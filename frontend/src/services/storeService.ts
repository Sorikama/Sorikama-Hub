import api from './api';
import { Store } from '../types';
import API_CONFIG from '../config/api';

// Durée de validité du cache en millisecondes (5 minutes)
const CACHE_EXPIRY = 5 * 60 * 1000;

// Structure pour le cache
interface CacheItem<T> {
  data: T;
  timestamp: number;
}

// Cache en mémoire
let storesCache: CacheItem<Store[]> | null = null;

// Variables pour gérer les requêtes
let isStoresRequestInProgress = false;
let lastStoresRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000; // 2 secondes minimum entre les requêtes

// Pas besoin d'interfaces supplémentaires, nous utilisons directement le type Store

export const storeService = {
  /**
   * Crée une nouvelle boutique
   */
  async createStore(name: string, description: string, domaine: string): Promise<Store> {
    try {
      const response = await api.post<Store>('/stores', {
        name,
        description,
        domaine
      });
      
      // Invalider le cache pour forcer un rechargement
      this.invalidateStoresCache();
      
      // Mettre à jour le stockage local des boutiques
      const storedStores = localStorage.getItem(API_CONFIG.AUTH_STORAGE_KEY.STORES);
      const stores = storedStores ? JSON.parse(storedStores) : [];
      const updatedStores = [...stores, response.data];
      localStorage.setItem(API_CONFIG.AUTH_STORAGE_KEY.STORES, JSON.stringify(updatedStores));
      
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de la boutique:', error);
      throw error;
    }
  },

  /**
   * Récupère toutes les boutiques de l'utilisateur
   * @param forceRefresh Force le rafraîchissement du cache
   */
  /**
   * Récupère toutes les boutiques de l'utilisateur
   * @param forceRefresh Force le rafraîchissement du cache
   */

  async getStores(forceRefresh = false): Promise<Store[]> {
    console.log('Début de getStores, forceRefresh:', forceRefresh);
    
    // Vérifier si nous avons des données en cache valides
    const now = Date.now();
    if (!forceRefresh && storesCache && (now - storesCache.timestamp < CACHE_EXPIRY)) {
      console.log('Utilisation des données en cache pour les boutiques:', storesCache.data);
      return storesCache.data;
    }
    
    // Vérifier si une requête est déjà en cours
    if (isStoresRequestInProgress) {
      console.log('Une requête est déjà en cours, utilisation du cache ou du stockage local');
      return storesCache?.data || this.getStoresFromStorage();
    }
    
    // Vérifier si la dernière requête était trop récente
    const timeSinceLastRequest = now - lastStoresRequestTime;
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      console.log(`Dernière requête trop récente (${timeSinceLastRequest}ms), utilisation du cache ou du stockage local`);
      return storesCache?.data || this.getStoresFromStorage();
    }
    
    isStoresRequestInProgress = true;
    lastStoresRequestTime = now;
    
    try {
      console.log('Appel API pour récupérer les boutiques...');
      const response = await api.get<Store[]>('/stores/');
      console.log('Réponse API reçue:', response.data);
      
      // Mettre à jour le cache en mémoire
      storesCache = {
        data: response.data,
        timestamp: now
      };
      
      // Mettre à jour le stockage local
      localStorage.setItem(API_CONFIG.AUTH_STORAGE_KEY.STORES, JSON.stringify(response.data));
      console.log('Boutiques enregistrées dans localStorage');
      
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des boutiques:', error);
      
      // En cas d'erreur, essayer d'utiliser le cache existant
      if (storesCache) {
        console.log('Utilisation du cache existant suite à une erreur:', storesCache.data);
        return storesCache.data;
      }
      
      // Sinon, utiliser le stockage local
      const storedStores = this.getStoresFromStorage();
      console.log('Boutiques récupérées du localStorage:', storedStores);
      if (storedStores.length > 0) {
        return storedStores;
      }
      
      console.error('Aucune boutique disponible, ni en cache ni en localStorage');
      throw error;
    } finally {
      isStoresRequestInProgress = false;
    }
  },
  
  /**
   * Invalide le cache des boutiques
   */
  invalidateStoresCache(): void {
    storesCache = null;
    console.log('Cache des boutiques invalidé');
  },

  /**
   * Récupère une boutique spécifique par son ID
   */
  async getStoreById(storeId: string): Promise<Store> {
    try {
      const response = await api.get<Store>(`/stores/${storeId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la boutique ${storeId}:`, error);
      throw error;
    }
  },

  /**
   * Vérifie si un nom de domaine est disponible
   */
  async checkDomainAvailability(domaine: string): Promise<boolean> {
    try {
      const response = await api.post<{ available: boolean }>(`/stores/check-domaine`, { domaine });
      return response.data.available;
    } catch (error) {
      console.error('Erreur lors de la vérification du domaine:', error);
      return false;
    }
  },

  /**
   * Récupère les boutiques depuis le stockage local
   */
  getStoresFromStorage(): Store[] {
    try {
      const storedStores = localStorage.getItem(API_CONFIG.AUTH_STORAGE_KEY.STORES);
      console.log('Contenu brut du localStorage pour les boutiques:', storedStores);
      
      if (storedStores) {
        const parsedStores = JSON.parse(storedStores);
        console.log('Boutiques parsées depuis le localStorage:', parsedStores);
        return parsedStores;
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des boutiques depuis le stockage local:', error);
    }
    console.log('Aucune boutique trouvée dans le localStorage');
    return [];
  },

  /**
   * Met à jour une boutique existante
   */
  async updateStore(storeId: string, data: Partial<Store>): Promise<Store> {
    try {
      // Vérifier si l'ID est au format valide pour MongoDB (24 caractères hexadécimaux)
      const isValidMongoId = /^[0-9a-fA-F]{24}$/.test(storeId);
      if (!isValidMongoId) {
        throw new Error(`Format d'ID de boutique invalide: ${storeId}`);
      }

      // Vérifier si la boutique existe dans le stockage local avant de faire l'appel API
      const storedStores = this.getStoresFromStorage();
      const storeExists = storedStores.some(store => store.id === storeId);
      
      if (!storeExists) {
        console.warn(`Boutique avec l'ID ${storeId} non trouvée dans le stockage local. Tentative d'appel API quand même.`);
      }

      const response = await api.put<Store>(`/stores/${storeId}`, data);
      
      // Invalider le cache pour forcer un rechargement
      this.invalidateStoresCache();
      
      // Mettre à jour le stockage local des boutiques
      const updatedStores = storedStores.map(store => 
        store.id === storeId ? { ...store, ...response.data } : store
      );
      localStorage.setItem(API_CONFIG.AUTH_STORAGE_KEY.STORES, JSON.stringify(updatedStores));
      
      return response.data;
    } catch (error: any) {
      // Améliorer le message d'erreur pour les erreurs 404 et 400
      if (error?.response?.status === 404) {
        throw new Error(`Boutique avec l'ID ${storeId} non trouvée sur le serveur.`);
      } else if (error?.response?.status === 400) {
        const errorDetail = error?.response?.data?.detail || 'Données invalides';
        throw new Error(`Erreur de validation: ${errorDetail}`);
      }
      
      console.error(`Erreur lors de la mise à jour de la boutique ${storeId}:`, error);
      throw error;
    }
  },

  /**
   * Supprime une boutique
   */
  async deleteStore(storeId: string): Promise<void> {
    try {
      await api.delete(`/stores/${storeId}`);
      
      // Invalider le cache pour forcer un rechargement
      this.invalidateStoresCache();
      
      // Mettre à jour le stockage local des boutiques
      const storedStores = this.getStoresFromStorage();
      const updatedStores = storedStores.filter(store => store.id !== storeId);
      localStorage.setItem(API_CONFIG.AUTH_STORAGE_KEY.STORES, JSON.stringify(updatedStores));
    } catch (error) {
      console.error(`Erreur lors de la suppression de la boutique ${storeId}:`, error);
      throw error;
    }
  }
};

export default storeService;
