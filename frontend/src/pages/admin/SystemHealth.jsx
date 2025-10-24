/**
 * Page de santé du système
 * 
 * Affiche l'état de tous les composants :
 * - Base de données
 * - Redis
 * - Services externes
 * - API Gateway
 */

import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function SystemHealth() {
  const [health, setHealth] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadHealth = async () => {
    try {
      setIsLoading(true);
      // TODO: Remplacer par l'API réelle
      setHealth({
        database: { status: 'healthy', responseTime: 12 },
        redis: { status: 'healthy', responseTime: 5 },
        apiGateway: { status: 'healthy', responseTime: 8 },
        services: [
          { name: 'Auth Service', status: 'healthy', uptime: 99.9 },
          { name: 'SSO Service', status: 'healthy', uptime: 99.8 },
          { name: 'Proxy Service', status: 'healthy', uptime: 99.7 },
        ]
      });
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHealth();
    const interval = setInterval(loadHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'degraded': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'unhealthy': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return '✅';
      case 'degraded': return '⚠️';
      case 'unhealthy': return '❌';
      default: return '❓';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Vérification de la santé du système...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Santé du Système</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Monitoring en temps réel de tous les composants
        </p>
      </div>

      {/* Status Global */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-4xl">✅</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold">Tous les systèmes opérationnels</h2>
              <p className="text-white/80">Dernière vérification : {new Date().toLocaleTimeString('fr-FR')}</p>
            </div>
          </div>
          <button
            onClick={loadHealth}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            🔄 Actualiser
          </button>
        </div>
      </div>

      {/* Composants Principaux */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl">🗄️</span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(health?.database?.status)}`}>
              {getStatusIcon(health?.database?.status)} {health?.database?.status}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Base de données</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Temps de réponse : {health?.database?.responseTime}ms
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl">⚡</span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(health?.redis?.status)}`}>
              {getStatusIcon(health?.redis?.status)} {health?.redis?.status}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Redis Cache</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Temps de réponse : {health?.redis?.responseTime}ms
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl">🌐</span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(health?.apiGateway?.status)}`}>
              {getStatusIcon(health?.apiGateway?.status)} {health?.apiGateway?.status}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">API Gateway</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Temps de réponse : {health?.apiGateway?.responseTime}ms
          </p>
        </div>
      </div>

      {/* Services */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Services Internes
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Service</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Uptime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {health?.services?.map((service, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {service.name}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(service.status)}`}>
                      {getStatusIcon(service.status)} {service.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {service.uptime}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Note */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          💡 <strong>Note :</strong> Les données affichées sont des données de démonstration. 
          L'intégration avec le monitoring réel est en cours.
        </p>
      </div>
    </div>
  );
}
