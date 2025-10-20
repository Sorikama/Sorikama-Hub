// Configuration des endpoints backend
export const API_ENDPOINTS = {
  // Authentification
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register', 
    VERIFY: '/auth/verify',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    UPDATE_PROFILE: '/auth/update-me',
    REGENERATE_API_KEY: '/auth/regenerate-api-key',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password'
  },
  
  // Système
  SYSTEM: {
    HEALTH: '/system/health',
    SERVICES: '/system/services'
  },
  
  // Services externes (proxy)
  SERVICES: {
    SORISTORE: '/soristore',
    SORIPAY: '/soripay', 
    SORIWALLET: '/soriwallet',
    SORILEARN: '/sorilearn',
    SORIHEALTH: '/sorihealth',
    SORIACCESS: '/soriaccess'
  }
};

// Configuration de sécurité
export const SECURITY_CONFIG = {
  TOKEN_STORAGE_KEY: 'token',
  API_KEY_STORAGE_KEY: 'userApiKey',
  USER_STORAGE_KEY: 'user',
  
  // Routes publiques (n'ont pas besoin de JWT)
  PUBLIC_ROUTES: [
    API_ENDPOINTS.AUTH.LOGIN,
    API_ENDPOINTS.AUTH.REGISTER,
    API_ENDPOINTS.AUTH.VERIFY,
    API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
    API_ENDPOINTS.AUTH.RESET_PASSWORD
  ],
  
  // Routes système (utilisent la clé système)
  SYSTEM_ROUTES: [
    API_ENDPOINTS.SYSTEM.HEALTH,
    API_ENDPOINTS.SYSTEM.SERVICES
  ]
};

// Validation des données
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  API_KEY_PREFIX: 'sk_',
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};