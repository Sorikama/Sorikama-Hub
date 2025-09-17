// Configuration de l'API
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8000/api',
  
  // Clés pour le stockage local
  STORAGE_KEYS: {
    AUTH_TOKEN: 'WebRichesse_token',
    USER_DATA: 'WebRichesse_user',
    SELECTED_STORE: 'WebRichesse_selected_store',
    PRODUCTS: 'WebRichesse_products'
  },
  
  // Durées d'expiration
  EXPIRY: {
    TOKEN: 24 * 60 * 60 * 1000, // 24 heures en millisecondes
    CACHE: 5 * 60 * 1000 // 5 minutes en millisecondes
  }
};

// Configuration des thèmes
export const THEME_CONFIG = {
  DEFAULT_THEME: 'light',
  STORAGE_KEY: 'WebRichesse_theme'
};

// Configuration des routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  DASHBOARD: '/dashboard',
  PRODUCTS: '/dashboard/products',
  SALES: '/dashboard/sales',
  CUSTOMERS: '/dashboard/customers',
  SETTINGS: '/dashboard/settings'
};

export default {
  API_CONFIG,
  THEME_CONFIG,
  ROUTES
};
