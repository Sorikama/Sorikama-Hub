/**
 * Page d'administration des services externes
 * Permet de créer, modifier et supprimer des services SSO
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function ServicesAdmin() {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    url: '',
    frontendUrl: '',
    icon: '🔗',
    color: 'blue',
    ssoEnabled: true,
    authEndpoint: '/auth/sorikama',
    healthCheckUrl: '/health',
    redirectUrls: '',
    scopes: 'profile email'
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/services');
      setServices(response.data.data || []);
    } catch (error) {
      console.error('Erreur chargement services:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const serviceData = {
        ...formData,
        redirectUrls: formData.redirectUrls.split(',').map(url => url.trim()).filter(Boolean),
        scopes: formData.scopes.split(' ').filter(Boolean)
      };

      if (editingService) {
        await api.put(`/services/${editingService.id}`, serviceData);
      } else {
        await api.post('/services', serviceData);
      }

      setShowModal(false);
      resetForm();
      loadServices();
    } catch (error) {
      console.error('Erreur sauvegarde service:', error);
      alert(error.response?.data?.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      id: service.id,
      name: service.name,
      description: service.description || '',
      url: service.url,
      frontendUrl: service.frontendUrl || '',
      icon: service.icon || '🔗',
      color: service.color || 'blue',
      ssoEnabled: service.ssoEnabled !== false,
      authEndpoint: service.authEndpoint || '/auth/sorikama',
      healthCheckUrl: service.healthCheckUrl || '/health',
      redirectUrls: (service.redirectUrls || []).join(', '),
      scopes: (service.scopes || []).join(' ')
    });
    setShowModal(true);
  };

  const handleDelete = async (serviceId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) return;

    try {
      await api.delete(`/services/${serviceId}`);
      loadServices();
    } catch (error) {
      console.error('Erreur suppression service:', error);
      alert(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const resetForm = () => {
    setEditingService(null);
    setFormData({
      id: '',
      name: '',
      description: '',
      url: '',
      frontendUrl: '',
      icon: '🔗',
      color: 'blue',
      ssoEnabled: true,
      authEndpoint: '/auth/sorikama',
      healthCheckUrl: '/health',
      redirectUrls: '',
      scopes: 'profile email'
    });
  };

  const colorOptions = [
    { value: 'blue', label: 'Bleu', class: 'from-blue-500 to-cyan-500' },
    { value: 'purple', label: 'Violet', class: 'from-purple-500 to-pink-500' },
    { value: 'green', label: 'Vert', class: 'from-green-500 to-emerald-500' },
    { value: 'red', label: 'Rouge', class: 'from-red-500 to-rose-500' },
    { value: 'yellow', label: 'Jaune', class: 'from-yellow-500 to-orange-500' },
    { value: 'indigo', label: 'Indigo', class: 'from-indigo-500 to-blue-500' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Services Externes</h1>
            <p className="text-gray-600 mt-2">Gérez les services SSO connectés à Sorikama Hub</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nouveau Service
          </button>
        </div>

        {/* Liste des services */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : services.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">🔗</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun service configuré</h3>
            <p className="text-gray-600 mb-6">Commencez par ajouter votre premier service externe</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              Ajouter un service
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div key={service.id} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
                <div className={`bg-gradient-to-r ${colorOptions.find(c => c.value === service.color)?.class || 'from-blue-500 to-cyan-500'} p-6 text-center`}>
                  <div className="text-5xl mb-3">{service.icon}</div>
                  <h3 className="text-xl font-bold text-white">{service.name}</h3>
                </div>
                
                <div className="p-6">
                  <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                  
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <span className="font-semibold">Backend:</span>
                      <span className="text-xs truncate">{service.url}</span>
                    </div>
                    {service.frontendUrl && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <span className="font-semibold">Frontend:</span>
                        <span className="text-xs truncate">{service.frontendUrl}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        service.status === 'active' ? 'bg-green-100 text-green-700' :
                        service.status === 'maintenance' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {service.status === 'active' ? '✓ Actif' :
                         service.status === 'maintenance' ? '⚠ Maintenance' :
                         '✗ Inactif'}
                      </span>
                      {service.ssoEnabled && (
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                          🔐 SSO
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(service)}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition font-medium text-sm"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition font-medium text-sm"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de création/édition */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingService ? 'Modifier le service' : 'Nouveau service'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ID du service *
                    </label>
                    <input
                      type="text"
                      value={formData.id}
                      onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                      disabled={!!editingService}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      placeholder="mon-service"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nom du service *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Mon Service"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="2"
                    placeholder="Description du service"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    URL Backend (API) *
                  </label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://api.mon-service.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    URL Frontend (optionnel)
                  </label>
                  <input
                    type="url"
                    value={formData.frontendUrl}
                    onChange={(e) => setFormData({ ...formData, frontendUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://mon-service.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Icône (emoji)
                    </label>
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-2xl text-center"
                      placeholder="🔗"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Couleur
                    </label>
                    <select
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {colorOptions.map(color => (
                        <option key={color.value} value={color.value}>{color.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Endpoint d'authentification
                  </label>
                  <input
                    type="text"
                    value={formData.authEndpoint}
                    onChange={(e) => setFormData({ ...formData, authEndpoint: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="/auth/sorikama"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    URLs de redirection (séparées par des virgules)
                  </label>
                  <input
                    type="text"
                    value={formData.redirectUrls}
                    onChange={(e) => setFormData({ ...formData, redirectUrls: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://mon-service.com/callback, https://localhost:3000/callback"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Scopes (séparés par des espaces)
                  </label>
                  <input
                    type="text"
                    value={formData.scopes}
                    onChange={(e) => setFormData({ ...formData, scopes: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="profile email services"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="ssoEnabled"
                    checked={formData.ssoEnabled}
                    onChange={(e) => setFormData({ ...formData, ssoEnabled: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="ssoEnabled" className="text-sm font-semibold text-gray-700">
                    Activer le SSO
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition"
                  >
                    {editingService ? 'Mettre à jour' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
