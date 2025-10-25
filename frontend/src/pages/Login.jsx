/**
 * Page de connexion - Design moderne avec icônes
 * Gère 2 scénarios :
 * 1. Connexion SSO (avec service externe)
 * 2. Connexion normale (sans service externe)
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login, isLoading, error, user } = useAuth();

  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);

  // ============================================
  // RÉCUPÉRER LES PARAMÈTRES SSO
  // ============================================
  const redirectUrl = searchParams.get('redirect');
  const serviceSlug = searchParams.get('service');
  const isSSO = redirectUrl && serviceSlug;

  // ============================================
  // SI DÉJÀ CONNECTÉ, REDIRIGER AUTOMATIQUEMENT
  // ============================================
  useEffect(() => {
    if (!user || hasRedirected) return; // Pas connecté ou déjà redirigé

    console.log('👤 Utilisateur déjà connecté:', user.email);
    setHasRedirected(true);

    // Scénario 1 : SSO - Rediriger vers /authorize
    if (isSSO) {
      console.log('🔐 SSO détecté - Redirection vers page d\'autorisation');
      const authorizeUrl = `/authorize?redirect=${encodeURIComponent(redirectUrl)}&service=${serviceSlug}`;
      navigate(authorizeUrl, { replace: true });
      return;
    }

    // Scénario 2 : Connexion normale - Rediriger selon rôle
    if (user.role === 'admin') {
      console.log('👑 Admin détecté - Redirection vers espace admin');
      navigate('/admin/dashboard', { replace: true });
    } else {
      console.log('👤 User détecté - Redirection vers dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [user, isSSO, redirectUrl, serviceSlug, navigate, hasRedirected]);

  const handleInputChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await login(credentials);
      const userData = response?.data?.user;

      console.log('✅ Connexion réussie', {
        email: userData?.email,
        role: userData?.role,
        isSSO
      });

      setHasRedirected(true); // Marquer qu'on va rediriger

      // ============================================
      // SCÉNARIO 1 : CONNEXION SSO (avec service externe)
      // ============================================
      if (isSSO) {
        console.log('🔐 SSO - Redirection vers page d\'autorisation');
        const authorizeUrl = `/authorize?redirect=${encodeURIComponent(redirectUrl)}&service=${serviceSlug}`;
        navigate(authorizeUrl, { replace: true });
        return;
      }

      // ============================================
      // SCÉNARIO 2 : CONNEXION NORMALE (sans service externe)
      // ============================================

      // Vérifier s'il y a un state.from (page protégée)
      if (location.state?.from) {
        const from = typeof location.state.from === 'string'
          ? location.state.from
          : location.state.from.pathname + (location.state.from.search || '');
        console.log('🔄 Redirection vers page protégée:', from);
        navigate(from, { replace: true });
        return;
      }

      // Rediriger selon le rôle de l'utilisateur
      if (userData?.role === 'admin') {
        console.log('👑 Admin - Redirection vers espace admin');
        navigate('/admin/dashboard', { replace: true });
      } else {
        console.log('👤 User - Redirection vers dashboard');
        navigate('/dashboard', { replace: true });
      }

    } catch (error) {
      console.error('❌ Erreur connexion:', error);
      setHasRedirected(false); // Réinitialiser en cas d'erreur
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-8 sm:py-12 px-4">
      <div className="w-full max-w-md">

        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">
            {isSSO ? 'Connexion SSO' : 'Bon retour !'}
          </h1>
          <p className="text-gray-600">
            {isSSO
              ? `Connectez-vous pour accéder à ${serviceSlug}`
              : 'Connectez-vous à votre compte Sorikama'
            }
          </p>
        </div>

        {/* Notice SSO */}
        {isSSO && (
          <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 text-blue-700 px-4 py-3 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium">Connexion via service externe</p>
                <p className="text-xs mt-1">
                  Vous serez redirigé vers <strong>{serviceSlug}</strong> après autorisation
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Formulaire */}
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-gray-100">

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg animate-slide-in-up">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={credentials.email}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:ring-2 focus:ring-gray-100 transition-all duration-200 outline-none"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Mot de passe
                </label>
                <a href="#" className="text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors">
                  Mot de passe oublié ?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={credentials.password}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:ring-2 focus:ring-gray-100 transition-all duration-200 outline-none"
                  placeholder="Votre mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Se souvenir de moi */}
            <div className="flex items-center">
              <input
                id="remember"
                name="rememberMe"
                type="checkbox"
                checked={credentials.rememberMe}
                onChange={(e) => setCredentials({ ...credentials, rememberMe: e.target.checked })}
                className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900 focus:ring-2"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                Se souvenir de moi (30 jours)
              </label>
            </div>

            {/* Bouton Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connexion en cours...
                </>
              ) : (
                <>
                  Se connecter
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Séparateur */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Ou</span>
            </div>
          </div>

          {/* Lien inscription */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Vous n'avez pas de compte ?{' '}
              <Link to="/signup" className="font-semibold text-gray-900 hover:underline">
                Créer un compte
              </Link>
            </p>
          </div>
        </div>

        {/* Info sécurité */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Connexion sécurisée avec chiffrement SSL
          </p>
        </div>
      </div>
    </div>
  );
}
