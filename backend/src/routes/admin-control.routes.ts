// src/routes/admin-control.routes.ts
import { Router } from 'express';
import { logger } from '../utils/logger';
import { PerformanceOptimizer } from '../utils/performanceOptimizer';

const router = Router();

// Vérification sécurisée de l'API key admin
const verifyAdminKey = (req: any, res: any, next: any) => {
  const apiKey = req.query.apiKey || req.headers['x-api-key'];
  const adminKey = 'sk_dev_default_key_12345678901234567890123456789012345678901234567890';
  
  if (!apiKey || apiKey !== adminKey) {
    return res.status(403).json({
      success: false,
      message: 'Accès refusé - Clé admin requise'
    });
  }
  
  // Log de sécurité
  logger.warn('🔐 Accès admin autorisé', {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  
  next();
};

/**
 * GET /admin/control - Interface de contrôle admin
 */
router.get('/control', verifyAdminKey, (req, res) => {
  const controlHTML = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contrôle Admin - Sorikama API Gateway</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <style>
        body { font-family: 'Inter', sans-serif; }
        .control-card { transition: all 0.3s ease; }
        .control-card:hover { transform: translateY(-2px); }
        .danger-zone { border: 2px dashed #ef4444; }
    </style>
</head>
<body class="bg-gray-50 min-h-screen">

    <!-- Header -->
    <nav class="bg-red-600 text-white shadow-lg">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center py-4">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-red-800 rounded-lg flex items-center justify-center">
                        <i class="fas fa-shield-alt text-white"></i>
                    </div>
                    <div>
                        <h1 class="text-xl font-bold">Contrôle Admin</h1>
                        <p class="text-xs text-red-200">Interface d'administration sécurisée</p>
                    </div>
                </div>
                <div class="text-sm">
                    <i class="fas fa-user-shield mr-1"></i>
                    Administrateur
                </div>
            </div>
        </div>
    </nav>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <!-- Optimisation Performance -->
        <div class="bg-white rounded-xl shadow-sm border p-6 mb-8">
            <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <i class="fas fa-tachometer-alt mr-2 text-blue-600"></i>
                Optimisation des Performances
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <button onclick="forceGarbageCollection()" class="control-card bg-blue-50 border border-blue-200 rounded-lg p-4 text-left hover:bg-blue-100">
                    <div class="flex items-center justify-between mb-2">
                        <i class="fas fa-broom text-blue-600 text-xl"></i>
                        <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">MÉMOIRE</span>
                    </div>
                    <h4 class="font-semibold text-gray-900">Nettoyer Mémoire</h4>
                    <p class="text-sm text-gray-600">Force le garbage collection</p>
                </button>

                <button onclick="clearCache()" class="control-card bg-green-50 border border-green-200 rounded-lg p-4 text-left hover:bg-green-100">
                    <div class="flex items-center justify-between mb-2">
                        <i class="fas fa-database text-green-600 text-xl"></i>
                        <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">CACHE</span>
                    </div>
                    <h4 class="font-semibold text-gray-900">Vider Cache</h4>
                    <p class="text-sm text-gray-600">Nettoie le cache Redis</p>
                </button>

                <button onclick="optimizeSystem()" class="control-card bg-purple-50 border border-purple-200 rounded-lg p-4 text-left hover:bg-purple-100">
                    <div class="flex items-center justify-between mb-2">
                        <i class="fas fa-magic text-purple-600 text-xl"></i>
                        <span class="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">AUTO</span>
                    </div>
                    <h4 class="font-semibold text-gray-900">Optimisation Auto</h4>
                    <p class="text-sm text-gray-600">Optimise automatiquement</p>
                </button>

            </div>
        </div>

        <!-- Sécurité -->
        <div class="bg-white rounded-xl shadow-sm border p-6 mb-8">
            <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <i class="fas fa-lock mr-2 text-red-600"></i>
                Contrôles de Sécurité
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <button onclick="blockSuspiciousIPs()" class="control-card bg-red-50 border border-red-200 rounded-lg p-4 text-left hover:bg-red-100">
                    <div class="flex items-center justify-between mb-2">
                        <i class="fas fa-ban text-red-600 text-xl"></i>
                        <span class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">SÉCURITÉ</span>
                    </div>
                    <h4 class="font-semibold text-gray-900">Bloquer IPs Suspectes</h4>
                    <p class="text-sm text-gray-600">Active le blocage automatique</p>
                </button>

                <button onclick="resetRateLimit()" class="control-card bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left hover:bg-yellow-100">
                    <div class="flex items-center justify-between mb-2">
                        <i class="fas fa-stopwatch text-yellow-600 text-xl"></i>
                        <span class="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">LIMITE</span>
                    </div>
                    <h4 class="font-semibold text-gray-900">Reset Rate Limiting</h4>
                    <p class="text-sm text-gray-600">Remet à zéro les compteurs</p>
                </button>

            </div>
        </div>

        <!-- Zone Dangereuse -->
        <div class="danger-zone bg-red-50 rounded-xl p-6">
            <h3 class="text-lg font-semibold text-red-900 mb-4 flex items-center">
                <i class="fas fa-exclamation-triangle mr-2"></i>
                Zone Dangereuse
            </h3>
            <p class="text-sm text-red-700 mb-4">Ces actions peuvent affecter le fonctionnement de l'application.</p>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <button onclick="restartServer()" class="bg-red-600 text-white rounded-lg p-4 text-left hover:bg-red-700 transition-colors">
                    <div class="flex items-center justify-between mb-2">
                        <i class="fas fa-power-off text-xl"></i>
                        <span class="text-xs bg-red-800 px-2 py-1 rounded">DANGER</span>
                    </div>
                    <h4 class="font-semibold">Redémarrer Serveur</h4>
                    <p class="text-sm text-red-200">Redémarre l'application</p>
                </button>

                <button onclick="clearAllLogs()" class="bg-orange-600 text-white rounded-lg p-4 text-left hover:bg-orange-700 transition-colors">
                    <div class="flex items-center justify-between mb-2">
                        <i class="fas fa-trash text-xl"></i>
                        <span class="text-xs bg-orange-800 px-2 py-1 rounded">LOGS</span>
                    </div>
                    <h4 class="font-semibold">Vider Tous les Logs</h4>
                    <p class="text-sm text-orange-200">Supprime tous les fichiers de logs</p>
                </button>

            </div>
        </div>

    </div>

    <!-- Messages -->
    <div id="message" class="fixed top-4 right-4 hidden"></div>

    <script>
        const apiKey = new URLSearchParams(window.location.search).get('apiKey');

        function showMessage(text, type = 'success') {
            const messageDiv = document.getElementById('message');
            messageDiv.className = \`px-4 py-2 rounded-lg text-white \${type === 'success' ? 'bg-green-500' : 'bg-red-500'}\`;
            messageDiv.textContent = text;
            messageDiv.classList.remove('hidden');
            setTimeout(() => messageDiv.classList.add('hidden'), 3000);
        }

        async function makeRequest(endpoint, action) {
            try {
                const response = await fetch(\`/admin/\${endpoint}?apiKey=\${apiKey}\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
                const result = await response.json();
                
                if (result.success) {
                    showMessage(\`\${action} effectué avec succès\`, 'success');
                } else {
                    showMessage(\`Erreur: \${result.message}\`, 'error');
                }
            } catch (error) {
                showMessage(\`Erreur: \${error.message}\`, 'error');
            }
        }

        function forceGarbageCollection() {
            makeRequest('gc', 'Nettoyage mémoire');
        }

        function clearCache() {
            makeRequest('clear-cache', 'Vidage du cache');
        }

        function optimizeSystem() {
            makeRequest('optimize', 'Optimisation système');
        }

        function blockSuspiciousIPs() {
            makeRequest('block-ips', 'Blocage des IPs suspectes');
        }

        function resetRateLimit() {
            makeRequest('reset-limits', 'Reset du rate limiting');
        }

        function restartServer() {
            if (confirm('Êtes-vous sûr de vouloir redémarrer le serveur ?')) {
                makeRequest('restart', 'Redémarrage du serveur');
            }
        }

        function clearAllLogs() {
            if (confirm('Êtes-vous sûr de vouloir supprimer tous les logs ?')) {
                makeRequest('clear-logs', 'Suppression des logs');
            }
        }
    </script>

</body>
</html>`;

  res.send(controlHTML);
});

/**
 * POST /admin/gc - Force garbage collection
 */
router.post('/gc', verifyAdminKey, (req, res) => {
  try {
    if (global.gc) {
      const beforeMem = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
      global.gc();
      const afterMem = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
      
      logger.info('🧹 Garbage collection forcé par admin', {
        before: `${beforeMem}MB`,
        after: `${afterMem}MB`,
        freed: `${beforeMem - afterMem}MB`,
        ip: req.ip
      });
      
      res.json({
        success: true,
        message: `Mémoire libérée: ${beforeMem - afterMem}MB`
      });
    } else {
      res.json({
        success: false,
        message: 'Garbage collection non disponible'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors du nettoyage mémoire'
    });
  }
});

/**
 * POST /admin/optimize - Optimisation système
 */
router.post('/optimize', verifyAdminKey, (req, res) => {
  try {
    // Force GC + optimisations
    if (global.gc) global.gc();
    
    logger.info('⚡ Optimisation système déclenchée par admin', { ip: req.ip });
    
    res.json({
      success: true,
      message: 'Optimisation système effectuée'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'optimisation'
    });
  }
});

export default router;