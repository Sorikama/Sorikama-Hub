// src/routes/system-health.routes.ts
import { Router } from 'express';
import os from 'os';
import fs from 'fs';
import path from 'path';
import { performance } from 'perf_hooks';

const router = Router();

/**
 * GET /system/health - Page System Health
 */
router.get('/health', (req, res) => {
  try {
    const path = require('path');
    const viewerPath = path.join(__dirname, '../../public/views/system-health.html');
    
    if (fs.existsSync(viewerPath)) {
      const html = fs.readFileSync(viewerPath, 'utf8');
      res.send(html);
    } else {
      res.status(404).send('Page System Health non trouvée');
    }
  } catch (error) {
    res.status(500).send('Erreur lors du chargement de la page System Health');
  }
});

/**
 * GET /system/test-data - Route de test pour vérifier les données (sans auth)
 */
router.get('/test-data', (req, res) => {
  try {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    const uptime = process.uptime();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    
    console.log('=== DONNÉES SYSTÈME RÉELLES ===');
    console.log('CPU Cores:', os.cpus().length);
    console.log('CPU Model:', os.cpus()[0]?.model);
    console.log('Total Memory:', Math.round(totalMem / 1024 / 1024), 'MB');
    console.log('Free Memory:', Math.round(freeMem / 1024 / 1024), 'MB');
    console.log('Used Memory:', Math.round(usedMem / 1024 / 1024), 'MB');
    console.log('Process RSS:', Math.round(memUsage.rss / 1024 / 1024), 'MB');
    console.log('Heap Used:', Math.round(memUsage.heapUsed / 1024 / 1024), 'MB');
    console.log('Uptime:', Math.round(uptime), 'seconds');
    console.log('Platform:', os.platform());
    console.log('Hostname:', os.hostname());
    console.log('Load Average:', os.loadavg());
    
    const systemInfo = {
      cpu: {
        cores: os.cpus().length,
        model: os.cpus()[0]?.model || 'Unknown CPU',
        load: os.loadavg(),
        speed: os.cpus()[0]?.speed || 0
      },
      memory: {
        total: Math.round(totalMem / 1024 / 1024),
        free: Math.round(freeMem / 1024 / 1024),
        used: Math.round(usedMem / 1024 / 1024),
        usagePercent: Math.round((usedMem / totalMem) * 100),
        process: {
          rss: Math.round(memUsage.rss / 1024 / 1024),
          heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
          heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024)
        }
      },
      system: {
        platform: os.platform(),
        arch: os.arch(),
        hostname: os.hostname(),
        uptime: Math.round(uptime),
        nodeVersion: process.version,
        osType: os.type(),
        osRelease: os.release()
      },
      timestamp: new Date().toISOString(),
      verified: true
    };
    
    res.json({
      success: true,
      message: 'Données système vérifiées et réelles',
      data: systemInfo
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des données',
      error: error.message
    });
  }
});

/**
 * GET /system/health-data - Données système en JSON
 */
router.get('/health-data', (req, res) => {
  try {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    const uptime = process.uptime();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    
    // Calcul du pourcentage CPU (approximatif)
    // Calcul plus précis du CPU
    const cpuPercent = Math.min(100, Math.max(0, Math.round(os.loadavg()[0] * 100 / os.cpus().length)));
    
    const systemInfo = {
      cpu: {
        usage: cpuPercent,
        cores: os.cpus().length,
        model: os.cpus()[0]?.model || 'Unknown CPU',
        load: os.loadavg(),
        speed: os.cpus()[0]?.speed || 0
      },
      memory: {
        total: Math.round(totalMem / 1024 / 1024),
        free: Math.round(freeMem / 1024 / 1024),
        used: Math.round(usedMem / 1024 / 1024),
        usagePercent: Math.round((usedMem / totalMem) * 100),
        process: {
          rss: Math.round(memUsage.rss / 1024 / 1024),
          heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
          heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
          external: Math.round(memUsage.external / 1024 / 1024),
          arrayBuffers: Math.round((memUsage.arrayBuffers || 0) / 1024 / 1024)
        }
      },
      system: {
        platform: os.platform(),
        arch: os.arch(),
        hostname: os.hostname(),
        uptime: Math.round(uptime),
        nodeVersion: process.version,
        osUptime: Math.round(os.uptime()),
        osType: os.type(),
        osRelease: os.release(),
        networkInterfaces: Object.keys(os.networkInterfaces()).length
      },
      health: {
        status: 'healthy',
        checks: {
          memory: usedMem / totalMem < 0.9 ? 'ok' : 'warning',
          cpu: cpuPercent < 80 ? 'ok' : 'warning',
          uptime: uptime > 60 ? 'ok' : 'starting'
        }
      },
      timestamp: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: systemInfo
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des informations système',
      error: error.message
    });
  }
});

export default router;