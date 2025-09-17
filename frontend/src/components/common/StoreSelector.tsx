import React, { useState, useMemo } from 'react';
import { Store, ChevronDown, Plus, Check, RefreshCw } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { Button } from '../ui/Button';
import { StoreModal } from '../ui/StoreModal';

export const StoreSelector: React.FC = () => {
  const { stores, selectedStore, setSelectedStore, isLoading, refreshStores } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  
  // Mémoriser le nombre de boutiques pour éviter les re-rendus inutiles
  const storeCount = useMemo(() => stores.length, [stores]);
  
  // Fonction pour rafraîchir manuellement les boutiques
  const handleRefresh = async () => {
    if (isRefreshing || isLoading) return;
    
    setIsRefreshing(true);
    try {
      await refreshStores();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleStoreSelect = (store: any) => {
    setSelectedStore(store);
    setIsModalOpen(false);
  };

  const handleCreateStore = () => {
    setIsModalOpen(false);
    setIsStoreModalOpen(true);
  };
  
  const handleStoreModalClose = () => {
    setIsStoreModalOpen(false);
  };
  
  const handleStoreSuccess = (storeId: string) => {
    // Rafraîchir la liste des boutiques et sélectionner la nouvelle boutique
    refreshStores().then(() => {
      const newStore = stores.find(store => store.id === storeId);
      if (newStore) {
        setSelectedStore(newStore);
      }
    });
  };

  return (
    <>
      {/* Header WebRichesse */}
      <div className="px-4 py-[23px] border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">Preview</span>
          <h1 className="text-lg font-bold text-theme-primary">WebRichesse</h1>
        </div>
      </div>

      {/* Store Selector */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-theme-primary"></div>
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Chargement...</span>
          </div>
        ) : !storeCount ? (
          <div className="flex items-center justify-center p-4 text-gray-500 dark:text-gray-400">
            <Store className="w-5 h-5 mr-2" />
            <span className="text-sm">Aucune boutique</span>
          </div>
        ) : (
          <div className="relative">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center min-w-0">
                <Store className="w-5 h-5 mr-3 text-theme-primary flex-shrink-0" />
                <div className="text-left min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {selectedStore?.name || 'Sélectionner une boutique'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {selectedStore?.domaine}
                  </p>
                </div>
              </div>
              <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Arrière-plan grisé */}
          <div 
            className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Contenu du modal centré */}
          <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 transform transition-all">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Sélectionner une boutique
              </h3>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleRefresh();
                }}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                disabled={isRefreshing || isLoading}
                title="Rafraîchir la liste des boutiques"
              >
                <RefreshCw className={`w-4 h-4 text-gray-500 dark:text-gray-400 ${(isRefreshing || isLoading) ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Choisissez la boutique que vous souhaitez gérer
            </p>

            {/* Liste des boutiques */}
            <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-theme-primary"></div>
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Chargement...</span>
                </div>
              ) : stores.map((store) => (
                <button
                  key={store.id}
                  onClick={() => handleStoreSelect(store)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                    selectedStore?.id === store.id
                      ? 'bg-theme-primary-50 border border-theme-primary'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700 border border-transparent'
                  }`}
                >
                  <div className="flex items-center min-w-0">
                    <Store className={`w-4 h-4 mr-3 flex-shrink-0 ${
                      selectedStore?.id === store.id 
                        ? 'text-theme-primary' 
                        : 'text-gray-400'
                    }`} />
                    <div className="min-w-0">
                      <p className={`font-medium truncate ${
                        selectedStore?.id === store.id
                          ? 'text-theme-primary'
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {store.name}
                      </p>
                      <p className={`text-sm truncate ${
                        selectedStore?.id === store.id
                          ? 'text-theme-primary'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {store.domaine}
                      </p>
                    </div>
                  </div>
                  {selectedStore?.id === store.id && (
                    <Check className="w-5 h-5 text-theme-primary flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>

            {/* Bouton créer une nouvelle boutique */}
            <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
              <Button
                onClick={handleCreateStore}
                variant="secondary"
                icon={Plus}
                className="w-full justify-center"
              >
                Créer une nouvelle boutique
              </Button>
            </div>

            {/* Bouton fermer */}
            <div className="mt-4">
              <Button
                onClick={() => setIsModalOpen(false)}
                variant="ghost"
                className="w-full justify-center"
              >
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* StoreModal pour créer une nouvelle boutique */}
      <StoreModal 
        isOpen={isStoreModalOpen} 
        onClose={handleStoreModalClose} 
        onSuccess={handleStoreSuccess}
      />
    </>
  );
};