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
    
    // Vérifier si c'est une API key temporaire ou la clé par défaut
    const { portalSessions } = require('./auth-portal.routes');
    let isValidKey = false;
    
    // Vérifier les clés temporaires
    for (const [sessionToken, session] of portalSessions.entries()) {
      if (session.apiKey === apiKey && session.expires > Date.now()) {
        isValidKey = true;
        break;
      }
    }
    
    // Vérifier la clé par défaut
    const defaultKey = 'sk_dev_default_key_12345678901234567890123456789012345678901234567890';
    if (apiKey === defaultKey) {
      isValidKey = true;
    }
    
    if (!apiKey || !isValidKey) {
      const errorHTML = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Accès refusé - Sorikama Admin</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
</head>
<body class="bg-gradient-to-br from-red-900 via-red-800 to-red-900 min-h-screen flex items-center justify-center">
    <div class="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 border border-red-400 border-opacity-20 text-center">
        <i class="fas fa-shield-alt text-red-300 text-6xl mb-4"></i>
        <h1 class="text-2xl font-bold text-white mb-4">Accès Refusé</h1>
        <p class="text-red-200 mb-6">API key requise ou invalide</p>
        <a href="/api" class="bg-red-500 bg-opacity-20 hover:bg-opacity-30 px-6 py-3 rounded-lg text-red-200 hover:text-white transition-all">
            <i class="fas fa-arrow-left mr-2"></i>Retour au dashboard
        </a>
    </div>
</body>
</html>`;
      return res.status(401).send(errorHTML);
    }

    // Statistiques système
    const stats = {
      timestamp: new Date().toISOString(),
      system: {
        uptime: Math.round(process.uptime()),
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

    const statsHTML = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Stats - Sorikama Gateway</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
</head>
<body class="bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 min-h-screen">
    <div class="container mx-auto px-4 py-8">
        <!-- Header -->
        <div class="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white border-opacity-20">
            <div class="flex justify-between items-center">
                <div>
                    <h1 class="text-3xl font-bold text-white mb-2"><i class="fas fa-chart-bar mr-3"></i>Admin Statistics</h1>
                    <p class="text-blue-300">Statistiques système en temps réel</p>
                </div>
                <a href="/api" class="bg-blue-500 bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg text-blue-200 hover:text-white transition-all">
                    <i class="fas fa-arrow-left mr-2"></i>Retour
                </a>
            </div>
        </div>
        
        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <!-- Système -->
            <div class="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-20">
                <h3 class="text-xl font-bold text-white mb-4"><i class="fas fa-server text-green-300 mr-2"></i>Système</h3>
                <div class="space-y-3 text-sm">
                    <div class="flex justify-between">
                        <span class="text-gray-300">Uptime:</span>
                        <span class="text-green-300 font-semibold">${Math.floor(stats.system.uptime / 3600)}h ${Math.floor((stats.system.uptime % 3600) / 60)}m</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-300">Node.js:</span>
                        <span class="text-blue-300">${stats.system.node_version}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-300">Platform:</span>
                        <span class="text-purple-300">${stats.system.platform}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-300">Architecture:</span>
                        <span class="text-yellow-300">${stats.system.arch}</span>
                    </div>
                </div>
            </div>
            
            <!-- Mémoire -->
            <div class="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-20">
                <h3 class="text-xl font-bold text-white mb-4"><i class="fas fa-memory text-orange-300 mr-2"></i>Mémoire</h3>
                <div class="space-y-3 text-sm">
                    <div class="flex justify-between">
                        <span class="text-gray-300">Utilisée:</span>
                        <span class="text-orange-300 font-semibold">${stats.system.memory.used} MB</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-300">Total:</span>
                        <span class="text-blue-300">${stats.system.memory.total} MB</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-300">Externe:</span>
                        <span class="text-purple-300">${stats.system.memory.external} MB</span>
                    </div>
                    <div class="mt-4">
                        <div class="bg-gray-700 rounded-full h-2">
                            <div class="bg-orange-400 h-2 rounded-full" style="width: ${(stats.system.memory.used / stats.system.memory.total * 100).toFixed(1)}%"></div>
                        </div>
                        <p class="text-xs text-gray-400 mt-1">${(stats.system.memory.used / stats.system.memory.total * 100).toFixed(1)}% utilisé</p>
                    </div>
                </div>
            </div>
            
            <!-- API -->
            <div class="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-20">
                <h3 class="text-xl font-bold text-white mb-4"><i class="fas fa-code text-cyan-300 mr-2"></i>API Gateway</h3>
                <div class="space-y-3 text-sm">
                    <div class="flex justify-between">
                        <span class="text-gray-300">Version:</span>
                        <span class="text-cyan-300 font-semibold">${stats.api.version}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-300">Environnement:</span>
                        <span class="text-green-300">${stats.api.environment}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-300">Port:</span>
                        <span class="text-blue-300">${stats.api.port}</span>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Services Status -->
        <div class="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20 mb-8">
            <h2 class="text-2xl font-bold text-white mb-6"><i class="fas fa-heartbeat text-red-300 mr-3"></i>Status des Services</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-green-500 bg-opacity-20 p-4 rounded-lg border border-green-400 border-opacity-50">
                    <div class="flex items-center">
                        <i class="fas fa-database text-green-300 text-2xl mr-3"></i>
                        <div>
                            <h4 class="text-white font-semibold">Redis</h4>
                            <p class="text-green-300 text-sm">${stats.services.redis}</p>
                        </div>
                    </div>
                </div>
                <div class="bg-green-500 bg-opacity-20 p-4 rounded-lg border border-green-400 border-opacity-50">
                    <div class="flex items-center">
                        <i class="fas fa-leaf text-green-300 text-2xl mr-3"></i>
                        <div>
                            <h4 class="text-white font-semibold">MongoDB</h4>
                            <p class="text-green-300 text-sm">${stats.services.mongodb}</p>
                        </div>
                    </div>
                </div>
                <div class="bg-green-500 bg-opacity-20 p-4 rounded-lg border border-green-400 border-opacity-50">
                    <div class="flex items-center">
                        <i class="fas fa-network-wired text-green-300 text-2xl mr-3"></i>
                        <div>
                            <h4 class="text-white font-semibold">Gateway</h4>
                            <p class="text-green-300 text-sm">${stats.services.gateway}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Timestamp -->
        <div class="text-center text-gray-400 text-sm">
            <i class="fas fa-clock mr-2"></i>Dernière mise à jour: ${new Date(stats.timestamp).toLocaleString('fr-FR')}
        </div>
    </div>
    
    <script>
        // Auto-refresh toutes les 30 secondes
        setTimeout(() => {
            window.location.reload();
        }, 30000);
    </script>
</body>
</html>`;

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