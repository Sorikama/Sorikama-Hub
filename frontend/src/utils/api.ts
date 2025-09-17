import axios from 'axios';
import API_CONFIG from '../config/api';

// Configuration de base pour Axios
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: API_CONFIG.TIMEOUT
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    // Récupérer le token depuis le localStorage avec la bonne clé
    const token = localStorage.getItem(API_CONFIG.AUTH_STORAGE_KEY.TOKEN);
    
    if (token) {
      console.log('[API] Token ajouté à la requête');
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('[API] Aucun token d\'authentification trouvé');
    }
    
    // Log de la requête pour le débogage
    console.log(`[API] Requête vers ${config.url}`);
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Log des erreurs pour le débogage
    if (error.response) {
      console.log(`[API] Erreur pour ${error.config.url}: ${error.response.status}`, error.response.data);
      
      // Rediriger vers la page de connexion si le token est expiré ou invalide
      if (error.response.status === 401) {
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      }
    } else {
      console.log('[API] Erreur réseau:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
