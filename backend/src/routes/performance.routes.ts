// src/routes/performance.routes.ts
import { Router } from 'express';
import { MetricsService, CacheService } from '../config/redis';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /performance/metrics - Métriques de performance en temps réel
 */
router.get('/metrics', async (req, res) => {
  // Si c'est une requête pour la page web (pas API)
  if (req.headers.accept && req.headers.accept.includes('text/html')) {
    const metricsPageHTML = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>📈 Métriques Performance - Sorikama</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700;900&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body {
            font-family: 'Poppins', sans-serif;
            background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #0f3460 100%);
            min-height: 100vh;
        }
        .glass-morphism {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        .neon-glow {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.3);
        }
        .gradient-text {
            background: linear-gradient(135deg, #3b82f6, #8b5cf6, #06b6d4, #10b981);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .metric-card {
            transition: all 0.3s ease;
        }
        .metric-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        }
    </style>
</head>
<body class="text-white">
    <div class="min-h-screen p-6">
        <!-- Header -->
        <div class="max-w-7xl mx-auto mb-8">
            <div class="glass-morphism rounded-3xl p-6">
                <div class="flex justify-between items-center">
                    <div class="flex items-center space-x-4">
                        <div class="w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center neon-glow">
                            <i class="fas fa-chart-line text-white text-2xl"></i>
                        </div>
                        <div>
                            <h1 class="text-3xl font-bold gradient-text">Métriques Performance</h1>
                            <p class="text-blue-300">Surveillance en temps réel du système</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-4">
                        <div class="flex items-center space-x-2">
                            <div class="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                            <span class="text-green-400 font-medium">En Ligne</span>
                        </div>
                        <a href="/api" class="glass-morphism px-6 py-3 rounded-xl hover:bg-white hover:bg-opacity-10 transition-all">
                            <i class="fas fa-arrow-left mr-2"></i>Retour
                        </a>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Loading -->
        <div id="loading" class="max-w-7xl mx-auto text-center py-20">
            <div class="glass-morphism rounded-3xl p-12">
                <i class="fas fa-spinner fa-spin text-blue-400 text-4xl mb-4"></i>
                <p class="text-xl text-gray-300">Chargement des métriques...</p>
            </div>
        </div>
        
        <!-- Dashboard -->
        <div id="dashboard" class="max-w-7xl mx-auto hidden">
            <!-- Summary Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="glass-morphism rounded-2xl p-6 metric-card">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                            <i class="fas fa-globe text-white"></i>
                        </div>
                        <span class="text-xs bg-blue-500 bg-opacity-20 px-3 py-1 rounded-full text-blue-300">TOTAL</span>
                    </div>
                    <h3 class="text-3xl font-bold text-white mb-1" id="totalRequests">-</h3>
                    <p class="text-gray-400 text-sm">Requêtes Totales</p>
                </div>
                
                <div class="glass-morphism rounded-2xl p-6 metric-card">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                            <i class="fas fa-exclamation-triangle text-white"></i>
                        </div>
                        <span class="text-xs bg-red-500 bg-opacity-20 px-3 py-1 rounded-full text-red-300">ERREURS</span>
                    </div>
                    <h3 class="text-3xl font-bold text-white mb-1" id="totalErrors">-</h3>
                    <p class="text-gray-400 text-sm">Erreurs Totales</p>
                </div>
                
                <div class="glass-morphism rounded-2xl p-6 metric-card">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                            <i class="fas fa-check-circle text-white"></i>
                        </div>
                        <span class="text-xs bg-green-500 bg-opacity-20 px-3 py-1 rounded-full text-green-300">SUCCÈS</span>
                    </div>
                    <h3 class="text-3xl font-bold text-white mb-1" id="successRate">-</h3>
                    <p class="text-gray-400 text-sm">Taux de Succès</p>
                </div>
                
                <div class="glass-morphism rounded-2xl p-6 metric-card">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                            <i class="fas fa-clock text-white"></i>
                        </div>
                        <span class="text-xs bg-yellow-500 bg-opacity-20 px-3 py-1 rounded-full text-yellow-300">TEMPS</span>
                    </div>
                    <h3 class="text-3xl font-bold text-white mb-1" id="avgResponseTime">-</h3>
                    <p class="text-gray-400 text-sm">Temps Moyen (ms)</p>
                </div>
            </div>
            
            <!-- Charts -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div class="glass-morphism rounded-2xl p-6">
                    <h3 class="text-xl font-bold text-white mb-4">Temps de Réponse</h3>
                    <canvas id="responseChart" width="400" height="200"></canvas>
                </div>
                
                <div class="glass-morphism rounded-2xl p-6">
                    <h3 class="text-xl font-bold text-white mb-4">Méthodes HTTP</h3>
                    <canvas id="methodsChart" width="400" height="200"></canvas>
                </div>
            </div>
            
            <!-- Performance Indicators -->
            <div class="glass-morphism rounded-2xl p-8">
                <h2 class="text-2xl font-bold gradient-text mb-6">Indicateurs de Performance</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div class="text-center">
                        <div class="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center text-3xl font-bold" id="healthCircle">
                            <span id="healthScore">-</span>
                        </div>
                        <p class="text-gray-300">Score de Santé</p>
                    </div>
                    
                    <div class="text-center">
                        <div class="text-2xl font-bold mb-2" id="loadLevel">-</div>
                        <p class="text-gray-300">Niveau de Charge</p>
                        <div class="flex justify-center space-x-1 mt-2" id="loadIndicator">
                            <div class="w-3 h-3 rounded-full bg-gray-600"></div>
                            <div class="w-3 h-3 rounded-full bg-gray-600"></div>
                            <div class="w-3 h-3 rounded-full bg-gray-600"></div>
                        </div>
                    </div>
                    
                    <div class="text-center">
                        <div class="text-2xl font-bold mb-2" id="trend">-</div>
                        <p class="text-gray-300">Tendance</p>
                        <div class="mt-2" id="trendIcon">
                            <i class="fas fa-minus text-gray-400 text-2xl"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        let responseChart, methodsChart;
        
        async function loadMetrics() {
            try {
                const response = await fetch('/performance/metrics', {
                    headers: { 'Accept': 'application/json' }
                });
                const result = await response.json();
                
                if (result.success) {
                    updateDashboard(result.data);
                    document.getElementById('loading').classList.add('hidden');
                    document.getElementById('dashboard').classList.remove('hidden');
                }
            } catch (error) {
                console.error('Erreur:', error);
            }
        }
        
        function updateDashboard(data) {
            // Update cards
            document.getElementById('totalRequests').textContent = data.summary.total_requests.toLocaleString();
            document.getElementById('totalErrors').textContent = data.summary.total_errors.toLocaleString();
            document.getElementById('successRate').textContent = data.summary.success_rate.toFixed(1) + '%';
            document.getElementById('avgResponseTime').textContent = data.summary.avg_response_time + 'ms';
            
            // Health score
            const healthScore = data.performance_indicators.health_score;
            document.getElementById('healthScore').textContent = healthScore;
            const healthCircle = document.getElementById('healthCircle');
            if (healthScore >= 80) {
                healthCircle.className = 'w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center text-3xl font-bold bg-gradient-to-r from-green-400 to-green-600 text-white';
            } else if (healthScore >= 60) {
                healthCircle.className = 'w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
            } else {
                healthCircle.className = 'w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center text-3xl font-bold bg-gradient-to-r from-red-400 to-red-600 text-white';
            }
            
            // Load level
            document.getElementById('loadLevel').textContent = data.performance_indicators.load_level.toUpperCase();
            
            // Trend
            document.getElementById('trend').textContent = data.performance_indicators.trend.toUpperCase();
            const trendIcon = document.getElementById('trendIcon').querySelector('i');
            if (data.performance_indicators.trend === 'improving') {
                trendIcon.className = 'fas fa-arrow-up text-green-400 text-2xl';
            } else if (data.performance_indicators.trend === 'degrading') {
                trendIcon.className = 'fas fa-arrow-down text-red-400 text-2xl';
            }
            
            // Charts
            createCharts(data);
        }
        
        function createCharts(data) {
            // Response time chart
            const responseCtx = document.getElementById('responseChart').getContext('2d');
            if (responseChart) responseChart.destroy();
            
            responseChart = new Chart(responseCtx, {
                type: 'line',
                data: {
                    labels: data.response_times.slice(0, 20).map((_, i) => \`-\${i}m\`),
                    datasets: [{
                        label: 'Temps (ms)',
                        data: data.response_times.slice(0, 20).map(item => item.value),
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { labels: { color: 'white' } } },
                    scales: {
                        x: { ticks: { color: 'white' } },
                        y: { ticks: { color: 'white' } }
                    }
                }
            });
            
            // Methods chart
            const methodsCtx = document.getElementById('methodsChart').getContext('2d');
            if (methodsChart) methodsChart.destroy();
            
            methodsChart = new Chart(methodsCtx, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(data.methods),
                    datasets: [{
                        data: Object.values(data.methods),
                        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444']
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { labels: { color: 'white' } } }
                }
            });
        }
        
        // Load data
        loadMetrics();
        setInterval(loadMetrics, 30000);
    </script>
</body>
</html>`;
    return res.send(metricsPageHTML);
  }
  
  try {
    const cachedMetrics = await CacheService.get('performance:realtime_metrics');
    
    if (cachedMetrics) {
      logger.debug('📊 Métriques servies depuis le cache');
      return res.json({
        success: true,
        cached: true,
        data: cachedMetrics
      });
    }
    
    const [
      totalRequests,
      totalErrors,
      responseTimeData,
      methodStats,
      statusStats
    ] = await Promise.all([
      MetricsService.get('api.requests.total'),
      MetricsService.get('api.errors.total'),
      MetricsService.getTimeSeries('api.response_time', 100),
      collectMethodStats(),
      collectStatusStats()
    ]);
    
    const successRate = totalRequests > 0 
      ? ((totalRequests - totalErrors) / totalRequests * 100).toFixed(2)
      : '100.00';
    
    const avgResponseTime = responseTimeData.length > 0
      ? Math.round(responseTimeData.reduce((sum, item) => sum + item.value, 0) / responseTimeData.length)
      : 0;
    
    const currentMinute = Math.floor(Date.now() / 60000);
    const rpsLastMinute = await MetricsService.get(`api.rps.minute.${currentMinute}`);
    
    const metrics = {
      timestamp: new Date().toISOString(),
      summary: {
        total_requests: totalRequests,
        total_errors: totalErrors,
        success_rate: parseFloat(successRate),
        avg_response_time: avgResponseTime,
        requests_per_second: Math.round(rpsLastMinute / 60)
      },
      response_times: responseTimeData.slice(0, 50),
      methods: methodStats,
      status_codes: statusStats,
      performance_indicators: {
        health_score: calculateHealthScore(parseFloat(successRate), avgResponseTime),
        load_level: getLoadLevel(rpsLastMinute),
        trend: calculateTrend(responseTimeData)
      }
    };
    
    await CacheService.set('performance:realtime_metrics', metrics, 30);
    
    logger.debug('📊 Métriques de performance calculées et mises en cache');
    res.json({
      success: true,
      cached: false,
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

function getLoadLevel(rpsLastMinute: number): string {
  if (rpsLastMinute > 1000) return 'high';
  if (rpsLastMinute > 100) return 'medium';
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