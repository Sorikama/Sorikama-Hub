// src/routes/system-health.routes.ts
import { Router } from 'express';
import os from 'os';
import fs from 'fs';

const router = Router();

/**
 * GET /system/health - Health check système complet
 */
router.get('/health', (req, res) => {
  try {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    const uptime = process.uptime();
    
    const systemInfo = {
      cpu: {
        usage: Math.round((cpuUsage.user + cpuUsage.system) / 1000000),
        cores: os.cpus().length,
        model: os.cpus()[0]?.model || 'Unknown',
        load: os.loadavg()
      },
      memory: {
        total: Math.round(os.totalmem() / 1024 / 1024),
        free: Math.round(os.freemem() / 1024 / 1024),
        used: Math.round((os.totalmem() - os.freemem()) / 1024 / 1024),
        process: {
          rss: Math.round(memUsage.rss / 1024 / 1024),
          heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
          heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024)
        }
      },
      system: {
        platform: os.platform(),
        arch: os.arch(),
        hostname: os.hostname(),
        uptime: Math.round(uptime),
        nodeVersion: process.version
      }
    };

    const healthHTML = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🏥 System Health - Sorikama</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700;900&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
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
        .health-card {
            transition: all 0.3s ease;
        }
        .health-card:hover {
            transform: translateY(-5px);
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
                        <div class="w-16 h-16 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-2xl flex items-center justify-center neon-glow">
                            <i class="fas fa-heartbeat text-white text-2xl"></i>
                        </div>
                        <div>
                            <h1 class="text-3xl font-bold gradient-text">System Health</h1>
                            <p class="text-green-300">Surveillance système en temps réel</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-4">
                        <div class="flex items-center space-x-2">
                            <div class="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                            <span class="text-green-400 font-medium">Système Sain</span>
                        </div>
                        <a href="/api" class="glass-morphism px-6 py-3 rounded-xl hover:bg-white hover:bg-opacity-10 transition-all">
                            <i class="fas fa-arrow-left mr-2"></i>Retour
                        </a>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- System Overview -->
        <div class="max-w-7xl mx-auto mb-8">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                <!-- CPU -->
                <div class="glass-morphism rounded-2xl p-6 health-card">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                            <i class="fas fa-microchip text-white"></i>
                        </div>
                        <span class="text-xs bg-blue-500 bg-opacity-20 px-3 py-1 rounded-full text-blue-300">CPU</span>
                    </div>
                    <h3 class="text-2xl font-bold text-white mb-1">${systemInfo.cpu.cores} Cores</h3>
                    <p class="text-gray-400 text-sm mb-2">${systemInfo.cpu.model.substring(0, 30)}...</p>
                    <div class="text-xs text-blue-300">Load: ${systemInfo.cpu.load[0].toFixed(2)}</div>
                </div>
                
                <!-- Memory -->
                <div class="glass-morphism rounded-2xl p-6 health-card">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                            <i class="fas fa-memory text-white"></i>
                        </div>
                        <span class="text-xs bg-green-500 bg-opacity-20 px-3 py-1 rounded-full text-green-300">RAM</span>
                    </div>
                    <h3 class="text-2xl font-bold text-white mb-1">${systemInfo.memory.used}MB</h3>
                    <p class="text-gray-400 text-sm mb-2">sur ${systemInfo.memory.total}MB</p>
                    <div class="w-full bg-gray-700 rounded-full h-2">
                        <div class="bg-green-400 h-2 rounded-full" style="width: ${(systemInfo.memory.used / systemInfo.memory.total * 100).toFixed(1)}%"></div>
                    </div>
                </div>
                
                <!-- Uptime -->
                <div class="glass-morphism rounded-2xl p-6 health-card">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                            <i class="fas fa-clock text-white"></i>
                        </div>
                        <span class="text-xs bg-purple-500 bg-opacity-20 px-3 py-1 rounded-full text-purple-300">UPTIME</span>
                    </div>
                    <h3 class="text-2xl font-bold text-white mb-1">${Math.floor(systemInfo.system.uptime / 3600)}h</h3>
                    <p class="text-gray-400 text-sm">${Math.floor((systemInfo.system.uptime % 3600) / 60)}m ${systemInfo.system.uptime % 60}s</p>
                </div>
                
                <!-- Node.js -->
                <div class="glass-morphism rounded-2xl p-6 health-card">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                            <i class="fab fa-node-js text-white"></i>
                        </div>
                        <span class="text-xs bg-yellow-500 bg-opacity-20 px-3 py-1 rounded-full text-yellow-300">NODE</span>
                    </div>
                    <h3 class="text-2xl font-bold text-white mb-1">${systemInfo.system.nodeVersion}</h3>
                    <p class="text-gray-400 text-sm">${systemInfo.system.platform} ${systemInfo.system.arch}</p>
                </div>
                
            </div>
        </div>
        
        <!-- Detailed Info -->
        <div class="max-w-7xl mx-auto">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                <!-- Process Memory -->
                <div class="glass-morphism rounded-2xl p-6">
                    <h3 class="text-xl font-bold text-white mb-6 flex items-center">
                        <i class="fas fa-chart-pie text-green-400 mr-3"></i>
                        Mémoire Processus
                    </h3>
                    <div class="space-y-4">
                        <div class="flex justify-between items-center">
                            <span class="text-gray-300">RSS (Resident Set Size)</span>
                            <span class="text-green-400 font-bold">${systemInfo.memory.process.rss} MB</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-300">Heap Total</span>
                            <span class="text-blue-400 font-bold">${systemInfo.memory.process.heapTotal} MB</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-300">Heap Used</span>
                            <span class="text-purple-400 font-bold">${systemInfo.memory.process.heapUsed} MB</span>
                        </div>
                        <div class="mt-4">
                            <canvas id="memoryChart" width="400" height="200"></canvas>
                        </div>
                    </div>
                </div>
                
                <!-- System Info -->
                <div class="glass-morphism rounded-2xl p-6">
                    <h3 class="text-xl font-bold text-white mb-6 flex items-center">
                        <i class="fas fa-server text-blue-400 mr-3"></i>
                        Informations Système
                    </h3>
                    <div class="space-y-4">
                        <div class="flex justify-between items-center">
                            <span class="text-gray-300">Hostname</span>
                            <span class="text-white font-mono text-sm">${systemInfo.system.hostname}</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-300">Platform</span>
                            <span class="text-blue-400 font-bold">${systemInfo.system.platform}</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-300">Architecture</span>
                            <span class="text-purple-400 font-bold">${systemInfo.system.arch}</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-300">Mémoire Libre</span>
                            <span class="text-green-400 font-bold">${systemInfo.memory.free} MB</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-300">Load Average</span>
                            <span class="text-yellow-400 font-bold">${systemInfo.cpu.load.map(l => l.toFixed(2)).join(', ')}</span>
                        </div>
                    </div>
                </div>
                
            </div>
        </div>
    </div>
    
    <script>
        // Memory Chart
        const memoryCtx = document.getElementById('memoryChart').getContext('2d');
        new Chart(memoryCtx, {
            type: 'doughnut',
            data: {
                labels: ['Heap Used', 'Heap Free', 'External'],
                datasets: [{
                    data: [
                        ${systemInfo.memory.process.heapUsed},
                        ${systemInfo.memory.process.heapTotal - systemInfo.memory.process.heapUsed},
                        ${systemInfo.memory.process.rss - systemInfo.memory.process.heapTotal}
                    ],
                    backgroundColor: ['#8b5cf6', '#3b82f6', '#10b981']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { labels: { color: 'white' } }
                }
            }
        });
        
        // Auto refresh every 30 seconds
        setTimeout(() => {
            window.location.reload();
        }, 30000);
    </script>
</body>
</html>`;
    
    res.send(healthHTML);
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des informations système'
    });
  }
});

export default router;