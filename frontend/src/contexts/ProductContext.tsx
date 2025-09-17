import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../types';
import { useAuth } from './AuthContext';
import { useStore } from './StoreContext';
import productService from '../services/productService';

interface ProductContextType {
  products: Product[];
  createProduct: (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Product>;
  updateProduct: (id: string, productData: Partial<Product>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<boolean>;
  getProductsByStore: (storeId: string) => Product[];
  refreshProducts: (storeId: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

interface ProductProviderProps {
  children: ReactNode;
}

export const ProductProvider: React.FC<ProductProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { selectedStore } = useStore();

  useEffect(() => {
    if (user) {
      // Charger les produits depuis le stockage local en attendant l'API
      const storedProducts = productService.getProductsFromStorage();
      setProducts(storedProducts);
      setIsLoading(false);
    }
  }, [user]);

  // Charger les produits depuis l'API quand la boutique sélectionnée change
  useEffect(() => {
    if (user && selectedStore) {
      refreshProducts(selectedStore.id);
    }
  }, [user, selectedStore]);

  // Fonction pour rafraîchir les produits depuis l'API
  const refreshProducts = async (storeId: string) => {
    if (!storeId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const fetchedProducts = await productService.getProductsByStore(storeId, true);
      setProducts(fetchedProducts);
    } catch (err) {
      console.error('Erreur lors du chargement des produits:', err);
      setError('Impossible de charger les produits. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const createProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newProduct = await productService.createProduct(productData);
      
      // Forcer un rafraîchissement complet depuis l'API pour s'assurer que tous les produits sont à jour
      if (productData.storeId) {
        console.log('Rafraîchissement des produits après création...');
        // Forcer un rafraîchissement complet en invalidant le cache
        productService.invalidateProductsCache();
        // Récupérer les produits mis à jour avec forceRefresh=true
        await refreshProducts(productData.storeId);
      } else {
        // Fallback au comportement précédent si storeId n'est pas disponible
        setProducts(prev => [...prev, newProduct]);
      }
      
      return newProduct;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Erreur lors de la création du produit';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedProduct = await productService.updateProduct(id, productData);
      setProducts(prev => 
        prev.map(product => product.id === id ? updatedProduct : product)
      );
      return updatedProduct;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || `Erreur lors de la mise à jour du produit ${id}`;
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await productService.deleteProduct(id);
      setProducts(prev => prev.filter(product => product.id !== id));
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || `Erreur lors de la suppression du produit ${id}`;
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getProductsByStore = (storeId: string) => {
    // Filtrer les produits par storeId et ajouter des logs pour débogage
    const filteredProducts = products.filter(product => {
      if (!product) return false;
      const match = product.storeId === storeId;
      return match;
    });
    
    console.log(`getProductsByStore(${storeId}): ${filteredProducts.length} produits trouvés sur ${products.length} total`);
    return filteredProducts;
  };

  return (
    <ProductContext.Provider value={{
      products,
      createProduct,
      updateProduct,
      deleteProduct,
      getProductsByStore,
      refreshProducts,
      isLoading,
      error
    }}>
      {children}
    </ProductContext.Provider>
  );
};