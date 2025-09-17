import api from './api';
import { User } from '../types';
import API_CONFIG from '../config/api';

interface LoginResponse {
  user: User;
  token: string;
  refresh_token: string;
}

interface RegisterResponse {
  user: User;
  token: string;
  refresh_token: string;
}

export const authService = {
  /**
   * Connecte un utilisateur avec son email et mot de passe
   */
  async login(email: string, password: string): Promise<User> {
    try {
      const response = await api.post<LoginResponse>('/auth/login', { email, password });
      
      // Stocker les informations d'authentification
      localStorage.setItem(API_CONFIG.AUTH_STORAGE_KEY.USER, JSON.stringify(response.data.user));
      localStorage.setItem(API_CONFIG.AUTH_STORAGE_KEY.TOKEN, response.data.token);
      localStorage.setItem(API_CONFIG.AUTH_STORAGE_KEY.REFRESH_TOKEN, response.data.refresh_token);
      
      // Effacer le cache des boutiques pour forcer une nouvelle récupération
      localStorage.removeItem(API_CONFIG.AUTH_STORAGE_KEY.STORES);
      
      return response.data.user;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  },

  /**
   * Inscrit un nouvel utilisateur
   */
  async register(name: string, email: string, password: string): Promise<User> {
    try {
      const response = await api.post<RegisterResponse>('/auth/register', {
        name,
        email,
        password
      });
      
      // Stocker les informations d'authentification
      localStorage.setItem(API_CONFIG.AUTH_STORAGE_KEY.USER, JSON.stringify(response.data.user));
      localStorage.setItem(API_CONFIG.AUTH_STORAGE_KEY.TOKEN, response.data.token);
      localStorage.setItem(API_CONFIG.AUTH_STORAGE_KEY.REFRESH_TOKEN, response.data.refresh_token);
      
      return response.data.user;
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      throw error;
    }
  },

  /**
   * Déconnecte l'utilisateur
   */
  async logout(): Promise<void> {
    try {
      // Récupérer le refresh token pour l'invalidation côté serveur
      const refreshToken = localStorage.getItem(API_CONFIG.AUTH_STORAGE_KEY.REFRESH_TOKEN);
      if (refreshToken) {
        await api.post('/auth/logout', { refresh_token: refreshToken });
      }
      
      // Supprimer les informations d'authentification
      localStorage.removeItem(API_CONFIG.AUTH_STORAGE_KEY.USER);
      localStorage.removeItem(API_CONFIG.AUTH_STORAGE_KEY.TOKEN);
      localStorage.removeItem(API_CONFIG.AUTH_STORAGE_KEY.REFRESH_TOKEN);
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
      // Même en cas d'erreur, on supprime les données locales
      localStorage.removeItem(API_CONFIG.AUTH_STORAGE_KEY.USER);
      localStorage.removeItem(API_CONFIG.AUTH_STORAGE_KEY.TOKEN);
      localStorage.removeItem(API_CONFIG.AUTH_STORAGE_KEY.REFRESH_TOKEN);
      throw error;
    }
  },

  /**
   * Récupère les informations de l'utilisateur actuel
   */
  async getCurrentUser(): Promise<{user: User, hasStores: boolean} | null> {
    try {
      const response = await api.get<{user: User, hasStores: boolean}>('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      return null;
    }
  },

  /**
   * Vérifie si un email est disponible
   */
  async checkEmailAvailability(email: string): Promise<boolean> {
    try {
      const response = await api.post<{ available: boolean }>('/auth/check-email', { email });
      return response.data.available;
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'email:', error);
      return false;
    }
  },

  /**
   * Récupère l'utilisateur depuis le stockage local
   */
  getUserFromStorage(): User | null {
    const userJson = localStorage.getItem(API_CONFIG.AUTH_STORAGE_KEY.USER);
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch (e) {
        console.error('Erreur lors du parsing de l\'utilisateur:', e);
        return null;
      }
    }
    return null;
  }
};

export default authService;
