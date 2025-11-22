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
      </div>
    </div>
  );
}
