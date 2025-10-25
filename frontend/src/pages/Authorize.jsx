/**
 * Page d'autorisation SSO - Version compacte et dynamique
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

export default function Authorize() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [authorizing, setAuthorizing] = useState(false);
  const [error, setError] = useState('');
  const [serviceInfo, setServiceInfo] = useState(null);
  const [alreadyAuthorized, setAlreadyAuthorized] = useState(false);

  // Paramètres URL
  const serviceId = searchParams.get('service_id');
  const redirectUrl = searchParams.get('redirect_url');
  const scope = searchParams.get('scope') || 'profile email';

  useEffect(() => {
    // Rediriger vers login si non authentifié
    if (!isAuthenticated) {
      const fullUrl = window.location.pathname + window.location.search;
      navigate(`/login?redirect=${encodeURIComponent(fullUrl)}`);
      return;
    }

    // Vérifier que service_id est présent
    if (!serviceId) {
      setError('Paramètre service_id manquant');
      setLoading(false);
      return;
    }

    // Charger les infos du service
    loadServiceInfo();
  }, [isAuthenticated, serviceId, navigate]);

  const loadServiceInfo = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/authorize/service/${serviceId}`);
      
      if (response.data.success) {
        setServiceInfo(response.data.service);
        setAlreadyAuthorized(response.data.alreadyAuthorized);
      }
    } catch (err) {
      console.error('Erreur chargement service:', err);
      if (err.response?.status === 404) {
        setError('Service non trouvé. Vérifiez que le service existe dans la configuration.');
      } else {
        setError('Erreur lors du chargement du service');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAuthorize = async () => {
    try {
      setAuthorizing(true);
      const response = await api.post(`/authorize/service/${serviceId}/authorize`, {
        scopes: scope.split(' '),
        redirectUrl
      });

      if (response.data.success) {
        // Rediriger vers le service avec le token
        window.location.href = response.data.redirectUrl;
      }
    } catch (err) {
      console.error('Erreur autorisation:', err);
      setError('Erreur lors de l\'autorisation');
      setAuthorizing(false);
    }
  };

  const handleDeny = () => {
    navigate('/dashboard?auth_denied=true');
  };

  // Permissions disponibles
  const scopeDetails = {
    'profile': { icon: '👤', title: 'Profil', desc: 'Nom, prénom' },
    'email': { icon: '📧', title: 'Email', desc: 'Adresse email' },
    'services': { icon: '🔗', title: 'Services', desc: 'Services connectés' },
  };

  const requestedScopes = scope.split(' ').map(s => scopeDetails[s] || { icon: '🔒', title: s, desc: 'Permission' });

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition"
          >
            Retour au dashboard
          </button>
        </div>
      </div>
    );
  }

  const colorMap = {
    'blue': 'from-blue-500 to-cyan-500',
    'purple': 'from-purple-500 to-pink-500',
    'green': 'from-green-500 to-emerald-500',
  };
  const serviceColor = colorMap[serviceInfo?.color] || 'from-blue-500 to-purple-500';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        
        {/* Carte compacte */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          
          {/* Header compact */}
          <div className={`bg-gradient-to-r ${serviceColor} p-6 text-center relative overflow-hidden`}>
            <div className="absolute inset-0 bg-white/10"></div>
            <div className="relative flex items-center justify-center gap-4">
              <div className="w-16 h-16 bg-white/95 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-3xl">{serviceInfo?.logo || '🔗'}</span>
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-black text-white">{serviceInfo?.name}</h1>
                <p className="text-white/90 text-sm font-medium">demande l'accès à votre compte</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            
            {/* User info compact */}
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl mb-6">
              <div className={`w-12 h-12 bg-gradient-to-br ${serviceColor} rounded-xl flex items-center justify-center shadow-lg`}>
                <span className="text-lg font-black text-white">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 truncate">{user?.firstName} {user?.lastName}</p>
                <p className="text-sm text-gray-600 truncate">{user?.email}</p>
              </div>
              {alreadyAuthorized && (
                <div className="flex items-center gap-1 text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded-full">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Déjà autorisé
                </div>
              )}
            </div>

            {/* Permissions compactes */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Autorisations demandées
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {requestedScopes.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-xl">{s.icon}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900">{s.title}</p>
                      <p className="text-xs text-gray-600 truncate">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Info service compact */}
            {serviceInfo?.description && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                <p className="text-xs text-blue-900 font-medium">{serviceInfo.description}</p>
                {serviceInfo.website && (
                  <a href={serviceInfo.website} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline font-bold mt-1 inline-block">
                    {serviceInfo.website} →
                  </a>
                )}
              </div>
            )}

            {/* Warning compact */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
              <p className="text-xs text-amber-900 font-medium">
                Vous pouvez révoquer cet accès à tout moment depuis vos paramètres.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleDeny}
                disabled={authorizing}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition disabled:opacity-50"
              >
                Refuser
              </button>
              <button
                onClick={handleAuthorize}
                disabled={authorizing}
                className={`flex-1 bg-gradient-to-r ${serviceColor} text-white py-3 rounded-xl font-bold hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2`}
              >
                {authorizing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Autorisation...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{alreadyAuthorized ? 'Renouveler' : 'Autoriser'}</span>
                  </>
                )}
              </button>
            </div>

            {/* SSL badge */}
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">Connexion sécurisée</span>
            </div>
          </div>
        </div>

        {/* Retour */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-bold px-4 py-2 rounded-lg hover:bg-white/50 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Retour</span>
          </button>
        </div>
      </div>
    </div>
  );
}
