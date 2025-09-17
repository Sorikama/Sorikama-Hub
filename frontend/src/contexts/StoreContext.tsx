import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { Store } from '../types';
import { useAuth } from './AuthContext';
import storeService from '../services/storeService';
import API_CONFIG from '../config/api';

interface StoreContextType {
  stores: Store[];
  selectedStore: Store | null;
  setSelectedStore: (store: Store) => void;
  createStore: (name: string, description: string, domaine: string) => Promise<Store | null>;
  updateStore: (storeId: string, storeData: Partial<Store>) => Promise<Store | undefined>;
  deleteStore: (storeId: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  refreshStores: () => Promise<void>;
  getStores: (forceRefresh?: boolean) => Promise<Store[]>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

interface StoreProviderProps {
  children: ReactNode;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStoreState] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Fonction pour récupérer les boutiques
  const fetchStores = useCallback(async (forceRefresh = false) => {
    if (!user) {
      console.log('Aucun utilisateur connecté, impossible de charger les boutiques');
      setIsLoading(false);
      return;
    }
    
    // Si nous avons déjà des boutiques et qu'on ne force pas le rafraîchissement, ne pas recharger
    if (stores.length > 0 && !forceRefresh) {
      console.log('Utilisation des boutiques en cache');
      setIsLoading(false);
      return;
    }
    
    console.log('Début du chargement des boutiques, forceRefresh:', forceRefresh);
    setIsLoading(true);
    try {
      // Récupérer les boutiques avec le système de cache
      const fetchedStores = await storeService.getStores(forceRefresh);
      console.log('Boutiques récupérées depuis le backend:', fetchedStores);
      setStores(fetchedStores);
      
      // Récupérer la boutique sélectionnée du stockage local
      const storedSelectedStore = localStorage.getItem(API_CONFIG.AUTH_STORAGE_KEY.SELECTED_STORE);
      
      if (storedSelectedStore) {
        try {
          const selectedStoreData = JSON.parse(storedSelectedStore);
          const foundStore = fetchedStores.find((s: Store) => s.id === selectedStoreData.id);
          if (foundStore) {
            setSelectedStoreState(foundStore);
          } else if (fetchedStores.length > 0) {
            // Si la boutique sélectionnée n'existe plus, sélectionner la première
            setSelectedStoreState(fetchedStores[0]);
            localStorage.setItem(API_CONFIG.AUTH_STORAGE_KEY.SELECTED_STORE, JSON.stringify(fetchedStores[0]));
          }
        } catch (parseError) {
          console.error('Erreur lors du parsing de la boutique sélectionnée:', parseError);
          if (fetchedStores.length > 0) {
            setSelectedStoreState(fetchedStores[0]);
          }
        }
      } else if (fetchedStores.length > 0) {
        setSelectedStoreState(fetchedStores[0]);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des boutiques:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);
  
  // Effet pour charger les boutiques au démarrage
  useEffect(() => {
    fetchStores(false);
  }, [fetchStores]);

  const setSelectedStore = useCallback((store: Store) => {
    setSelectedStoreState(store);
    localStorage.setItem(API_CONFIG.AUTH_STORAGE_KEY.SELECTED_STORE, JSON.stringify(store));
  }, []);

  const createStore = useCallback(async (name: string, description: string, domaine: string): Promise<Store | null> => {
    if (!user) return null;

    try {
      setIsLoading(true);
      // Appel à l'API pour créer la boutique
      const newStore = await storeService.createStore(name, description, domaine);
      
      // Rafraîchir la liste des boutiques après création
      await fetchStores(true);
      
      // Sélectionner la nouvelle boutique
      setSelectedStore(newStore);
      
      return newStore;
    } catch (error) {
      console.error('Erreur lors de la création de la boutique:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user, setSelectedStore, fetchStores]);

  // Fonction pour rafraîchir manuellement les boutiques
  const refreshStores = useCallback(() => {
    return fetchStores(true);
  }, [fetchStores]);

  // Fonction pour mettre à jour une boutique
  const updateStore = useCallback(async (storeId: string, data: Partial<Store>) => {
    if (!user) return;

    try {
      setIsLoading(true);
      // Appel à l'API pour mettre à jour la boutique
      const updatedStore = await storeService.updateStore(storeId, data);
      
      // Rafraîchir la liste des boutiques après mise à jour
      await fetchStores(true);
      
      // Si la boutique mise à jour est la boutique sélectionnée, mettre à jour la sélection
      if (selectedStore && selectedStore.id === storeId) {
        setSelectedStore(updatedStore);
      }
      
      return updatedStore;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la boutique:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user, fetchStores, selectedStore, setSelectedStore]);

  // Fonction pour supprimer une boutique
  const deleteStore = useCallback(async (storeId: string) => {
    if (!user) return false;

    try {
      setIsLoading(true);
      // Appel à l'API pour supprimer la boutique
      await storeService.deleteStore(storeId);
      
      // Rafraîchir la liste des boutiques après suppression
      await fetchStores(true);
      
      // Si la boutique supprimée était la boutique sélectionnée, sélectionner une autre boutique
      if (selectedStore && selectedStore.id === storeId) {
        if (stores.length > 0) {
          const newSelectedStore = stores.find(store => store.id !== storeId);
          if (newSelectedStore) {
            setSelectedStore(newSelectedStore);
          } else {
            localStorage.removeItem(API_CONFIG.AUTH_STORAGE_KEY.SELECTED_STORE);
            setSelectedStoreState(null);
          }
        } else {
          localStorage.removeItem(API_CONFIG.AUTH_STORAGE_KEY.SELECTED_STORE);
          setSelectedStoreState(null);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de la boutique:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, fetchStores, selectedStore, stores, setSelectedStore]);

  // Fonction pour récupérer les boutiques (exposée dans le contexte)
  const getStores = useCallback(async (forceRefresh = false) => {
    await fetchStores(forceRefresh);
    return stores;
  }, [fetchStores, stores]);

  // État pour les erreurs
  const [error, setError] = useState<string | null>(null);

  // Mémoriser la valeur du contexte pour éviter les re-rendus inutiles
  const contextValue = useMemo(() => ({
    stores,
    selectedStore,
    setSelectedStore,
    createStore,
    updateStore,
    deleteStore,
    getStores,
    isLoading,
    error,
    refreshStores
  }), [stores, selectedStore, setSelectedStore, createStore, updateStore, deleteStore, getStores, isLoading, error, refreshStores]);

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};