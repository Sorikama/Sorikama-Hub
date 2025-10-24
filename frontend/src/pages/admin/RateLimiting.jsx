/**
 * Page de gestion du Rate Limiting (Admin uniquement)
 * 
 * Fonctionnalités :
 * - Statistiques globales
 * - Liste des utilisateurs bloqués
 * - Déblocage manuel
 * - Graphiques d'utilisation
 * - Historique par utilisateur
 */

import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function RateLimiting() {
  // États pour les statistiques
  const [stats, setStats] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  
  // États pour les utilisateurs bloqués
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [isLoadingBlocked, setIsLoadingBlocked] = useState(true);
  
  // États pour la pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  
  // États pour les modals
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userHistory, setUserHistory] = useState(null);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  /**
   * Charger les statistiques
   */
  const loadStats = async () => {
    try {
      setIsLoadingStats(true);
      const response = await api.get('/admin/rate-limit/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
      setError('Erreur lors du chargement des statistiques');
    } finally {
      setIsLoadingStats(false);
    }
  };

  /**
   * Charger les utilisateurs bloqués
   */
  const loadBlockedUsers = async () => {
    try {
      setIsLoadingBlocked(true);
      const response = await api.get(`/admin/rate-limit/blocked?page=${page}&limit=${limit}`);
      setBlockedUsers(response.data.data.blockedUsers);
      setTotal(response.data.data.pagination.total);
      setPages(response.data.data.pagination.pages);
    } catch (error) {
      console.error('Erreur chargement utilisateurs bloqués:', error);
      setError('Erreur lors du chargement');
    } finally {
      setIsLoadingBlocked(false);
    }
  };

  /**
   * Débloquer un utilisateur
   */
  const handleUnblock = async (userId) => {
    if (!confirm('Débloquer cet utilisateur ?')) return;
    
    try {
      await api.post(`/admin/rate-limit/unblock/${userId}`);
      setSuccess('Utilisateur débloqué avec succès');
      loadBlockedUsers();
      loadStats();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Erreur déblocage:', error);
      setError(error.response?.data?.message || 'Erreur lors du déblocage');
    }
  };

  /**
   * Voir l'historique d'un utilisateur
   */
  const handleViewHistory = async (user) => {
    try {
      setSelectedUser(user);
      const response = await api.get(`/admin/rate-limit/history/${user.userId}?days=7`);
      setUserHistory(response.data.data);
      setShowHistoryModal(true);
    } catch (error) {
      console.error('Erreur historique:', error);
      setError('Erreur lors du chargement de l\'historique');
    }
  };

  /**
   * Nettoyer les anciennes entrées
   */
  const handleCleanup = async () => {
    if (!confirm('Nettoyer les anciennes entrées de rate limiting ?')) return;
    
    try {
      const response = await api.post('/admin/rate-limit/cleanup');
      setSuccess(`${response.data.data.deletedCount} entrées supprimées`);
      loadStats();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Erreur nettoyage:', error);
      setError('Erreur lors du nettoyage');
    }
  };

  /**
   * Formater le temps restant
   */
  const formatRemainingTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}min`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}min`;
  };

  // Charger les données au montage
  useEffect(() => {
    loadStats();
    loadBlockedUsers();
  }, [page]);

  // Auto-refresh toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      loadStats();
      loadBlockedUsers();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [page]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Rate Limiting</h1>
            <p className="text-gray-600 mt-2">Surveillance et gestion des limites de requêtes</p>
          </div>
          <button
            onClick={handleCleanup}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 font-semibold"
          >
            🧹 Nettoyer
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Statistiques globales */}
        {isLoadingStats ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-600">Utilisateurs Bloqués</div>
                  <span className="text-2xl">🚫</span>
                </div>
                <div className="text-3xl font-bold text-red-600">{stats.overview.blockedUsers}</div>
                <div className="text-xs text-gray-500 mt-1">Actuellement</div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-600">Total Requêtes</div>
                  <span className="text-2xl">📊</span>
                </div>
                <div className="text-3xl font-bold text-blue-600">{stats.overview.totalRequests.toLocaleString()}</div>
                <div className="text-xs text-gray-500 mt-1">{stats.overview.period}</div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-600">Services Actifs</div>
                  <span className="text-2xl">🔗</span>
                </div>
                <div className="text-3xl font-bold text-green-600">{stats.requestsByService.length}</div>
                <div className="text-xs text-gray-500 mt-1">Avec activité</div>
              </div>
            </div>

            {/* Top utilisateurs */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Top Utilisateurs (Dernière heure)</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Utilisateur</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Requêtes</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Services</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {stats.topUsers.map((item, index) => (
                      <tr key={item.userId} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {index + 1}
                            </div>
                            <div>
                              {item.user ? (
                                <>
                                  <div className="font-semibold text-gray-900">
                                    {item.user.firstName} {item.user.lastName}
                                  </div>
                                  <div className="text-xs text-gray-500">{item.user.email}</div>
                                </>
                              ) : (
                                <div className="text-sm text-gray-500">ID: {item.userId.substring(0, 8)}...</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                            {item.totalRequests.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {item.services.map(service => (
                              <span key={service} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                {service}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Requêtes par service */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Requêtes par Service</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {stats.requestsByService.map((item) => {
                    const percentage = (item.totalRequests / stats.overview.totalRequests) * 100;
                    return (
                      <div key={item._id}>
                        <div className="flex justify-between items-center mb-2">
                          <div className="font-semibold text-gray-900">{item._id || 'Global'}</div>
                          <div className="text-sm text-gray-600">
                            {item.totalRequests.toLocaleString()} requêtes • {item.uniqueUsers} utilisateur(s)
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Utilisateurs bloqués */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Utilisateurs Bloqués</h2>
          </div>
          
          {isLoadingBlocked ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : blockedUsers.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              <div className="text-4xl mb-4">✅</div>
              <div>Aucun utilisateur bloqué</div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Utilisateur</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Service</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Requêtes</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Temps restant</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {blockedUsers.map((entry) => (
                      <tr key={entry._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          {entry.user ? (
                            <div>
                              <div className="font-semibold text-gray-900">
                                {entry.user.firstName} {entry.user.lastName}
                              </div>
                              <div className="text-xs text-gray-500">{entry.user.email}</div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">ID: {entry.userId.substring(0, 8)}...</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            {entry.service || 'Global'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                            {entry.requestCount}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-700 font-medium">
                            {formatRemainingTime(entry.remainingTime)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewHistory(entry)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              title="Voir l'historique"
                            >
                              📊
                            </button>
                            <button
                              onClick={() => handleUnblock(entry.userId)}
                              className="text-green-600 hover:text-green-800 text-sm font-medium"
                              title="Débloquer"
                            >
                              🔓
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Page {page} sur {pages} ({total} utilisateur(s) bloqué(s))
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Précédent
                    </button>
                    <button
                      onClick={() => setPage(p => Math.min(pages, p + 1))}
                      disabled={page === pages}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Historique */}
        {showHistoryModal && selectedUser && userHistory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Historique Rate Limiting
              </h3>
              
              <div className="mb-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-sm text-blue-600 font-semibold">Total Requêtes</div>
                    <div className="text-2xl font-bold text-blue-900">{userHistory.stats.totalRequests}</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4">
                    <div className="text-sm text-red-600 font-semibold">Blocages</div>
                    <div className="text-2xl font-bold text-red-900">{userHistory.stats.blockedCount}</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-sm text-green-600 font-semibold">Services</div>
                    <div className="text-2xl font-bold text-green-900">{userHistory.stats.services.length}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                {userHistory.history.map((entry) => (
                  <div key={entry._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-semibold text-gray-900">
                          {entry.service || 'Global'} - {entry.endpoint || 'Tous endpoints'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(entry.createdAt).toLocaleString('fr-FR')}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                          {entry.requestCount} requêtes
                        </span>
                        {entry.isBlocked && (
                          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                            Bloqué
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button
                onClick={() => {
                  setShowHistoryModal(false);
                  setSelectedUser(null);
                  setUserHistory(null);
                }}
                className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
              >
                Fermer
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
