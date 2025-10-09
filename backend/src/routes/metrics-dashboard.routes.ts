// src/routes/metrics-dashboard.routes.ts
import { Router } from 'express';

const router = Router();

/**
 * GET /metrics/dashboard - Dashboard visuel des métriques temps réel
 */
router.get('/dashboard', (req, res) => {
  const dashboardHTML = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard Métriques - Sorikama API Gateway</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <style>
        body { font-family: 'Inter', sans-serif; }
        .metric-card { 
            transition: all 0.3s ease; 
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
        }
        .metric-card:hover { 
            transform: translateY(-4px); 
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }
        .pulse-dot { animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        .chart-container { position: relative; height: 350px; }
        .status-indicator {
            width: 12px; height: 12px; border-radius: 50%;
            animation: pulse 2s infinite;
        }
        .gradient-bg {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .glass-effect {
            backdrop-filter: blur(10px);
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .loading-spinner {
            border: 3px solid #f3f4f6;
            border-top: 3px solid #3b82f6;
            border-radius: 50%;
            width: 24px; height: 24px;
            animation: spin 1s linear infinite;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
</head>
<body class="bg-gray-50 min-h-screen">

    <!-- Header avec gradient -->
    <nav class="gradient-bg text-white shadow-lg">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center py-6">
                <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                        <i class="fas fa-chart-line text-white text-xl"></i>
                    </div>
                    <div>
                        <h1 class="text-2xl font-bold">Dashboard Métriques</h1>
                        <p class="text-blue-100">Sorikama API Gateway - Temps Réel</p>
                    </div>
                </div>
                <div class="flex items-center space-x-6">
                    <div class="flex items-center space-x-2">
                        <div class="status-indicator bg-green-400"></div>
                        <span class="text-sm font-medium">Temps Réel</span>
                        <span id="lastUpdate" class="text-xs text-blue-200"></span>
                    </div>
                    <div class="flex space-x-2">
                        <button id="viewNumbers" class="px-4 py-2 bg-white bg-opacity-20 rounded-lg text-sm font-medium hover:bg-opacity-30 transition-all">
                            <i class="fas fa-list mr-1"></i>Chiffres
                        </button>
                        <button id="viewCharts" class="px-4 py-2 bg-white bg-opacity-10 rounded-lg text-sm font-medium hover:bg-opacity-20 transition-all">
                            <i class="fas fa-chart-bar mr-1"></i>Graphiques
                        </button>
                        <button id="refreshBtn" class="px-4 py-2 bg-green-500 bg-opacity-80 rounded-lg text-sm font-medium hover:bg-opacity-100 transition-all">
                            <i class="fas fa-sync-alt mr-1"></i>Actualiser
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </nav>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <!-- Loading -->
        <div id="loading" class="text-center py-16">
            <div class="loading-spinner mx-auto mb-4"></div>
            <p class="text-gray-600 font-medium">Chargement des métriques en temps réel...</p>
        </div>

        <!-- Vue Chiffres -->
        <div id="numbersView" class="hidden">
            
            <!-- Métriques Principales -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                
                <div class="metric-card rounded-2xl shadow-lg border p-6">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                            <i class="fas fa-globe text-white text-xl"></i>
                        </div>
                        <span class="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">TOTAL</span>
                    </div>
                    <h3 class="text-3xl font-bold text-gray-900 mb-1" id="totalRequests">-</h3>
                    <p class="text-sm text-gray-600">Requêtes Totales</p>
                    <div class="mt-2 text-xs text-green-600 font-medium" id="requestsTrend">
                        <i class="fas fa-arrow-up mr-1"></i>+0 depuis la dernière heure
                    </div>
                </div>

                <div class="metric-card rounded-2xl shadow-lg border p-6">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                            <i class="fas fa-exclamation-triangle text-white text-xl"></i>
                        </div>
                        <span class="text-xs bg-red-100 text-red-800 px-3 py-1 rounded-full font-semibold">ERREURS</span>
                    </div>
                    <h3 class="text-3xl font-bold text-gray-900 mb-1" id="totalErrors">-</h3>
                    <p class="text-sm text-gray-600">Erreurs Totales</p>
                    <div class="mt-2 text-xs text-red-600 font-medium" id="errorsTrend">
                        <i class="fas fa-arrow-down mr-1"></i>-0 depuis la dernière heure
                    </div>
                </div>

                <div class="metric-card rounded-2xl shadow-lg border p-6">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                            <i class="fas fa-check-circle text-white text-xl"></i>
                        </div>
                        <span class="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">SUCCÈS</span>
                    </div>
                    <h3 class="text-3xl font-bold text-gray-900 mb-1" id="successRate">-</h3>
                    <p class="text-sm text-gray-600">Taux de Succès</p>
                    <div class="mt-2">
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div id="successBar" class="bg-green-500 h-2 rounded-full transition-all duration-500" style="width: 0%"></div>
                        </div>
                    </div>
                </div>

                <div class="metric-card rounded-2xl shadow-lg border p-6">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-14 h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
                            <i class="fas fa-clock text-white text-xl"></i>
                        </div>
                        <span class="text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-semibold">TEMPS</span>
                    </div>
                    <h3 class="text-3xl font-bold text-gray-900 mb-1" id="avgResponseTime">-</h3>
                    <p class="text-sm text-gray-600">Temps Moyen (ms)</p>
                    <div class="mt-2 text-xs font-medium" id="responseTimeTrend">
                        <i class="fas fa-minus mr-1"></i>Stable
                    </div>
                </div>

            </div>

            <!-- Métriques Détaillées -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                
                <!-- Méthodes HTTP -->
                <div class="metric-card rounded-2xl shadow-lg border p-6">
                    <h3 class="text-lg font-bold text-gray-900 mb-6 flex items-center">
                        <i class="fas fa-code text-blue-600 mr-2"></i>
                        Méthodes HTTP
                    </h3>
                    <div id="methodsStats" class="space-y-4">
                        <!-- Rempli dynamiquement -->
                    </div>
                </div>

                <!-- Codes de Statut -->
                <div class="metric-card rounded-2xl shadow-lg border p-6">
                    <h3 class="text-lg font-bold text-gray-900 mb-6 flex items-center">
                        <i class="fas fa-list-alt text-green-600 mr-2"></i>
                        Codes de Statut
                    </h3>
                    <div id="statusStats" class="space-y-4">
                        <!-- Rempli dynamiquement -->
                    </div>
                </div>

                <!-- Performance -->
                <div class="metric-card rounded-2xl shadow-lg border p-6">
                    <h3 class="text-lg font-bold text-gray-900 mb-6 flex items-center">
                        <i class="fas fa-tachometer-alt text-purple-600 mr-2"></i>
                        Performance
                    </h3>
                    <div class="space-y-6">
                        <div class="text-center">
                            <div class="w-24 h-24 mx-auto mb-3 rounded-full flex items-center justify-center text-3xl font-bold" id="healthScoreCircle">
                                <span id="healthScore">-</span>
                            </div>
                            <p class="text-sm text-gray-600 font-medium">Score de Santé</p>
                        </div>
                        <div class="grid grid-cols-2 gap-4 text-center">
                            <div>
                                <p class="text-lg font-bold text-gray-900" id="loadLevel">-</p>
                                <p class="text-xs text-gray-600">Charge</p>
                            </div>
                            <div>
                                <p class="text-lg font-bold text-gray-900" id="trend">-</p>
                                <p class="text-xs text-gray-600">Tendance</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        <!-- Vue Graphiques -->
        <div id="chartsView" class="hidden">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                
                <!-- Graphique Temps de Réponse -->
                <div class="metric-card rounded-2xl shadow-lg border p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-bold text-gray-900">Temps de Réponse</h3>
                        <select id="timeRangeFilter" class="text-sm border rounded px-2 py-1">
                            <option value="50">50 derniers points</option>
                            <option value="100">100 derniers points</option>
                            <option value="200">200 derniers points</option>
                        </select>
                    </div>
                    <div class="chart-container">
                        <canvas id="responseTimeChart"></canvas>
                    </div>
                </div>

                <!-- Graphique Méthodes -->
                <div class="metric-card rounded-2xl shadow-lg border p-6">
                    <h3 class="text-lg font-bold text-gray-900 mb-4">Répartition par Méthode</h3>
                    <div class="chart-container">
                        <canvas id="methodsChart"></canvas>
                    </div>
                </div>

            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                <!-- Graphique Codes de Statut -->
                <div class="metric-card rounded-2xl shadow-lg border p-6">
                    <h3 class="text-lg font-bold text-gray-900 mb-4">Codes de Statut</h3>
                    <div class="chart-container">
                        <canvas id="statusChart"></canvas>
                    </div>
                </div>

                <!-- Graphique Score de Santé -->
                <div class="metric-card rounded-2xl shadow-lg border p-6">
                    <h3 class="text-lg font-bold text-gray-900 mb-4">Score de Santé</h3>
                    <div class="chart-container">
                        <canvas id="healthChart"></canvas>
                    </div>
                </div>

            </div>
        </div>

    </div>

    <script>
        let metricsData = null;
        let charts = {};
        let updateInterval = null;
        let isUpdating = false;

        // Configuration
        const UPDATE_INTERVAL = 15000; // 15 secondes
        const MAX_RETRIES = 3;
        let retryCount = 0;

        // Chargement initial
        document.addEventListener('DOMContentLoaded', function() {
            setupViewToggle();
            setupFilters();
            loadMetrics();
            startAutoUpdate();
        });

        // Basculer entre les vues
        function setupViewToggle() {
            const viewNumbers = document.getElementById('viewNumbers');
            const viewCharts = document.getElementById('viewCharts');
            const numbersView = document.getElementById('numbersView');
            const chartsView = document.getElementById('chartsView');

            viewNumbers.addEventListener('click', () => {
                viewNumbers.className = 'px-4 py-2 bg-white bg-opacity-30 rounded-lg text-sm font-medium';
                viewCharts.className = 'px-4 py-2 bg-white bg-opacity-10 rounded-lg text-sm font-medium hover:bg-opacity-20 transition-all';
                numbersView.classList.remove('hidden');
                chartsView.classList.add('hidden');
            });

            viewCharts.addEventListener('click', () => {
                viewCharts.className = 'px-4 py-2 bg-white bg-opacity-30 rounded-lg text-sm font-medium';
                viewNumbers.className = 'px-4 py-2 bg-white bg-opacity-10 rounded-lg text-sm font-medium hover:bg-opacity-20 transition-all';
                chartsView.classList.remove('hidden');
                numbersView.classList.add('hidden');
                
                if (metricsData && Object.keys(charts).length === 0) {
                    setTimeout(() => createCharts(), 100);
                }
            });

            // Bouton refresh
            document.getElementById('refreshBtn').addEventListener('click', () => {
                loadMetrics(true);
            });
        }

        // Configuration des filtres
        function setupFilters() {
            document.getElementById('timeRangeFilter').addEventListener('change', (e) => {
                if (charts.responseTime && metricsData) {
                    updateResponseTimeChart(parseInt(e.target.value));
                }
            });
        }

        // Démarrer les mises à jour automatiques
        function startAutoUpdate() {
            updateInterval = setInterval(() => {
                if (!isUpdating) {
                    loadMetrics();
                }
            }, UPDATE_INTERVAL);
        }

        // Charger les métriques avec gestion d'erreur
        async function loadMetrics(forceRefresh = false) {
            if (isUpdating && !forceRefresh) return;
            
            isUpdating = true;
            
            try {
                const response = await fetch('/performance/metrics');
                
                if (!response.ok) {
                    throw new Error(\`HTTP \${response.status}\`);
                }
                
                const result = await response.json();
                
                if (result.success) {
                    metricsData = result.data;
                    updateNumbersView();
                    updateCharts();
                    
                    document.getElementById('loading').classList.add('hidden');
                    document.getElementById('numbersView').classList.remove('hidden');
                    
                    // Mise à jour du timestamp
                    document.getElementById('lastUpdate').textContent = 
                        'Mis à jour: ' + new Date().toLocaleTimeString('fr-FR');
                    
                    retryCount = 0; // Reset sur succès
                } else {
                    throw new Error(result.message || 'Erreur inconnue');
                }
                
            } catch (error) {
                console.error('Erreur chargement métriques:', error);
                retryCount++;
                
                if (retryCount >= MAX_RETRIES) {
                    document.getElementById('lastUpdate').textContent = 
                        'Erreur: Impossible de charger les données';
                    retryCount = 0;
                }
            } finally {
                isUpdating = false;
            }
        }

        // Mettre à jour la vue chiffres
        function updateNumbersView() {
            const data = metricsData;
            
            // Métriques principales avec animations
            animateNumber('totalRequests', data.summary.total_requests);
            animateNumber('totalErrors', data.summary.total_errors);
            animateNumber('avgResponseTime', data.summary.avg_response_time, 'ms');
            
            const successRate = data.summary.success_rate;
            document.getElementById('successRate').textContent = successRate.toFixed(1) + '%';
            document.getElementById('successBar').style.width = successRate + '%';

            // Méthodes HTTP avec barres de progression
            const methodsContainer = document.getElementById('methodsStats');
            methodsContainer.innerHTML = '';
            const maxMethodCount = Math.max(...Object.values(data.methods));
            
            Object.entries(data.methods).forEach(([method, count]) => {
                const percentage = maxMethodCount > 0 ? (count / maxMethodCount) * 100 : 0;
                const colors = {
                    get: 'bg-blue-500',
                    post: 'bg-green-500', 
                    put: 'bg-yellow-500',
                    patch: 'bg-purple-500',
                    delete: 'bg-red-500'
                };
                
                const div = document.createElement('div');
                div.innerHTML = \`
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-sm font-semibold text-gray-700 uppercase">\${method}</span>
                        <span class="text-sm font-bold text-gray-900">\${count.toLocaleString()}</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="\${colors[method] || 'bg-gray-500'} h-2 rounded-full transition-all duration-500" 
                             style="width: \${percentage}%"></div>
                    </div>
                \`;
                methodsContainer.appendChild(div);
            });

            // Codes de statut
            const statusContainer = document.getElementById('statusStats');
            statusContainer.innerHTML = '';
            Object.entries(data.status_codes).forEach(([status, count]) => {
                const colors = {
                    '2xx': { bg: 'bg-green-100', text: 'text-green-800', bar: 'bg-green-500' },
                    '3xx': { bg: 'bg-blue-100', text: 'text-blue-800', bar: 'bg-blue-500' },
                    '4xx': { bg: 'bg-red-100', text: 'text-red-800', bar: 'bg-red-500' },
                    '5xx': { bg: 'bg-purple-100', text: 'text-purple-800', bar: 'bg-purple-500' }
                };
                const color = colors[status] || colors['2xx'];
                
                const div = document.createElement('div');
                div.innerHTML = \`
                    <div class="flex justify-between items-center p-3 \${color.bg} rounded-lg">
                        <span class="text-sm font-semibold \${color.text}">\${status}</span>
                        <span class="text-lg font-bold \${color.text}">\${count.toLocaleString()}</span>
                    </div>
                \`;
                statusContainer.appendChild(div);
            });

            // Score de santé avec couleur dynamique
            const healthScore = data.performance_indicators.health_score;
            const healthScoreElement = document.getElementById('healthScore');
            const healthCircle = document.getElementById('healthScoreCircle');
            
            healthScoreElement.textContent = healthScore;
            
            if (healthScore >= 80) {
                healthCircle.className = 'w-24 h-24 mx-auto mb-3 rounded-full flex items-center justify-center text-3xl font-bold bg-gradient-to-br from-green-400 to-green-600 text-white shadow-lg';
            } else if (healthScore >= 60) {
                healthCircle.className = 'w-24 h-24 mx-auto mb-3 rounded-full flex items-center justify-center text-3xl font-bold bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg';
            } else {
                healthCircle.className = 'w-24 h-24 mx-auto mb-3 rounded-full flex items-center justify-center text-3xl font-bold bg-gradient-to-br from-red-400 to-red-600 text-white shadow-lg';
            }

            document.getElementById('loadLevel').textContent = data.performance_indicators.load_level.toUpperCase();
            document.getElementById('trend').textContent = data.performance_indicators.trend.toUpperCase();
        }

        // Animation des nombres
        function animateNumber(elementId, targetValue, suffix = '') {
            const element = document.getElementById(elementId);
            const currentValue = parseInt(element.textContent.replace(/[^0-9]/g, '')) || 0;
            const increment = Math.ceil((targetValue - currentValue) / 10);
            
            if (increment !== 0) {
                const timer = setInterval(() => {
                    const current = parseInt(element.textContent.replace(/[^0-9]/g, '')) || 0;
                    const newValue = current + increment;
                    
                    if ((increment > 0 && newValue >= targetValue) || (increment < 0 && newValue <= targetValue)) {
                        element.textContent = targetValue.toLocaleString() + suffix;
                        clearInterval(timer);
                    } else {
                        element.textContent = newValue.toLocaleString() + suffix;
                    }
                }, 50);
            }
        }

        // Créer les graphiques
        function createCharts() {
            if (!metricsData) return;
            
            const data = metricsData;

            // Graphique temps de réponse
            const responseTimeCtx = document.getElementById('responseTimeChart').getContext('2d');
            charts.responseTime = new Chart(responseTimeCtx, {
                type: 'line',
                data: {
                    labels: data.response_times.slice(0, 50).map((_, i) => \`-\${i}min\`).reverse(),
                    datasets: [{
                        label: 'Temps de réponse (ms)',
                        data: data.response_times.slice(0, 50).map(item => item.value).reverse(),
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4,
                        fill: true,
                        pointRadius: 3,
                        pointHoverRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: { 
                            beginAtZero: true,
                            grid: { color: 'rgba(0,0,0,0.1)' }
                        },
                        x: {
                            grid: { color: 'rgba(0,0,0,0.1)' }
                        }
                    }
                }
            });

            // Graphique méthodes (donut)
            const methodsCtx = document.getElementById('methodsChart').getContext('2d');
            charts.methods = new Chart(methodsCtx, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(data.methods).map(m => m.toUpperCase()),
                    datasets: [{
                        data: Object.values(data.methods),
                        backgroundColor: [
                            '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'
                        ],
                        borderWidth: 0,
                        hoverOffset: 10
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { padding: 20 }
                        }
                    }
                }
            });

            // Graphique codes de statut
            const statusCtx = document.getElementById('statusChart').getContext('2d');
            charts.status = new Chart(statusCtx, {
                type: 'bar',
                data: {
                    labels: Object.keys(data.status_codes),
                    datasets: [{
                        label: 'Nombre de réponses',
                        data: Object.values(data.status_codes),
                        backgroundColor: [
                            '#10B981', '#3B82F6', '#F59E0B', '#EF4444'
                        ],
                        borderRadius: 8,
                        borderSkipped: false
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: { 
                            beginAtZero: true,
                            grid: { color: 'rgba(0,0,0,0.1)' }
                        },
                        x: {
                            grid: { display: false }
                        }
                    }
                }
            });

            // Graphique score de santé (gauge)
            const healthCtx = document.getElementById('healthChart').getContext('2d');
            const healthScore = data.performance_indicators.health_score;
            charts.health = new Chart(healthCtx, {
                type: 'doughnut',
                data: {
                    datasets: [{
                        data: [healthScore, 100 - healthScore],
                        backgroundColor: [
                            healthScore >= 80 ? '#10B981' : healthScore >= 60 ? '#F59E0B' : '#EF4444',
                            '#E5E7EB'
                        ],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    circumference: 180,
                    rotation: 270,
                    cutout: '75%',
                    plugins: {
                        legend: { display: false }
                    }
                }
            });
        }

        // Mettre à jour les graphiques
        function updateCharts() {
            if (!metricsData || Object.keys(charts).length === 0) return;
            
            const data = metricsData;
            
            // Mise à jour du graphique temps de réponse
            if (charts.responseTime) {
                const range = parseInt(document.getElementById('timeRangeFilter').value);
                updateResponseTimeChart(range);
            }
            
            // Mise à jour des autres graphiques
            Object.values(charts).forEach(chart => {
                if (chart && chart.update) {
                    chart.update('none'); // Animation désactivée pour les mises à jour
                }
            });
        }

        // Mettre à jour le graphique temps de réponse avec filtre
        function updateResponseTimeChart(range) {
            if (!charts.responseTime || !metricsData) return;
            
            const data = metricsData.response_times.slice(0, range);
            charts.responseTime.data.labels = data.map((_, i) => \`-\${i}min\`).reverse();
            charts.responseTime.data.datasets[0].data = data.map(item => item.value).reverse();
            charts.responseTime.update('none');
        }

        // Nettoyage à la fermeture
        window.addEventListener('beforeunload', () => {
            if (updateInterval) {
                clearInterval(updateInterval);
            }
            Object.values(charts).forEach(chart => {
                if (chart && chart.destroy) {
                    chart.destroy();
                }
            });
        });
    </script>

</body>
</html>`;

  res.send(dashboardHTML);
});

export default router;