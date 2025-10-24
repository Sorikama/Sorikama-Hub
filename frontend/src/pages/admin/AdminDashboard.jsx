/**
 * Dashboard principal de l'administration - Version améliorée
 * 
 * Affiche :
 * - KPIs globaux (utilisateurs, services, requêtes, etc.)
 * - Graphiques d'activité en temps réel
 * - Alertes et notifications importantes
 * - Activité récente
 * - Statistiques détaillées
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [auditStats, setAuditStats] = useState(null);
  const [rateLimitStats, setRateLimitStats] = useState(null);
  const [webhookStats, setWebhookStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  /**
   * Charger toutes les statistiques
   */
  const loadAllStats = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Charger en parallèle toutes les stats
      const [usersRes, auditRes, rateLimitRes, webhookRes] = await Promise.all([
        api.get('/admin/users/stats/overview').catch(() => null),
        api.get('/admin/audit/stats?days=1').catch(() => null),
        api.get('/admin/rate-limit/stats').catch(() => null),
        api.get('/admin/webhooks/stats/overview').catch(() => null),
      ]);

      setStats(usersRes?.data?.data || null);
      setAuditStats(auditRes?.data?.data || null);
      setRateLimitStats(rateLimitRes?.data?.data || null);
      setWebhookStats(webhookRes?.data?.data || null);

    } catch (error) {
      console.error('Erreur chargement stats:', error);
      setError('Erreur lors du chargement des statistiques');
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les stats au montage
  useEffect(() => {
    loadAllStats();
    
    // Auto-refresh toutes les 30 secondes
    const interval = setInterval(loadAllStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Horloge en temps réel
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header avec horloge */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
            <p className="text-gray-600 mt-2">Vue d'ensemble de la plateforme</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {currentTime.toLocaleTimeString('fr-FR')}
            </div>
            <div className="text-sm text-gray-600">
              {currentTime.toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>

        {/* KPIs Principaux */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Utilisateurs */}
          <Link to="/admin/users" className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-all transform hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">👥</div>
              <div className="text-right">
                <div className="text-sm opacity-90">Total Utilisateurs</div>
                <div className="text-3xl font-bold">{stats?.total || 0}</div>
              </div>
            </div>
            <div className="flex justify-between text-sm opacity-90">
              <span>Actifs: {stats?.active || 0}</span>
              <span>Bloqués: {stats?.blocked || 0}</span>
            </div>
          </Link>

          {/* Activité aujourd'hui */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">📊</div>
              <div className="text-right">
                <div className="text-sm opacity-90">Actifs Aujourd'hui</div>
                <div className="text-3xl font-bold">{stats?.activeToday || 0}</div>
              </div>
            </div>
            <div className="flex justify-between text-sm opacity-90">
              <span>Nouveaux: {stats?.newToday || 0}</span>
              <span>Vérifiés: {stats?.verified || 0}</span>
            </div>
          </div>

          {/* Audit Logs */}
          <Link to="/admin/audit" className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-all transform hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">📜</div>
              <div className="text-right">
                <div className="text-sm opacity-90">Logs (24h)</div>
                <div className="text-3xl font-bold">{auditStats?.overview?.totalLogs || 0}</div>
              </div>
            </div>
            <div className="flex justify-between text-sm opacity-90">
              <span>Succès: {auditStats?.logsByStatus?.find(s => s._id === 'success')?.count || 0}</span>
              <span>Échecs: {auditStats?.logsByStatus?.find(s => s._id === 'failure')?.count || 0}</span>
            </div>
          </Link>

          {/* Rate Limiting */}
          <Link to="/admin/rate-limit" className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-all transform hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">⏱️</div>
              <div className="text-right">
                <div className="text-sm opacity-90">Requêtes (1h)</div>
                <div className="text-3xl font-bold">{rateLimitStats?.overview?.totalRequests?.toLocaleString() || 0}</div>
              </div>
            </div>
            <div className="flex justify-between text-sm opacity-90">
              <span>Bloqués: {rateLimitStats?.overview?.blockedUsers || 0}</span>
              <span>Services: {rateLimitStats?.requestsByService?.length || 0}</span>
            </div>
          </Link>
        </div>

        {/* Alertes importantes */}
        {(stats?.blocked > 0 || rateLimitStats?.overview?.blockedUsers > 0) && (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg mb-8">
            <div className="flex items-start">
              <div className="text-3xl mr-4">⚠️</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-900 mb-2">Alertes de sécurité</h3>
                <div className="space-y-2 text-red-700">
                  {stats?.blocked > 0 && (
                    <div>• {stats.blocked} utilisateur(s) bloqué(s)</div>
                  )}
                  {rateLimitStats?.overview?.blockedUsers > 0 && (
                    <div>• {rateLimitStats.overview.blockedUsers} utilisateur(s) en rate limit</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statistiques détaillées */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* Activité par catégorie */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Activité par Catégorie (24h)</h3>
            {auditStats?.logsByCategory && auditStats.logsByCategory.length > 0 ? (
              <div className="space-y-3">
                {auditStats.logsByCategory.map((cat) => {
                  const total = auditStats.overview.totalLogs;
                  const percentage = total > 0 ? (cat.count / total) * 100 : 0;
                  const colors = {
                    auth: 'from-blue-500 to-blue-600',
                    user: 'from-green-500 to-green-600',
                    admin: 'from-purple-500 to-purple-600',
                    service: 'from-yellow-500 to-yellow-600',
                    proxy: 'from-indigo-500 to-indigo-600',
                    system: 'from-gray-500 to-gray-600',
                    security: 'from-red-500 to-red-600',
                  };
                  return (
                    <div key={cat._id}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700 capitalize">{cat._id}</span>
                        <span className="text-sm text-gray-600">{cat.count} ({percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`bg-gradient-to-r ${colors[cat._id] || 'from-gray-400 to-gray-500'} h-2 rounded-full transition-all`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">Aucune donnée disponible</div>
            )}
          </div>

          {/* Top utilisateurs actifs */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Top Utilisateurs Actifs (24h)</h3>
            {auditStats?.topUsers && auditStats.topUsers.length > 0 ? (
              <div className="space-y-3">
                {auditStats.topUsers.slice(0, 5).map((item, index) => (
                  <div key={item.userId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      {item.user ? (
                        <>
                          <div className="font-semibold text-gray-900 truncate">
                            {item.user.firstName} {item.user.lastName}
                          </div>
                          <div className="text-xs text-gray-500 truncate">{item.user.email}</div>
                        </>
                      ) : (
                        <div className="text-sm text-gray-500">ID: {item.userId.substring(0, 8)}...</div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-600">{item.count}</div>
                      <div className="text-xs text-gray-500">actions</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">Aucune donnée disponible</div>
            )}
          </div>
        </div>

        {/* Webhooks et Rate Limiting */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* Webhooks */}
          <Link to="/admin/webhooks" className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Webhooks</h3>
              <span className="text-2xl">🔔</span>
            </div>
            {webhookStats ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total configurés</span>
                  <span className="font-bold text-gray-900">{webhookStats.overview.totalWebhooks}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Actifs</span>
                  <span className="font-bold text-green-600">{webhookStats.overview.activeWebhooks}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Envois (24h)</span>
                  <span className="font-bold text-blue-600">{webhookStats.overview.recentLogs}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Taux de succès</span>
                  <span className={`font-bold ${webhookStats.overview.successRate >= 90 ? 'text-green-600' : 'text-orange-600'}`}>
                    {webhookStats.overview.successRate}%
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">Chargement...</div>
            )}
          </Link>

          {/* Rate Limiting détaillé */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Rate Limiting (1h)</h3>
              <span className="text-2xl">⏱️</span>
            </div>
            {rateLimitStats?.requestsByService && rateLimitStats.requestsByService.length > 0 ? (
              <div className="space-y-2">
                {rateLimitStats.requestsByService.slice(0, 5).map((service) => (
                  <div key={service._id} className="flex justify-between items-center text-sm">
                    <span className="text-gray-700 font-medium">{service._id || 'Global'}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">{service.totalRequests.toLocaleString()}</span>
                      <span className="text-xs text-gray-500">({service.uniqueUsers} users)</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">Aucune activité récente</div>
            )}
          </div>
        </div>

        {/* Actions rapides */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Actions Rapides</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to="/admin/users"
              className="flex flex-col items-center gap-2 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all"
            >
              <span className="text-3xl">👥</span>
              <span className="text-sm font-semibold text-blue-900">Utilisateurs</span>
            </Link>
            <Link
              to="/admin/roles"
              className="flex flex-col items-center gap-2 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-all"
            >
              <span className="text-3xl">🔐</span>
              <span className="text-sm font-semibold text-purple-900">Rôles</span>
            </Link>
            <Link
              to="/admin/audit"
              className="flex flex-col items-center gap-2 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-all"
            >
              <span className="text-3xl">📜</span>
              <span className="text-sm font-semibold text-green-900">Audit</span>
            </Link>
            <Link
              to="/admin/webhooks"
              className="flex flex-col items-center gap-2 p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-all"
            >
              <span className="text-3xl">🔔</span>
              <span className="text-sm font-semibold text-orange-900">Webhooks</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
