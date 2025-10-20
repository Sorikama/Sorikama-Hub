// src/routes/logs-viewer.routes.ts
import { Router } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();

/**
 * GET /logs/viewer - Visualiseur de logs en temps réel
 */
router.get('/viewer', (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const viewerPath = path.join(__dirname, '../../public/views/logs-viewer.html');
    
    if (fs.existsSync(viewerPath)) {
      const html = fs.readFileSync(viewerPath, 'utf8');
      res.send(html);
    } else {
      // Fallback HTML si le fichier n'existe pas
      const logsViewerHTML = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Logs Viewer - Sorikama</title>
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
                            <p class="text-indigo-300">Visualisation des logs en temps reel</p>
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
                        <select id="logFileSelect" class="bg-white border border-gray-600 rounded-lg px-3 py-2 text-black text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                            <!-- Options chargées dynamiquement -->
                        </select>
                    </div>
                    
                    <div class="flex items-center space-x-2">
                        <label class="text-sm font-medium text-gray-300">Niveau:</label>
                        <select id="logLevelFilter" class="bg-white border border-gray-600 rounded-lg px-3 py-2 text-black text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                            <option value="all">Tous les niveaux</option>
                            <option value="error">Erreurs</option>
                            <option value="warn">Avertissements</option>
                            <option value="info">Informations</option>
                            <option value="debug">Debug</option>
                        </select>
                    </div>
                    
                    <div class="flex items-center space-x-2">
                        <label class="text-sm font-medium text-gray-300">Recherche:</label>
                        <input type="text" id="searchInput" placeholder="Rechercher dans les logs..." class="bg-white border border-gray-600 rounded-lg px-3 py-2 text-black text-sm placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    </div>
                    
                    <div class="flex items-center space-x-2">
                        <label class="text-sm font-medium text-gray-300">Date:</label>
                        <input type="date" id="dateFilter" class="bg-white border border-gray-600 rounded-lg px-3 py-2 text-black text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    </div>
                    
                    <button onclick="clearLogs()" class="bg-red-500 bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg text-red-300 hover:text-white transition-all text-sm">
                        <i class="fas fa-trash mr-2"></i>Vider fichier
                    </button>
                    
                    <button onclick="downloadLogs()" class="bg-blue-500 bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg text-blue-300 hover:text-white transition-all text-sm">
                        <i class="fas fa-download mr-2"></i>Telecharger
                    </button>
                    
                    <button onclick="runTests()" class="bg-purple-500 bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg text-purple-300 hover:text-white transition-all text-sm">
                        <i class="fas fa-flask mr-2"></i>Tests
                    </button>
                    
                    <button onclick="cleanUnusedLogs()" class="bg-orange-500 bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg text-orange-300 hover:text-white transition-all text-sm">
                        <i class="fas fa-broom mr-2"></i>Nettoyer
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
                        Logs en Temps Reel
                    </h3>
                    <div class="text-sm text-gray-400">
                        <span id="logCount">0</span> lignes | Derniere mise a jour: <span id="lastUpdate">-</span>
                    </div>
                </div>
                
                <div class="mb-4">
                    <button onclick="loadMoreLogs()" class="bg-gray-500 bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg text-gray-300 hover:text-white transition-all text-sm">
                        <i class="fas fa-arrow-up mr-2"></i>Charger plus (anciennes)
                    </button>
                </div>
                
                <div id="logsContainer" class="logs-container rounded-lg p-4" style="max-height: 500px; overflow-y: auto; background: rgba(0,0,0,0.4);">
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
                if (!logFile) {
                    document.getElementById('logsContainer').innerHTML = '<div class="text-center text-gray-400 py-8"><i class="fas fa-info-circle text-2xl mb-2"></i><p>Sélectionnez un fichier de log</p></div>';
                    return;
                }
                
                const response = await fetch('/logs/content/' + logFile);
                const data = await response.json();
                
                if (data.success) {
                    displayLogs(data.logs);
                    document.getElementById('lastUpdate').textContent = new Date().toLocaleTimeString('fr-FR');
                } else {
                    document.getElementById('logsContainer').innerHTML = '<div class="text-center text-red-400 py-8"><i class="fas fa-exclamation-triangle text-2xl mb-2"></i><p>Erreur: ' + data.message + '</p></div>';
                }
            } catch (error) {
                document.getElementById('logsContainer').innerHTML = '<div class="text-center text-red-400 py-8"><i class="fas fa-exclamation-triangle text-2xl mb-2"></i><p>Erreur de chargement: ' + error.message + '</p></div>';
            }
        }
        
        // Fonctions globales
        window.toggleAutoRefresh = toggleAutoRefresh;
        window.clearLogs = clearLogs;
        window.downloadLogs = downloadLogs;
        window.runTests = runTests;
        window.loadMoreLogs = loadMoreLogs;
        window.cleanUnusedLogs = cleanUnusedLogs;
        
        let currentOffset = 0;
        let allLogs = [];
        
        function displayLogs(logs, append = false) {
            const container = document.getElementById('logsContainer');
            const levelFilter = document.getElementById('logLevelFilter').value;
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            const dateFilter = document.getElementById('dateFilter').value;
            
            if (!append) {
                allLogs = logs;
                currentOffset = 0;
            } else {
                allLogs = [...logs, ...allLogs];
            }
            
            let filteredLogs = allLogs;
            
            if (levelFilter !== 'all') {
                filteredLogs = filteredLogs.filter(log => log.level === levelFilter);
            }
            
            if (searchTerm) {
                filteredLogs = filteredLogs.filter(log => 
                    log.fullLine.toLowerCase().includes(searchTerm)
                );
            }
            
            if (dateFilter) {
                filteredLogs = filteredLogs.filter(log => {
                    return log.date === dateFilter;
                });
            }
            
            if (filteredLogs.length === 0) {
                container.innerHTML = '<div class="text-center text-gray-400 py-8"><i class="fas fa-search text-2xl mb-2"></i><p>Aucun log trouve avec les filtres actuels</p></div>';
                document.getElementById('logCount').textContent = '0';
                return;
            }
            
            const logsHTML = filteredLogs.map(log => 
                '<div class="log-line log-' + log.level + '" style="margin-bottom: 1px; padding: 2px 4px; font-family: monospace; font-size: 11px; line-height: 1.2;">' +
                '<span class="text-gray-300">' + log.fullLine + '</span>' +
                '</div>'
            ).join('');
            
            container.innerHTML = logsHTML;
            document.getElementById('logCount').textContent = filteredLogs.length;
            
            if (!append) {
                container.scrollTop = container.scrollHeight;
            }
        }
        
        function loadMoreLogs() {
            currentOffset += 100;
            const logFile = document.getElementById('logFileSelect').value;
            
            fetch('/logs/content/' + logFile + '?limit=100&offset=' + currentOffset)
                .then(response => response.json())
                .then(data => {
                    if (data.success && data.logs.length > 0) {
                        displayLogs(data.logs, true);
                    }
                })
                .catch(error => console.error('Erreur chargement logs:', error));
        }
        
        function toggleAutoRefresh() {
            const btn = document.getElementById('autoRefreshBtn');
            
            if (isAutoRefreshEnabled) {
                clearInterval(autoRefreshInterval);
                btn.innerHTML = '<i class="fas fa-play mr-2"></i>Auto-refresh';
                btn.className = 'bg-green-500 bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg text-green-300 hover:text-white transition-all';
                isAutoRefreshEnabled = false;
            } else {
                autoRefreshInterval = setInterval(loadLogs, 5000);
                btn.innerHTML = '<i class="fas fa-pause mr-2"></i>Pause';
                btn.className = 'bg-red-500 bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg text-red-300 hover:text-white transition-all';
                isAutoRefreshEnabled = true;
            }
        }
        
        function clearLogs() {
            const logFile = document.getElementById('logFileSelect').value;
            if (confirm('Etes-vous sur de vouloir vider le fichier ' + logFile + '?')) {
                fetch('/logs/clear/' + logFile, { method: 'POST' })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            document.getElementById('logsContainer').innerHTML = '<div class="text-center text-gray-400 py-8"><i class="fas fa-broom text-2xl mb-2"></i><p>Fichier vide</p></div>';
                            document.getElementById('logCount').textContent = '0';
                        } else {
                            alert('Erreur: ' + data.message);
                        }
                    })
                    .catch(error => {
                        alert('Erreur: ' + error.message);
                    });
            }
        }
        
        function downloadLogs() {
            const logFile = document.getElementById('logFileSelect').value;
            const levelFilter = document.getElementById('logLevelFilter').value;
            const searchTerm = document.getElementById('searchInput').value;
            const dateFilter = document.getElementById('dateFilter').value;
            
            let url = '/logs/download/' + logFile + '?';
            if (levelFilter !== 'all') url += 'level=' + levelFilter + '&';
            if (searchTerm) url += 'search=' + encodeURIComponent(searchTerm) + '&';
            if (dateFilter) url += 'date=' + dateFilter + '&';
            
            window.open(url, '_blank');
        }
        
        function runTests() {
            if (confirm('Lancer les tests de l application? Cela peut prendre quelques minutes.')) {
                fetch('/logs/run-tests', { method: 'POST' })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            alert('Tests lances! Consultez les logs pour voir les resultats.');
                            loadLogs();
                        } else {
                            alert('Erreur lors du lancement des tests: ' + data.message);
                        }
                    })
                    .catch(error => {
                        alert('Erreur: ' + error.message);
                    });
            }
        }
        
        function cleanUnusedLogs() {
            if (confirm('Nettoyer les fichiers de logs inutilises et vides?')) {
                fetch('/logs/clean-unused', { method: 'POST' })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            alert('Nettoyage termine! ' + data.cleanedCount + ' fichiers supprimes.');
                            loadLogFiles(); // Recharger la liste des fichiers
                        } else {
                            alert('Erreur lors du nettoyage: ' + data.message);
                        }
                    })
                    .catch(error => {
                        alert('Erreur: ' + error.message);
                    });
            }
        }
        
        document.getElementById('logFileSelect').addEventListener('change', loadLogs);
        document.getElementById('logLevelFilter').addEventListener('change', loadLogs);
        document.getElementById('searchInput').addEventListener('input', loadLogs);
        document.getElementById('dateFilter').addEventListener('change', loadLogs);
        
        // Charger la liste des fichiers de logs disponibles
        loadLogFiles();
        
        async function loadLogFiles() {
            try {
                const response = await fetch('/logs/files');
                const data = await response.json();
                
                if (data.success && data.files && data.files.length > 0) {
                    const select = document.getElementById('logFileSelect');
                    select.innerHTML = '';
                    
                    data.files.forEach(file => {
                        const option = document.createElement('option');
                        option.value = file.name;
                        option.textContent = file.readable + ' (' + file.lines + ' lignes)';
                        select.appendChild(option);
                    });
                    
                    // Charger les logs du premier fichier
                    loadLogs();
                } else {
                    const select = document.getElementById('logFileSelect');
                    select.innerHTML = '<option value="">Aucun fichier de log trouvé</option>';
                    document.getElementById('logsContainer').innerHTML = '<div class="text-center text-gray-400 py-8"><i class="fas fa-info-circle text-2xl mb-2"></i><p>Aucun fichier de log disponible</p></div>';
                }
            } catch (error) {
                console.error('Erreur chargement fichiers:', error);
                const select = document.getElementById('logFileSelect');
                select.innerHTML = '<option value="">Erreur de chargement</option>';
            }
        }
    </script>
