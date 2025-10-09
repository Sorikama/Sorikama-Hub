// src/routes/dashboard.routes.ts
import { Router } from 'express';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /dashboard - Page de tableau de bord après connexion
 */
router.get('/', (req, res) => {
  const apiKey = req.query.apiKey as string;
  
  if (!apiKey) {
    return res.redirect('/swagger/login');
  }

  const dashboardHTML = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Sorikama API Gateway</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <style>
        body { font-family: 'Inter', sans-serif; }
        .card-hover:hover { transform: translateY(-2px); transition: all 0.3s ease; }
        .pulse-dot { animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    </style>
</head>
<body class="bg-gray-50 min-h-screen">

    <!-- Header -->
    <nav class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center py-4">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <i class="fas fa-network-wired text-white"></i>
                    </div>
                    <div>
                        <h1 class="text-xl font-bold text-gray-900">Sorikama Dashboard</h1>
                        <p class="text-xs text-gray-500">API Gateway Control Panel</p>
                    </div>
                </div>
                <div class="flex items-center space-x-4">
                    <div class="flex items-center space-x-2">
                        <div class="w-3 h-3 bg-green-400 rounded-full pulse-dot"></div>
                        <span class="text-sm text-green-600 font-medium">Connecté</span>
                    </div>
                    <div class="text-sm text-gray-500">
                        <i class="fas fa-key mr-1"></i>
                        API Key: <span class="font-mono text-xs">${apiKey.substring(0, 20)}...</span>
                    </div>
                </div>
            </div>
        </div>
    </nav>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <!-- Welcome Section -->
        <div class="mb-8">
            <h2 class="text-3xl font-bold text-gray-900 mb-2">Bienvenue dans Sorikama Hub</h2>
            <p class="text-gray-600">Votre tableau de bord centralisé pour gérer l'écosystème Sorikama</p>
        </div>

        <!-- Quick Actions -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            
            <div class="bg-white rounded-xl shadow-sm border card-hover p-6">
                <div class="flex items-center justify-between mb-4">
                    <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <i class="fas fa-code text-blue-600 text-xl"></i>
                    </div>
                    <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">API</span>
                </div>
                <h3 class="font-semibold text-gray-900 mb-2">Swagger UI</h3>
                <p class="text-sm text-gray-600 mb-4">Interface interactive pour tester l'API</p>
                <a href="/api-docs" target="_blank" class="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Ouvrir Swagger <i class="fas fa-external-link-alt ml-1 text-xs"></i>
                </a>
            </div>

            <div class="bg-white rounded-xl shadow-sm border card-hover p-6">
                <div class="flex items-center justify-between mb-4">
                    <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <i class="fas fa-chart-line text-green-600 text-xl"></i>
                    </div>
                    <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">LIVE</span>
                </div>
                <h3 class="font-semibold text-gray-900 mb-2">Métriques</h3>
                <p class="text-sm text-gray-600 mb-4">Performance et statistiques temps réel</p>
                <a href="/performance/metrics" target="_blank" class="inline-flex items-center text-green-600 hover:text-green-800 text-sm font-medium">
                    Voir Métriques <i class="fas fa-external-link-alt ml-1 text-xs"></i>
                </a>
            </div>

            <div class="bg-white rounded-xl shadow-sm border card-hover p-6">
                <div class="flex items-center justify-between mb-4">
                    <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <i class="fas fa-book text-purple-600 text-xl"></i>
                    </div>
                    <span class="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">DOCS</span>
                </div>
                <h3 class="font-semibold text-gray-900 mb-2">Documentation</h3>
                <p class="text-sm text-gray-600 mb-4">Guide complet d'utilisation</p>
                <a href="/documentation?token=dashboard_access" target="_blank" class="inline-flex items-center text-purple-600 hover:text-purple-800 text-sm font-medium">
                    Lire Docs <i class="fas fa-external-link-alt ml-1 text-xs"></i>
                </a>
            </div>

            <div class="bg-white rounded-xl shadow-sm border card-hover p-6">
                <div class="flex items-center justify-between mb-4">
                    <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                        <i class="fas fa-shield-alt text-red-600 text-xl"></i>
                    </div>
                    <span class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">ADMIN</span>
                </div>
                <h3 class="font-semibold text-gray-900 mb-2">Administration</h3>
                <p class="text-sm text-gray-600 mb-4">Gestion système et sécurité</p>
                <a href="/api/v1/admin/stats" target="_blank" class="inline-flex items-center text-red-600 hover:text-red-800 text-sm font-medium">
                    Admin Panel <i class="fas fa-external-link-alt ml-1 text-xs"></i>
                </a>
            </div>

        </div>

        <!-- Services Status -->
        <div class="bg-white rounded-xl shadow-sm border p-6 mb-8">
            <h3 class="text-lg font-semibold text-gray-900 mb-6">Services Sorikama</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                
                <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div class="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <i class="fas fa-store text-white"></i>
                    </div>
                    <div class="flex-1">
                        <h4 class="font-medium text-gray-900">SoriStore</h4>
                        <p class="text-sm text-gray-500">E-commerce Platform</p>
                    </div>
                    <div class="w-3 h-3 bg-green-400 rounded-full pulse-dot"></div>
                </div>

                <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div class="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                        <i class="fas fa-credit-card text-white"></i>
                    </div>
                    <div class="flex-1">
                        <h4 class="font-medium text-gray-900">SoriPay</h4>
                        <p class="text-sm text-gray-500">Payment Gateway</p>
                    </div>
                    <div class="w-3 h-3 bg-green-400 rounded-full pulse-dot"></div>
                </div>

                <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div class="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                        <i class="fas fa-wallet text-white"></i>
                    </div>
                    <div class="flex-1">
                        <h4 class="font-medium text-gray-900">SoriWallet</h4>
                        <p class="text-sm text-gray-500">Digital Wallet</p>
                    </div>
                    <div class="w-3 h-3 bg-green-400 rounded-full pulse-dot"></div>
                </div>

                <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div class="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                        <i class="fas fa-graduation-cap text-white"></i>
                    </div>
                    <div class="flex-1">
                        <h4 class="font-medium text-gray-900">SoriLearn</h4>
                        <p class="text-sm text-gray-500">Learning Platform</p>
                    </div>
                    <div class="w-3 h-3 bg-green-400 rounded-full pulse-dot"></div>
                </div>

                <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div class="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                        <i class="fas fa-heartbeat text-white"></i>
                    </div>
                    <div class="flex-1">
                        <h4 class="font-medium text-gray-900">SoriHealth</h4>
                        <p class="text-sm text-gray-500">Health Services</p>
                    </div>
                    <div class="w-3 h-3 bg-green-400 rounded-full pulse-dot"></div>
                </div>

                <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div class="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                        <i class="fas fa-universal-access text-white"></i>
                    </div>
                    <div class="flex-1">
                        <h4 class="font-medium text-gray-900">SoriAccess</h4>
                        <p class="text-sm text-gray-500">Accessibility Tools</p>
                    </div>
                    <div class="w-3 h-3 bg-green-400 rounded-full pulse-dot"></div>
                </div>

            </div>
        </div>

        <!-- API Information -->
        <div class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white p-6">
            <div class="flex items-center justify-between">
                <div>
                    <h3 class="text-xl font-bold mb-2">Prêt à utiliser l'API ?</h3>
                    <p class="text-blue-100 mb-4">Accédez à l'interface Swagger pour tester tous les endpoints disponibles</p>
                    <div class="flex space-x-4">
                        <a href="/api-docs" target="_blank" class="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                            <i class="fas fa-rocket mr-2"></i>Ouvrir Swagger
                        </a>
                        <a href="/performance/health" target="_blank" class="bg-blue-400 bg-opacity-30 text-white px-6 py-2 rounded-lg font-medium hover:bg-opacity-40 transition-colors">
                            <i class="fas fa-heartbeat mr-2"></i>Health Check
                        </a>
                    </div>
                </div>
                <div class="hidden md:block">
                    <i class="fas fa-code text-6xl text-blue-200"></i>
                </div>
            </div>
        </div>

    </div>

    <script>
        // Mise à jour de l'heure
        function updateTime() {
            const now = new Date();
            const timeElements = document.querySelectorAll('.current-time');
            timeElements.forEach(el => {
                el.textContent = now.toLocaleTimeString('fr-FR');
            });
        }
        updateTime();
        setInterval(updateTime, 1000);
    </script>

</body>
</html>`;

  res.send(dashboardHTML);
});

export default router;