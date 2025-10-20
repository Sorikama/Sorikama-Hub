// src/routes/performance.routes.ts
import { Router } from 'express';
import { MetricsService, CacheService } from '../config/redis';
import { logger } from '../utils/logger';
import fs from 'fs';
import path from 'path';

const router = Router();

/**
 * GET /performance/metrics - Page Performance Metrics
 */
router.get('/metrics', (req, res) => {
  try {
    const path = require('path');
    const viewerPath = path.join(__dirname, '../../public/views/performance-metrics.html');
    
    if (fs.existsSync(viewerPath)) {
      const html = fs.readFileSync(viewerPath, 'utf8');
      res.send(html);
    } else {
      res.status(404).send('Page Performance Metrics non trouvée');
    }
  } catch (error) {
    res.status(500).send('Erreur lors du chargement de la page Performance Metrics');
  }
});

/**
 * GET /performance/metrics-data - Données de performance en JSON
 */
router.get('/metrics-data', async (req, res) => {
  try {
    // Générer des données de test réalistes
    const now = Date.now();
    const totalRequests = Math.floor(Math.random() * 10000) + 5000;
    const totalErrors = Math.floor(totalRequests * 0.05);
    const successRate = ((totalRequests - totalErrors) / totalRequests * 100);
    const avgResponseTime = Math.floor(Math.random() * 200) + 50;
    
    // Générer des données de temps de réponse
    const responseTimeData = [];
    for (let i = 0; i < 50; i++) {
      responseTimeData.push({
        timestamp: now - (i * 60000),
        value: Math.floor(Math.random() * 300) + 50
      });
    }
    
    const methodStats = {
      get: Math.floor(totalRequests * 0.6),
      post: Math.floor(totalRequests * 0.25),
      put: Math.floor(totalRequests * 0.1),
      delete: Math.floor(totalRequests * 0.03),
      patch: Math.floor(totalRequests * 0.02)
    };
    
    const statusStats = {
      '2xx': totalRequests - totalErrors,
      '3xx': Math.floor(totalErrors * 0.1),
      '4xx': Math.floor(totalErrors * 0.7),
      '5xx': Math.floor(totalErrors * 0.2)
    };
    
    const metrics = {
      timestamp: new Date().toISOString(),
      summary: {
        total_requests: totalRequests,
        total_errors: totalErrors,
        success_rate: parseFloat(successRate.toFixed(2)),
        avg_response_time: avgResponseTime,
        requests_per_second: Math.floor(Math.random() * 50) + 10
      },
      response_times: responseTimeData,
      methods: methodStats,
      status_codes: statusStats,
      performance_indicators: {
        health_score: calculateHealthScore(successRate, avgResponseTime),
        load_level: getLoadLevel(Math.random() * 100),
        trend: ['improving', 'stable', 'degrading'][Math.floor(Math.random() * 3)]
      }
    };
    
    res.json({
      success: true,
      data: metrics
    });
    
  } catch (error) {
    logger.error('❌ Erreur récupération métriques performance:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des métriques de performance'
    });
  }
});

/**
 * GET /performance/health - Vérification de santé rapide
 */
router.get('/health', async (req, res) => {
  try {
    const startTime = Date.now();
    
    const healthChecks = await Promise.all([
      checkRedisHealth(),
      checkDatabaseHealth(),
      checkMemoryHealth()
    ]);
    
    const responseTime = Date.now() - startTime;
    const allHealthy = healthChecks.every(check => check.healthy);
    
    const healthStatus = {
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      response_time: responseTime,
      checks: {
        redis: healthChecks[0],
        database: healthChecks[1],
        memory: healthChecks[2]
      },
      uptime: process.uptime()
    };
    
    await MetricsService.recordTimeSeries('system.health_check_time', responseTime);
    
    res.status(allHealthy ? 200 : 503).json({
      success: allHealthy,
      data: healthStatus
    });
    
  } catch (error) {
    logger.error('❌ Erreur health check:', error);
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      message: 'Health check failed'
    });
  }
});

/**
 * GET /performance/cache-stats - Statistiques du cache Redis
 */
