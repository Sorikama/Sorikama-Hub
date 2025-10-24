/**
 * Page de gestion des webhooks (Admin uniquement)
 * 
 * Fonctionnalités :
 * - Liste des webhooks
 * - Créer/Modifier/Supprimer
 * - Tester un webhook
 * - Voir les logs
 * - Statistiques
 */

import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function WebhooksManager() {
  // États pour les webhooks
  const [webhooks, setWebhooks] = useState([]);
  const [availableEvents, setAvailableEvents] = useState([]);
  const [isLoadingWebhooks, setIsLoadingWebhooks] = useState(true);
  
  // États pour les statistiques
  const [stats, setStats] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  
  // États pour les modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // États pour le formulaire
  const [selectedWebhook, setSelectedWebhook] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    events: [],
    retryCount: 3,
    timeout: 5000,
    headers: {},
  });
  
  // États pour les logs
  const [logs, setLogs] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  /**
   * Charger les webhooks
   */
  const loadWebhooks = async () => {
    try {
      setIsLoadingWebhooks(true);
      const response = await api.get('/admin/webhooks');
      setWebhooks(response.data.data.webhooks);
      setAvailableEvents(response.data.data.availableEvents);
    } catch (error) {
      console.error('Erreur chargement webhooks:', error);
      setError('Erreur lors du chargement des webhooks');
    } finally {
      setIsLoadingWebhooks(false);
    }
  };

  /**
   * Charger les statistiques
   */
  const loadStats = async () => {
    try {
      setIsLoadingStats(true);
      const response = await api.get('/admin/webhooks/stats/overview');
      setStats(response.data.data);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  /**
   * Créer un webhook
   */
  const handleCreateWebhook = async () => {
    try {
      setError('');
      if (!formData.name.trim() || !formData.url.trim() || formData.events.length === 0) {
        setError('Tous les champs sont requis');
        return;
      }

      await api.post('/admin/webhooks', formData);
      setSuccess('Webhook créé avec succès');
      setShowCreateModal(false);
      setFormData({ name: '', url: '', events: [], retryCount: 3, timeout: 5000, headers: {} });
      loadWebhooks();
      loadStats();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Erreur création webhook:', error);
      setError(error.response?.data?.message || 'Erreur lors de la création');
    }
  };

  /**
   * Mettre à jour un webhook
   */
  const handleUpdateWebhook = async () => {
    try {
      setError('');
      if (!selectedWebhook) return;

      await api.put(`/admin/webhooks/${selectedWebhook._id}`, formData);
      setSuccess('Webhook mis à jour avec succès');
      setShowEditModal(false);
      setSelectedWebhook(null);
      setFormData({ name: '', url: '', events: [], retryCount: 3, timeout: 5000, headers: {} });
      loadWebhooks();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Erreur mise à jour webhook:', error);
      setError(error.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  };

  /**
   * Supprimer un webhook
   */
  const handleDeleteWebhook = async () => {
    try {
      setError('');
      if (!selectedWebhook) return;

      await api.delete(`/admin/webhooks/${selectedWebhook._id}`);
      setSuccess('Webhook supprimé avec succès');
      setShowDeleteModal(false);
      setSelectedWebhook(null);
      loadWebhooks();
      loadStats();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Erreur suppression webhook:', error);
      setError(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  /**
   * Tester un webhook
   */
  const handleTestWebhook = async (webhook) => {
    try {
      setError('');
      const response = await api.post(`/admin/webhooks/${webhook._id}/test`);
      if (response.data.data.success) {
        setSuccess(`Test réussi ! (${response.data.data.statusCode} - ${response.data.data.responseTime}ms)`);
      } else {
        setError(`Test échoué : ${response.data.data.error}`);
      }
      setTimeout(() => { setSuccess(''); setError(''); }, 5000);
    } catch (error) {
      console.error('Erreur test webhook:', error);
      setError('Erreur lors du test');
    }
  };

  /**
   * Voir les logs d'un webhook
   */
  const handleViewLogs = async (webhook) => {
    try {
      setSelectedWebhook(webhook);
      setIsLoadingLogs(true);
      setShowLogsModal(true);
      const response = await api.get(`/admin/webhooks/${webhook._id}/logs`);
      setLogs(response.data.data.logs);
    } catch (error) {
      console.error('Erreur chargement logs:', error);
      setError('Erreur lors du chargement des logs');
    } finally {
      setIsLoadingLogs(false);
    }
  };

  /**
   * Ouvrir le modal d'édition
   */
  const openEditModal = (webhook) => {
    setSelectedWebhook(webhook);
    setFormData({
      name: webhook.name,
      url: webhook.url,
      events: webhook.events,
      retryCount: webhook.retryCount,
      timeout: webhook.timeout,
      headers: webhook.headers || {},
    });
    setShowEditModal(true);
  };

  /**
   * Toggle un événement
   */
  const toggleEvent = (event) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event]
    }));
  };

  /**
   * Toggle actif/inactif
   */
  const handleToggleActive = async (webhook) => {
    try {
      await api.put(`/admin/webhooks/${webhook._id}`, {
        isActive: !webhook.isActive
      });
      setSuccess(`Webhook ${webhook.isActive ? 'désactivé' : 'activé'}`);
      loadWebhooks();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Erreur toggle:', error);
      setError('Erreur lors de la modification');
    }
  };

  // Charger les données au montage
  useEffect(() => {
    loadWebhooks();
    loadStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Webhooks Manager</h1>
            <p className="text-gray-600 mt-2">Gérez les webhooks et notifications externes</p>
          </div>
          <button
            onClick={() => {
              setFormData({ name: '', url: '', events: [], retryCount: 3, timeout: 5000, headers: {} });
              setShowCreateModal(true);
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
          >
            ➕ Créer un webhook
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

        {/* Statistiques */}
        {isLoadingStats ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-sm text-gray-600 mb-1">Total Webhooks</div>
              <div className="text-3xl font-bold text-gray-900">{stats.overview.totalWebhooks}</div>
              <div className="text-xs text-gray-500 mt-1">{stats.overview.activeWebhooks} actifs</div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-sm text-gray-600 mb-1">Envois (24h)</div>
              <div className="text-3xl font-bold text-blue-600">{stats.overview.recentLogs}</div>
              <div className="text-xs text-gray-500 mt-1">Dernières 24h</div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-sm text-gray-600 mb-1">Succès</div>
              <div className="text-3xl font-bold text-green-600">{stats.overview.successfulLogs}</div>
              <div className="text-xs text-gray-500 mt-1">{stats.overview.successRate}% taux de succès</div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-sm text-gray-600 mb-1">Échecs</div>
              <div className="text-3xl font-bold text-red-600">{stats.overview.failedLogs}</div>
              <div className="text-xs text-gray-500 mt-1">À surveiller</div>
            </div>
          </div>
        )}

        {/* Liste des webhooks */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Webhooks configurés</h2>
          </div>
          
          {isLoadingWebhooks ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : webhooks.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              <div className="text-4xl mb-4">🔔</div>
              <div>Aucun webhook configuré</div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {webhooks.map((webhook) => (
                <div key={webhook._id} className="p-6 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{webhook.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          webhook.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {webhook.isActive ? '✓ Actif' : '○ Inactif'}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-3 font-mono">{webhook.url}</div>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {webhook.events.map((event) => (
                          <span key={event} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
                            {event}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-semibold">Succès:</span> {webhook.successCount}
                        </div>
                        <div>
                          <span className="font-semibold">Échecs:</span> {webhook.failureCount}
                        </div>
                        <div>
                          <span className="font-semibold">Retry:</span> {webhook.retryCount}
                        </div>
                        <div>
                          <span className="font-semibold">Timeout:</span> {webhook.timeout}ms
                        </div>
                      </div>
                      
                      {webhook.lastTriggered && (
                        <div className="text-xs text-gray-500 mt-2">
                          Dernier envoi: {new Date(webhook.lastTriggered).toLocaleString('fr-FR')}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleToggleActive(webhook)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium ${
                          webhook.isActive
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                        title={webhook.isActive ? 'Désactiver' : 'Activer'}
                      >
                        {webhook.isActive ? '⏸️' : '▶️'}
                      </button>
                      <button
                        onClick={() => handleTestWebhook(webhook)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium"
                        title="Tester"
                      >
                        🧪
                      </button>
                      <button
                        onClick={() => handleViewLogs(webhook)}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 text-sm font-medium"
                        title="Voir les logs"
                      >
                        📊
                      </button>
                      <button
                        onClick={() => openEditModal(webhook)}
                        className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 text-sm font-medium"
                        title="Modifier"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => {
                          setSelectedWebhook(webhook);
                          setShowDeleteModal(true);
                        }}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium"
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Créer/Modifier */}
        {(showCreateModal || showEditModal) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {showCreateModal ? 'Créer un webhook' : 'Modifier le webhook'}
              </h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nom *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Mon webhook"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">URL *</label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/webhook"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Événements *</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-4">
                    {availableEvents.map((event) => (
                      <label key={event} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.events.includes(event)}
                          onChange={() => toggleEvent(event)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="text-sm text-gray-700">{event}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Retry Count</label>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      value={formData.retryCount}
                      onChange={(e) => setFormData({ ...formData, retryCount: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Timeout (ms)</label>
                    <input
                      type="number"
                      min="1000"
                      max="30000"
                      step="1000"
                      value={formData.timeout}
                      onChange={(e) => setFormData({ ...formData, timeout: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    showCreateModal ? setShowCreateModal(false) : setShowEditModal(false);
                    setFormData({ name: '', url: '', events: [], retryCount: 3, timeout: 5000, headers: {} });
                    setSelectedWebhook(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                >
                  Annuler
                </button>
                <button
                  onClick={showCreateModal ? handleCreateWebhook : handleUpdateWebhook}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  {showCreateModal ? 'Créer' : 'Mettre à jour'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Logs */}
        {showLogsModal && selectedWebhook && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Logs: {selectedWebhook.name}
              </h3>
              
              {isLoadingLogs ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-12 text-gray-600">Aucun log</div>
              ) : (
                <div className="space-y-3 mb-6">
                  {logs.map((log) => (
                    <div key={log._id} className={`border rounded-lg p-4 ${
                      log.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                    }`}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-semibold text-gray-900">{log.event}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(log.createdAt).toLocaleString('fr-FR')}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {log.statusCode && (
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              log.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {log.statusCode}
                            </span>
                          )}
                          {log.responseTime && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                              {log.responseTime}ms
                            </span>
                          )}
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                            Tentative {log.attempt}
                          </span>
                        </div>
                      </div>
                      {log.error && (
                        <div className="text-sm text-red-700 mt-2">
                          Erreur: {log.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              <button
                onClick={() => {
                  setShowLogsModal(false);
                  setSelectedWebhook(null);
                  setLogs([]);
                }}
                className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
              >
                Fermer
              </button>
            </div>
          </div>
        )}

        {/* Modal Supprimer */}
        {showDeleteModal && selectedWebhook && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Supprimer le webhook</h3>
              <p className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir supprimer <strong>{selectedWebhook.name}</strong> ?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedWebhook(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteWebhook}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
