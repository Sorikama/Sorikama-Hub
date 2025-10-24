// src/routes/dashboard.routes.ts
import { Router } from 'express';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /dashboard - Page de tableau de bord après connexion
 */
router.get('/', (req: any, res) => {
  const user = req.portalUser;
  const apiKey = user?.apiKey || 'N/A';

  const dashboardHTML = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>📋 Dashboard - Sorikama Hub</title>
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
        .action-card {
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .action-card:hover {
            transform: translateY(-8px) scale(1.02);
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
                            <i class="fas fa-tachometer-alt text-white text-2xl"></i>
                        </div>
                        <div>
                            <h1 class="text-3xl font-bold gradient-text">Control Center</h1>
                            <p class="text-blue-300">Centre de contrôle Sorikama</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-4">
                        <div class="flex items-center space-x-2">
                            <div class="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                            <span class="text-green-400 font-medium">Opérationnel</span>
                        </div>
                        <a href="/api" class="glass-morphism px-6 py-3 rounded-xl hover:bg-white hover:bg-opacity-10 transition-all">
                            <i class="fas fa-home mr-2"></i>Accueil
                        </a>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Actions Grid -->
        <div class="max-w-7xl mx-auto">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                
                <!-- API Testing -->
                <div class="glass-morphism rounded-2xl p-8 action-card">
                    <div class="flex items-center space-x-4 mb-6">
                        <div class="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                            <i class="fas fa-code text-white text-2xl"></i>
                        </div>
                        <div>
                            <h3 class="text-2xl font-bold text-white">API Testing</h3>
                            <p class="text-blue-300 font-medium">Interface Swagger</p>
                        </div>
                    </div>
                    <p class="text-gray-300 leading-relaxed mb-6">
                        Testez tous les endpoints de l'API Sorikama avec une interface interactive complète.
                    </p>
                    <a href="/api-docs" class="inline-flex items-center bg-blue-500 bg-opacity-20 hover:bg-opacity-30 px-6 py-3 rounded-xl text-blue-300 hover:text-white transition-all font-semibold">
                        <i class="fas fa-rocket mr-2"></i>Ouvrir Swagger
                    </a>
                </div>
                
                <!-- Performance Monitoring -->
                <div class="glass-morphism rounded-2xl p-8 action-card">
                    <div class="flex items-center space-x-4 mb-6">
                        <div class="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                            <i class="fas fa-chart-line text-white text-2xl"></i>
                        </div>
                        <div>
                            <h3 class="text-2xl font-bold text-white">Monitoring</h3>
                            <p class="text-green-300 font-medium">Métriques Temps Réel</p>
                        </div>
                    </div>
                    <p class="text-gray-300 leading-relaxed mb-6">
                        Surveillez les performances, les métriques et la santé du système en temps réel.
                    </p>
                    <a href="/performance/metrics" class="inline-flex items-center bg-green-500 bg-opacity-20 hover:bg-opacity-30 px-6 py-3 rounded-xl text-green-300 hover:text-white transition-all font-semibold">
                        <i class="fas fa-chart-bar mr-2"></i>Voir Métriques
                    </a>
                </div>
                
                <!-- System Administration -->
                <div class="glass-morphism rounded-2xl p-8 action-card">
                    <div class="flex items-center space-x-4 mb-6">
                        <div class="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center">
                            <i class="fas fa-shield-alt text-white text-2xl"></i>
                        </div>
                        <div>
                            <h3 class="text-2xl font-bold text-white">Administration</h3>
                            <p class="text-red-300 font-medium">Gestion Système</p>
                        </div>
                    </div>
                    <p class="text-gray-300 leading-relaxed mb-6">
                        Accédez aux statistiques administrateur et aux outils de gestion du système.
                    </p>
                    <a href="/admin/stats?apiKey=${apiKey}" class="inline-flex items-center bg-red-500 bg-opacity-20 hover:bg-opacity-30 px-6 py-3 rounded-xl text-red-300 hover:text-white transition-all font-semibold">
                        <i class="fas fa-cogs mr-2"></i>Admin Panel
                    </a>
                </div>
                
            </div>
        </div>
    </div>
</body>
</html>`;

  res.send(dashboardHTML);
});

export default router;