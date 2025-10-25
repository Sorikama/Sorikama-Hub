/**
 * EXEMPLE DE CONFIGURATION FRONTEND POUR MASEBUY
 * 
 * Configuration pour l'intégration avec Sorikama Hub
 * À copier dans votre projet MaseBuy: src/config/sorikama.ts
 */

export const sorikamaConfig = {
  // URL de Sorikama Hub (Gateway)
  hubUrl: import.meta.env.VITE_SORIKAMA_HUB_URL || 'http://localhost:7000',
  
  // URL de l'API MaseBuy (votre propre backend)
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  
  // Slug du service (doit correspondre à celui enregistré dans Sorikama)
  serviceSlug: 'masebuy',
  
  // URL de callback (où Sorikama redirige après autorisation)
  callbackUrl: import.meta.env.VITE_SORIKAMA_CALLBACK_URL || 'http://localhost:3001/auth/callback',
  
  // Clés de stockage localStorage
  storageKeys: {
    TOKEN: 'sorikama_token',
    USER: 'sorikama_user',
    STORES: 'masebuy_stores'
  },
  
  // Proxy path (pour les requêtes via le gateway)
  proxyPath: 'masebuy'
};

/**
 * Générer l'URL d'autorisation Sorikama
 */
export const getSorikamaAuthUrl = (): string => {
  const params = new URLSearchParams({
    service: sorikamaConfig.serviceSlug,
    redirect_uri: sorikamaConfig.callbackUrl
  });
  
  return `${sorikamaConfig.hubUrl}/authorize?${params.toString()}`;
};

/**
 * Vérifier si l'utilisateur est authentifié
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem(sorikamaConfig.storageKeys.TOKEN);
  const user = localStorage.getItem(sorikamaConfig.storageKeys.USER);
  
  if (!token || !user) {
    return false;
  }
  
  // Vérifier l'expiration du token
  try {
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      return false;
    }
    
    const payload = JSON.parse(atob(tokenParts[1]));
    const now = Math.floor(Date.now() / 1000);
    
    if (payload.exp && payload.exp < now) {
      // Token expiré
      clearAuth();
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Récupérer le token
 */
export const getToken = (): string | null => {
  return localStorage.getItem(sorikamaConfig.storageKeys.TOKEN);
};

/**
 * Récupérer les données utilisateur
 */
export const getUser = (): any | null => {
  const userStr = localStorage.getItem(sorikamaConfig.storageKeys.USER);
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    return null;
  }
};

/**
 * Nettoyer l'authentification
 */
export const clearAuth = (): void => {
  localStorage.removeItem(sorikamaConfig.storageKeys.TOKEN);
  localStorage.removeItem(sorikamaConfig.storageKeys.USER);
  localStorage.removeItem(sorikamaConfig.storageKeys.STORES);
};

/**
 * Créer une instance Axios configurée pour Sorikama
 */
import axios from 'axios';

export const sorikamaApi = axios.create({
  baseURL: sorikamaConfig.apiUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour ajouter le token automatiquement
sorikamaApi.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs d'authentification
sorikamaApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token invalide ou expiré
      clearAuth();
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);
