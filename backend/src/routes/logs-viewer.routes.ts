// src/routes/logs-viewer.routes.ts
import { Router } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();

/**
 * GET /logs/viewer - Visualiseur de logs en temps réel
 */
router.get('/viewer', (req, res) => {
  const logsViewerHTML = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>📋 Logs Viewer - Sorikama</title>
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
        .log-line {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.4;
            padding: 4px 8px;
            border-left: 3px solid transparent;
        }
        .log-error { border-left-color: #ef4444; background: rgba(239, 68, 68, 0.1); }
        .log-warn { border-left-color: #f59e0b; background: rgba(245, 158, 11, 0.1); }
        .log-info { border-left-color: #3b82f6; background: rgba(59, 130, 246, 0.1); }
        .log-debug { border-left-color: #8b5cf6; background: rgba(139, 92, 246, 0.1); }
        .logs-container {
            max-height: 600px;
            overflow-y: auto;
            background: rgba(0, 0, 0, 0.3);
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
                        <div class="w-16 h-16 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center neon-glow">
                            <i class="fas fa-file-alt text-white text-2xl"></i>
                        </div>
                        <div>
                            <h1 class="text-3xl font-bold gradient-text">Logs Viewer</h1>
                            <p class="text-indigo-300">Visualisation des logs en temps réel</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-4">
                        <div class="flex items-center space-x-2">
                            <div class="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                            <span class="text-green-400 font-medium">Live</span>
                        </div>
                        <button onclick="toggleAutoRefresh()" id="autoRefreshBtn" class="bg-green-500 bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg text-green-300 hover:text-white transition-all">
                            <i class="fas fa-play mr-2"></i>Auto-refresh
                        </button>
                        <a href="/api" class="glass-morphism px-6 py-3 rounded-xl hover:bg-white hover:bg-opacity-10 transition-all">
                            <i class="fas fa-arrow-left mr-2"></i>Retour
                        </a>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Log Filters -->
        <div class="max-w-7xl mx-auto mb-6">
            <div class="glass-morphism rounded-2xl p-4">
                <div class="flex flex-wrap items-center gap-4">
                    <div class="flex items-center space-x-2">
                        <label class="text-sm font-medium text-gray-300">Fichier:</label>
                        <select id="logFileSelect" class="bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                            <option value="application.log">📱 Application</option>
                            <option value="error.log">❌ Erreurs</option>
                            <option value="security.log">🔒 Sécurité</option>
                            <option value="performance.log">⚡ Performance</option>
                            <option value="redis.log">🔴 Redis</option>
                            <option value="alerts.log">🚨 Alertes</option>
                            <option value="debug.log">🐛 Debug</option>
                            <option value="requests.log">📡 Requêtes</option>
                        </select>
                    </div>
                    
                    <div class="flex items-center space-x-2">
                        <label class="text-sm font-medium text-gray-300">Niveau:</label>
                        <select id="logLevelFilter" class="bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                            <option value="all">🔍 Tous les niveaux</option>
                            <option value="error">❌ Erreurs</option>
                            <option value="warn">⚠️ Avertissements</option>
                            <option value="info">ℹ️ Informations</option>
                            <option value="debug">🐛 Debug</option>
                        </select>
                    </div>
                    
                    <div class="flex items-center space-x-2">
                        <label class="text-sm font-medium text-gray-300">Recherche:</label>
                        <input type="text" id="searchInput" placeholder="🔍 Rechercher dans les logs..." class="bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    </div>
                    
                    <button onclick="clearLogs()" class="bg-red-500 bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg text-red-300 hover:text-white transition-all text-sm">
                        <i class="fas fa-trash mr-2"></i>Effacer
                    </button>
                    
                    <button onclick="downloadLogs()" class="bg-blue-500 bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg text-blue-300 hover:text-white transition-all text-sm">
                        <i class="fas fa-download mr-2"></i>Télécharger
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Logs Display -->
        <div class="max-w-7xl mx-auto">
            <div class="glass-morphism rounded-2xl p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold text-white flex items-center">
                        <i class="fas fa-terminal text-green-400 mr-3"></i>
                        Logs en Temps Réel
                    </h3>
                    <div class="text-sm text-gray-400">
                        <span id="logCount">0</span> lignes | Dernière mise à jour: <span id="lastUpdate">-</span>
                    </div>
                </div>
                
                <div id="logsContainer" class="logs-container rounded-lg p-4">
                    <div class="text-center text-gray-400 py-8">
                        <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
                        <p>Chargement des logs...</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        let autoRefreshInterval = null;
        let isAutoRefreshEnabled = false;
        
        async function loadLogs() {
            try {
                const logFile = document.getElementById('logFileSelect').value;
                const response = await fetch(\`/logs/content/\${logFile}\`);
                const data = await response.json();
                
                if (data.success) {
                    displayLogs(data.logs);
                    document.getElementById('lastUpdate').textContent = new Date().toLocaleTimeString('fr-FR');
                } else {
                    document.getElementById('logsContainer').innerHTML = \`
                        <div class="text-center text-red-400 py-8">
                            <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
                            <p>Erreur: \${data.message}</p>
                        </div>
                    \`;
                }
            } catch (error) {
                document.getElementById('logsContainer').innerHTML = \`
                    <div class="text-center text-red-400 py-8">
                        <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
                        <p>Erreur de chargement: \${error.message}</p>
                    </div>
                \`;
            }
        }
        
        function displayLogs(logs) {
            const container = document.getElementById('logsContainer');
            const levelFilter = document.getElementById('logLevelFilter').value;
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            
            let filteredLogs = logs;
            
            // Filtrer par niveau
            if (levelFilter !== 'all') {
                filteredLogs = filteredLogs.filter(log => log.level === levelFilter);
            }
            
            // Filtrer par recherche
            if (searchTerm) {
                filteredLogs = filteredLogs.filter(log => 
                    log.message.toLowerCase().includes(searchTerm) ||
                    log.timestamp.toLowerCase().includes(searchTerm)
                );
            }
            
            if (filteredLogs.length === 0) {
                container.innerHTML = \`
                    <div class="text-center text-gray-400 py-8">
                        <i class="fas fa-search text-2xl mb-2"></i>
                        <p>Aucun log trouvé avec les filtres actuels</p>
                    </div>
                \`;
                document.getElementById('logCount').textContent = '0';
                return;
            }
            
            const logsHTML = filteredLogs.map(log => \`
                <div class="log-line log-\${log.level}">
                    <span class="text-gray-400">\${log.timestamp}</span>
                    <span class="text-white font-semibold ml-2">[\${log.level.toUpperCase()}]</span>
                    <span class="text-gray-200 ml-2">\${log.message}</span>
                </div>
            \`).join('');
            
            container.innerHTML = logsHTML;
            document.getElementById('logCount').textContent = filteredLogs.length;
            
            // Auto-scroll vers le bas
            container.scrollTop = container.scrollHeight;
        }
        
        function toggleAutoRefresh() {
            const btn = document.getElementById('autoRefreshBtn');
            
            if (isAutoRefreshEnabled) {
                clearInterval(autoRefreshInterval);
                btn.innerHTML = '<i class="fas fa-play mr-2"></i>Auto-refresh';
                btn.className = 'bg-green-500 bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg text-green-300 hover:text-white transition-all';
                isAutoRefreshEnabled = false;
            } else {
                autoRefreshInterval = setInterval(loadLogs, 5000); // Refresh toutes les 5 secondes
                btn.innerHTML = '<i class="fas fa-pause mr-2"></i>Pause';
                btn.className = 'bg-red-500 bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg text-red-300 hover:text-white transition-all';
                isAutoRefreshEnabled = true;
            }
        }
        
        function clearLogs() {
            if (confirm('Êtes-vous sûr de vouloir effacer les logs?')) {
                document.getElementById('logsContainer').innerHTML = \`
                    <div class="text-center text-gray-400 py-8">
                        <i class="fas fa-broom text-2xl mb-2"></i>
                        <p>Logs effacés</p>
                    </div>
                \`;
                document.getElementById('logCount').textContent = '0';
            }
        }
        
        function downloadLogs() {
            const logFile = document.getElementById('logFileSelect').value;
            window.open(\`/logs/download/\${logFile}\`, '_blank');
        }
        
        // Event listeners
        document.getElementById('logFileSelect').addEventListener('change', loadLogs);
        document.getElementById('logLevelFilter').addEventListener('change', () => {
            // Re-filtrer les logs actuels
            loadLogs();
        });
        document.getElementById('searchInput').addEventListener('input', () => {
            // Re-filtrer les logs actuels
            loadLogs();
        });
        
        // Chargement initial
        loadLogs();
    </script>
</body>
</html>`;
  
  res.send(logsViewerHTML);
});

/**
 * GET /logs/content/:filename - Récupérer le contenu d'un fichier de log
 */
router.get('/content/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const logPath = path.join(process.cwd(), 'logs', filename);
    
    if (!fs.existsSync(logPath)) {
      return res.json({
        success: false,
        message: 'Fichier de log non trouvé'
      });
    }
    
    const logContent = fs.readFileSync(logPath, 'utf8');
    const lines = logContent.split('\n').filter(line => line.trim());
    
    // Parser les logs (format simple)
    const logs = lines.slice(-100).map(line => { // Dernières 100 lignes
      const parts = line.split(' ');
      const timestamp = parts[0] + ' ' + parts[1];
      const level = parts[2] ? parts[2].replace(/[\[\]]/g, '').toLowerCase() : 'info';
      const message = parts.slice(3).join(' ');
      
      return {
        timestamp,
        level: ['error', 'warn', 'info', 'debug'].includes(level) ? level : 'info',
        message
      };
    });
    
    res.json({
      success: true,
      logs: logs.reverse() // Plus récents en premier
    });
    
  } catch (error) {
    res.json({
      success: false,
      message: 'Erreur lors de la lecture du fichier de log'
    });
  }
});

/**
 * GET /logs/download/:filename - Télécharger un fichier de log
 */
router.get('/download/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const logPath = path.join(process.cwd(), 'logs', filename);
    
    if (!fs.existsSync(logPath)) {
      return res.status(404).json({
        success: false,
        message: 'Fichier de log non trouvé'
      });
    }
    
    res.download(logPath, filename);
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors du téléchargement'
    });
  }
});

export default router;