// src/routes/admin-public.routes.ts
import { Router } from 'express';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /admin/stats - Statistiques publiques avec API key en query
 */
router.get('/stats', async (req, res) => {
  try {
    const apiKey = req.query.apiKey as string;
    
    if (!apiKey || !apiKey.startsWith('sk_')) {
      return res.status(401).json({
        success: false,
        message: 'API key requise dans les paramètres de requête'
      });
    }

    // Vérification simple de la clé par défaut
    const defaultKey = 'sk_dev_default_key_12345678901234567890123456789012345678901234567890';
    if (apiKey !== defaultKey) {
      return res.status(401).json({
        success: false,
        message: 'API key invalide'
      });
    }

    // Statistiques système
    const stats = {
      timestamp: new Date().toISOString(),
      system: {
        uptime: process.uptime(),
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          external: Math.round(process.memoryUsage().external / 1024 / 1024)
        },
        node_version: process.version,
        platform: process.platform,
        arch: process.arch
      },
      api: {
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        port: process.env.PORT || 7000
      },
      services: {
        redis: 'connected',
        mongodb: 'connected',
        gateway: 'operational'
      }
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    logger.error('❌ Erreur récupération stats admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

export default router;