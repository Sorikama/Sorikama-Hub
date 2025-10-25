/**
 * EXEMPLE DE COMPOSANT CALLBACK POUR MASEBUY
 * 
 * Page de callback SSO Sorikama avec échange de code sécurisé
 * À copier dans votre projet MaseBuy: src/pages/auth/SorikamaCallback.tsx
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { sorikamaConfig, sorikamaApi } from '../../config/sorikama';

/**
 * Page de callback SSO Sorikama
 * Reçoit un CODE d'autorisation et l'échange contre un token JWT
 * 
 * Format attendu dans l'URL:
 * - code: Code d'autorisation temporaire (5 min)
 * - error: Code d'erreur si refus (access_denied)
 * - error_description: Description de l'erreur
 */
export const SorikamaCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Connexion en cours...');
  const [details, setDetails] = useState<string>('');

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      // ============================================
      // 1. VÉRIFIER LES ERREURS
      // ============================================
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (error) {
        console.error('❌ [Sorikama] Erreur d\'autorisation:', error);
        setStatus('error');
        setMessage('Autorisation refusée');
        setDetails(
          errorDescription 
            ? decodeURIComponent(errorDescription) 
            : 'Vous devez autoriser MaseBuy pour continuer.'
        );

        // Rediriger vers login après 3 secondes
        setTimeout(() => {
          navigate('/auth/login');
        }, 3000);
        return;
      }

      // ============================================
      // 2. RÉCUPÉRER LE CODE D'AUTORISATION
      // ============================================
      const authCode = searchParams.get('code');

      console.log('📥 [Sorikama] Callback reçu');

      if (!authCode) {
        console.error('❌ [Sorikama] Code d\'autorisation manquant');
        setStatus('error');
        setMessage('Données d\'authentification manquantes');
        setDetails('Le code d\'autorisation est absent.');
        
        setTimeout(() => {
          navigate('/auth/login');
        }, 3000);
        return;
      }

      console.log('✅ [Sorikama] Code d\'autorisation reçu');

      // ============================================
      // 3. ÉCHANGER LE CODE CONTRE UN TOKEN
      // ============================================
      // SÉCURITÉ: L'échange se fait via NOTRE backend
      // Le token ne transite jamais par l'URL du navigateur
      
      console.log('🔄 [Sorikama] Échange du code via notre backend...');

      const response = await sorikamaApi.post('/api/auth/callback', {
        code: authCode
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Échec de l\'échange du code');
      }

      const { token, user, service } = response.data;

      if (!token || !user) {
        throw new Error('Réponse invalide du serveur');
      }

      console.log('✅ [Sorikama] Token reçu');
      console.log('👤 [Sorikama] Utilisateur:', user.email);

      // ============================================
      // 4. VALIDER LE TOKEN (optionnel, pour info)
      // ============================================
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          
          // Vérifier que le token est pour MaseBuy
          if (payload.service !== sorikamaConfig.serviceSlug) {
            console.error('❌ [Sorikama] Token non valide pour ce service');
            throw new Error('Token non valide pour ce service');
          }

          // Vérifier l'expiration
          const now = Math.floor(Date.now() / 1000);
          if (payload.exp && payload.exp < now) {
            console.error('❌ [Sorikama] Token expiré');
            throw new Error('Token expiré');
          }

          console.log('✅ [Sorikama] Token valide');
          console.log(`⏰ [Sorikama] Expire le: ${new Date(payload.exp * 1000).toLocaleString()}`);
        }
      } catch (validationError) {
        console.error('⚠️ [Sorikama] Erreur validation token:', validationError);
        // On continue quand même, la validation côté serveur est plus importante
      }

      // ============================================
      // 5. SAUVEGARDER DANS LOCALSTORAGE
      // ============================================
      console.log('💾 [Sorikama] Sauvegarde des données...');

      // Sauvegarder le token JWT
      localStorage.setItem(sorikamaConfig.storageKeys.TOKEN, token);

      // Sauvegarder les infos utilisateur
      const masebuyUser = {
        id: user.id,
        email: user.email,
        name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        roles: user.roles || [user.role],
        created_at: user.created_at || new Date().toISOString()
      };

      localStorage.setItem(
        sorikamaConfig.storageKeys.USER, 
        JSON.stringify(masebuyUser)
      );

      // Nettoyer le cache des boutiques pour forcer un refresh
      localStorage.removeItem(sorikamaConfig.storageKeys.STORES);

      // Nettoyer l'URL (enlever les paramètres sensibles)
      window.history.replaceState({}, document.title, '/auth/callback');

      // ============================================
      // 6. SUCCÈS
      // ============================================
      setStatus('success');
      setMessage('Connexion réussie !');
      setDetails(`Bienvenue ${masebuyUser.name} !`);

      console.log('✅ [Sorikama] Authentification réussie');

      // Rediriger vers le dashboard après 1.5 secondes
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);

    } catch (err: any) {
      console.error('❌ [Sorikama] Erreur inattendue:', err);
      
      setStatus('error');
      setMessage('Erreur lors de la connexion');
      setDetails(
        err.response?.data?.message || 
        err.message || 
        'Une erreur inattendue s\'est produite.'
      );
    }
  };

  // ============================================
  // RENDU
  // ============================================
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 space-y-6">
          
          {/* Loading */}
          {status === 'loading' && (
            <div className="text-center space-y-4">
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {message}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Vérification de votre identité...
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}

          {/* Success */}
          {status === 'success' && (
            <div className="text-center space-y-4">
              <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-4 w-20 h-20 mx-auto flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {message}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {details}
              </p>
              <div className="pt-4">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Redirection vers votre dashboard...</span>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {status === 'error' && (
            <div className="text-center space-y-4">
              <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-4 w-20 h-20 mx-auto flex items-center justify-center">
                <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {message}
              </h2>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-300 text-left">
                    {details}
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/auth/login')}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Retour à la connexion
              </button>
            </div>
          )}
        </div>

        {/* Debug info en dev */}
        {import.meta.env.DEV && (
          <div className="mt-4 p-4 bg-gray-800 rounded-lg text-xs text-gray-300 font-mono">
            <div className="font-bold mb-2">🔍 Debug Info:</div>
            <div>Status: {status}</div>
            <div>Code: {searchParams.get('code') ? '✓' : '✗'}</div>
            <div>Error: {searchParams.get('error') || 'none'}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SorikamaCallback;
