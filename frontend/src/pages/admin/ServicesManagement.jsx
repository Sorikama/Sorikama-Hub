/**
 * Gestion des Services Externes
 * Interface moderne pour ajouter, configurer et gérer les services externes
 */

import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiExternalLink, FiServer, FiGlobe, FiToggleLeft, FiToggleRight, FiCheck, FiX, FiAlertCircle, FiCopy, FiRefreshCw, FiFileText } from 'react-icons/fi';
import api from '../../services/api';

// Styles pour les animations
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.2s ease-out;
  }
  
  .animate-slideUp {
    animation: slideUp 0.3s ease-out;
  }
`;

export default function ServicesManagement() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    frontendUrl: '',
    backendUrl: '',
    proxyPath: '',
    enabled: true,
    requireAuth: false,
    allowedRoles: []
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/services');
      setServices(response.data.services || []);
    } catch (error) {
      console.error('Erreur chargement services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingService) {
        await api.put(`/admin/services/${editingService._id}`, formData);
      } else {
        await api.post('/admin/services', formData);
      }
      fetchServices();
      closeModal();
    } catch (error) {
      console.error('Erreur sauvegarde service:', error);
      alert(error.response?.data?.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) return;
    try {
      await api.delete(`/admin/services/${id}`);
      fetchServices();
    } catch (error) {
      console.error('Erreur suppression service:', error);
    }
  };

  const toggleService = async (id, enabled) => {
    try {
      await api.patch(`/admin/services/${id}/toggle`, { enabled: !enabled });
      fetchServices();
    } catch (error) {
      console.error('Erreur toggle service:', error);
    }
  };

  const testConnection = async (service) => {
    try {
      const response = await api.post(`/admin/services/${service._id}/test`);
      const { test } = response.data;
      
      if (test.status === 'online') {
        alert(
          `✅ Service ${test.serviceName} en ligne !\n\n` +
          `Backend: ${test.backendUrl}\n` +
          `Temps de réponse: ${test.responseTime}ms\n` +
          `Statut: Opérationnel`
        );
      } else if (test.status === 'offline') {
        alert(
          `❌ Service ${test.serviceName} hors ligne\n\n` +
          `Backend: ${test.backendUrl}\n` +
          `Erreur: ${test.error}\n\n` +
          `Assurez-vous que le backend est démarré sur ce port.`
        );
      } else {
        alert(
          `⚠️ Service ${test.serviceName} - Statut inconnu\n\n` +
          `Backend: ${test.backendUrl}\n` +
          `Temps de réponse: ${test.responseTime}ms`
        );
      }
    } catch (error) {
      console.error('Erreur test connexion:', error);
      alert(`❌ Erreur lors du test de connexion\n\n${error.response?.data?.message || error.message}`);
    }
  };

  const openModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        slug: service.slug,
        description: service.description || '',
        frontendUrl: service.frontendUrl,
        backendUrl: service.backendUrl,
        proxyPath: service.proxyPath,
        enabled: service.enabled,
        requireAuth: service.requireAuth || false,
        allowedRoles: service.allowedRoles || []
      });
    } else {
      setEditingService(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        frontendUrl: '',
        backendUrl: '',
        proxyPath: '',
        enabled: true,
        requireAuth: false,
        allowedRoles: []
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingService(null);
  };

  const generateSlug = (name) => {
    return name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Gestion des Services Externes
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Ajoutez et gérez vos services externes avec proxy et routage automatique
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus className="w-5 h-5" />
          Ajouter un service
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Services</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {services.length}
              </p>
            </div>
            <FiServer className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Actifs</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {services.filter(s => s.enabled).length}
              </p>
            </div>
            <FiCheck className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Inactifs</p>
              <p className="text-2xl font-bold text-gray-600 mt-1">
                {services.filter(s => !s.enabled).length}
              </p>
            </div>
            <FiX className="w-8 h-8 text-gray-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avec Auth</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {services.filter(s => s.requireAuth).length}
              </p>
            </div>
            <FiAlertCircle className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Liste des services */}
      {services.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
          <FiServer className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Aucun service configuré
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Commencez par ajouter votre premier service externe
          </p>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiPlus className="w-5 h-5" />
            Ajouter un service
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {services.map((service) => (
            <div
              key={service._id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {service.name}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        service.enabled 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                        {service.enabled ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {service.description || 'Aucune description'}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleService(service._id, service.enabled)}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    {service.enabled ? (
                      <FiToggleRight className="w-6 h-6 text-green-600" />
                    ) : (
                      <FiToggleLeft className="w-6 h-6" />
                    )}
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                {/* URLs */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FiGlobe className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Frontend:</span>
                    <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded flex-1 truncate">
                      {service.frontendUrl}
                    </code>
                    <button
                      onClick={() => copyToClipboard(service.frontendUrl)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <FiCopy className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <FiServer className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Backend:</span>
                    <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded flex-1 truncate">
                      {service.backendUrl}
                    </code>
                    <button
                      onClick={() => copyToClipboard(service.backendUrl)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <FiCopy className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <FiRefreshCw className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Proxy:</span>
                    <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded flex-1 truncate">
                      /api/proxy/{service.proxyPath}
                    </code>
                    <button
                      onClick={() => copyToClipboard(`/api/proxy/${service.proxyPath}`)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <FiCopy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Infos */}
                <div className="flex items-center gap-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    {service.requireAuth ? (
                      <>
                        <FiCheck className="w-4 h-4 text-yellow-600" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">Auth requise</span>
                      </>
                    ) : (
                      <>
                        <FiX className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">Auth non requise</span>
                      </>
                    )}
                  </div>
                  {service.allowedRoles?.length > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        Rôles: {service.allowedRoles.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <a
                    href={service.frontendUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <FiExternalLink className="w-4 h-4" />
                    Ouvrir
                  </a>
                  <button
                    onClick={() => testConnection(service)}
                    className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 transition-colors"
                    title="Tester la connexion au backend"
                  >
                    <FiRefreshCw className="w-4 h-4" />
                    Tester
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openModal(service)}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors"
                    title="Modifier"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(service._id)}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 transition-colors"
                    title="Supprimer"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Moderne */}
      {showModal && (
        <>
          {/* Overlay avec animation */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fadeIn"
            onClick={closeModal}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl pointer-events-auto animate-slideUp">
              
              {/* Header avec gradient */}
              <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                      {editingService ? '✏️ Modifier le service' : '➕ Nouveau service'}
                    </h2>
                    <p className="text-blue-100 text-sm">
                      {editingService ? 'Mettez à jour les informations du service' : 'Ajoutez un nouveau service externe à votre hub'}
                    </p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <FiX className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>

              {/* Form avec scroll */}
              <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-180px)]">
                <div className="p-6 space-y-6">
                  
                  {/* Section: Informations générales */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Informations générales
                      </h3>
                    </div>

                    {/* Nom du service */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <span className="flex items-center gap-2">
                          <FiServer className="w-4 h-4" />
                          Nom du service
                          <span className="text-red-500">*</span>
                        </span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ 
                            ...formData, 
                            name: e.target.value,
                            slug: generateSlug(e.target.value),
                            proxyPath: generateSlug(e.target.value)
                          });
                        }}
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        placeholder="Ex: Service de Gestion Utilisateurs"
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Le nom affiché de votre service
                      </p>
                    </div>

                    {/* Slug (auto-généré) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <span className="flex items-center gap-2">
                          <FiRefreshCw className="w-4 h-4" />
                          Identifiant unique (slug)
                          <span className="text-red-500">*</span>
                        </span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        placeholder="service-gestion-utilisateurs"
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Généré automatiquement, modifiable si besoin
                      </p>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <span className="flex items-center gap-2">
                          <FiFileText className="w-4 h-4" />
                          Description
                        </span>
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                        placeholder="Décrivez brièvement ce que fait ce service..."
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Optionnel - Aide à identifier rapidement le service
                      </p>
                    </div>
                  </div>

                  {/* Section: Configuration des URLs */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-1 h-6 bg-green-600 rounded-full"></div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Configuration des URLs
                      </h3>
                    </div>

                    {/* Frontend URL */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <span className="flex items-center gap-2">
                          <FiGlobe className="w-4 h-4 text-blue-600" />
                          URL Frontend
                          <span className="text-red-500">*</span>
                        </span>
                      </label>
                      <div className="relative">
                        <input
                          type="url"
                          required
                          value={formData.frontendUrl}
                          onChange={(e) => setFormData({ ...formData, frontendUrl: e.target.value })}
                          className="w-full px-4 py-3 pl-10 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                          placeholder="http://localhost:3000"
                        />
                        <FiGlobe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      </div>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        L'URL où votre interface utilisateur est hébergée
                      </p>
                    </div>

                    {/* Backend URL */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <span className="flex items-center gap-2">
                          <FiServer className="w-4 h-4 text-green-600" />
                          URL Backend (API)
                          <span className="text-red-500">*</span>
                        </span>
                      </label>
                      <div className="relative">
                        <input
                          type="url"
                          required
                          value={formData.backendUrl}
                          onChange={(e) => setFormData({ ...formData, backendUrl: e.target.value })}
                          className="w-full px-4 py-3 pl-10 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                          placeholder="http://localhost:4000"
                        />
                        <FiServer className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      </div>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        L'URL de votre API backend (sera proxifiée)
                      </p>
                    </div>

                    {/* Proxy Path */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <span className="flex items-center gap-2">
                          <FiRefreshCw className="w-4 h-4 text-purple-600" />
                          Chemin Proxy
                          <span className="text-red-500">*</span>
                        </span>
                      </label>
                      <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-600">
                        <span className="text-sm text-gray-600 dark:text-gray-400 font-mono whitespace-nowrap">
                          /api/v1/proxy/
                        </span>
                        <input
                          type="text"
                          required
                          value={formData.proxyPath}
                          onChange={(e) => setFormData({ ...formData, proxyPath: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                          className="flex-1 px-3 py-2 border-0 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm rounded-lg focus:ring-2 focus:ring-purple-500/20"
                          placeholder="mon-service"
                        />
                      </div>
                      <div className="mt-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                        <p className="text-xs text-purple-700 dark:text-purple-300 font-medium">
                          📍 URL finale du proxy: <code className="font-mono bg-purple-100 dark:bg-purple-900/40 px-2 py-0.5 rounded">/api/v1/proxy/{formData.proxyPath || 'mon-service'}</code>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Section: Sécurité & Permissions */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-1 h-6 bg-yellow-600 rounded-full"></div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Sécurité & Permissions
                      </h3>
                    </div>

                    <div className="space-y-3">
                      {/* Service activé */}
                      <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-600 cursor-pointer hover:border-blue-500 transition-all">
                        <input
                          type="checkbox"
                          checked={formData.enabled}
                          onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <FiToggleRight className="w-5 h-5 text-blue-600" />
                            <span className="font-medium text-gray-900 dark:text-white">Service activé</span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Le service sera accessible immédiatement après création
                          </p>
                        </div>
                      </label>

                      {/* Authentification requise */}
                      <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-600 cursor-pointer hover:border-yellow-500 transition-all">
                        <input
                          type="checkbox"
                          checked={formData.requireAuth}
                          onChange={(e) => setFormData({ ...formData, requireAuth: e.target.checked })}
                          className="w-5 h-5 text-yellow-600 rounded focus:ring-2 focus:ring-yellow-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <FiAlertCircle className="w-5 h-5 text-yellow-600" />
                            <span className="font-medium text-gray-900 dark:text-white">Authentification requise</span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Les utilisateurs devront être connectés pour accéder au service
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                </div>

                {/* Footer avec actions */}
                <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      <span className="text-red-500">*</span> Champs obligatoires
                    </p>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-medium shadow-lg shadow-blue-500/30 flex items-center gap-2"
                      >
                        {editingService ? (
                          <>
                            <FiCheck className="w-5 h-5" />
                            Mettre à jour
                          </>
                        ) : (
                          <>
                            <FiPlus className="w-5 h-5" />
                            Ajouter le service
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
      </div>
    </>
  );
}
