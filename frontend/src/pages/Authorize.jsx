/**
 * Page d'autorisation SSO - Connexion d'applications tierces
 * Design moderne et stylé
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function Authorize() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Récupérer les paramètres de l'URL
  const serviceId = searchParams.get('service_id') || searchParams.get('client_id');
  const redirectUrl = searchParams.get('redirect_url') || searchParams.get('redirect_uri');
  const scope = searchParams.get('scope') || 'profile email';

  // Informations de l'application qui demande l'accès
  const [appInfo, setAppInfo] = useState({
    name: 'Application Tierce',
    logo: '🔗',
    description: 'Cette application souhaite accéder à votre compte Sorikama',
    website: 'https://example.com',
    color: 'from-blue-500 to-purple-500'
  });

  useEffect(() => {
    console.log('🔍 Authorize - Paramètres reçus:', {
      serviceId,
      redirectUrl,
      scope,
      isAuthenticated,
      allParams: searchParams.toString()
    });

    // Rediriger vers login si non authentifié
    if (!isAuthenticated) {
      console.log('🔒 Non authentifié, redirection vers login avec paramètres dans l\'URL');

      // Construire l'URL de login avec le redirect en paramètre
      const fullAuthorizeUrl = window.location.pathname + window.location.search;
      const loginUrl = `/login?redirect=${encodeURIComponent(fullAuthorizeUrl)}`;

      console.log('� Redisrection vers:', loginUrl);
      navigate(loginUrl);
      return;
    }

    // Vérifier que les paramètres requis sont présents
    if (!serviceId) {
      console.error('❌ service_id manquant');
      setError('Paramètre service_id manquant');
      return;
    }

    console.log('✅ Utilisateur authentifié avec service_id:', serviceId);

    // Récupérer le nom de l'app depuis les paramètres URL (pour les apps tierces)
    const appName = searchParams.get('app_name');
    const appLogo = searchParams.get('app_logo');
    const appDescription = searchParams.get('app_description');
    const appWebsite = searchParams.get('app_website');

    // Informations des services Sorikama prédéfinis
    const services = {
      'soristore': {
        name: 'SoriStore',
        logo: '🛍️',
        description: 'Marketplace e-commerce de l\'écosystème Sorikama',
        website: 'https://soristore.sorikama.com',
        color: 'from-blue-500 to-cyan-500'
      },
      'soripay': {
        name: 'SoriPay',
        logo: '💳',
        description: 'Solution de paiement sécurisée et rapide',
        website: 'https://soripay.sorikama.com',
        color: 'from-purple-500 to-pink-500'
      },
      'soriwallet': {
        name: 'SoriWallet',
        logo: '💰',
        description: 'Portefeuille numérique multi-devises',
        website: 'https://soriwallet.sorikama.com',
        color: 'from-pink-500 to-rose-500'
      },
      'sorilearn': {
        name: 'SoriLearn',
        logo: '📚',
        description: 'Plateforme d\'apprentissage en ligne',
        website: 'https://sorilearn.sorikama.com',
        color: 'from-yellow-500 to-orange-500'
      },
      'sorihealth': {
        name: 'SoriHealth',
        logo: '🏥',
        description: 'Gestion de santé et bien-être',
        website: 'https://sorihealth.sorikama.com',
        color: 'from-green-500 to-emerald-500'
      },
      'soriaccess': {
        name: 'SoriAccess',
        logo: '♿',
        description: 'Solutions d\'accessibilité inclusives',
        website: 'https://soriaccess.sorikama.com',
        color: 'from-indigo-500 to-blue-500'
      }
    };

    const serviceKey = serviceId.toLowerCase().replace(/[_-]/g, '');

    // Si c'est un service Sorikama connu, utiliser ses infos
    if (services[serviceKey]) {
      setAppInfo(services[serviceKey]);
    }
    // Sinon, utiliser les infos fournies dans l'URL (application tierce)
    else if (appName) {
      setAppInfo({
        name: appName,
        logo: appLogo || '🔗',
        description: appDescription || 'Cette application souhaite accéder à votre compte Sorikama',
        website: appWebsite || 'https://example.com',
        color: 'from-blue-500 to-purple-500'
      });
    }
    // Sinon, utiliser le service_id comme nom
    else {
      setAppInfo({
        name: serviceId,
        logo: '🔗',
        description: 'Cette application souhaite accéder à votre compte Sorikama',
        website: 'https://example.com',
        color: 'from-blue-500 to-purple-500'
      });
    }
  }, [isAuthenticated, navigate, searchParams, serviceId]);

  // Permissions demandées
  const requestedScopes = scope.split(' ').map(s => {
    const scopeInfo = {
      'profile': {
        icon: '👤',
        title: 'Informations de profil',
        description: 'Nom, prénom et identifiant'
      },
      'email': {
        icon: '📧',
        title: 'Adresse email',
        description: 'Votre adresse email principale'
      },
      'services': {
        icon: '🔗',
        title: 'Services connectés',
        description: 'Liste de vos services Sorikama actifs'
      },
      'transactions': {
        icon: '💰',
        title: 'Historique des transactions',
        description: 'Accès à vos transactions et paiements'
      },
      'apikey': {
        icon: '🔑',
        title: 'Clé API',
        description: 'Votre clé API personnelle pour les requêtes'
      }
    };

    return scopeInfo[s] || {
      icon: '🔒',
      title: s,
      description: 'Permission personnalisée'
    };
  });

  const handleAuthorize = async () => {
    setIsLoading(true);
    setError('');

    try {
      console.log('✅ Autorisation accordée pour:', serviceId);

      // Construire l'URL de redirection SSO vers le backend
      // On utilise une requête GET avec axios pour envoyer les headers d'authentification
      const params = new URLSearchParams();
      if (redirectUrl) {
        params.append('redirect_url', redirectUrl);
      }

      const ssoAuthUrl = `/sso/auth/${serviceId}${params.toString() ? '?' + params.toString() : ''}`;

      console.log('🚀 Appel API SSO:', ssoAuthUrl);

      // Faire une requête avec axios qui inclut automatiquement les headers JWT
      // Le backend va rediriger, donc on suit la redirection
      const response = await fetch(
        `${import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:7000/api/v1'}${ssoAuthUrl}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('sorikama_access_token')}`,
            'X-API-Key': localStorage.getItem('sorikama_user_api_key')
          },
          redirect: 'follow'
        }
      );

      // Si la réponse est une redirection, suivre l'URL
      if (response.redirected) {
        console.log('🔄 Redirection vers:', response.url);
        window.location.href = response.url;
      } else {
        // Sinon, lire la réponse
        const data = await response.json();
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
        } else {
          throw new Error('Pas d\'URL de redirection reçue');
        }
      }

    } catch (error) {
      console.error('❌ Erreur autorisation:', error);
      setError('Une erreur est survenue lors de l\'autorisation');
      setIsLoading(false);
    }
  };

  const handleDeny = () => {
    console.log('❌ Autorisation refusée');
    // Rediriger vers le dashboard avec un message
    navigate('/dashboard?auth_denied=true');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirection vers la connexion...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-12 px-4 flex items-center justify-center">
      <div className="max-w-lg w-full">

        {/* Carte principale */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden transform hover:scale-[1.02] transition-transform duration-300">

          {/* En-tête avec logo de l'app */}
          <div className={`bg-gradient-to-r ${appInfo.color} p-10 text-center relative overflow-hidden`}>
            {/* Décoration animée */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -mr-20 -mt-20 opacity-10 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full -ml-16 -mb-16 opacity-10 animate-pulse" style={{ animationDelay: '1s' }}></div>

            <div className="relative">
              <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl transform hover:rotate-6 transition-transform">
                <span className="text-5xl">{appInfo.logo}</span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {appInfo.name}
              </h1>
              <p className="text-white/90 text-sm font-medium">
                souhaite se connecter à votre compte
              </p>
            </div>
          </div>

          {/* Informations utilisateur */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 bg-gradient-to-br ${appInfo.color} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                <span className="text-xl font-bold text-white">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Permissions demandées */}
          <div className="p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-2xl">🔐</span>
              Autorisations demandées
            </h2>

            <div className="space-y-3 mb-6">
              {requestedScopes.map((scope, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-200 hover:shadow-md transition-shadow">
                  <div className={`w-12 h-12 bg-gradient-to-br ${appInfo.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-md`}>
                    <span className="text-xl">{scope.icon}</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{scope.title}</p>
                    <p className="text-sm text-gray-600">{scope.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Informations de l'app */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-blue-900 font-bold mb-1">
                    À propos de {appInfo.name}
                  </p>
                  <p className="text-sm text-blue-800 mb-2">
                    {appInfo.description}
                  </p>
                  <a href={appInfo.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline font-medium">
                    {appInfo.website} →
                  </a>
                </div>
              </div>
            </div>

            {/* Avertissement */}
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-5 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <p className="text-sm text-yellow-900 font-medium">
                  En autorisant cette application, vous lui donnez accès aux informations listées ci-dessus. Vous pouvez révoquer cet accès à tout moment depuis vos paramètres.
                </p>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-4">
              <button
                onClick={handleDeny}
                disabled={isLoading}
                className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-2xl font-bold hover:bg-gray-300 transition-all disabled:opacity-50 hover:shadow-lg"
              >
                Refuser
              </button>
              <button
                onClick={handleAuthorize}
                disabled={isLoading}
                className={`flex-1 bg-gradient-to-r ${appInfo.color} text-white py-4 rounded-2xl font-bold hover:shadow-2xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Autorisation...
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Autoriser
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Lien retour */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-600 hover:text-gray-900 text-sm font-semibold flex items-center gap-2 mx-auto hover:gap-3 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour au dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
