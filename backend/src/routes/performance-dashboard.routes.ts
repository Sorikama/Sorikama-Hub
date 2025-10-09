// src/routes/performance-dashboard.routes.ts
import { Router } from 'express';
import { verifyPortalSession } from './auth-portal.routes';

const router = Router();

/**
 * GET /performance/dashboard - Dashboard des métriques de performance
 */
router.get('/dashboard', verifyPortalSession, (req, res) => {
  const dashboardHTML = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Performance Dashboard - Sorikama Gateway</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body class="bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 min-h-screen">
    <div class="container mx-auto px-4 py-8">
        <!-- Header -->
        <div class="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white border-opacity-20">
            <div class="flex justify-between items-center">
                <div>
                    <h1 class="text-3xl font-bold text-white mb-2"><i class="fas fa-tachometer-alt mr-3"></i>Performance Dashboard</h1>
                    <p class="text-blue-300">Métriques de performance en temps réel</p>
                </div>
                <div class="flex gap-3">
                    <button onclick="refreshData()" class="bg-blue-500 bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg text-blue-200 hover:text-white transition-all">
                        <i class="fas fa-sync-alt mr-2"></i>Actualiser
                    </button>
                    <a href="/api" class="bg-gray-500 bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg text-gray-200 hover:text-white transition-all">
                        <i class="fas fa-arrow-left mr-2"></i>Retour
                    </a>
                </div>
            </div>
        </div>
        
        <!-- Loading -->
        <div id="loading" class="text-center py-12">
            <i class="fas fa-spinner fa-spin text-white text-4xl mb-4"></i>
            <p class="text-white">Chargement des métriques...</p>
        </div>
        
        <!-- Dashboard Content -->
        <div id="dashboard" class="hidden">
            <!-- Summary Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-20">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-300 text-sm">Total Requêtes</p>
                            <p class="text-white text-2xl font-bold" id="totalRequests">-</p>
                        </div>
                        <i class="fas fa-globe text-blue-300 text-3xl"></i>
                    </div>
                </div>
                
                <div class="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-20">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-300 text-sm">Taux de Succès</p>
                            <p class="text-white text-2xl font-bold" id="successRate">-</p>
                        </div>
                        <i class="fas fa-check-circle text-green-300 text-3xl"></i>
                    </div>
                </div>
                
                <div class="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-20">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-300 text-sm">Temps Réponse Moy.</p>
                            <p class="text-white text-2xl font-bold" id="avgResponseTime">-</p>
                        </div>
                        <i class="fas fa-clock text-yellow-300 text-3xl"></i>
                    </div>
                </div>
                
                <div class="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-20">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-300 text-sm">Req/Seconde</p>
                            <p class="text-white text-2xl font-bold" id="rps">-</p>
                        </div>
                        <i class="fas fa-bolt text-purple-300 text-3xl"></i>
                    </div>
                </div>
            </div>
            
            <!-- Charts -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div class="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-20">
                    <h3 class="text-xl font-bold text-white mb-4"><i class="fas fa-chart-line mr-2"></i>Temps de Réponse</h3>
                    <canvas id="responseTimeChart" width="400" height="200"></canvas>
                </div>
                
                <div class="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-20">
                    <h3 class="text-xl font-bold text-white mb-4"><i class="fas fa-chart-pie mr-2"></i>Méthodes HTTP</h3>
                    <canvas id="methodsChart" width="400" height="200"></canvas>
                </div>
            </div>
            
            <!-- Health Indicators -->
            <div class="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
                <h2 class="text-2xl font-bold text-white mb-6"><i class="fas fa-heartbeat mr-3"></i>Indicateurs de Santé</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="text-center">
                        <div class="text-4xl font-bold mb-2" id="healthScore">-</div>
                        <p class="text-gray-300">Score de Santé</p>
                        <div class="w-full bg-gray-700 rounded-full h-2 mt-2">
                            <div class="bg-green-400 h-2 rounded-full transition-all duration-500" id="healthBar" style="width: 0%"></div>
                        </div>
                    </div>
                    
                    <div class="text-center">
                        <div class="text-2xl font-bold mb-2" id="loadLevel">-</div>
                        <p class="text-gray-300">Niveau de Charge</p>
                        <div class="mt-2" id="loadIndicator">
                            <span class="inline-block w-3 h-3 rounded-full bg-gray-600 mr-1"></span>
                            <span class="inline-block w-3 h-3 rounded-full bg-gray-600 mr-1"></span>
                            <span class="inline-block w-3 h-3 rounded-full bg-gray-600"></span>
                        </div>
                    </div>
                    
                    <div class="text-center">
                        <div class="text-2xl font-bold mb-2" id="trend">-</div>
                        <p class="text-gray-300">Tendance</p>
                        <div class="mt-2" id="trendIcon">
                            <i class="fas fa-minus text-gray-400 text-2xl"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Error State -->
        <div id="error" class="hidden text-center py-12">
            <i class="fas fa-exclamation-triangle text-red-300 text-4xl mb-4"></i>
            <p class="text-red-300 text-xl mb-4">Erreur de chargement des métriques</p>
            <button onclick="loadMetrics()" class="bg-red-500 bg-opacity-20 hover:bg-opacity-30 px-6 py-3 rounded-lg text-red-200 hover:text-white transition-all">
                <i class="fas fa-retry mr-2"></i>Réessayer
            </button>
        </div>
    </div>
    
    <script>
        let responseTimeChart, methodsChart;
        
        async function loadMetrics() {
            try {
                document.getElementById('loading').classList.remove('hidden');
                document.getElementById('dashboard').classList.add('hidden');
                document.getElementById('error').classList.add('hidden');
                
                const response = await fetch('/performance/metrics');
                const result = await response.json();
                
                if (!result.success) {
                    throw new Error(result.message || 'Erreur de chargement');
                }
                
                updateDashboard(result.data);
                
                document.getElementById('loading').classList.add('hidden');
                document.getElementById('dashboard').classList.remove('hidden');
                
            } catch (error) {
                console.error('Erreur:', error);
                document.getElementById('loading').classList.add('hidden');
                document.getElementById('error').classList.remove('hidden');
            }
        }
        
        function updateDashboard(data) {
            // Update summary cards
            document.getElementById('totalRequests').textContent = data.summary.total_requests.toLocaleString();
            document.getElementById('successRate').textContent = data.summary.success_rate.toFixed(1) + '%';
            document.getElementById('avgResponseTime').textContent = data.summary.avg_response_time + 'ms';
            document.getElementById('rps').textContent = data.summary.requests_per_second;
            
            // Update health indicators
            const healthScore = data.performance_indicators.health_score;
            document.getElementById('healthScore').textContent = healthScore;
            document.getElementById('healthScore').className = 'text-4xl font-bold mb-2 ' + getHealthColor(healthScore);
            document.getElementById('healthBar').style.width = healthScore + '%';
            document.getElementById('healthBar').className = 'h-2 rounded-full transition-all duration-500 ' + getHealthBarColor(healthScore);
            
            // Load level
            const loadLevel = data.performance_indicators.load_level;
            document.getElementById('loadLevel').textContent = loadLevel.toUpperCase();
            document.getElementById('loadLevel').className = 'text-2xl font-bold mb-2 ' + getLoadColor(loadLevel);
            updateLoadIndicator(loadLevel);
            
            // Trend
            const trend = data.performance_indicators.trend;
            document.getElementById('trend').textContent = trend.toUpperCase();
            document.getElementById('trend').className = 'text-2xl font-bold mb-2 ' + getTrendColor(trend);
            updateTrendIcon(trend);
            
            // Update charts
            updateResponseTimeChart(data.response_times);
            updateMethodsChart(data.methods);
        }
        
        function updateResponseTimeChart(responseTimeData) {
            const ctx = document.getElementById('responseTimeChart').getContext('2d');
            
            if (responseTimeChart) {
                responseTimeChart.destroy();
            }
            
            responseTimeChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: responseTimeData.slice(0, 20).map((_, i) => \`-\${i}m\`),
                    datasets: [{
                        label: 'Temps de réponse (ms)',
                        data: responseTimeData.slice(0, 20).map(item => item.value),
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { labels: { color: 'white' } }
                    },
                    scales: {
                        x: { ticks: { color: 'white' } },
                        y: { ticks: { color: 'white' } }
                    }
                }
            });
        }
        
        function updateMethodsChart(methodsData) {
            const ctx = document.getElementById('methodsChart').getContext('2d');
            
            if (methodsChart) {
                methodsChart.destroy();
            }
            
            methodsChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(methodsData),
                    datasets: [{
                        data: Object.values(methodsData),
                        backgroundColor: [
                            'rgba(34, 197, 94, 0.8)',
                            'rgba(59, 130, 246, 0.8)',
                            'rgba(251, 191, 36, 0.8)',
                            'rgba(239, 68, 68, 0.8)',
                            'rgba(168, 85, 247, 0.8)'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { labels: { color: 'white' } }
                    }
                }
            });
        }
        
        function getHealthColor(score) {
            if (score >= 80) return 'text-green-300';
            if (score >= 60) return 'text-yellow-300';
            return 'text-red-300';
        }
        
        function getHealthBarColor(score) {
            if (score >= 80) return 'bg-green-400';
            if (score >= 60) return 'bg-yellow-400';
            return 'bg-red-400';
        }
        
        function getLoadColor(level) {
            if (level === 'high') return 'text-red-300';
            if (level === 'medium') return 'text-yellow-300';
            return 'text-green-300';
        }
        
        function updateLoadIndicator(level) {
            const indicators = document.getElementById('loadIndicator').children;
            const colors = ['bg-gray-600', 'bg-gray-600', 'bg-gray-600'];
            
            if (level === 'low') colors[0] = 'bg-green-400';
            else if (level === 'medium') { colors[0] = 'bg-yellow-400'; colors[1] = 'bg-yellow-400'; }
            else if (level === 'high') { colors[0] = 'bg-red-400'; colors[1] = 'bg-red-400'; colors[2] = 'bg-red-400'; }
            
            for (let i = 0; i < indicators.length; i++) {
                indicators[i].className = 'inline-block w-3 h-3 rounded-full mr-1 ' + colors[i];
            }
        }
        
        function getTrendColor(trend) {
            if (trend === 'improving') return 'text-green-300';
            if (trend === 'degrading') return 'text-red-300';
            return 'text-gray-300';
        }
        
        function updateTrendIcon(trend) {
            const iconElement = document.getElementById('trendIcon').querySelector('i');
            if (trend === 'improving') {
                iconElement.className = 'fas fa-arrow-up text-green-400 text-2xl';
            } else if (trend === 'degrading') {
                iconElement.className = 'fas fa-arrow-down text-red-400 text-2xl';
            } else {
                iconElement.className = 'fas fa-minus text-gray-400 text-2xl';
            }
        }
        
        function refreshData() {
            loadMetrics();
        }
        
        // Load initial data
        loadMetrics();
        
        // Auto-refresh every 30 seconds
        setInterval(loadMetrics, 30000);
    </script>
</body>
</html>`;
  
  res.send(dashboardHTML);
});

export default router;