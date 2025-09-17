import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Edit, Trash2, Eye, Search, Filter, Package, Share, Copy, EyeOff, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { DataGrid } from '../../components/ui/DataGrid';
import { Input } from '../../components/ui/Input';
import { Dropdown, DropdownItem } from '../../components/ui/Dropdown';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { ProductForm } from '../../components/products/ProductForm';
import { ShareProductModal } from '../../components/products/ShareProductModal';
import { useStore } from '../../contexts/StoreContext';
import { useProducts } from '../../contexts/ProductContext';
import { Product } from '../../types';

export const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedStore } = useStore();
  const { getProductsByStore, updateProduct, deleteProduct, createProduct, refreshProducts, error, isLoading } = useProducts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [productToShare, setProductToShare] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // État pour la pagination avec persistance via localStorage
  const [currentPage, setCurrentPage] = useState(() => {
    // Récupérer la page courante depuis localStorage si elle existe
    const savedPage = localStorage.getItem(`WebRichesse_pagination_${selectedStore?.id}`);
    return savedPage ? parseInt(savedPage, 10) : 1;
  });
  const itemsPerPage = 6; // 6 éléments par page
  
  // État pour le tri des colonnes
  const [sortConfig, setSortConfig] = useState<{ key: keyof Product | string; direction: 'asc' | 'desc' | null }>(() => {
    // Récupérer la configuration de tri depuis localStorage si elle existe
    const savedSort = localStorage.getItem(`WebRichesse_sort_${selectedStore?.id}`);
    return savedSort ? JSON.parse(savedSort) : { key: 'createdAt', direction: 'desc' };
  });
  
  // Sauvegarder la page courante dans localStorage quand elle change
  useEffect(() => {
    if (selectedStore) {
      localStorage.setItem(`WebRichesse_pagination_${selectedStore.id}`, currentPage.toString());
    }
  }, [currentPage, selectedStore]);
  
  // Sauvegarder la configuration de tri dans localStorage quand elle change
  useEffect(() => {
    if (selectedStore) {
      localStorage.setItem(`WebRichesse_sort_${selectedStore.id}`, JSON.stringify(sortConfig));
    }
  }, [sortConfig, selectedStore]);
  
  // Gérer le changement de tri
  const handleSort = (key: keyof Product | string, direction: 'asc' | 'desc' | null) => {
    setSortConfig({ key, direction });
    // Revenir à la première page lors d'un changement de tri
    setCurrentPage(1);
  };
  
  // État pour le modal de confirmation
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    onConfirm: () => {},
    product: null as Product | null
  });

  const products = selectedStore ? getProductsByStore(selectedStore.id) : [];
  
  // Ajouter un log pour vérifier les produits reçus
  useEffect(() => {
    console.log('Produits disponibles dans ProductsPage:', products);
  }, [products]);
  
  // Rafraîchir les produits quand la boutique sélectionnée change
  // Utiliser une référence pour éviter les appels multiples
  const storeIdRef = React.useRef<string | null>(null);
  
  useEffect(() => {
    if (selectedStore && selectedStore.id !== storeIdRef.current) {
      storeIdRef.current = selectedStore.id;
      console.log('Rafraîchissement des produits pour la boutique:', selectedStore.id);
      
      // Récupérer la page sauvegardée pour cette boutique ou utiliser la page 1
      const savedPage = localStorage.getItem(`WebRichesse_pagination_${selectedStore.id}`);
      if (savedPage) {
        setCurrentPage(parseInt(savedPage, 10));
      } else {
        setCurrentPage(1); // Réinitialiser la pagination si pas de page sauvegardée
      }
      
      refreshProducts(selectedStore.id);
    }
  }, [selectedStore, refreshProducts]);
  
  // Afficher les erreurs avec toast
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Filter products based on search and type
  const filteredProducts = products.filter(product => {
    // Vérifier que le produit existe
    if (!product) {
      console.warn('Produit null ou undefined détecté');
      return false;
    }
    
    // Vérifier les propriétés requises
    const name = product.name || '';
    const description = product.description || '';
    const type = product.type || 'downloadable';
    
    // Appliquer les filtres
    const matchesSearch = searchTerm === '' || 
                         name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || type === filterType;
    
    return matchesSearch && matchesType;
  });
  
  // Trier les produits en fonction de la configuration de tri
  const sortedProducts = React.useMemo(() => {
    if (!sortConfig.key || sortConfig.direction === null) {
      return [...filteredProducts]; // Pas de tri
    }
    
    return [...filteredProducts].sort((a, b) => {
      const key = sortConfig.key as keyof Product;
      const aValue = a[key];
      const bValue = b[key];
      
      // Si l'une des valeurs est undefined ou null, la traiter comme une valeur vide
      if (aValue === undefined || aValue === null) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (bValue === undefined || bValue === null) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      
      if (aValue === bValue) return 0;
      
      // Gérer les différents types de données
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      // Pour les dates
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortConfig.direction === 'asc'
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }
      
      // Pour les nombres et autres types
      return sortConfig.direction === 'asc'
        ? (aValue < bValue ? -1 : 1)
        : (aValue < bValue ? 1 : -1);
    });
  }, [filteredProducts, sortConfig]);
  
  // Calculer le nombre total de pages
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  
  // Obtenir les produits pour la page actuelle
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Gérer le changement de page
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // La sauvegarde dans localStorage est gérée par l'useEffect qui surveille currentPage
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    // Réinitialiser la pagination lors d'une recherche mais ne pas sauvegarder cette réinitialisation
    // car elle est liée au filtre et non à la navigation
    setCurrentPage(1);
    if (selectedStore) {
      localStorage.removeItem(`WebRichesse_pagination_${selectedStore.id}`);
    }
  };

  const handleFilterChange = (type: string) => {
    setFilterType(type);
    // Réinitialiser la pagination lors d'un changement de filtre mais ne pas sauvegarder cette réinitialisation
    // car elle est liée au filtre et non à la navigation
    setCurrentPage(1);
    if (selectedStore) {
      localStorage.removeItem(`WebRichesse_pagination_${selectedStore.id}`);
    }
  };

  const handleCreateProduct = () => {
    setSelectedProduct(undefined);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    navigate(`/dashboard/products/${product.id}/edit`);
  };

  const handleDeleteProduct = (product: Product) => {
    setConfirmationModal({
      isOpen: true,
      title: 'Supprimer le produit',
      message: `Êtes-vous sûr de vouloir supprimer "${product.name}" ? Cette action est irréversible.`,
      confirmText: 'Supprimer',
      onConfirm: async () => {
        try {
          setIsSubmitting(true);
          await deleteProduct(product.id);
          toast.success(`Produit "${product.name}" supprimé avec succès`);
          refreshProducts(selectedStore?.id || '');
        } catch (error: any) {
          const errorMessage = error.response?.data?.detail || 'Erreur lors de la suppression du produit';
          toast.error(errorMessage);
          console.error('Erreur lors de la suppression du produit:', error);
        } finally {
          setIsSubmitting(false);
          // Fermer le modal
          setConfirmationModal(prev => ({ ...prev, isOpen: false }));
        }
      },
      product: product
    });
  };

  // Fonction pour ouvrir le modal de confirmation de publication/dépublication
  const handleToggleStatus = (product: Product) => {
    const isPublishing = !product.isActive;
    
    setConfirmationModal({
      isOpen: true,
      title: isPublishing ? 'Publier le produit' : 'Dépublier le produit',
      message: isPublishing 
        ? 'Êtes-vous sûr de vouloir publier ce produit ? Il sera visible par tous les visiteurs de votre boutique.'
        : 'Êtes-vous sûr de vouloir dépublier ce produit ? Il ne sera plus visible par les visiteurs de votre boutique.',
      confirmText: isPublishing ? 'Publier' : 'Dépublier',
      onConfirm: async () => {
        try {
          setIsSubmitting(true);
          const updatedProduct = await updateProduct(product.id, { isActive: !product.isActive });
          
          if (updatedProduct.isActive) {
            // Si le produit est publié, informer l'utilisateur sur la génération de l'URL
            toast.success(
              updatedProduct.public_id
                ? `Produit publié avec succès ! Une URL unique a été générée pour ce produit.`
                : `Produit publié avec succès !`
            );
          } else {
            // Si le produit est dépublié, informer l'utilisateur sur la suppression de l'URL
            toast.success(`Produit dépublié avec succès. L'URL de prévisualisation n'est plus accessible.`);
          }
          
          refreshProducts(selectedStore?.id || '');
        } catch (error: any) {
          const errorMessage = error.response?.data?.detail || 'Erreur lors de la mise à jour du statut';
          toast.error(errorMessage);
        } finally {
          setIsSubmitting(false);
          // Fermer le modal
          setConfirmationModal(prev => ({ ...prev, isOpen: false }));
        }
      },
      product: product
    });
  };

  const handleViewProduct = (product: Product) => {
    // Déterminer l'URL à utiliser
    let productUrl;
    
    // Pour les produits non publiés, utiliser le private_id
    if (!product.is_published) {
      // Utiliser private_id pour les produits non publiés
      const id = product.private_id || product.id;
      productUrl = `${window.location.origin}/${selectedStore?.domaine}/product/${id}?preview=true`;
    }
    // Pour les produits publiés, utiliser l'URL normale
    else {
      // Si une URL personnalisée existe, l'utiliser
      if (product.custom_url) {
        productUrl = `${window.location.origin}/${selectedStore?.domaine}/${product.custom_url}`;
      } 
      // Sinon, utiliser public_id si disponible
      else if (product.public_id) {
        productUrl = `${window.location.origin}/${selectedStore?.domaine}/product/${product.public_id}`;
      }
      // Fallback sur l'ID du produit si aucune URL spécifique n'est disponible
      else {
        productUrl = `${window.location.origin}/${selectedStore?.domaine}/product/${product.id}`;
      }
    }
    
    // Ouvrir l'aperçu du produit dans un nouvel onglet
    window.open(productUrl, '_blank');
  };

  const handleShareProduct = (product: Product) => {
    // Vérifier si le produit est publié
    if (!product.is_published) {
      toast.error('Ce produit n\'est pas publié. Vous ne pouvez pas partager un produit non publié.');
      return;
    }
    
    setProductToShare(product);
    setShareModalOpen(true);
  };

  const handleDuplicateProduct = (product: Product) => {
    setConfirmationModal({
      isOpen: true,
      title: 'Dupliquer le produit',
      message: `Êtes-vous sûr de vouloir créer une copie du produit "${product.name}" ?`,
      confirmText: 'Dupliquer',
      onConfirm: async () => {
        try {
          setIsSubmitting(true);
          
          const duplicatedProduct = {
            ...product,
            name: `${product.name} (Copie)`,
            id: undefined,
            createdAt: undefined,
            updatedAt: undefined
          };
          
          // Supprimer les propriétés qui ne doivent pas être copiées
          delete (duplicatedProduct as any).id;
          delete (duplicatedProduct as any).createdAt;
          delete (duplicatedProduct as any).updatedAt;
          
          await createProduct(duplicatedProduct);
          toast.success(`Produit "${product.name}" dupliqué avec succès !`);
          refreshProducts(selectedStore?.id || '');
        } catch (error: any) {
          const errorMessage = error.response?.data?.detail || 'Erreur lors de la duplication du produit';
          toast.error(errorMessage);
          console.error('Erreur lors de la duplication du produit:', error);
        } finally {
          setIsSubmitting(false);
          // Fermer le modal
          setConfirmationModal(prev => ({ ...prev, isOpen: false }));
        }
      },
      product: product
    });
  };

  const handleFormSubmit = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsSubmitting(true);
    try {
      if (selectedProduct) {
        const updatedProduct = await updateProduct(selectedProduct.id, productData);
        toast.success(`Produit "${updatedProduct.name}" mis à jour avec succès!`);
      } else {
        // selectedStore ne peut pas être null ici car cette fonction n'est appelée que lorsqu'une boutique est sélectionnée
        const newProduct = await createProduct({
          ...productData,
          storeId: selectedStore?.id || productData.storeId
        });
        toast.success(`Produit "${newProduct.name}" créé avec succès!`);
        // Réinitialiser la pagination pour afficher la première page après création
        setCurrentPage(1);
      }
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Erreur lors de l\'enregistrement du produit:', error);
      
      // Gérer les différents formats d'erreur possibles
      let errorMessage = 'Erreur lors de l\'enregistrement du produit';
      
      if (typeof error.response?.data?.detail === 'string') {
        errorMessage = error.response.data.detail;
      } else if (Array.isArray(error.response?.data?.detail)) {
        // Si c'est un tableau d'erreurs de validation Pydantic
        errorMessage = error.response.data.detail.map((err: any) => 
          `${err.loc.join('.')}: ${err.msg}`
        ).join(', ');
      }
      
      toast.error(errorMessage);
      // Ne pas fermer le modal en cas d'erreur pour permettre à l'utilisateur de corriger
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'downloadable': return 'Téléchargeable';
      case 'course': return 'Cours';
      case 'service': return 'Service';
      default: return type;
    }
  };

  const getPricingLabel = (pricingModel: string) => {
    switch (pricingModel) {
      case 'one-time': return 'Paiement unique';
      case 'subscription': return 'Abonnement';
      case 'free': return 'Gratuit';
      default: return pricingModel;
    }
  };

  const columns = [
    { 
      key: 'name', 
      header: 'Nom du produit',
      sortable: true,
      render: (product: Product) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{getTypeLabel(product.type)}</p>
        </div>
      )
    },
    { 
      key: 'price', 
      header: 'Prix',
      sortable: true,
      render: (product: Product) => {
        // S'assurer que le prix est un nombre valide
        const price = typeof product.price === 'number' ? product.price : 0;
        const promoPrice = typeof product.promotionalPrice === 'number' ? product.promotionalPrice : undefined;
        
        // Calculer le pourcentage de réduction si un prix promotionnel est défini
        const discountPercentage = promoPrice && price > 0 ? Math.round((1 - promoPrice / price) * 100) : 0;
        
        return (
          <div>
            {product.pricingModel === 'free' || price === 0 ? (
              <span className="text-green-600 dark:text-green-400 font-medium">Gratuit</span>
            ) : (
              <div>
                {promoPrice ? (
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <span className="line-through text-gray-500 text-sm">{price.toLocaleString()} F CFA</span>
                      {discountPercentage > 0 && (
                        <span className="ml-2 px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium rounded">
                          -{discountPercentage}%
                        </span>
                      )}
                    </div>
                    <div className="font-medium text-red-600 dark:text-red-400">
                      {promoPrice.toLocaleString()} F CFA
                    </div>
                  </div>
                ) : (
                  <div className="font-medium text-gray-900 dark:text-white">
                    {price.toLocaleString()} F CFA
                  </div>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{getPricingLabel(product.pricingModel)}</p>
              </div>
            )}
          </div>
        );
      }
    },
    { 
      key: 'category', 
      header: 'Catégorie',
      sortable: true,
      render: (product: Product) => (
        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-xs">
          {product.category}
        </span>
      )
    },
    { 
      key: 'isActive', 
      header: 'Status',
      sortable: true,
      render: (product: Product) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          product.isActive 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
        }`}>
          {product.isActive ? 'Publié' : 'Dépublié'}
        </span>
      )
    },
    { 
      key: 'createdAt', 
      header: 'Date de création',
      sortable: true,
      render: (product: Product) => new Date(product.createdAt).toLocaleDateString('fr-FR') 
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '100px', // Largeur fixe pour la colonne d'actions
      sortable: false, // La colonne d'actions ne doit pas être triable
      render: (product: Product) => (
        <div className="flex items-center justify-center w-full">
          {/* Menu d'actions avec trois points */}
          <Dropdown 
            trigger={
              <button className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            }
          >
            {/* Publier/Dépublier */}
            <DropdownItem 
              onClick={() => handleToggleStatus(product)}
              icon={product.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              className={product.isActive ? 'text-orange-600' : 'text-green-600'}
            >
              {product.isActive ? 'Dépublier' : 'Publier'}
            </DropdownItem>
            
            {/* Voir */}
            <DropdownItem 
              onClick={() => handleViewProduct(product)}
              icon={<Eye className="w-4 h-4" />}
              className="text-indigo-600"
            >
              Voir              
            </DropdownItem>
            
            {/* Modifier */}
            <DropdownItem 
              onClick={() => handleEditProduct(product)}
              icon={<Edit className="w-4 h-4" />}
              className="text-yellow-600"
            >
              Modifier
            </DropdownItem>
            
            {/* Partager */}
            <DropdownItem 
              onClick={() => handleShareProduct(product)}
              icon={<Share className="w-4 h-4" />}
              className={`${product.isActive ? 'text-blue-600' : 'text-gray-400 cursor-not-allowed'}`}
              disabled={!product.isActive}
            >
              {product.isActive ? 'Partager' : 'Non partageable'}
            </DropdownItem>
            
            {/* Dupliquer */}
            <DropdownItem 
              onClick={() => handleDuplicateProduct(product)}
              icon={<Copy className="w-4 h-4" />}
              className="text-purple-600"
            >
              Dupliquer
            </DropdownItem>
            
            {/* Supprimer */}
            <DropdownItem 
              onClick={() => handleDeleteProduct(product)}
              icon={<Trash2 className="w-4 h-4" />}
              className="text-red-600"
            >
              Supprimer
            </DropdownItem>
          </Dropdown>
        </div>
      )
    }
  ];

  if (!selectedStore) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          Veuillez sélectionner une boutique pour gérer vos produits
        </p>
      </div>
    );
  }

  // État vide - Aucun produit
  if (products.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Produits</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gérez vos produits numériques pour {selectedStore.name}
            </p>
          </div>
        </div>

        {/* Message d'encouragement */}
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="text-center max-w-md">
            <div className="mb-6">
              <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Le premier pas vers vos revenus en ligne commence ici.
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              Créez votre premier produit et partagez-le avec le monde !
            </p>
            
            <Button 
              size="lg"
              icon={Plus} 
              onClick={handleCreateProduct}
              className="px-8 py-3"
            >
              Créer un produit
            </Button>
          </div>
        </div>

        <ProductForm
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleFormSubmit}
          initialData={selectedProduct}
          storeId={selectedStore.id}
          isSubmitting={isSubmitting}
        />
      </div>
    );
  }

  // État avec produits - Affichage du tableau
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Produits</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gérez vos produits numériques pour {selectedStore.name}
          </p>
        </div>
        <Button 
          icon={Plus} 
          onClick={handleCreateProduct}
        >
          Ajouter un produit
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Rechercher des produits..."
            value={searchTerm}
            onChange={handleSearchChange}
            icon={Search}
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="all">Tous les types</option>
            <option value="downloadable">Téléchargeable</option>
            <option value="course">Cours</option>
            <option value="service">Service</option>
          </select>
          <Button variant="secondary" icon={Filter}>
            Filtres
          </Button>
        </div>
      </div>

      {/* Products Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total produits</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{products.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Produits publiés</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {products.filter(p => p.isActive).length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Produits dépubliés</p>
          <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
            {products.filter(p => !p.isActive).length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Prix moyen</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {products.length > 0 
              ? Math.round(products.reduce((sum, p) => sum + p.price, 0) / products.length)
              : 0
            } F CFA
          </p>
        </div>
      </div>

      {/* Afficher un indicateur de chargement ou la grille de données */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Chargement des produits...</span>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden mt-6">
          <DataGrid 
            data={paginatedProducts} 
            columns={columns} 
            emptyMessage="Aucun produit trouvé avec les filtres actuels."
            initialSortKey={sortConfig.key}
            initialSortDirection={sortConfig.direction}
            onSort={handleSort}
          />
          
          {/* Pagination */}
          {filteredProducts.length > 0 && (
            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  Précédent
                </button>
                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  Suivant
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Affichage de <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> à{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, filteredProducts.length)}
                    </span>{' '}
                    sur <span className="font-medium">{filteredProducts.length}</span> produits
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                    >
                      <span className="sr-only">Précédent</span>
                      &larr;
                    </button>
                    
                    {/* Afficher les numéros de page */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === currentPage
                            ? 'z-10 bg-blue-50 dark:bg-blue-900 border-blue-500 dark:border-blue-700 text-blue-600 dark:text-blue-300'
                            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                    >
                      <span className="sr-only">Suivant</span>
                      &rarr;
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Modal de confirmation */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        title={confirmationModal.title}
        message={confirmationModal.message}
        confirmText={confirmationModal.confirmText}
        onConfirm={confirmationModal.onConfirm}
        onCancel={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
        isDestructive={confirmationModal.confirmText === 'Dépublier' || confirmationModal.confirmText === 'Supprimer'}
      />
      
      <ProductForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedProduct}
        storeId={selectedStore?.id || ''}
        isSubmitting={isSubmitting}
      />
      
      {/* Modal de partage */}
      {shareModalOpen && productToShare && (
        <ShareProductModal
          isOpen={shareModalOpen}
          onClose={() => {
            setShareModalOpen(false);
            setProductToShare(null);
          }}
          product={productToShare}
          storeDomain={selectedStore?.domaine || ''}
        />
      )}
    </div>
  );
};