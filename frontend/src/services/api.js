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
import { logger } from '../utils/logger.js';

/**
 * Instance Axios configurée pour l'API Gateway
 * Toutes les requêtes passent par cette instance
 */
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  withCredentials: true, // Envoyer les cookies automatiquement
  headers: {
    'Content-Type': 'application/json'
  }
});

// Flag pour indiquer qu'une déconnexion est en cours
let isLoggingOut = false;

// Cache du token CSRF
let csrfToken = null;

/**
 * Récupérer le token CSRF depuis le serveur
 */
async function fetchCsrfToken() {
  try {
    const response = await axios.get(`${API_CONFIG.BASE_URL}/security/csrf-token`, {
      withCredentials: true
    });
    csrfToken = response.data.data.csrfToken;
    logger.debug('✅ Token CSRF récupéré');
    return csrfToken;
  } catch (error) {
    logger.error('❌ Erreur récupération token CSRF:', error);
    throw error;
  }
}

/**
 * Intercepteur de requête - Ajoute automatiquement les headers d'authentification et CSRF
 * 
 * 🔒 SÉCURITÉ HYBRIDE :
 * - Access token depuis localStorage (courte durée, partagé entre onglets)
 * - Refresh token dans cookie httpOnly (envoyé automatiquement)
 */
