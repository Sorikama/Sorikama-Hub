/**
 * Service API principal pour Sorikama Hub
 * 
 * Ce fichier gère toute la communication avec le backend :
 * - Configuration automatique des headers d'authentification
 * - Gestion automatique du refresh token
 * - Services d'authentification complets
 * - Utilitaires pour vérifier l'état d'authentification
 */

import axios from 'axios';
import { API_CONFIG, ENDPOINTS, PUBLIC_ROUTES, STORAGE_KEYS } from '../config/api.js';

/**
 * Instance Axios configurée pour l'API Gateway
 * Toutes les requêtes passent par cette instance
 */
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Flag pour indiquer qu'une déconnexion est en cours
let isLoggingOut = false;

/**
 * Intercepteur de requête - Ajoute automatiquement les headers d'authentification
 * 
 * Logique d'authentification à 2 niveaux :
 * 1. API Key OBLIGATOIRE pour toutes les requêtes
 * 2. JWT Token pour les routes protégées uniquement
 */
api.interceptors.request.use(
  (config) => {
    // === NIVEAU 1 : API KEY OBLIGATOIRE ===
    const userApiKey = localStorage.getItem(STORAGE_KEYS.USER_API_KEY);
    const systemApiKey = API_CONFIG.SYSTEM_API_KEY;
    const isPublicRoute = PUBLIC_ROUTES.some(route => config.url?.includes(route));

    // Pour les utilisateurs connectés : TOUJOURS utiliser leur API Key
    if (userApiKey && userApiKey !== 'null' && userApiKey !== 'undefined') {
      config.headers['X-API-Key'] = userApiKey;
      console.log('🔑 Utilisation de l\'API Key utilisateur');
    }
    // Pour les routes publiques (login, register, etc.) : utiliser l'API Key système
    else if (isPublicRoute) {
      config.headers['X-API-Key'] = systemApiKey;
      console.log('🔑 Utilisation de l\'API Key système (route publique)');
    }
    // Si pas d'API Key utilisateur et route protégée : erreur
    else {
      console.error('❌ Aucune API Key utilisateur disponible pour une route protégée');
      config.headers['X-API-Key'] = systemApiKey; // Fallback pour éviter l'erreur
    }

    // === NIVEAU 2 : JWT TOKEN (routes protégées seulement) ===
    if (!isPublicRoute) {
      const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (accessToken && accessToken !== 'null' && accessToken !== 'undefined') {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }

    // Log pour debug (masquer les clés sensibles)
    console.log(`📡 ${config.method?.toUpperCase()} ${config.url}`, {
      apiKey: config.headers['X-API-Key']?.substring(0, 10) + '...',
      hasJWT: !!config.headers.Authorization,
      isPublic: isPublicRoute
    });

    return config;
  },
  (error) => {
    console.error('❌ Erreur configuration requête:', error);
    return Promise.reject(error);
  }
);

/**
 * Intercepteur de réponse - Gestion automatique du refresh token
 * 
 * Si une requête retourne 401 (non autorisé), on tente automatiquement
 * de renouveler le token d'accès avec le refresh token
 */
api.interceptors.response.use(
  (response) => {
    // Requête réussie - retourner la réponse
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Ne pas tenter de refresh si c'est une requête de logout ou de refresh
    const isLogoutRequest = originalRequest.url?.includes('/auth/logout');
    const isRefreshRequest = originalRequest.url?.includes('/auth/refresh');

    // Si erreur 401 et qu'on n'a pas déjà tenté le refresh
    // ET que ce n'est pas une requête de logout ou refresh
    if (error.response?.status === 401 && !originalRequest._retry && !isLogoutRequest && !isRefreshRequest) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

      if (refreshToken) {
        try {
          console.log('🔄 Tentative de renouvellement du token...');

          // Appeler l'endpoint de refresh (avec API Key mais sans JWT)
          const response = await api.post(ENDPOINTS.AUTH.REFRESH, {
            refreshToken
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens;

          // Sauvegarder les nouveaux tokens
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);

          console.log('✅ Token renouvelé avec succès');

          // Retry la requête originale avec le nouveau token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);

        } catch (refreshError) {
          console.error('❌ Échec du renouvellement du token:', refreshError);

          // Refresh échoué - déconnecter l'utilisateur
          authUtils.clearStorage();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        console.warn('⚠️ Pas de refresh token disponible');
        authUtils.clearStorage();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Services d'authentification
 * Toutes les fonctions nécessaires pour gérer l'authentification utilisateur
 */
export const authService = {
  /**
   * ÉTAPE 1 : Demande d'inscription
   * Envoie les données utilisateur et reçoit un token de vérification
   * 
   * @param {Object} userData - Données utilisateur (firstName, lastName, email, password)
   * @returns {Promise} Réponse avec verificationToken
   */
  async register(userData) {
    try {
      console.log('📝 Demande d\'inscription pour:', userData.email);
      const response = await api.post(ENDPOINTS.AUTH.REGISTER, userData);
      console.log('✅ Code de vérification envoyé');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur inscription:', error.response?.data?.message);
      throw error;
    }
  },

  /**
   * ÉTAPE 2 : Validation du compte
   * Valide le code reçu par email et crée le compte définitif
   * 
   * @param {Object} verificationData - Token de vérification + code
   * @returns {Promise} Réponse avec user et tokens
   */
  async verify(verificationData) {
    try {
      console.log('🔍 Vérification du code...');
      const response = await api.post(ENDPOINTS.AUTH.VERIFY, verificationData);

      const { user, tokens } = response.data.data;

      // Sauvegarder toutes les données d'authentification
      authUtils.saveAuthData(user, tokens);

      console.log('✅ Compte créé et utilisateur connecté');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur vérification:', error.response?.data?.message);
      throw error;
    }
  },

  /**
   * Connexion utilisateur
   * Authentifie avec email/password et récupère les tokens
   * 
   * @param {Object} credentials - Email et mot de passe
   * @returns {Promise} Réponse avec user et tokens
   */
  async login(credentials) {
    try {
      console.log('🚪 Tentative de connexion pour:', credentials.email);
      const response = await api.post(ENDPOINTS.AUTH.LOGIN, credentials);

      const { user, tokens } = response.data.data;

      // Sauvegarder les données d'authentification
      authUtils.saveAuthData(user, tokens);

      console.log('✅ Connexion réussie');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur connexion:', error.response?.data?.message);
      throw error;
    }
  },

  /**
   * Déconnexion utilisateur
   * Invalide le refresh token côté serveur et nettoie le stockage local
   * Gère manuellement le refresh token si nécessaire (car l'intercepteur ignore les requêtes de logout)
   */
  async logout() {
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

    // Vérifier qu'on a bien un refresh token
    if (!refreshToken || refreshToken === 'null' || refreshToken === 'undefined') {
      console.warn('⚠️ Pas de refresh token - déconnexion locale uniquement');
      authUtils.clearStorage();
      return { success: true };
    }

    try {
      console.log('🚪 Envoi de la requête de déconnexion au serveur...');

      // Envoyer la requête de logout au serveur
      const response = await api.post(ENDPOINTS.AUTH.LOGOUT, { refreshToken });

      console.log('✅ Déconnexion validée par le serveur');

      // Nettoyer le localStorage
      authUtils.clearStorage();
      console.log('✅ Stockage local nettoyé');

      return { success: true };

    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion:', error);

      // Si erreur 401 (token invalide), demander un nouveau token et réessayer UNE FOIS
      if (error.response?.status === 401) {
        console.log('🔄 Token invalide, tentative de renouvellement...');

        try {
          // Demander un nouveau token
          const refreshResponse = await api.post(ENDPOINTS.AUTH.REFRESH, { refreshToken });
          const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.data.tokens;

          // Sauvegarder les nouveaux tokens
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);

          console.log('✅ Token renouvelé, nouvelle tentative de déconnexion...');

          // Réessayer le logout avec le nouveau token (DERNIÈRE TENTATIVE)
          const retryResponse = await api.post(ENDPOINTS.AUTH.LOGOUT, { refreshToken: newRefreshToken });

          console.log('✅ Déconnexion réussie après renouvellement du token');
          authUtils.clearStorage();
          return { success: true };

        } catch (refreshError) {
          console.error('❌ Échec du renouvellement ou deuxième tentative de déconnexion:', refreshError);

          // Si on a un 401 une DEUXIÈME fois, ou si le refresh échoue, déconnecter localement
          console.warn('⚠️ Impossible de se déconnecter proprement - déconnexion locale forcée');
          authUtils.clearStorage();
          return { success: true, warning: 'Session expirée, déconnexion locale effectuée' };
        }
      }

      // Si c'est une erreur réseau ou serveur, déconnecter localement
      if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || error.response?.status >= 500) {
        console.warn('⚠️ Erreur serveur - déconnexion locale forcée');
        authUtils.clearStorage();
        return { success: true, warning: 'Déconnexion locale effectuée (serveur injoignable)' };
      }

      // Pour les autres erreurs, propager le message
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la déconnexion';
      throw new Error(errorMessage);
    }
  },

  /**
   * Récupérer le profil utilisateur actuel
   * Nécessite une authentification complète (API Key + JWT)
   * 
   * @returns {Promise} Données du profil utilisateur
   */
  async getProfile() {
    try {
      console.log('👤 Récupération du profil...');
      const response = await api.get(ENDPOINTS.AUTH.ME);
      console.log('✅ Profil récupéré');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération profil:', error);
      throw error;
    }
  },

  /**
   * Mettre à jour le profil utilisateur
   * 
   * @param {Object} profileData - Nouvelles données du profil
   * @returns {Promise} Profil mis à jour
   */
  async updateProfile(profileData) {
    try {
      console.log('✏️ Mise à jour du profil...');
      const response = await api.patch(ENDPOINTS.AUTH.UPDATE_ME, profileData);

      const updatedUser = response.data.data.user;

      // Mettre à jour les données utilisateur en local
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));

      console.log('✅ Profil mis à jour');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur mise à jour profil:', error);
      throw error;
    }
  },

  /**
   * Mettre à jour le mot de passe de l'utilisateur
   * 
   * @param {Object} passwordData - Ancien et nouveau mot de passe
   * @returns {Promise} Confirmation de mise à jour
   */
  async updatePassword(passwordData) {
    try {
      console.log('🔒 Mise à jour du mot de passe...');
      const response = await api.patch(ENDPOINTS.AUTH.UPDATE_PASSWORD, passwordData);
      console.log('✅ Mot de passe mis à jour');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur mise à jour mot de passe:', error);
      throw error;
    }
  },

  /**
   * Régénérer l'API Key personnelle de l'utilisateur
   * L'ancienne clé devient invalide
   * 
   * @returns {Promise} Nouvelle API Key
   */
  async regenerateApiKey() {
    try {
      console.log('🔄 Régénération de l\'API Key...');
      const response = await api.post(ENDPOINTS.AUTH.REGENERATE_API_KEY);

      const newApiKey = response.data.data.apiKey;

      // Sauvegarder la nouvelle API Key
      localStorage.setItem(STORAGE_KEYS.USER_API_KEY, newApiKey);

      // Mettre à jour les données utilisateur
      const user = authUtils.getUser();
      if (user) {
        user.apiKey = newApiKey;
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      }

      console.log('✅ API Key régénérée');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur régénération API Key:', error);
      throw error;
    }
  }
};

/**
 * Services système
 * Fonctions pour interagir avec les endpoints système
 */
export const systemService = {
  /**
   * Vérifier l'état de santé du système
   * Route publique - nécessite seulement l'API Key système
   * 
   * @returns {Promise} État de santé du système
   */
  async getHealth() {
    try {
      const response = await api.get(ENDPOINTS.SYSTEM.HEALTH);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur santé système:', error);
      throw error;
    }
  }
};

/**
 * Utilitaires d'authentification
 * Fonctions helper pour gérer l'état d'authentification
 */
export const authUtils = {
  /**
   * Vérifier si l'utilisateur est authentifié
   * @returns {boolean} True si un token d'accès existe
   */
  isAuthenticated() {
    return !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  /**
   * Récupérer les données utilisateur du stockage local
   * @returns {Object|null} Données utilisateur ou null
   */
  getUser() {
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  },

  /**
   * Récupérer l'API Key personnelle de l'utilisateur
   * @returns {string|null} API Key utilisateur ou null
   */
  getUserApiKey() {
    return localStorage.getItem(STORAGE_KEYS.USER_API_KEY);
  },

  /**
   * Vérifier si l'API Key système est configurée
   * @returns {boolean} True si l'API Key système existe
   */
  hasSystemApiKey() {
    return !!API_CONFIG.SYSTEM_API_KEY;
  },

  /**
   * Sauvegarder les données d'authentification après connexion/inscription
   * 
   * @param {Object} user - Données utilisateur
   * @param {Object} tokens - Tokens d'authentification
   */
  saveAuthData(user, tokens) {
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.USER_API_KEY, user.apiKey);
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
  },

  /**
   * Nettoyer tout le stockage local (déconnexion)
   */
  clearStorage() {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    localStorage.removeItem(STORAGE_KEYS.USER_API_KEY);
  }
};

// Export de l'instance Axios pour usage direct si nécessaire
export default api;