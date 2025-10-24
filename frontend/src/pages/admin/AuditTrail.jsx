/**
 * Page de visualisation de l'audit trail (Admin uniquement)
 * 
 * Fonctionnalités :
 * - Liste des logs d'audit avec filtres
 * - Statistiques d'activité
 * - Export CSV/JSON
 * - Timeline visuelle
 * - Recherche avancée
 */

import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function AuditTrail() {
  // États pour les logs
  const [logs, setLogs] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  
  // États pour les statistiques
  const [stats, setStats] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  
  // États pour la pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  
  // États pour les filtres
  const [filters, setFilters] = useState({
    category: '',
    action: '',
    status: '',
    userId: '',
    startDate: '',
    endDate: '',
    search: '',
  });
  
  // États pour les modals
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  /**
   * Charger les logs
   */
  const loadLogs = async () => {
    try {
      setIsLoadingLogs(true);
      setError('');

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await api.get(`/admin/audit?${params}`);
      setLogs(response.data.data.logs);
      setTotal(response.data.data.pagination.total);
      setPages(response.data.data.pagination.pages);
    } catch (error) {
      console.error('Erreur chargement logs:', error);
      setError('Erreur lors du chargement des logs');
    } finally {
      setIsLoadingLogs(false);
    }
  };

  /**
   * Charger les statistiques
   */
  const loadStats = async () => {
    try {
      setIsLoadingStats(true);
      const response = await api.get('/admin/audit/stats?days=7');
      setStats(response.data.data);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  /**
   * Exporter en CSV
   */
  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await api.get(`/admin/audit/export/csv?${params}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-logs-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setSuccess('Export CSV réussi');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Erreur export CSV:', error);
      setError('Erreur lors de l\'export CSV');
    }
  };

  /**
   * Exporter en JSON
   */
  const handleExportJSON = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await api.get(`/admin/audit/export/json?${params}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-logs-${Date.now()}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setSuccess('Export JSON réussi');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Erreur export JSON:', error);
      setError('Erreur lors de l\'export JSON');
    }
  };

  /**
   * Réinitialiser les filtres
   */
  const handleResetFilters = () => {
    setFilters({
      category: '',
      action: '',
      status: '',
      userId: '',
      startDate: '',
      endDate: '',
      search: '',
    });
    setPage(1);
  };

  /**
   * Obtenir la couleur du badge selon la catégorie
   */
  const getCategoryColor = (category) => {
    const colors = {
      auth: 'bg-blue-100 text-blue-700',
      user: 'bg-green-100 text-green-700',
      admin: 'bg-purple-100 text-purple-700',
      service: 'bg-yellow-100 text-yellow-700',
      proxy: 'bg-indigo-100 text-indigo-700',
      system: 'bg-gray-100 text-gray-700',
      security: 'bg-red-100 text-red-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  /**
   * Obtenir la couleur du badge selon le statut
   */
  const getStatusColor = (status) => {
    const colors = {
      success: 'bg-green-100 text-green-700',
      failure: 'bg-red-100 text-red-700',
      warning: 'bg-orange-100 text-orange-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  /**
   * Obtenir l'icône selon la catégorie
   */
  const getCategoryIcon = (category) => {
    const icons = {
      auth: '🔐',
      user: '👤',
      admin: '👑',
      service: '🔗',
      proxy: '🌐',
      system: '⚙️',
      security: '🛡️',
    };
    return icons[category] || '📝';
  };

  // Charger les données au montage et quand les filtres changent
  useEffect(() => {
    loadLogs();
  }, [page, filters]);

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Audit Trail</h1>
            <p className="text-gray-600 mt-2">Journal complet des actions système</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportCSV}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold"
            >
              📥 Export CSV
            </button>
            <button
              onClick={handleExportJSON}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
            >
              📥 Export JSON
            </button>
          </div>
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

        {/* Statistiques */}
        {isLoadingStats ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-sm text-gray-600 mb-1">Total Logs</div>
              <div className="text-3xl font-bold text-gray-900">{stats.overview.totalLogs.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-1">{stats.overview.period}</div>
            </div>
            
            {stats.logsByStatus.map((item) => (
              <div key={item._id} className="bg-white rounded-xl shadow-sm p-6">
                <div className="text-sm text-gray-600 mb-1 capitalize">{item._id}</div>
                <div className={`text-3xl font-bold ${
                  item._id === 'success' ? 'text-green-600' :
                  item._id === 'failure' ? 'text-red-600' : 'text-orange-600'
                }`}>
                  {item.count.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {((item.count / stats.overview.totalLogs) * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filtres */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Catégorie</label>
              <select
                value={filters.category}
                onChange={(e) => {
                  setFilters({ ...filters, category: e.target.value });
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Toutes</option>
                <option value="auth">Authentification</option>
                <option value="user">Utilisateur</option>
                <option value="admin">Admin</option>
                <option value="service">Service</option>
                <option value="proxy">Proxy</option>
                <option value="system">Système</option>
                <option value="security">Sécurité</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Statut</label>
              <select
                value={filters.status}
                onChange={(e) => {
                  setFilters({ ...filters, status: e.target.value });
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous</option>
                <option value="success">Succès</option>
                <option value="failure">Échec</option>
                <option value="warning">Avertissement</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date début</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => {
                  setFilters({ ...filters, startDate: e.target.value });
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date fin</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => {
                  setFilters({ ...filters, endDate: e.target.value });
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Rechercher dans les logs..."
              value={filters.search}
              onChange={(e) => {
                setFilters({ ...filters, search: e.target.value });
                setPage(1);
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleResetFilters}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
            >
              Réinitialiser
            </button>
          </div>
        </div>

        {/* Timeline des logs */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Journal d'activité</h2>
          </div>
          
          {isLoadingLogs ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-gray-600">Aucun log trouvé</div>
          ) : (
            <>
              <div className="divide-y divide-gray-200">
                {logs.map((log) => (
                  <div key={log._id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start gap-4">
                      {/* Icône */}
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl">
                          {getCategoryIcon(log.category)}
                        </div>
                      </div>

                      {/* Contenu */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(log.category)}`}>
                            {log.category}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(log.status)}`}>
                            {log.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(log.createdAt).toLocaleString('fr-FR')}
                          </span>
                        </div>

                        <div className="font-semibold text-gray-900 mb-1">
                          {log.action.replace(/_/g, ' ')}
                        </div>

                        {log.user && (
                          <div className="text-sm text-gray-600 mb-1">
                            Par: {log.user.firstName} {log.user.lastName} ({log.user.email})
                          </div>
                        )}

                        {log.resource && (
                          <div className="text-sm text-gray-600 mb-1">
                            Ressource: {log.resource} {log.resourceId && `(${log.resourceId.substring(0, 8)}...)`}
                          </div>
                        )}

                        {log.errorMessage && (
                          <div className="text-sm text-red-600 mb-1">
                            Erreur: {log.errorMessage}
                          </div>
                        )}

                        {log.ipAddress && (
                          <div className="text-xs text-gray-500">
                            IP: {log.ipAddress}
                          </div>
                        )}

                        {log.details && Object.keys(log.details).length > 0 && (
                          <button
                            onClick={() => {
                              setSelectedLog(log);
                              setShowDetailsModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2"
                          >
                            Voir les détails →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Page {page} sur {pages} ({total.toLocaleString()} logs)
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

        {/* Modal Détails */}
        {showDetailsModal && selectedLog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Détails du log</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600">ID</label>
                  <p className="text-gray-900 font-mono text-sm">{selectedLog._id}</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-600">Date</label>
                  <p className="text-gray-900">{new Date(selectedLog.createdAt).toLocaleString('fr-FR')}</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-600">Action</label>
                  <p className="text-gray-900">{selectedLog.action}</p>
                </div>

                {selectedLog.details && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Détails</label>
                    <pre className="mt-2 p-4 bg-gray-50 rounded-lg text-sm overflow-x-auto">
                      {JSON.stringify(selectedLog.details, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedLog.metadata && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Métadonnées</label>
                    <pre className="mt-2 p-4 bg-gray-50 rounded-lg text-sm overflow-x-auto">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedLog.userAgent && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">User Agent</label>
                    <p className="text-gray-900 text-sm">{selectedLog.userAgent}</p>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedLog(null);
                }}
                className="w-full mt-6 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
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
