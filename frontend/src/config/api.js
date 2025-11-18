/**
 * Configuration de l'API Gateway Sorikama Hub
 * 
 * Ce fichier centralise toute la configuration pour communiquer avec le backend.
 * Il définit les URLs, les endpoints et les routes selon le système d'authentification à 2 niveaux.
 */

// Configuration principale de l'API
export const API_CONFIG = {
  // URL de base de l'API Gateway (port 7000 forcé côté backend)
  BASE_URL: import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:7000/api/v1',

  // Timeout des requêtes HTTP (10 secondes)
  TIMEOUT: 10000
};

// Définition de tous les endpoints de l'API
export const ENDPOINTS = {
  // Routes d'authentification
  AUTH: {
    LOGIN: '/auth/login',                    // Connexion utilisateur
    REGISTER: '/auth/register',              // Étape 1 : Demande d'inscription
    VERIFY: '/auth/verify',                  // Étape 2 : Validation du code email
    LOGOUT: '/auth/logout',                  // Déconnexion
    REFRESH: '/auth/refresh-token',          // Renouvellement des tokens
    ME: '/auth/me',                          // Profil utilisateur actuel
    UPDATE_ME: '/auth/update-me',            // Mise à jour du profil
    UPDATE_PASSWORD: '/auth/update-password' // Mise à jour du mot de passe
  },

  // Routes système
  SYSTEM: {
    HEALTH: '/system/health'                 // État de santé du système
  }
};

/**
 * Routes publiques - Nécessitent seulement l'API Key système
 * Ces routes n'ont pas besoin de JWT Token
 */
export const PUBLIC_ROUTES = [
  ENDPOINTS.AUTH.LOGIN,
  ENDPOINTS.AUTH.REGISTER,
  ENDPOINTS.AUTH.VERIFY,
  ENDPOINTS.SYSTEM.HEALTH
];

/**
 * Routes protégées - Nécessitent API Key + JWT Token
 * Ces routes accèdent aux données personnelles de l'utilisateur
 */
export const PROTECTED_ROUTES = [
  ENDPOINTS.AUTH.LOGOUT,
  ENDPOINTS.AUTH.ME,
  ENDPOINTS.AUTH.UPDATE_ME,
  ENDPOINTS.AUTH.UPDATE_PASSWORD
];

// Clés de stockage
// 🔒 SÉCURITÉ HYBRIDE :
// - Access token → sessionStorage (courte durée, perdu à la fermeture)
// - Refresh token → Cookie httpOnly (longue durée, sécurisé)
// - User data → sessionStorage (données non sensibles)
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'sorikama_access_token',  // sessionStorage
  USER_DATA: 'sorikama_user'              // sessionStorage
};