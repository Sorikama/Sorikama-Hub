/**
 * Page des métriques de performance
 * 
 * Affiche :
 * - Temps de réponse moyen
 * - Requêtes par seconde
 * - Utilisation CPU/RAM
 * - Graphiques de performance
 * - Top endpoints les plus lents
 */

import { useState, useEffect } from 'react';

export default function PerformanceMetrics() {
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('1h');

  // Données de démonstration
  const loadMetrics = async () => {
    try {
      setIsLoading(true);
      // TODO: Remplacer par l'API réelle
      setMetrics({
        avgResponseTime: 145,
        requestsPerSecond: 42,
        cpuUsage: 35,
        ramUsage: 62,
        totalRequests: 15234,
        errorRate: 0.8,
        slowestEndpoints: [
          { endpoint: '/api/v1/admin/users', avgTime: 320, calls: 1234 },
          { endpoint: '/api/v1/services', avgTime: 280, calls: 892 },
          { endpoint: '/api/v1/sso/auth/:id', avgTime: 245, calls: 2341 },
          { endpoint: '/api/v1/admin/users/:id', avgTime: 198, calls: 456 },
          { endpoint: '/api/v1/auth/login', avgTime: 165, calls: 3421 },
        ],
        requestsByHour: [
          { hour: '00:00', requests: 120 },
          { hour: '01:00', requests: 95 },
          { hour: '02:00', requests: 78 },
          { hour: '03:00', requests: 65 },
          { hour: '04:00', requests: 82 },
          { hour: '05:00', requests: 145 },
          { hour: '06:00', requests: 234 },
          { hour: '07:00', requests: 456 },
          { hour: '08:00', requests: 678 },
          { hour: '09:00', requests: 892 },
          { hour: '10:00', requests: 1023 },
          { hour: '11:00', requests: 1156 },
        ]
      });
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 5000);
    return () => clearInterval(interval);
  }, [timeRange]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement des métriques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Métriques de Performance</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Monitoring en temps réel des performances du système
          </p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
          {['1h', '6h', '24h', '7d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs Principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Temps de réponse moyen */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <span className="text-2xl">⚡</span>
            </div>
            <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
              -12%
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {metrics?.avgResponseTime}ms
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Temps de réponse moyen
          </p>
        </div>

        {/* Requêtes par seconde */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
              +8%
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {metrics?.requestsPerSecond}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Requêtes par seconde
          </p>
        </div>

        {/* CPU Usage */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <span className="text-2xl">💻</span>
            </div>
            <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
              Normal
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {metrics?.cpuUsage}%
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Utilisation CPU
          </p>
          <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${metrics?.cpuUsage}%` }}
            />
          </div>
        </div>

        {/* RAM Usage */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🧠</span>
            </div>
            <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-full">
              Moyen
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {metrics?.ramUsage}%
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Utilisation RAM
          </p>
          <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-orange-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${metrics?.ramUsage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Statistiques supplémentaires */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">📈</span>
            <h3 className="font-semibold text-gray-900 dark:text-white">Total Requêtes</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {metrics?.totalRequests?.toLocaleString('fr-FR')}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Dernières {timeRange}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">✅</span>
            <h3 className="font-semibold text-gray-900 dark:text-white">Taux de Succès</h3>
          </div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {(100 - metrics?.errorRate).toFixed(1)}%
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {metrics?.errorRate}% d'erreurs
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🔄</span>
            <h3 className="font-semibold text-gray-900 dark:text-white">Auto-refresh</h3>
          </div>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            5s
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Mise à jour automatique
          </p>
        </div>
      </div>

      {/* Graphique des requêtes par heure */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          📊 Requêtes par heure
        </h2>
        <div className="flex items-end justify-between gap-2 h-64">
          {metrics?.requestsByHour?.map((item, index) => {
            const maxRequests = Math.max(...metrics.requestsByHour.map(i => i.requests));
            const height = (item.requests / maxRequests) * 100;
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="relative w-full group">
                  <div 
                    className="w-full bg-gradient-to-t from-blue-600 to-purple-600 rounded-t-lg transition-all duration-300 hover:from-blue-500 hover:to-purple-500"
                    style={{ height: `${height}%` }}
                  />
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {item.requests} requêtes
                  </div>
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400 transform -rotate-45 origin-top-left">
                  {item.hour}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Endpoints les plus lents */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            🐌 Endpoints les plus lents
          </h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Endpoint</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Temps moyen</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Appels</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Performance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {metrics?.slowestEndpoints?.map((endpoint, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-6 py-4">
                  <code className="text-sm font-mono text-gray-900 dark:text-white">
                    {endpoint.endpoint}
                  </code>
                </td>
                <td className="px-6 py-4">
                  <span className={`font-semibold ${
                    endpoint.avgTime > 300 ? 'text-red-600 dark:text-red-400' :
                    endpoint.avgTime > 200 ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-green-600 dark:text-green-400'
                  }`}>
                    {endpoint.avgTime}ms
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                  {endpoint.calls.toLocaleString('fr-FR')}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 max-w-[200px]">
                      <div 
                        className={`h-2 rounded-full ${
                          endpoint.avgTime > 300 ? 'bg-red-500' :
                          endpoint.avgTime > 200 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min((endpoint.avgTime / 400) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {endpoint.avgTime > 300 ? 'Lent' : endpoint.avgTime > 200 ? 'Moyen' : 'Rapide'}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Note */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          💡 <strong>Note :</strong> Les métriques affichées sont des données de démonstration. 
          L'intégration avec le système de monitoring réel (Prometheus, Grafana) est en cours.
        </p>
      </div>
    </div>
  );
}
