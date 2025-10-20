import axios from 'axios';
import { SECURITY_CONFIG } from '../config/api';

const API_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:7000/api/v1';
const SYSTEM_API_KEY = import.meta.env.VITE_API_KEY || 'sk_59105e8b548140fe11e8bad8db2572f174a6266fe4b3c4ab';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(SECURITY_CONFIG.TOKEN_STORAGE_KEY);
    const userApiKey = localStorage.getItem(SECURITY_CONFIG.API_KEY_STORAGE_KEY);
    
    // Vérifier si c'est une route publique
    const isPublicRoute = SECURITY_CONFIG.PUBLIC_ROUTES.some(route => 
      config.url?.includes(route)
    );
    
    // Vérifier si c'est une route système
    const isSystemRoute = SECURITY_CONFIG.SYSTEM_ROUTES.some(route => 
      config.url?.includes(route)
    );
    
    if (isPublicRoute || isSystemRoute) {
      // Utiliser la clé système pour les routes publiques et système
      config.headers['X-API-Key'] = SYSTEM_API_KEY;
    } else {
      // Utiliser la clé utilisateur pour les routes protégées
      if (userApiKey) {
        config.headers['X-API-Key'] = userApiKey;
      } else {
        // Fallback vers la clé système si pas de clé utilisateur
        config.headers['X-API-Key'] = SYSTEM_API_KEY;
      }
    }
    
    // Ajouter le JWT pour les routes protégées
    if (token && !isPublicRoute && !isSystemRoute) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken
          }, {
            headers: {
              'X-API-Key': SYSTEM_API_KEY,
              'Content-Type': 'application/json'
            }
          });
          
          const { user, tokens } = response.data.data;
          
          // Mettre à jour les tokens
          localStorage.setItem(SECURITY_CONFIG.TOKEN_STORAGE_KEY, tokens.accessToken);
          localStorage.setItem(SECURITY_CONFIG.API_KEY_STORAGE_KEY, user.apiKey);
          localStorage.setItem('refreshToken', tokens.refreshToken);
          localStorage.setItem(SECURITY_CONFIG.USER_STORAGE_KEY, JSON.stringify(user));
          
          // Réessayer la requête originale
          originalRequest.headers['Authorization'] = `Bearer ${tokens.accessToken}`;
          originalRequest.headers['X-API-Key'] = user.apiKey;
          
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh token invalide, déconnecter
          localStorage.removeItem(SECURITY_CONFIG.TOKEN_STORAGE_KEY);
          localStorage.removeItem(SECURITY_CONFIG.API_KEY_STORAGE_KEY);
          localStorage.removeItem(SECURITY_CONFIG.USER_STORAGE_KEY);
          localStorage.removeItem('refreshToken');
          
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      } else {
        // Pas de refresh token, déconnecter
        localStorage.removeItem(SECURITY_CONFIG.TOKEN_STORAGE_KEY);
        localStorage.removeItem(SECURITY_CONFIG.API_KEY_STORAGE_KEY);
        localStorage.removeItem(SECURITY_CONFIG.USER_STORAGE_KEY);
        
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;