router.get('/cache-stats', async (req, res) => {
  try {
    const { redisClient } = require('../config/redis');
    
    const redisInfo = await redisClient.info('memory');
    const redisStats = await redisClient.info('stats');
    
    const memoryInfo = parseRedisInfo(redisInfo);
    const statsInfo = parseRedisInfo(redisStats);
    
    const cacheStats = {
      memory: {
        used: memoryInfo.used_memory_human,
        peak: memoryInfo.used_memory_peak_human,
        fragmentation_ratio: parseFloat(memoryInfo.mem_fragmentation_ratio)
      },
      operations: {
        total_commands: parseInt(statsInfo.total_commands_processed),
        ops_per_sec: parseFloat(statsInfo.instantaneous_ops_per_sec),
        keyspace_hits: parseInt(statsInfo.keyspace_hits || '0'),
        keyspace_misses: parseInt(statsInfo.keyspace_misses || '0')
      },
      connections: {
        connected_clients: parseInt(statsInfo.connected_clients),
        blocked_clients: parseInt(statsInfo.blocked_clients || '0')
      }
    };
    
    const totalKeyspaceOps = cacheStats.operations.keyspace_hits + cacheStats.operations.keyspace_misses;
    const hitRatio = totalKeyspaceOps > 0 
      ? (cacheStats.operations.keyspace_hits / totalKeyspaceOps * 100).toFixed(2)
      : '0.00';
    
    res.json({
      success: true,
      data: {
        ...cacheStats,
        hit_ratio: parseFloat(hitRatio),
        status: 'connected'
      }
    });
    
  } catch (error) {
    logger.error('❌ Erreur stats cache:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques de cache'
    });
  }
});

// === Fonctions utilitaires ===

async function collectMethodStats() {
  const methods = ['get', 'post', 'put', 'patch', 'delete'];
  const stats: any = {};
  
  for (const method of methods) {
    stats[method] = await MetricsService.get(`api.requests.method.${method}`);
  }
  
  return stats;
}

async function collectStatusStats() {
  const statusCodes = ['2xx', '3xx', '4xx', '5xx'];
  const stats: any = {};
  
  for (const code of statusCodes) {
    stats[code] = await MetricsService.get(`api.errors.${code}`);
  }
  
  return stats;
}

function calculateHealthScore(successRate: number, avgResponseTime: number): number {
  let score = 100;
  
  score -= (100 - successRate) * 2;
  
  if (avgResponseTime > 1000) score -= 20;
  else if (avgResponseTime > 500) score -= 10;
  else if (avgResponseTime > 200) score -= 5;
  
  return Math.max(0, Math.round(score));
}

function getLoadLevel(load: number): string {
  if (load > 70) return 'high';
  if (load > 30) return 'medium';
  return 'low';
}

function calculateTrend(responseTimeData: Array<{timestamp: number, value: number}>): string {
  if (responseTimeData.length < 10) return 'stable';
  
  const recent = responseTimeData.slice(0, 5);
  const older = responseTimeData.slice(-5);
  
  const recentAvg = recent.reduce((sum, item) => sum + item.value, 0) / recent.length;
  const olderAvg = older.reduce((sum, item) => sum + item.value, 0) / older.length;
  
  const change = ((recentAvg - olderAvg) / olderAvg) * 100;
  
  if (change > 10) return 'degrading';
  if (change < -10) return 'improving';
  return 'stable';
}

async function checkRedisHealth(): Promise<{healthy: boolean, message: string, response_time: number}> {
  const startTime = Date.now();
  try {
    await CacheService.set('health:redis_check', 'ok', 10);
    const value = await CacheService.get('health:redis_check');
    const responseTime = Date.now() - startTime;
    
    return {
      healthy: value === 'ok',
      message: 'Redis operational',
      response_time: responseTime
    };
  } catch (error) {
    return {
      healthy: false,
      message: 'Redis connection failed',
      response_time: Date.now() - startTime
    };
  }
}

async function checkDatabaseHealth(): Promise<{healthy: boolean, message: string, response_time: number}> {
  const startTime = Date.now();
  try {
    const mongoose = require('mongoose');
    const isConnected = mongoose.connection.readyState === 1;
    const responseTime = Date.now() - startTime;
    
    return {
      healthy: isConnected,
      message: isConnected ? 'Database connected' : 'Database disconnected',
      response_time: responseTime
    };
  } catch (error) {
    return {
      healthy: false,
      message: 'Database check failed',
      response_time: Date.now() - startTime
    };
  }
}

async function checkMemoryHealth(): Promise<{healthy: boolean, message: string, usage_percent: number}> {
  try {
    const memUsage = process.memoryUsage();
    const totalMem = require('os').totalmem();
    const usagePercent = (memUsage.rss / totalMem) * 100;
    
    return {
      healthy: usagePercent < 80,
      message: `Memory usage: ${usagePercent.toFixed(1)}%`,
      usage_percent: Math.round(usagePercent)
    };
  } catch (error) {
    return {
      healthy: false,
      message: 'Memory check failed',
      usage_percent: 0
    };
  }
}

function parseRedisInfo(info: string): any {
  const result: any = {};
  const lines = info.split('\r\n');
  
  for (const line of lines) {
    if (line.includes(':')) {
      const [key, value] = line.split(':');
      result[key] = value;
    }
  }
  
  return result;
}

export default router;