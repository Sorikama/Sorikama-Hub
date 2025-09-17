import React, { useState, useEffect } from 'react';
import { Store as StoreIcon, Edit, Trash2, Plus, X, ArrowLeft, Settings } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { useStore } from '../../../contexts/StoreContext';
import { Modal } from '../../../components/ui/Modal';
import { StoreModal } from '../../../components/ui/StoreModal';
import PageTransition from '../../../components/ui/PageTransition';

// Interface pour l'affichage des boutiques
interface StoreWithStatus {
  id: string;
  name: string;
  description: string;
  domaine: string;
  logo?: string;
  userId: string;
  isActive: boolean;
  createdAt: string;
}

export const StoresPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { stores, refreshStores, deleteStore, isLoading: storeContextLoading } = useStore();
  const [isLoading, setIsLoading] = useState(true);
  const [storesWithStatus, setStoresWithStatus] = useState<StoreWithStatus[]>([]);
  const [selectedStore, setSelectedStore] = useState<StoreWithStatus | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  console.log('StoresPage - Initial isStoreModalOpen:', false);
  const [editingStoreId, setEditingStoreId] = useState<string | undefined>(undefined);
  
  // État pour la soumission des formulaires
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Fonction pour convertir les stores en StoreWithStatus
    const convertStoresToStoreWithStatus = (storesList: any[]) => {
      return storesList.map(store => {
        if (!store) return null;
        return {
          ...store,
          createdAt: store.createdAt ? store.createdAt.toString() : new Date().toString()
        };
      }).filter(Boolean) as StoreWithStatus[];
    };
    
    const loadStores = async () => {
      // Si nous avons déjà des données et que les stores sont disponibles, utiliser les données existantes
      if (stores.length > 0 && !isLoading) {
        console.log('Utilisation des stores existants sans rechargement');
        const storesWithStatusData = convertStoresToStoreWithStatus(stores);
        setStoresWithStatus(storesWithStatusData);
        return;
      }
      
      try {
        console.log('Début du chargement des boutiques dans StoresPage');
        
        // Vérifier le contenu du localStorage pour un affichage rapide initial
        const storesKey = 'WebRichesse_stores';
        const localStorageStores = localStorage.getItem(storesKey);
        
        // Si nous avons des données dans le localStorage et que nous sommes en chargement
        if (localStorageStores && isLoading) {
          try {
            const parsedStores = JSON.parse(localStorageStores);
            if (Array.isArray(parsedStores) && parsedStores.length > 0) {
              // Afficher rapidement les données du localStorage pendant le chargement
              const storesWithStatusData = convertStoresToStoreWithStatus(parsedStores);
              setStoresWithStatus(storesWithStatusData);
              // Ne pas désactiver l'indicateur de chargement encore
            }
          } catch (parseError) {
            console.error('Erreur lors du parsing des boutiques du localStorage:', parseError);
          }
        }
        
        // Charger les données depuis l'API sans forcer le rafraîchissement d'abord
        // Cela utilisera le cache si disponible
        if (stores.length === 0) {
          await refreshStores();
        }
        
        // Vérifier si stores est un tableau et s'il contient des éléments
        if (!Array.isArray(stores)) {
          console.error('stores n\'est pas un tableau:', stores);
          setIsLoading(false);
          return;
        }
        
        // Mettre à jour avec les données fraîches
        if (stores.length > 0) {
          const storesWithStatusData = convertStoresToStoreWithStatus(stores);
          setStoresWithStatus(storesWithStatusData);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des boutiques:', error);
        
        // En cas d'erreur, essayer de charger depuis le localStorage
        try {
          const storesKey = 'WebRichesse_stores';
          const localStorageStores = localStorage.getItem(storesKey);
          if (localStorageStores) {
            const parsedStores = JSON.parse(localStorageStores);
            if (Array.isArray(parsedStores) && parsedStores.length > 0) {
              const storesWithStatusData = convertStoresToStoreWithStatus(parsedStores);
              setStoresWithStatus(storesWithStatusData);
            }
          }
        } catch (localStorageError) {
          console.error('Erreur lors de la récupération des boutiques depuis localStorage:', localStorageError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadStores();
  }, [refreshStores, stores, isLoading]);

  const handleEditClick = (storeId: string) => {
    // Ouvrir la modale d'édition avec l'ID de la boutique
    setEditingStoreId(storeId);
    setIsStoreModalOpen(true);
  };

  const handleDeleteClick = (storeId: string) => {
    const store = storesWithStatus.find(s => s.id === storeId);
    if (store) {
      setSelectedStore(store);
      setIsDeleteModalOpen(true);
    }
  };
  
  const handleDeleteConfirm = async () => {
    if (!selectedStore) return;
    
    setIsSubmitting(true);
    try {
      await deleteStore(selectedStore.id);
      
      // Rafraîchir la liste des boutiques
      await refreshStores();
      
      // Mettre à jour la liste locale
      setStoresWithStatus(prev => prev.filter(store => store.id !== selectedStore.id));
      
      // Fermer la modale
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Erreur lors de la suppression de la boutique:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  return (
    <PageTransition location={location.pathname}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard/settings')}
              icon={ArrowLeft}
              className="mr-4"
            >
              Retour
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Gestion des boutiques
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Gérez vos boutiques, leurs paramètres et leurs produits.
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button 
              onClick={() => {
                console.log('Bouton Nouvelle boutique cliqué');
                setEditingStoreId(undefined);
                setIsStoreModalOpen(true);
                console.log('isStoreModalOpen mis à true:', true);
              }} 
              icon={Plus}
              className="bg-theme-primary hover:bg-theme-primary text-white"
            >
              Nouvelle boutique
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-theme-primary"></div>
          </div>
        ) : storesWithStatus && storesWithStatus.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {storesWithStatus.map((store) => (
              <Card key={store.id} className="overflow-hidden flex flex-col h-full">
                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex items-center mb-4">
                    {store.logo ? (
                      <img 
                        src={store.logo} 
                        alt={`${store.name} logo`} 
                        className="w-12 h-12 rounded-full object-cover mr-4"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-theme-primary-50 flex items-center justify-center mr-4">
                        <StoreIcon className="w-6 h-6 text-theme-primary" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{store.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{store.domaine}</p>
                    </div>
                  </div>
                  
                  <div className="mt-2 mb-4 flex-grow">
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {store.description || "Aucune description"}
                    </p>
                  </div>

                  <div className="flex flex-col space-y-3 mt-auto">
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(store.isActive ? 'active' : 'inactive')}`}>
                        {store.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Créée le {formatDate(store.createdAt)}
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                      <button
                        onClick={() => handleEditClick(store.id)}
                        className="p-2 text-gray-600 hover:text-theme-primary hover:bg-gray-100 rounded-full dark:text-gray-400 dark:hover:bg-gray-700"
                        title="Modifier les informations de base"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/dashboard/settings/stores/edit/${store.id}`)}
                        className="p-2 text-gray-600 hover:text-theme-primary hover:bg-gray-100 rounded-full dark:text-gray-400 dark:hover:bg-gray-700"
                        title="Configuration avancée"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(store.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-full dark:text-gray-400 dark:hover:bg-gray-700"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <div className="flex flex-col items-center">
              <StoreIcon className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Aucune boutique trouvée</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Vous n'avez pas encore créé de boutique. Commencez par en créer une nouvelle.
              </p>
              <Button
                variant="primary"
                onClick={() => {
                  setEditingStoreId(undefined);
                  setIsStoreModalOpen(true);
                }}
              >
                Créer une boutique
              </Button>
            </div>
          </Card>
        )}

        {/* Modale de suppression */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Supprimer la boutique"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="bg-red-100 p-3 rounded-full">
                <X className="w-6 h-6 text-red-600" />
              </div>
            </div>
            
            <p className="text-center text-gray-700 dark:text-gray-300">
              Êtes-vous sûr de vouloir supprimer la boutique <strong>{selectedStore?.name}</strong> ?
              <br />
              Cette action est irréversible.
            </p>
            
            <div className="flex justify-center space-x-3 pt-4">
              <Button 
                type="button" 
                variant="secondary"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button 
                type="button" 
                variant="danger"
                onClick={handleDeleteConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Suppression...' : 'Supprimer'}
              </Button>
            </div>
          </div>
        </Modal>
        
        {/* Modale de création/édition de boutique */}
        <StoreModal
          isOpen={isStoreModalOpen}
          onClose={() => setIsStoreModalOpen(false)}
          storeId={editingStoreId}
          onSuccess={() => {
            // Rafraîchir la liste des boutiques après création/modification
            refreshStores();
          }}
        />
      </div>
    </PageTransition>
  );
};

export default StoresPage;