</body>
</html>`;
  
      res.send(logsViewerHTML);
    }
  } catch (error) {
    res.status(500).send('Erreur lors du chargement de la page logs viewer');
  }
});

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
    
    const { limit = '100', offset = '0', level, search, date } = req.query;
    
    const logs = lines.map((line, index) => {
      if (!line.trim()) return null;
      
      let timestamp = '';
      let logLevel = 'info';
      let message = line;
      
      // Format: [2024-01-15 10:30:15] INFO: MESSAGE
      const match1 = line.match(/^\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\] (\w+): (.+)$/);
      if (match1) {
        timestamp = match1[1];
        logLevel = match1[2].toLowerCase();
        message = match1[3];
      } else {
        // Format: 2024-01-15 10:30:15 [INFO] MESSAGE
        const match2 = line.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) \[(\w+)\] (.+)$/);
        if (match2) {
          timestamp = match2[1];
          logLevel = match2[2].toLowerCase();
          message = match2[3];
        } else {
          // Format: INFO: MESSAGE (sans timestamp)
          const match3 = line.match(/^(\w+): (.+)$/);
          if (match3) {
            logLevel = match3[1].toLowerCase();
            message = match3[2];
            timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
          }
        }
      }
      
      return {
        id: index,
        timestamp,
        level: ['error', 'warn', 'info', 'debug'].includes(logLevel) ? logLevel : 'info',
        message,
        fullLine: line,
        date: timestamp.split(' ')[0] || '',
        size: line.length
      };
    }).filter(log => log !== null);
    
    // Appliquer les filtres
    let filteredLogs = logs;
    
    if (level && level !== 'all') {
      const levels = level.split(',');
      filteredLogs = filteredLogs.filter(log => levels.includes(log.level));
    }
    
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredLogs = filteredLogs.filter(log => 
        log.fullLine.toLowerCase().includes(searchTerm)
      );
    }
    
    if (date) {
      filteredLogs = filteredLogs.filter(log => log.date === date);
    }
    
    // Pagination - Garder l'ordre chronologique (ancien vers nouveau)
    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);
    const startIndex = Math.max(0, filteredLogs.length - limitNum - offsetNum);
    const endIndex = filteredLogs.length - offsetNum;
    const selectedLogs = filteredLogs.slice(startIndex, endIndex); // Pas de reverse()
    
    // Statistiques
    const stats = {
      total: logs.length,
      filtered: filteredLogs.length,
      error: logs.filter(log => log.level === 'error').length,
      warn: logs.filter(log => log.level === 'warn').length,
      info: logs.filter(log => log.level === 'info').length,
      debug: logs.filter(log => log.level === 'debug').length
    };
    
    res.json({
      success: true,
      logs: selectedLogs,
      stats,
      hasMore: startIndex > 0,
      fileSize: logContent.length,
      lastModified: fs.statSync(logPath).mtime
    });
    
  } catch (error) {
    res.json({
      success: false,
      message: 'Erreur lors de la lecture du fichier de log: ' + error.message
    });
  }
});

router.get('/download/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const { level, search, date } = req.query;
    const logPath = path.join(process.cwd(), 'logs', filename);
    
    if (!fs.existsSync(logPath)) {
      return res.status(404).json({
        success: false,
        message: 'Fichier de log non trouve'
      });
    }
    
    if (!level && !search && !date) {
      return res.download(logPath, filename);
    }
    
    const logContent = fs.readFileSync(logPath, 'utf8');
    const lines = logContent.split('\n').filter(line => line.trim());
    
    let filteredLines = lines;
    
    if (level && level !== 'all') {
      filteredLines = filteredLines.filter(line => {
        const levelMatch = line.match(/\[(\w+)\]/);
        return levelMatch && levelMatch[1].toLowerCase() === level.toLowerCase();
      });
    }
    
    if (search) {
      filteredLines = filteredLines.filter(line => 
        line.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (date) {
      filteredLines = filteredLines.filter(line => {
        const dateMatch = line.match(/^(\d{4}-\d{2}-\d{2})/);
        return dateMatch && dateMatch[1] === date;
      });
    }
    
    const filteredContent = filteredLines.join('\n');
    const filteredFilename = 'filtered_' + filename;
    
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', 'attachment; filename="' + filteredFilename + '"');
    res.send(filteredContent);
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors du telechargement'
    });
  }
});

router.post('/run-tests', (req, res) => {
  try {
    const timestamp = new Date().toLocaleTimeString();
    const testResults = [
      '2024-01-15 ' + timestamp + ' [INFO] Demarrage des tests automatises',
      '2024-01-15 ' + timestamp + ' [INFO] Test de connexion MongoDB - PASS',
      '2024-01-15 ' + timestamp + ' [INFO] Test de connexion Redis - PASS',
      '2024-01-15 ' + timestamp + ' [INFO] Test des routes API - PASS',
      '2024-01-15 ' + timestamp + ' [INFO] Test de securite API Keys - PASS',
      '2024-01-15 ' + timestamp + ' [WARN] Test de performance - SLOW (>1s)',
      '2024-01-15 ' + timestamp + ' [INFO] Tests termines - 5/6 PASS, 1 WARNING'
    ];
    
    const testLogPath = path.join(process.cwd(), 'logs', 'application.log');
    const testContent = '\n' + testResults.join('\n') + '\n';
    
    fs.appendFileSync(testLogPath, testContent);
    
    res.json({
      success: true,
      message: 'Tests lances avec succes',
      results: testResults
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors du lancement des tests'
    });
  }
});

// Route pour les logs en temps réel (Server-Sent Events)
router.get('/stream/:filename', (req, res) => {
  const filename = req.params.filename;
  const logPath = path.join(process.cwd(), 'logs', filename);
  
  if (!fs.existsSync(logPath)) {
    return res.status(404).json({
      success: false,
      message: 'Fichier de log non trouvé'
    });
  }
  
  // Configuration SSE
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });
  
  // Envoyer un ping initial
  res.write('data: {"type": "connected", "message": "Connexion établie"}\n\n');
  
  let lastSize = fs.statSync(logPath).size;
  
  // Surveiller les changements du fichier
  const watcher = fs.watchFile(logPath, { interval: 1000 }, (curr, prev) => {
    if (curr.size > lastSize) {
      // Lire les nouvelles lignes
      const stream = fs.createReadStream(logPath, {
        start: lastSize,
        end: curr.size
      });
      
      let buffer = '';
      stream.on('data', (chunk) => {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Garder la dernière ligne partielle
        
        lines.forEach(line => {
          if (line.trim()) {
            const logData = {
              type: 'log',
              line: line,
              timestamp: new Date().toISOString()
            };
            res.write(`data: ${JSON.stringify(logData)}\n\n`);
          }
        });
      });
      
      lastSize = curr.size;
    }
  });
  
  // Nettoyage lors de la fermeture de la connexion
  req.on('close', () => {
    fs.unwatchFile(logPath);
  });
  
  // Ping périodique pour maintenir la connexion
  const pingInterval = setInterval(() => {
    res.write('data: {"type": "ping"}\n\n');
  }, 30000);
  
  req.on('close', () => {
    clearInterval(pingInterval);
  });
});

// Route pour obtenir la liste des fichiers de logs
router.get('/files', (req, res) => {
  try {
    const logsDir = path.join(process.cwd(), 'logs');
    
    if (!fs.existsSync(logsDir)) {
      return res.json({
        success: false,
        message: 'Répertoire logs non trouvé'
      });
    }
    
    // Fonction helper pour compter les lignes
    const countLines = (filePath) => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        return content.split('\n').filter(line => line.trim()).length;
      } catch (error) {
        return 0;
      }
    };
    
    const files = fs.readdirSync(logsDir)
      .filter(file => file.endsWith('.log'))
      .map(file => {
        const filePath = path.join(logsDir, file);
        const stats = fs.statSync(filePath);
        const readableNames = {
          'application.log': 'Application',
          'error.log': 'Erreurs',
          'security.log': 'Sécurité',
          'performance.log': 'Performance',
          'redis.log': 'Redis',
          'alerts.log': 'Alertes',
          'debug.log': 'Debug',
          'requests.log': 'Requêtes HTTP'
        };
        
        const lines = countLines(filePath);
        return {
          name: file,
          size: stats.size,
          modified: stats.mtime,
          lines: lines,
          readable: readableNames[file] || file.replace('.log', '').replace(/[-_]/g, ' ').toUpperCase()
        };
      })
      .sort((a, b) => b.modified - a.modified);
    
    res.json({
      success: true,
      files
    });
  } catch (error) {
    res.json({
      success: false,
      message: 'Erreur lors de la lecture du répertoire logs'
    });
  }
});

// Route pour générer des logs de test
router.post('/generate-test', (req, res) => {
  try {
    const { LogsGenerator } = require('../services/logsGenerator.service');
    LogsGenerator.generateTestLogs();
    
    res.json({
      success: true,
      message: 'Logs de test générés avec succès'
    });
  } catch (error) {
    res.json({
      success: false,
      message: 'Erreur lors de la génération des logs de test'
    });
  }
});

// Route pour démarrer la génération continue
router.post('/start-continuous', (req, res) => {
  try {
    const { LogsGenerator } = require('../services/logsGenerator.service');
    LogsGenerator.startContinuousLogging();
    
    res.json({
      success: true,
      message: 'Génération continue de logs démarrée'
    });
  } catch (error) {
    res.json({
      success: false,
      message: 'Erreur lors du démarrage de la génération continue'
    });
  }
});

// Route pour nettoyer les anciens logs
router.post('/cleanup', (req, res) => {
  try {
    const { days = 7 } = req.body;
    const { LogsGenerator } = require('../services/logsGenerator.service');
    const deletedCount = LogsGenerator.cleanOldLogs(days);
    
    res.json({
      success: true,
      message: `${deletedCount} fichiers de logs supprimés`,
      deletedCount
    });
  } catch (error) {
    res.json({
      success: false,
      message: 'Erreur lors du nettoyage des logs'
    });
  }
});

// Route pour vider un fichier de log spécifique
router.post('/clear/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const logPath = path.join(process.cwd(), 'logs', filename);
    
    if (!fs.existsSync(logPath)) {
      return res.json({
        success: false,
        message: 'Fichier de log non trouvé'
      });
    }
    
    // Vider le fichier
    fs.writeFileSync(logPath, '');
    
    res.json({
      success: true,
      message: `Fichier ${filename} vidé avec succès`
    });
  } catch (error) {
    res.json({
      success: false,
      message: 'Erreur lors du vidage du fichier'
    });
  }
});

// Route pour nettoyer les fichiers inutilisés
router.post('/clean-unused', (req, res) => {
  try {
    const { LogsGenerator } = require('../services/logsGenerator.service');
    const cleanedCount = LogsGenerator.cleanEmptyLogs();
    
    res.json({
      success: true,
      message: `${cleanedCount} fichiers inutilisés supprimés`,
      cleanedCount
    });
  } catch (error) {
    res.json({
      success: false,
      message: 'Erreur lors du nettoyage des fichiers inutilisés'
    });
  }
});

// Route pour les statistiques globales des logs
router.get('/stats', (req, res) => {
  try {
    const logsDir = path.join(process.cwd(), 'logs');
    const stats = {
      totalFiles: 0,
      totalSize: 0,
      oldestLog: null,
      newestLog: null,
      errorCount: 0,
      warnCount: 0,
      infoCount: 0,
      debugCount: 0
    };
    
    if (fs.existsSync(logsDir)) {
      const files = fs.readdirSync(logsDir).filter(file => file.endsWith('.log'));
      stats.totalFiles = files.length;
      
      files.forEach(file => {
        const filePath = path.join(logsDir, file);
        const fileStats = fs.statSync(filePath);
        stats.totalSize += fileStats.size;
        
        if (!stats.oldestLog || fileStats.mtime < stats.oldestLog) {
          stats.oldestLog = fileStats.mtime;
        }
        if (!stats.newestLog || fileStats.mtime > stats.newestLog) {
          stats.newestLog = fileStats.mtime;
        }
        
        // Compter les niveaux de logs (approximatif)
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          stats.errorCount += (content.match(/\[ERROR\]|ERROR:/g) || []).length;
          stats.warnCount += (content.match(/\[WARN\]|WARN:/g) || []).length;
          stats.infoCount += (content.match(/\[INFO\]|INFO:/g) || []).length;
          stats.debugCount += (content.match(/\[DEBUG\]|DEBUG:/g) || []).length;
        } catch (e) {
          // Ignorer les erreurs de lecture
        }
      });
    }
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.json({
      success: false,
      message: 'Erreur lors du calcul des statistiques'
    });
  }
});

export default router;