api.interceptors.request.use(
  async (config) => {
    const isPublicRoute = PUBLIC_ROUTES.some(route => config.url?.includes(route));

    // ✅ Ajouter le token d'accès depuis localStorage (s'il existe)
    if (!isPublicRoute) {
      const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (accessToken) {
        config.headers['Authorization'] = `Bearer ${accessToken}`;
      }
      // Si pas de token, la requête sera envoyée sans Authorization
      // et retournera 401, ce qui déclenchera le refresh dans l'intercepteur de réponse
    }

    // Ajouter le token CSRF pour les requêtes POST/PUT/PATCH/DELETE
    if (config.method && ['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
      // Récupérer le token CSRF si on ne l'a pas encore
      if (!csrfToken) {
        try {
          await fetchCsrfToken();
        } catch (error) {
          logger.warn('⚠️ Impossible de récupérer le token CSRF');
        }
      }

      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
    }

    // Log pour debug (désactivé en production)
    logger.debug(`📡 ${config.method?.toUpperCase()} ${config.url}`, {
      isPublic: isPublicRoute,
      hasAuth: !!config.headers['Authorization'],
      hasCsrf: !!config.headers['X-CSRF-Token']
    });

    return config;
  },
  (error) => {
    logger.error('❌ Erreur configuration requête:', error);
    return Promise.reject(error);
  }
);

// Flag pour éviter les refresh multiples simultanés
let isRefreshing = false;
let refreshSubscribers = [];

// Fonction pour notifier tous les abonnés quand le refresh est terminé
const onRefreshed = (accessToken) => {
  refreshSubscribers.forEach(callback => callback(accessToken));
  refreshSubscribers = [];
};

// Fonction pour ajouter un abonné
const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

/**
 * Intercepteur de réponse - Gestion automatique du refresh token
 * 
 * 🔒 SÉCURITÉ HYBRIDE :
 * - Refresh token dans cookie httpOnly (envoyé automatiquement)
 * - Nouveau access token sauvegardé dans sessionStorage
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

    // Si erreur 403 avec message CSRF, rafraîchir le token CSRF
    if (error.response?.status === 403 && error.response?.data?.message?.includes('CSRF')) {
      logger.warn('⚠️ Token CSRF invalide, récupération d\'un nouveau token...');
      csrfToken = null; // Réinitialiser le cache
      try {
        await fetchCsrfToken();
        // Retry la requête avec le nouveau token
        if (csrfToken) {
          originalRequest.headers['X-CSRF-Token'] = csrfToken;
          return api(originalRequest);
        }
      } catch (csrfError) {
        logger.error('❌ Impossible de récupérer le token CSRF');
      }
    }

    // Si erreur 401 et qu'on n'a pas déjà tenté le refresh
    // ET que ce n'est pas une requête de logout ou refresh
    if (error.response?.status === 401 && !originalRequest._retry && !isLogoutRequest && !isRefreshRequest) {
      
      // Si un refresh est déjà en cours, attendre qu'il se termine
      if (isRefreshing) {
        logger.log('⏳ Refresh déjà en cours, ajout à la file d\'attente...');
        return new Promise((resolve) => {
          addRefreshSubscriber((accessToken) => {
            originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        logger.log('🔄 Tentative de renouvellement du token...');

        // Appeler l'endpoint de refresh
        // Le refresh token est dans le cookie httpOnly, envoyé automatiquement
        const response = await api.post(ENDPOINTS.AUTH.REFRESH);

        logger.log('✅ Token renouvelé avec succès');

        // Sauvegarder le nouveau access token dans localStorage
        const { accessToken } = response.data.data;
        if (accessToken) {
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
          
          // Notifier tous les abonnés
          onRefreshed(accessToken);
        }

        isRefreshing = false;

        // Retry la requête originale avec le nouveau token
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        logger.error('❌ Échec du renouvellement du token');
        isRefreshing = false;
        refreshSubscribers = [];

        // Refresh échoué - déconnecter l'utilisateur
        authUtils.clearStorage();
        
        // Éviter la redirection si on est déjà sur la page de login
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
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
      logger.log('📝 Demande d\'inscription');
      const response = await api.post(ENDPOINTS.AUTH.REGISTER, userData);
      logger.log('✅ Code de vérification envoyé');
      return response.data;
    } catch (error) {
      logger.error('❌ Erreur inscription');
      throw error;
    }
  },

  /**
   * ÉTAPE 2 : Validation du compte
   * Valide le code reçu par email et crée le compte définitif
   * 
   * @param {Object} verificationData - Token de vérification + code
   * @returns {Promise} Réponse avec user et accessToken
   */
  async verify(verificationData) {
    try {
      logger.log('🔍 Vérification du code...');
      const response = await api.post(ENDPOINTS.AUTH.VERIFY, verificationData);

      const { user, accessToken } = response.data.data;

      // Sauvegarder les données d'authentification
      // Refresh token est dans le cookie httpOnly (géré par le backend)
      authUtils.saveAuthData(user, accessToken);

      logger.log('✅ Compte créé et utilisateur connecté');
      return response.data;
    } catch (error) {
      logger.error('❌ Erreur vérification');
      throw error;
    }
  },

  /**
   * Connexion utilisateur
   * Authentifie avec email/password et récupère les tokens
   * 
   * @param {Object} credentials - Email et mot de passe
   * @returns {Promise} Réponse avec user et accessToken
   */
  async login(credentials) {
    try {
      logger.log('🚪 Tentative de connexion');
      const response = await api.post(ENDPOINTS.AUTH.LOGIN, credentials);

      const { user, accessToken } = response.data.data;

      // Sauvegarder les données d'authentification
      // Refresh token est dans le cookie httpOnly (géré par le backend)
      authUtils.saveAuthData(user, accessToken);

      logger.log('✅ Connexion réussie');
      return response.data;
    } catch (error) {
      logger.error('❌ Erreur connexion');
      throw error;
    }
  },

  /**
   * Rafraîchir l'access token
   * Utilise le refresh token dans le cookie httpOnly pour obtenir un nouvel access token
   * 
   * @returns {Promise} Réponse avec user et accessToken
   */
  async refreshAccessToken() {
    try {
      logger.log('🔄 Refresh access token...');
      const response = await api.post(ENDPOINTS.AUTH.REFRESH);

      const { user, accessToken } = response.data.data;

      // Sauvegarder le nouvel access token
      if (accessToken) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      }

      // Sauvegarder les données utilisateur
      if (user) {
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      }

      logger.log('✅ Access token refreshé');
      return response.data;
    } catch (error) {
      logger.error('❌ Erreur refresh token');
      throw error;
    }
  },

  /**
   * Déconnexion utilisateur
   * Invalide le refresh token côté serveur et nettoie le stockage local
   * 
   * Le refresh token est dans le cookie httpOnly, envoyé automatiquement
   */
  async logout() {
    try {
      logger.log('🚪 Déconnexion en cours...');

      // Envoyer la requête de logout au serveur
      // Le refresh token est dans le cookie httpOnly, envoyé automatiquement
      const response = await api.post(ENDPOINTS.AUTH.LOGOUT);

      logger.log('✅ Déconnexion validée');

      // Nettoyer le cache local
      authUtils.clearStorage();

      return { success: true };

    } catch (error) {
      logger.error('❌ Erreur lors de la déconnexion');

      // En cas d'erreur, nettoyer quand même le cache local
      authUtils.clearStorage();

      // Si c'est une erreur réseau ou serveur, déconnexion locale
      if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || error.response?.status >= 500) {
        logger.warn('⚠️ Erreur serveur - déconnexion locale forcée');
        return { success: true, warning: 'Déconnexion locale effectuée (serveur injoignable)' };
      }

      // Pour les autres erreurs, considérer comme réussi quand même
      return { success: true, warning: 'Déconnexion locale effectuée' };
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
      logger.log('👤 Récupération du profil...');
      const response = await api.get(ENDPOINTS.AUTH.ME);
      logger.log('✅ Profil récupéré');
      return response.data;
    } catch (error) {
      logger.error('❌ Erreur récupération profil');
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
      logger.log('✏️ Mise à jour du profil...');
      const response = await api.patch(ENDPOINTS.AUTH.UPDATE_ME, profileData);

      const updatedUser = response.data.data.user;

      // Mettre à jour les données utilisateur en sessionStorage
      sessionStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));

      logger.log('✅ Profil mis à jour');
      return response.data;
    } catch (error) {
      logger.error('❌ Erreur mise à jour profil');
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
      logger.log('🔒 Mise à jour du mot de passe...');
      const response = await api.patch(ENDPOINTS.AUTH.UPDATE_PASSWORD, passwordData);
      logger.log('✅ Mot de passe mis à jour');
      return response.data;
    } catch (error) {
      logger.error('❌ Erreur mise à jour mot de passe');
      throw error;
    }
  },


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
      logger.error('❌ Erreur santé système');
      throw error;
    }
  }
};

