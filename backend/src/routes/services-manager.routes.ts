// src/routes/services-manager.routes.ts
import { Router } from 'express';
import { logger } from '../utils/logger';

const router = Router();

// Configuration des services externes
const EXTERNAL_SERVICES = [
  {
    id: 'soristore',
    name: 'SoriStore',
    description: 'Plateforme e-commerce révolutionnaire',
    url: process.env.SORISTORE_SERVICE_URL || 'http://localhost:3001',
    icon: 'fas fa-store',
    color: 'blue',
    status: 'active',
    endpoints: ['/products', '/orders', '/inventory'],
    version: '2.1.0'
  },
  {
    id: 'soripay',
    name: 'SoriPay',
    description: 'Solution de paiement sécurisée',
    url: process.env.SORIPAY_SERVICE_URL || 'http://localhost:3002',
    icon: 'fas fa-credit-card',
    color: 'green',
    status: 'active',
    endpoints: ['/payments', '/transactions', '/refunds'],
    version: '1.8.3'
  },
  {
    id: 'soriwallet',
    name: 'SoriWallet',
    description: 'Portefeuille numérique intelligent',
    url: process.env.SORIWALLET_SERVICE_URL || 'http://localhost:3003',
    icon: 'fas fa-wallet',
    color: 'yellow',
    status: 'active',
    endpoints: ['/balance', '/transfers', '/history'],
    version: '1.5.2'
  },
  {
    id: 'sorilearn',
    name: 'SoriLearn',
    description: 'Plateforme d\'apprentissage adaptative',
    url: process.env.SORILEARN_SERVICE_URL || 'http://localhost:3004',
    icon: 'fas fa-graduation-cap',
    color: 'purple',
    status: 'active',
    endpoints: ['/courses', '/progress', '/certificates'],
    version: '3.0.1'
  },
  {
    id: 'sorihealth',
    name: 'SoriHealth',
    description: 'Services de santé connectée',
    url: process.env.SORIHEALTH_SERVICE_URL || 'http://localhost:3005',
    icon: 'fas fa-heartbeat',
    color: 'red',
    status: 'active',
    endpoints: ['/appointments', '/records', '/monitoring'],
    version: '2.3.0'
  },
  {
    id: 'soriaccess',
    name: 'SoriAccess',
    description: 'Solutions d\'accessibilité universelle',
    url: process.env.SORIACCESS_SERVICE_URL || 'http://localhost:3006',
    icon: 'fas fa-universal-access',
    color: 'indigo',
    status: 'active',
    endpoints: ['/accessibility', '/tools', '/support'],
    version: '1.2.4'
  }
];

// État des services (en mémoire pour la démo)
let servicesStatus = new Map();
EXTERNAL_SERVICES.forEach(service => {
  servicesStatus.set(service.id, {
    ...service,
    lastCheck: new Date(),
    responseTime: Math.floor(Math.random() * 100) + 20,
    uptime: Math.floor(Math.random() * 99) + 95,
    requests: Math.floor(Math.random() * 10000) + 1000
  });
});

/**
 * GET /services/manager - Gestionnaire des services externes
 */
