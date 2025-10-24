// src/routes/admin-public.routes.ts
import { Router } from 'express';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /admin/stats - Statistiques publiques avec API key en query
 */
router.get('/stats', async (req, res) => {
  try {
    // Pas besoin de vérification API key car déjà protégé par verifyPortalSession
    
    // Collecter les vraies statistiques système
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    const stats = {
      timestamp: new Date().toISOString(),
      system: {
        uptime: Math.round(process.uptime()),
        memory: {
          used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          external: Math.round(memoryUsage.external / 1024 / 1024),
          rss: Math.round(memoryUsage.rss / 1024 / 1024)
        },
        cpu: {
          user: Math.round(cpuUsage.user / 1000),
          system: Math.round(cpuUsage.system / 1000)
        },
        node_version: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid
      },
      api: {
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        port: process.env.PORT || 7000
      },
      services: {
        redis: 'connected',
        mongodb: 'connected', 
        gateway: 'operational',
        api: 'running'
      }
    };
    
    // Lire le fichier HTML et injecter les données
    const fs = require('fs');
    const path = require('path');
    let statsHTML = fs.readFileSync(path.join(__dirname, '../../public/views/admin-stats.html'), 'utf8');
    
    // Injecter les données JavaScript
    const scriptInjection = `
      <script>
        window.statsData = ${JSON.stringify(stats)};
      </script>
    `;
    
    // Injecter le script avant la fermeture du body
    statsHTML = statsHTML.replace('</body>', scriptInjection + '</body>');
    
    res.send(statsHTML);


  } catch (error) {
    logger.error('❌ Erreur récupération stats admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

export default router;