/**
 * Utilitaires d'authentification
 * 
 * 🔒 SÉCURITÉ HYBRIDE :
 * - Access token → localStorage (courte durée, partagé entre onglets)
 * - Refresh token → Cookie httpOnly (longue durée, sécurisé, géré par backend)
 * - User data → localStorage (données non sensibles, partagé entre onglets)
 */
export const authUtils = {
  /**
   * Vérifier si l'utilisateur est authentifié
   * @returns {boolean} True si authentifié (access token présent)
   */
  isAuthenticated() {
    const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    return !!(accessToken && userData);
  },

  /**
   * Récupérer les données utilisateur du cache
   * @returns {Object|null} Données utilisateur ou null
   */
  getUser() {
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  },

  /**
   * Sauvegarder les données d'authentification
   * 
   * @param {Object} user - Données utilisateur
   * @param {string} accessToken - Access token JWT (courte durée)
   */
  saveAuthData(user, accessToken) {
    // Sauvegarder l'access token dans localStorage
    if (accessToken) {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    }

    // Sauvegarder les données utilisateur dans localStorage
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

    // Le refresh token est dans le cookie httpOnly (géré par le backend)
  },

  /**
   * Nettoyer le cache (déconnexion)
   * Le cookie httpOnly est supprimé par le backend
   */
  clearStorage() {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    // Le cookie httpOnly est supprimé par le backend lors du logout
  }
};

// Export de l'instance Axios pour usage direct si nécessaire
export default api;