router.get('/manager', async (req, res) => {
  const services = Array.from(servicesStatus.values());
  
  const managerHTML = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🔗 Services Manager - Sorikama</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700;900&display=swap" rel="stylesheet">
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
        .service-card {
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .service-card:hover {
            transform: translateY(-8px) scale(1.02);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        }
        .status-dot {
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
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
                        <div class="w-16 h-16 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-2xl flex items-center justify-center neon-glow">
                            <i class="fas fa-network-wired text-white text-2xl"></i>
                        </div>
                        <div>
                            <h1 class="text-3xl font-bold gradient-text">Services Manager</h1>
                            <p class="text-cyan-300">Gestion des services externes Sorikama</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-4">
                        <button onclick="refreshAllServices()" class="bg-blue-500 bg-opacity-20 hover:bg-opacity-30 px-6 py-3 rounded-xl text-blue-300 hover:text-white transition-all font-semibold">
                            <i class="fas fa-sync-alt mr-2"></i>Actualiser Tout
                        </button>
                        <a href="/api" class="glass-morphism px-6 py-3 rounded-xl hover:bg-white hover:bg-opacity-10 transition-all">
                            <i class="fas fa-arrow-left mr-2"></i>Retour
                        </a>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Services Overview -->
        <div class="max-w-7xl mx-auto mb-8">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div class="glass-morphism rounded-2xl p-6 text-center">
                    <div class="text-3xl font-bold text-blue-400">${services.length}</div>
                    <p class="text-gray-400 text-sm">Services Totaux</p>
                </div>
                <div class="glass-morphism rounded-2xl p-6 text-center">
                    <div class="text-3xl font-bold text-green-400">${services.filter(s => s.status === 'active').length}</div>
                    <p class="text-gray-400 text-sm">Actifs</p>
                </div>
                <div class="glass-morphism rounded-2xl p-6 text-center">
                    <div class="text-3xl font-bold text-red-400">${services.filter(s => s.status === 'inactive').length}</div>
                    <p class="text-gray-400 text-sm">Inactifs</p>
                </div>
                <div class="glass-morphism rounded-2xl p-6 text-center">
                    <div class="text-3xl font-bold text-yellow-400">${Math.round(services.reduce((acc, s) => acc + s.uptime, 0) / services.length)}%</div>
                    <p class="text-gray-400 text-sm">Uptime Moyen</p>
                </div>
            </div>
        </div>
        
        <!-- Services Grid -->
        <div class="max-w-7xl mx-auto">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                ${services.map(service => `
                <div class="service-card glass-morphism rounded-2xl p-8">
                    <div class="flex justify-between items-start mb-6">
                        <div class="flex items-center space-x-4">
                            <div class="w-16 h-16 bg-${service.color}-500 rounded-2xl flex items-center justify-center">
                                <i class="${service.icon} text-white text-2xl"></i>
                            </div>
                            <div>
                                <h3 class="text-2xl font-bold text-white">${service.name}</h3>
                                <p class="text-${service.color}-300 font-medium">v${service.version}</p>
                            </div>
                        </div>
                        <div class="flex items-center space-x-2">
                            <div class="w-3 h-3 bg-${service.status === 'active' ? 'green' : 'red'}-400 rounded-full status-dot"></div>
                            <span class="text-${service.status === 'active' ? 'green' : 'red'}-400 font-medium text-sm">
                                ${service.status === 'active' ? 'Actif' : 'Inactif'}
                            </span>
                        </div>
                    </div>
                    
                    <p class="text-gray-300 mb-6">${service.description}</p>
                    
                    <!-- Service Metrics -->
                    <div class="grid grid-cols-3 gap-4 mb-6">
                        <div class="text-center">
                            <div class="text-xl font-bold text-${service.color}-400">${service.responseTime}ms</div>
                            <p class="text-gray-400 text-xs">Temps Réponse</p>
                        </div>
                        <div class="text-center">
                            <div class="text-xl font-bold text-green-400">${service.uptime}%</div>
                            <p class="text-gray-400 text-xs">Uptime</p>
                        </div>
                        <div class="text-center">
                            <div class="text-xl font-bold text-blue-400">${service.requests.toLocaleString()}</div>
                            <p class="text-gray-400 text-xs">Requêtes</p>
                        </div>
                    </div>
                    
                    <!-- Service URL -->
                    <div class="mb-6">
                        <p class="text-gray-400 text-sm mb-2">URL du Service:</p>
                        <code class="text-${service.color}-300 bg-black bg-opacity-30 px-3 py-2 rounded-lg text-sm font-mono break-all">${service.url}</code>
                    </div>
                    
                    <!-- Endpoints -->
                    <div class="mb-6">
                        <p class="text-gray-400 text-sm mb-3">Endpoints Disponibles:</p>
                        <div class="flex flex-wrap gap-2">
                            ${service.endpoints.map(endpoint => `
                            <span class="bg-${service.color}-500 bg-opacity-20 text-${service.color}-300 px-3 py-1 rounded-full text-xs font-mono">
                                ${endpoint}
                            </span>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- Actions -->
                    <div class="flex space-x-3">
                        <button onclick="testService('${service.id}')" class="flex-1 bg-blue-500 bg-opacity-20 hover:bg-opacity-30 px-4 py-3 rounded-xl text-blue-300 hover:text-white transition-all font-semibold text-sm">
                            <i class="fas fa-vial mr-2"></i>Tester
                        </button>
                        
                        ${service.status === 'active' ? `
                        <button onclick="disconnectService('${service.id}')" class="flex-1 bg-red-500 bg-opacity-20 hover:bg-opacity-30 px-4 py-3 rounded-xl text-red-300 hover:text-white transition-all font-semibold text-sm">
                            <i class="fas fa-unlink mr-2"></i>Déconnecter
                        </button>
                        ` : `
                        <button onclick="connectService('${service.id}')" class="flex-1 bg-green-500 bg-opacity-20 hover:bg-opacity-30 px-4 py-3 rounded-xl text-green-300 hover:text-white transition-all font-semibold text-sm">
                            <i class="fas fa-link mr-2"></i>Connecter
                        </button>
                        `}
                        
                        <button onclick="viewLogs('${service.id}')" class="bg-gray-500 bg-opacity-20 hover:bg-opacity-30 px-4 py-3 rounded-xl text-gray-300 hover:text-white transition-all text-sm">
                            <i class="fas fa-file-alt"></i>
                        </button>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
    </div>
    
    <!-- Modal Test Results -->
    <div id="testModal" class="fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center z-50">
        <div class="glass-morphism rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-xl font-bold text-white">Résultats du Test</h3>
                <button onclick="closeTestModal()" class="text-gray-400 hover:text-white">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
            <div id="testResults" class="text-gray-300">
                <!-- Résultats du test -->
            </div>
        </div>
    </div>
    
    <script>
        async function testService(serviceId) {
            try {
                const response = await fetch(\`/services/test/\${serviceId}\`, { method: 'POST' });
                const result = await response.json();
                
                const resultsHTML = \`
                    <div class="space-y-4">
                        <div class="flex items-center space-x-3">
                            <div class="w-4 h-4 bg-\${result.success ? 'green' : 'red'}-400 rounded-full"></div>
                            <span class="font-semibold">\${result.success ? 'Test Réussi' : 'Test Échoué'}</span>
                        </div>
                        <div class="bg-black bg-opacity-30 p-4 rounded-lg">
                            <pre class="text-sm text-gray-300">\${JSON.stringify(result, null, 2)}</pre>
                        </div>
                    </div>
                \`;
                
                document.getElementById('testResults').innerHTML = resultsHTML;
                document.getElementById('testModal').classList.remove('hidden');
                
            } catch (error) {
                document.getElementById('testResults').innerHTML = \`
                    <div class="text-red-400">
                        <i class="fas fa-exclamation-triangle mr-2"></i>
                        Erreur: \${error.message}
                    </div>
                \`;
                document.getElementById('testModal').classList.remove('hidden');
            }
        }
        
        async function disconnectService(serviceId) {
            if (confirm('Êtes-vous sûr de vouloir déconnecter ce service?')) {
                try {
                    const response = await fetch(\`/services/disconnect/\${serviceId}\`, { method: 'POST' });
                    const result = await response.json();
                    
                    if (result.success) {
                        location.reload();
                    } else {
                        alert('Erreur: ' + result.message);
                    }
                } catch (error) {
                    alert('Erreur: ' + error.message);
                }
            }
        }
        
        async function connectService(serviceId) {
            try {
                const response = await fetch(\`/services/connect/\${serviceId}\`, { method: 'POST' });
                const result = await response.json();
                
                if (result.success) {
                    location.reload();
                } else {
                    alert('Erreur: ' + result.message);
                }
            } catch (error) {
                alert('Erreur: ' + error.message);
            }
        }
        
        function viewLogs(serviceId) {
            window.open(\`/logs/viewer?service=\${serviceId}\`, '_blank');
        }
        
        function closeTestModal() {
            document.getElementById('testModal').classList.add('hidden');
        }
        
        async function refreshAllServices() {
            location.reload();
        }
        
        // Auto-refresh every 30 seconds
        setInterval(() => {
            location.reload();
        }, 30000);
    </script>
</body>
</html>`;
  
  res.send(managerHTML);
});

/**
 * POST /services/test/:serviceId - Tester un service
 */
router.post('/test/:serviceId', async (req, res) => {
  try {
    const serviceId = req.params.serviceId;
    const service = servicesStatus.get(serviceId);
    
    if (!service) {
      return res.json({
        success: false,
        message: 'Service non trouvé'
      });
    }
    
    // Simulation d'un test de service
    const startTime = Date.now();
    const isHealthy = Math.random() > 0.1; // 90% de chance de succès
    const responseTime = Math.floor(Math.random() * 200) + 50;
    
    // Mise à jour des métriques
    service.lastCheck = new Date();
    service.responseTime = responseTime;
    servicesStatus.set(serviceId, service);
    
    logger.info(`🧪 Test du service ${service.name}`, {
      serviceId,
      success: isHealthy,
      responseTime,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: isHealthy,
      service: service.name,
      url: service.url,
      responseTime: responseTime,
      timestamp: new Date().toISOString(),
      endpoints: service.endpoints,
      message: isHealthy ? 'Service opérationnel' : 'Service indisponible'
    });
    
  } catch (error) {
    res.json({
      success: false,
      message: 'Erreur lors du test du service'
    });
  }
});

/**
 * POST /services/disconnect/:serviceId - Déconnecter un service
 */
router.post('/disconnect/:serviceId', async (req, res) => {
  try {
    const serviceId = req.params.serviceId;
    const service = servicesStatus.get(serviceId);
    
    if (!service) {
      return res.json({
        success: false,
        message: 'Service non trouvé'
      });
    }
    
    service.status = 'inactive';
    servicesStatus.set(serviceId, service);
    
    logger.warn(`🔌 Service ${service.name} déconnecté`, {
      serviceId,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      message: `Service ${service.name} déconnecté avec succès`
    });
    
  } catch (error) {
    res.json({
      success: false,
      message: 'Erreur lors de la déconnexion du service'
    });
  }
});

/**
 * POST /services/connect/:serviceId - Connecter un service
 */
router.post('/connect/:serviceId', async (req, res) => {
  try {
    const serviceId = req.params.serviceId;
    const service = servicesStatus.get(serviceId);
    
    if (!service) {
      return res.json({
        success: false,
        message: 'Service non trouvé'
      });
    }
    
    service.status = 'active';
    service.lastCheck = new Date();
    servicesStatus.set(serviceId, service);
    
    logger.info(`🔗 Service ${service.name} connecté`, {
      serviceId,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      message: `Service ${service.name} connecté avec succès`
    });
    
  } catch (error) {
    res.json({
      success: false,
      message: 'Erreur lors de la connexion du service'
    });
  }
});

export default router;