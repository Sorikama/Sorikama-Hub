// src/routes/dependencies.routes.ts
import { Router } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();

/**
 * GET /dependencies - Page des dépendances du projet
 */
router.get('/', (req, res) => {
  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    const dependenciesHTML = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>📦 Dépendances - Sorikama Hub</title>
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
        .dep-card {
            transition: all 0.3s ease;
        }
        .dep-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4);
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
                        <div class="w-16 h-16 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-2xl flex items-center justify-center neon-glow">
                            <i class="fas fa-cube text-white text-2xl"></i>
                        </div>
                        <div>
                            <h1 class="text-3xl font-bold gradient-text">Dépendances</h1>
                            <p class="text-purple-300">Packages et versions installés</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-4">
                        <div class="text-sm text-gray-300">
                            <i class="fas fa-box mr-2"></i>
                            ${Object.keys(packageJson.dependencies || {}).length + Object.keys(packageJson.devDependencies || {}).length} packages
                        </div>
                        <a href="/api" class="glass-morphism px-6 py-3 rounded-xl hover:bg-white hover:bg-opacity-10 transition-all">
                            <i class="fas fa-arrow-left mr-2"></i>Retour
                        </a>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Project Info -->
        <div class="max-w-7xl mx-auto mb-8">
            <div class="glass-morphism rounded-2xl p-6">
                <h2 class="text-2xl font-bold text-white mb-4">Informations Projet</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="text-center">
                        <div class="text-3xl font-bold text-blue-400">${packageJson.name || 'N/A'}</div>
                        <p class="text-gray-400 text-sm">Nom du Projet</p>
                    </div>
                    <div class="text-center">
                        <div class="text-3xl font-bold text-green-400">${packageJson.version || 'N/A'}</div>
                        <p class="text-gray-400 text-sm">Version</p>
                    </div>
                    <div class="text-center">
                        <div class="text-3xl font-bold text-purple-400">Node.js</div>
                        <p class="text-gray-400 text-sm">${process.version}</p>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Dependencies -->
        <div class="max-w-7xl mx-auto">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                <!-- Production Dependencies -->
                <div class="glass-morphism rounded-2xl p-6">
                    <h3 class="text-xl font-bold text-white mb-6 flex items-center">
                        <i class="fas fa-box text-green-400 mr-3"></i>
                        Dépendances Production (${Object.keys(packageJson.dependencies || {}).length})
                    </h3>
                    <div class="space-y-3 max-h-96 overflow-y-auto">
                        ${Object.entries(packageJson.dependencies || {}).map(([name, version]) => `
                        <div class="dep-card glass-morphism rounded-lg p-4">
                            <div class="flex justify-between items-center">
                                <div>
                                    <h4 class="font-semibold text-white">${name}</h4>
                                    <p class="text-sm text-gray-400">Production</p>
                                </div>
                                <div class="text-right">
                                    <span class="bg-green-500 bg-opacity-20 text-green-300 px-3 py-1 rounded-full text-sm font-mono">${version}</span>
                                </div>
                            </div>
                        </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Dev Dependencies -->
                <div class="glass-morphism rounded-2xl p-6">
                    <h3 class="text-xl font-bold text-white mb-6 flex items-center">
                        <i class="fas fa-tools text-blue-400 mr-3"></i>
                        Dépendances Développement (${Object.keys(packageJson.devDependencies || {}).length})
                    </h3>
                    <div class="space-y-3 max-h-96 overflow-y-auto">
                        ${Object.entries(packageJson.devDependencies || {}).map(([name, version]) => `
                        <div class="dep-card glass-morphism rounded-lg p-4">
                            <div class="flex justify-between items-center">
                                <div>
                                    <h4 class="font-semibold text-white">${name}</h4>
                                    <p class="text-sm text-gray-400">Développement</p>
                                </div>
                                <div class="text-right">
                                    <span class="bg-blue-500 bg-opacity-20 text-blue-300 px-3 py-1 rounded-full text-sm font-mono">${version}</span>
                                </div>
                            </div>
                        </div>
                        `).join('')}
                    </div>
                </div>
                
            </div>
        </div>
    </div>
</body>
</html>`;
    
    res.send(dependenciesHTML);
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la lecture des dépendances'
    });
  }
});

export default router;