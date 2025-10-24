// src/routes/admin.routes.ts
import { Router } from 'express';
// import { requirePermissions } from '../middlewares/authorization.middleware';
import { UserModel } from '../database/models/user.model';
import { ApiKeyModel } from '../database/models/apiKey.model';
import { RoleModel } from '../database/models/role.model';
import { MetricsService, CacheService } from '../config/redis';
import * as si from 'systeminformation';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /admin/stats - Statistiques complètes du système
 * 
 * Retourne des statistiques détaillées incluant :
 * - 📊 Données utilisateurs et API keys
 * - 💻 Métriques système (CPU, RAM, disque)
 * - 🚀 Métriques API (requêtes, temps de réponse)
 * - 🔥 Performance temps réel
 */
router.get('/stats', async (req, res) => {
  try {
    logger.info('📊 Récupération des statistiques système...');
    
    // 1. Statistiques base de données (avec cache)
    const dbStats = await CacheService.get('admin:db_stats');
    let dbData;
    
    if (!dbStats) {
      dbData = {
        users: {
          total: await UserModel.countDocuments(),
          active: await UserModel.countDocuments({ isActive: true }),
          verified: await UserModel.countDocuments({ isVerified: true })
        },
        apiKeys: {
          total: await ApiKeyModel.countDocuments(),
          active: await ApiKeyModel.countDocuments({ isActive: true }),
          expired: await ApiKeyModel.countDocuments({ expiresAt: { $lt: new Date() } })
        }
      };
      
      // Cache pendant 5 minutes
      await CacheService.set('admin:db_stats', dbData, 300);
    } else {
      dbData = dbStats;
    }
    
    // 2. Métriques système en temps réel
    const [cpuInfo, memInfo, diskInfo, networkStats] = await Promise.all([
      si.cpu(),
      si.mem(),
      si.fsSize(),
      si.networkStats()
    ]);
    
    // 3. Métriques API depuis Redis
    const apiMetrics = {
      requests: {
        total: await MetricsService.get('api.requests.total'),
        errors: await MetricsService.get('api.errors.total'),
        success_rate: 0
      },
      response_times: await MetricsService.getTimeSeries('api.response_time', 50),
      methods: {
        get: await MetricsService.get('api.requests.method.get'),
        post: await MetricsService.get('api.requests.method.post'),
        put: await MetricsService.get('api.requests.method.put'),
        delete: await MetricsService.get('api.requests.method.delete')
      }
    };
    
    // Calculer le taux de succès
    if (apiMetrics.requests.total > 0) {
      apiMetrics.requests.success_rate = 
        ((apiMetrics.requests.total - apiMetrics.requests.errors) / apiMetrics.requests.total * 100).toFixed(2);
    }
    
    // 4. Assembler la réponse complète
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        // Données applicatives
        application: dbData,
        
        // Métriques système
        system: {
          uptime: process.uptime(),
          version: '1.0.0',
          node_version: process.version,
          
          // CPU
          cpu: {
            model: cpuInfo.manufacturer + ' ' + cpuInfo.brand,
            cores: cpuInfo.cores,
            speed: cpuInfo.speed + ' GHz'
          },
          
          // Mémoire
          memory: {
            total: Math.round(memInfo.total / 1024 / 1024 / 1024 * 100) / 100 + ' GB',
            used: Math.round(memInfo.used / 1024 / 1024 / 1024 * 100) / 100 + ' GB',
            free: Math.round(memInfo.free / 1024 / 1024 / 1024 * 100) / 100 + ' GB',
            usage_percent: Math.round(memInfo.used / memInfo.total * 100)
          },
          
          // Stockage
          storage: diskInfo.map(disk => ({
            filesystem: disk.fs,
            size: Math.round(disk.size / 1024 / 1024 / 1024 * 100) / 100 + ' GB',
            used: Math.round(disk.used / 1024 / 1024 / 1024 * 100) / 100 + ' GB',
            available: Math.round(disk.available / 1024 / 1024 / 1024 * 100) / 100 + ' GB',
            usage_percent: Math.round(disk.use)
          })),
          
          // Réseau
          network: networkStats.map(net => ({
            interface: net.iface,
            rx_bytes: Math.round(net.rx_bytes / 1024 / 1024 * 100) / 100 + ' MB',
            tx_bytes: Math.round(net.tx_bytes / 1024 / 1024 * 100) / 100 + ' MB'
          }))
        },
        
        // Métriques API
        api: apiMetrics,
        
        // Métriques de performance
        performance: {
          avg_response_time: apiMetrics.response_times.length > 0 
            ? Math.round(apiMetrics.response_times.reduce((sum, item) => sum + item.value, 0) / apiMetrics.response_times.length)
            : 0,
          requests_per_minute: await calculateRPM(),
          cache_hit_ratio: await calculateCacheHitRatio()
        }
      }
    };
    
    logger.info('✅ Statistiques système récupérées avec succès');
    res.json(response);
    
  } catch (error) {
    logger.error('❌ Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération des statistiques système',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Calcule les requêtes par minute (RPM) sur les 5 dernières minutes
 */
async function calculateRPM(): Promise<number> {
  try {
    const currentMinute = Math.floor(Date.now() / 60000);
    let totalRequests = 0;
    
    // Sommer les 5 dernières minutes
    for (let i = 0; i < 5; i++) {
      const requests = await MetricsService.get(`api.rps.minute.${currentMinute - i}`);
      totalRequests += requests;
    }
    
    return Math.round(totalRequests / 5); // Moyenne sur 5 minutes
  } catch (error) {
    logger.error('Erreur calcul RPM:', error);
    return 0;
  }
}

/**
 * Calcule le ratio de cache hit (simulation)
 */
async function calculateCacheHitRatio(): Promise<number> {
  try {
    // Pour l'instant, on simule un ratio de cache
    // Dans une implémentation complète, on trackrait les hits/miss
    return Math.round(Math.random() * 30 + 70); // Entre 70% et 100%
  } catch (error) {
    return 0;
  }
}

// Liste de tous les utilisateurs
router.get('/users', async (req, res) => {
  try {
    const users = await UserModel.find()
      .populate('roles', 'name')
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Détails d'un utilisateur
router.get('/users/:id', async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id)
      .populate('roles')
      .select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Liste des API Keys
router.get('/api-keys', async (req, res) => {
  try {
    const apiKeys = await ApiKeyModel.find()
      .populate('userId', 'firstName lastName email')
      .select('-keyHash')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: apiKeys });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Désactiver un utilisateur
router.patch('/users/:id/deactivate', async (req, res) => {
  try {
    const user = await UserModel.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Révoquer une API Key
router.patch('/api-keys/:id/revoke', async (req, res) => {
  try {
    const apiKey = await ApiKeyModel.findByIdAndUpdate(
      req.params.id,
      { isActive: false, revokedAt: new Date() },
      { new: true }
    );
    
    if (!apiKey) {
      return res.status(404).json({ success: false, message: 'API Key non trouvée' });
    }
    
    res.json({ success: true, data: apiKey });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Endpoint analytics (alias pour stats)
router.get('/analytics', async (req, res) => {
  try {
    const totalUsers = await UserModel.countDocuments();
    const activeUsers = await UserModel.countDocuments({ isActive: true });
    const totalRequests = await MetricsService.get('api.requests.total') || 0;
    const totalServices = 6;
    const uptime = Math.round(process.uptime());
    
    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        totalRequests,
        totalServices,
        uptime
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur analytics' });
  }
});

// Supprimer un utilisateur
router.delete('/users/:userId', async (req, res) => {
  try {
    const user = await UserModel.findByIdAndDelete(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    res.json({ success: true, message: 'Utilisateur supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Lister toutes les sessions SSO
router.get('/sessions', async (req, res) => {
  try {
    // Simulation des sessions SSO
    const sessions = [
      {
        _id: '1',
        userId: '37707ab0-9693-4d71-ae1a-9acd3d56a1ae',
        serviceId: 'soristore',
        sessionToken: 'sess_abc123',
        expiresAt: new Date(Date.now() + 86400000),
        isActive: true,
        createdAt: new Date()
      }
    ];
    res.json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

export default router;