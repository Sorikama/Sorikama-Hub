import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authUtils } from '../services/api';
import { getServiceBySlug, authorizeService, getCurrentUser } from '../services/oauthService';

/**
 * Page d'autorisation OAuth - Design moderne
 * Affichée après connexion pour demander permission d'accès au service externe
 */
function Authorize() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [service, setService] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [authorizing, setAuthorizing] = useState(false);

  // Récupérer les paramètres de l'URL
  const redirectUrl = searchParams.get('redirect');
  const serviceSlug = searchParams.get('service');

  useEffect(() => {
    // Vérifier que les paramètres sont présents
    if (!redirectUrl || !serviceSlug) {
      setError('Paramètres manquants');
      setLoading(false);
      return;
    }

    loadServiceInfo();
  }, [redirectUrl, serviceSlug]);

  const loadServiceInfo = async () => {
    try {
      // Vérifier l'authentification avec authUtils
      if (!authUtils.isAuthenticated()) {
        console.error('❌ Pas de token - ProtectedRoute aurait dû rediriger');
        setError('Session expirée');
        setLoading(false);
        return;
      }

      // Charger les infos du service et de l'utilisateur en parallèle
      const [serviceData, userData] = await Promise.all([
        getServiceBySlug(serviceSlug),
        getCurrentUser()
      ]);

      setService(serviceData);
      setUser(userData);
      setLoading(false);

    } catch (err) {
      console.error('❌ Erreur chargement:', err);
      setError(err.response?.data?.message || 'Service introuvable ou non autorisé');
      setLoading(false);
    }
  };

  const handleAuthorize = async () => {
    setAuthorizing(true);

    try {
      // Appeler le service d'autorisation (retourne maintenant un CODE au lieu d'un token)
      const response = await authorizeService(serviceSlug, redirectUrl);
      
      // Le backend retourne maintenant un code temporaire
      const { code, expiresIn } = response;

      if (!code) {
        throw new Error('Code d\'autorisation non reçu');
      }

      console.log('✅ Code d\'autorisation reçu (expire dans', expiresIn, 'secondes)');

      // Construire l'URL de callback avec le CODE (pas le token!)
      const callbackUrl = new URL(redirectUrl);
      callbackUrl.searchParams.set('code', code);

      console.log('✅ Redirection vers:', callbackUrl.href);

      // Rediriger vers le service externe
      window.location.href = callbackUrl.href;

    } catch (err) {
      console.error('❌ Erreur autorisation:', err);
      setError(err.response?.data?.message || 'Erreur lors de l\'autorisation. Veuillez réessayer.');
      setAuthorizing(false);
    }
  };

  const handleDeny = () => {
    // Rediriger vers le service avec une erreur
    const callbackUrl = new URL(redirectUrl);
    callbackUrl.searchParams.set('error', 'access_denied');
    callbackUrl.searchParams.set('error_description', 'L\'utilisateur a refusé l\'autorisation');

    window.location.href = callbackUrl.href;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-2xl mb-4 animate-pulse">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-gray-600 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-300"
            >
              Retour au tableau de bord
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-lg">

        {/* Card principale */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">

          {/* Header avec logo Sorikama */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-8 py-6">
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white">Sorikama</h1>
            </div>
          </div>

          {/* Contenu */}
          <div className="px-8 py-6">

            {/* Profil utilisateur */}
            <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 font-medium">Connecté en tant que</p>
                <p className="text-base font-bold text-gray-900">{user?.firstName} {user?.lastName}</p>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
            </div>

            {/* Demande d'autorisation */}
            <div className="py-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl mb-3">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Autorisation requise</h2>
                <p className="text-gray-600">
                  <span className="font-semibold text-gray-900">{service?.name}</span> souhaite accéder à votre compte Sorikama
                </p>
              </div>

              {/* Permissions */}
              <div className="bg-gray-50 rounded-2xl p-5 mb-5">
                <p className="text-sm font-semibold text-gray-700 mb-3">Cette application pourra :</p>
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-700">Lire vos informations de profil (nom, email)</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-700">Utiliser votre identité pour les requêtes API</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-700">Accéder aux services autorisés</p>
                  </div>
                </div>
              </div>

              {/* Info service */}
              <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">Vous serez redirigé vers</p>
                    <p className="text-sm text-blue-700 font-mono break-all">{service?.frontendUrl}</p>
                  </div>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-3">
                <button
                  onClick={handleDeny}
                  disabled={authorizing}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Refuser
                </button>
                <button
                  onClick={handleAuthorize}
                  disabled={authorizing}
                  className="flex-1 bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {authorizing ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Autorisation...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Autoriser
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Connexion sécurisée • Vous pouvez révoquer cet accès à tout moment</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Authorize;
