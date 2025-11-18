/**
 * Page Services Connectés - Gestion des services liés au compte
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export default function ConnectedServices() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [allServices, setAllServices] = useState([]);
  const [connectedServices, setConnectedServices] = useState([]);
  const [disconnecting, setDisconnecting] = useState(null);

  // Charger tous les services et les services connectés
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Récupérer tous les services disponibles
        const servicesResponse = await fetch('http://localhost:7000/api/v1/system/services/public');
        const servicesData = await servicesResponse.json();
        
        // Récupérer les sessions SSO actives
        const sessionsResponse = await api.get('/sso/my-sessions');
        
        if (servicesData.success) {
          setAllServices(servicesData.data.services);
        }
        
        if (sessionsResponse.data.success) {
          setConnectedServices(sessionsResponse.data.data.sessions);
        }
        
      } catch (error) {
        console.error('Erreur chargement données:', error);
        toast.error('Erreur lors du chargement des services');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Déconnecter un service
  const handleDisconnect = async (sessionId, serviceName) => {
    if (!confirm(`Êtes-vous sûr de vouloir déconnecter ${serviceName} ?`)) {
      return;
    }

    try {
      setDisconnecting(sessionId);
      await api.delete(`/sso/revoke/${sessionId}`);
      
      // Mettre à jour la liste
      setConnectedServices(prev => prev.filter(s => s.sessionId !== sessionId));
      toast.success(`${serviceName} déconnecté avec succès`);
      
    } catch (error) {
      console.error('Erreur déconnexion:', error);
      toast.error('Erreur lors de la déconnexion');
    } finally {
      setDisconnecting(null);
    }
  };

  // Déconnecter tous les services
  const handleDisconnectAll = async () => {
    if (!confirm('Êtes-vous sûr de vouloir déconnecter tous les services ?')) {
      return;
    }

    try {
      await api.delete('/sso/revoke-all');
      setConnectedServices([]);
      toast.success('Tous les services ont été déconnectés');
    } catch (error) {
      console.error('Erreur déconnexion globale:', error);
      toast.error('Erreur lors de la déconnexion');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
            <p className="text-gray-600 mt-4">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        
        {/* En-tête */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Services connectés
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Gérez les services liés à votre compte Sorikama
          </p>
        </div>

        {/* Services connectés */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              Services connectés ({connectedServices.length})
            </h2>
            {connectedServices.length > 0 && (
              <button
                onClick={handleDisconnectAll}
                className="text-sm font-semibold text-red-600 hover:text-red-700 transition-colors"
              >
                Tout déconnecter
              </button>
            )}
          </div>

          {connectedServices.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 sm:p-16 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <p className="text-gray-900 font-semibold mb-2">Aucun service connecté</p>
              <p className="text-sm text-gray-500">Connectez-vous à un service pour qu'il apparaisse ici</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="divide-y divide-gray-100">
                {connectedServices.map((service) => (
                  <div key={service.sessionId} className="p-4 sm:p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm sm:text-base font-semibold text-gray-900 truncate mb-0.5">
                            {service.serviceName}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600 truncate mb-1">
                            {service.serviceDescription || 'Service externe'}
                          </p>
                          <p className="text-xs text-gray-500">
                            Connecté le {new Date(service.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDisconnect(service.sessionId, service.serviceName)}
                        disabled={disconnecting === service.sessionId}
                        className="ml-4 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {disconnecting === service.sessionId ? 'Déconnexion...' : 'Déconnecter'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tous les services disponibles */}
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
            Tous les services disponibles ({allServices.length})
          </h2>

          {allServices.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 sm:p-16 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-gray-900 font-semibold mb-2">Aucun service disponible</p>
              <p className="text-sm text-gray-500">Les services apparaîtront ici une fois configurés</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {allServices.map((service) => {
                const isConnected = connectedServices.some(cs => cs.serviceId === service.slug);
                
                return (
                  <div key={service.slug} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isConnected 
                            ? 'bg-gradient-to-br from-green-100 to-green-200' 
                            : 'bg-gradient-to-br from-gray-100 to-gray-200'
                        }`}>
                          <svg className={`w-5 h-5 ${
                            isConnected ? 'text-green-700' : 'text-gray-700'
                          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-gray-900">
                            {service.name}
                          </h3>
                          {isConnected && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Connecté
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {service.description || 'Service externe'}
                    </p>
                    <a
                      href={service.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      Accéder au service
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
