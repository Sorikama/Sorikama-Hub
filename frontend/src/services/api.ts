import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import API_CONFIG from '../config/api';

// Création de l'instance axios avec la configuration de base
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Type pour la requête avec propriété _retry
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Intercepteur pour ajouter le token d'authentification aux requêtes
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = localStorage.getItem(API_CONFIG.AUTH_STORAGE_KEY.TOKEN);
    console.log(`[API] Requête vers ${config.url}`);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[API] Token ajouté à la requête');
    } else {
      console.warn('[API] Aucun token disponible pour la requête');
    }
    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    console.log(`[API] Réponse reçue de ${response.config.url}:`, response.status);
    return response;
  },
  async (error: AxiosError): Promise<unknown> => {
    console.error(`[API] Erreur pour ${error.config?.url}:`, error.response?.status, error.response?.data);
    const originalRequest = error.config as ExtendedAxiosRequestConfig;
    
    // Si l'erreur est 401 (non autorisé) et que nous n'avons pas déjà essayé de rafraîchir le token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem(API_CONFIG.AUTH_STORAGE_KEY.REFRESH_TOKEN);
        if (!refreshToken) {
          // Si pas de refresh token, on déconnecte l'utilisateur
          localStorage.removeItem(API_CONFIG.AUTH_STORAGE_KEY.USER);
          localStorage.removeItem(API_CONFIG.AUTH_STORAGE_KEY.TOKEN);
          localStorage.removeItem(API_CONFIG.AUTH_STORAGE_KEY.REFRESH_TOKEN);
          window.location.href = '/auth/login';
          return Promise.reject(error);
        }
        
        // Essayer de rafraîchir le token
        const response = await axios.post(`${API_CONFIG.BASE_URL}/auth/refresh-token`, {
          refresh_token: refreshToken
        });
        
        if (response.data.token) {
          localStorage.setItem(API_CONFIG.AUTH_STORAGE_KEY.TOKEN, response.data.token);
          localStorage.setItem(API_CONFIG.AUTH_STORAGE_KEY.REFRESH_TOKEN, response.data.refresh_token);
          
          // Réessayer la requête originale avec le nouveau token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
          }
          return api(originalRequest);
        }
      } catch (refreshError) {
        // En cas d'échec du rafraîchissement, déconnecter l'utilisateur
        localStorage.removeItem(API_CONFIG.AUTH_STORAGE_KEY.USER);
        localStorage.removeItem(API_CONFIG.AUTH_STORAGE_KEY.TOKEN);
        localStorage.removeItem(API_CONFIG.AUTH_STORAGE_KEY.REFRESH_TOKEN);
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
