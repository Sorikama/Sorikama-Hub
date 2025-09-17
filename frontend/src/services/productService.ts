import api from './api';
import { Product } from '../types';

// Durée de validité du cache en millisecondes (5 minutes)
const CACHE_EXPIRY = 5 * 60 * 1000;

// Structure pour le cache
interface CacheItem<T> {
  data: T;
  timestamp: number;
  storeId?: string;
}

// Cache en mémoire
let productsCache: CacheItem<Product[]> | null = null;

// Variable pour gérer les requêtes simultanées
let isProductsRequestInProgress = false;

// Fonction utilitaire pour convertir un produit du format backend au format frontend
const convertBackendProductToFrontend = (backendProduct: any): Product => {
  // S'assurer que toutes les propriétés requises sont présentes
  return {
    id: backendProduct.id || '',
    name: backendProduct.title || 'Produit sans nom', // Convertir title en name
    description: backendProduct.description || '',
    price: typeof backendProduct.price === 'number' ? backendProduct.price : 0,
    promotionalPrice: typeof backendProduct.promotional_price === 'number' ? backendProduct.promotional_price : undefined,
    type: (backendProduct.type || 'downloadable') as 'downloadable' | 'course' | 'service',
    category: backendProduct.category || 'non-catégorisé',
    pricingModel: (backendProduct.pricing_model || 'one-time') as 'one-time' | 'subscription' | 'free',
    image: backendProduct.images && backendProduct.images.length > 0 ? backendProduct.images[0] : undefined,
    private_id: backendProduct.private_id || undefined, // ID privé généré à la création
    public_id: backendProduct.public_id || undefined, // ID public généré lors de la publication
    storeId: backendProduct.storeId || '',
    isActive: backendProduct.is_published !== undefined ? backendProduct.is_published : true,
    is_published: backendProduct.is_published !== undefined ? backendProduct.is_published : true, // Ajouter aussi is_published
    createdAt: backendProduct.created_at ? new Date(backendProduct.created_at) : new Date(),
    updatedAt: backendProduct.updated_at ? new Date(backendProduct.updated_at) : new Date()
  };
};

export const productService = {
  /**
   * Récupère tous les produits avec filtres optionnels
   */
  async getProducts(filters = {}, skip = 0, limit = 100): Promise<Product[]> {
    try {
      const response = await api.get('/products', { 
        params: { ...filters, skip, limit } 
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des produits:', error);
      // En cas d'erreur, retourner les produits du stockage local
      return this.getProductsFromStorage();
    }
  },

  /**
   * Récupère un produit par son ID
   */
  async getProductById(productId: string): Promise<Product> {
    try {
      const response = await api.get(`/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du produit ${productId}:`, error);
      
      // Essayer de trouver le produit dans le stockage local
      const products = this.getProductsFromStorage();
      const product = products.find(p => p.id === productId);
      
      if (product) {
        return product;
      }
      
      throw error;
    }
  },

  /**
   * Récupère les produits publics d'une boutique sans authentification
   * @param storeId ID de la boutique
   * @param page Numéro de page
   * @param limit Nombre d'éléments par page
   * @param sort Ordre de tri
   */
  async getPublicProductsByStore(storeId: string, page = 1, limit = 10, sort?: string): Promise<Product[]> {
    try {
      // Utiliser la nouvelle route publique
      const response = await fetch(`http://localhost:8000/api/public/products/store/${storeId}?page=${page}&limit=${limit}${sort ? `&sort=${sort}` : ''}`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Convertir les produits du format backend au format frontend
      const products = data.items.map(convertBackendProductToFrontend);
      
      // Mettre à jour le cache
      productsCache = {
        data: products,
        timestamp: Date.now(),
        storeId
      };
      
      // Mettre à jour le stockage local
      this.updateProductsInStorage(products);
      
      return products;
    } catch (error) {
      console.error(`Erreur lors de la récupération des produits publics pour la boutique ${storeId}:`, error);
      // En cas d'erreur, essayer de récupérer depuis le cache ou le stockage local
      if (productsCache && productsCache.storeId === storeId) {
        return productsCache.data;
      }
      return this.getProductsFromStorage().filter(p => p.storeId === storeId);
    }
  },
  
  /**
   * Récupère les produits d'une boutique spécifique
   * @param storeId ID de la boutique
   * @param forceRefresh Force le rafraîchissement du cache
   */
  async getProductsByStore(storeId: string, forceRefresh = false): Promise<Product[]> {
    // Vérifier si nous avons des données en cache valides pour cette boutique
    const now = Date.now();
    if (
      !forceRefresh &&
      productsCache &&
      productsCache.storeId === storeId &&
      now - productsCache.timestamp < CACHE_EXPIRY
    ) {
      console.log('Utilisation des données du cache pour la boutique', storeId);
      return productsCache.data;
    }
    
    // Vérifier si une requête est déjà en cours
    if (isProductsRequestInProgress) {
      console.log('Une requête est déjà en cours, utilisation du cache ou du stockage local');
      if (productsCache && productsCache.storeId === storeId) {
        return productsCache.data;
      }
      return this.getProductsFromStorage().filter(p => p.storeId === storeId);
    }
    
    isProductsRequestInProgress = true;
    
    try {
      console.log(`Appel API pour récupérer les produits de la boutique ${storeId}...`);
      const response = await api.get(`/products/store/${storeId}`);
      console.log('Réponse API reçue:', response.data);
      
      // Convertir les produits du backend au format frontend
      let frontendProducts: Product[] = [];
      
      // Vérifier la structure de la réponse
      if (response.data.items && Array.isArray(response.data.items)) {
        // Structure avec pagination {items: [...], total: X, ...}
        frontendProducts = response.data.items.map((item: any) => convertBackendProductToFrontend(item));
      } else if (Array.isArray(response.data)) {
        // Structure simple (tableau direct)
        frontendProducts = response.data.map((item: any) => convertBackendProductToFrontend(item));
      } else {
        console.error('Structure de réponse API inattendue:', response.data);
      }
      
      console.log('Produits convertis pour le frontend:', frontendProducts);
      
      // Mettre à jour le cache en mémoire
      productsCache = {
        data: frontendProducts,
        timestamp: now,
        storeId
      };
      
      // Mettre à jour le stockage local
      this.saveProductsToStorage(frontendProducts);
      
      return frontendProducts;
    } catch (error) {
      console.error(`Erreur lors de la récupération des produits pour la boutique ${storeId}:`, error);
      
      // En cas d'erreur, essayer d'utiliser le cache existant
      if (productsCache && productsCache.storeId === storeId) {
        return productsCache.data;
      }
      
      // Sinon, filtrer les produits du stockage local
      return this.getProductsFromStorage().filter(p => p.storeId === storeId);
    } finally {
      isProductsRequestInProgress = false;
    }
  },

  /**
   * Crée un nouveau produit
   */
  async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    try {
      // Vérifier le token d'authentification
      const token = localStorage.getItem('WebRichesse_token');
      console.log('Token d\'authentification disponible:', !!token);
      if (token) {
        console.log('Token JWT:', token.substring(0, 20) + '...');
      } else {
        console.error('Aucun token d\'authentification trouvé dans localStorage!');
        throw new Error('Vous devez être connecté pour créer un produit');
      }
      
      // Vérifier que l'utilisateur a accès à la boutique
      const userStr = localStorage.getItem('WebRichesse_user');
      if (!userStr) {
        throw new Error('Informations utilisateur non disponibles');
      }
      
      // Vérifier que l'utilisateur existe
      JSON.parse(userStr); // S'assurer que c'est un JSON valide
      const storeId = productData.storeId;
      
      // Vérifier si l'utilisateur a accès à cette boutique
      const stores = localStorage.getItem('WebRichesse_stores');
      if (stores) {
        const userStores = JSON.parse(stores);
        console.log('Boutiques disponibles pour l\'utilisateur:', userStores);
        console.log('Boutique cible pour le produit:', storeId);
        
        const hasAccess = userStores.some((store: any) => store.id === storeId);
        if (!hasAccess) {
          console.error(`L'utilisateur n'a pas accès à la boutique ${storeId}`);
          throw new Error('Vous n\'avez pas les permissions pour créer un produit dans cette boutique');
        } else {
          console.log('L\'utilisateur a accès à la boutique, création de produit autorisée');
        }
      } else {
        console.error('Aucune boutique trouvée dans localStorage');
        throw new Error('Aucune boutique disponible pour l\'utilisateur');
      }
      
      // S'assurer que le prix est un nombre valide
      const price = typeof productData.price === 'number' ? productData.price : Number(productData.price) || 0;
      console.log('Prix du produit avant adaptation:', productData.price, typeof productData.price);
      console.log('Prix converti:', price, typeof price);
      
      // Adapter les données au format attendu par le backend
      const adaptedData = {
        title: productData.name, // Utiliser title au lieu de name pour le backend
        description: productData.description,
        price: price, // Utiliser le prix converti
        promotional_price: productData.promotionalPrice,
        type: productData.type,
        category: productData.category,
        pricing_model: productData.pricingModel,
        // Par défaut, les produits sont créés comme dépubliés
        is_published: false, // Toujours dépublié à la création
        storeId: productData.storeId,
        // Ajouter des champs par défaut si nécessaire
        images: productData.image ? [productData.image] : [],
        is_featured: false,
        metadata: {}
      };
      
      // Afficher les données envoyées pour le débogage
      console.log('Données du produit adaptées:', JSON.stringify(adaptedData));
      
      // Vérifier que tous les champs obligatoires sont présents
      const requiredFields = ['title', 'description', 'type', 'category', 'storeId'];
      const missingFields = requiredFields.filter(field => !adaptedData[field as keyof typeof adaptedData]);
      
      // Vérifier spécifiquement le champ price qui peut être 0 (valeur falsy mais valide)
      if (adaptedData.price === undefined || adaptedData.price === null) {
        missingFields.push('price');
      }
      
      if (missingFields.length > 0) {
        console.error('Champs obligatoires manquants:', missingFields);
        throw new Error(`Champs obligatoires manquants: ${missingFields.join(', ')}`);
      }
      
      // Ajouter un slash à la fin de l'URL pour éviter la redirection 307
      const response = await api.post('/products/', adaptedData);
      
      console.log('Réponse de création de produit:', response.data);
      
      // Invalider le cache pour forcer un rechargement
      this.invalidateProductsCache();
      
      // Convertir la réponse du backend au format frontend
      const frontendProduct = convertBackendProductToFrontend(response.data);
      console.log('Produit créé converti pour le frontend:', frontendProduct);
      
      // Ajouter le nouveau produit au stockage local
      const products = this.getProductsFromStorage();
      const updatedProducts = [...products, frontendProduct];
      this.saveProductsToStorage(updatedProducts);
      
      return frontendProduct;
    } catch (error: any) {
      console.error('Erreur lors de la création du produit:', error);
      console.error('Détails de l\'erreur:', error.response?.data);
      throw error;
    }
  },

  /**
   * Met à jour un produit existant
   */
  async updateProduct(productId: string, productData: Partial<Product>): Promise<Product> {
    try {
      // Adapter les données au format attendu par le backend
      const adaptedData: Record<string, any> = {};
      
      // Mapper les propriétés du frontend vers le backend
      if (productData.name !== undefined) adaptedData.title = productData.name; // Utiliser title au lieu de name
      if (productData.description !== undefined) adaptedData.description = productData.description;
      
      // S'assurer que le prix est un nombre valide
      if (productData.price !== undefined) {
        const price = typeof productData.price === 'number' ? productData.price : Number(productData.price) || 0;
        adaptedData.price = price;
      }
      
      if (productData.promotionalPrice !== undefined) adaptedData.promotional_price = productData.promotionalPrice;
      if (productData.type !== undefined) adaptedData.type = productData.type;
      if (productData.category !== undefined) adaptedData.category = productData.category;
      if (productData.pricingModel !== undefined) adaptedData.pricing_model = productData.pricingModel;
      if (productData.isActive !== undefined) adaptedData.is_published = productData.isActive;
      if (productData.image !== undefined) adaptedData.images = productData.image ? [productData.image] : [];
      
      console.log(`Données adaptées pour la mise à jour du produit ${productId}:`, adaptedData);
      
      const response = await api.put(`/products/${productId}`, adaptedData);
      
      // Invalider le cache pour forcer un rechargement
      this.invalidateProductsCache();
      
      // Convertir la réponse du backend au format frontend
      const frontendProduct = convertBackendProductToFrontend(response.data);
      console.log('Produit mis à jour converti pour le frontend:', frontendProduct);
      
      // Mettre à jour le produit dans le stockage local
      const products = this.getProductsFromStorage();
      const updatedProducts = products.map(product => 
        product.id === productId ? frontendProduct : product
      );
      this.saveProductsToStorage(updatedProducts);
      
      return frontendProduct;
    } catch (error: any) {
      console.error(`Erreur lors de la mise à jour du produit ${productId}:`, error);
      console.error('Détails de l\'erreur:', error.response?.data);
      throw error;
    }
  },

  /**
   * Supprime un produit
   */
  async deleteProduct(productId: string): Promise<boolean> {
    try {
      await api.delete(`/products/${productId}`);
      
      // Invalider le cache pour forcer un rechargement
      this.invalidateProductsCache();
      
      // Supprimer le produit du stockage local
      const products = this.getProductsFromStorage();
      const updatedProducts = products.filter(product => product.id !== productId);
      this.saveProductsToStorage(updatedProducts);
      
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression du produit ${productId}:`, error);
      throw error;
    }
  },

  /**
   * Invalide le cache des produits
   */
  invalidateProductsCache(): void {
    productsCache = null;
    console.log('Cache des produits invalidé');
  },

  /**
   * Récupère les produits depuis le stockage local
   */
  getProductsFromStorage(): Product[] {
    try {
      const storedProducts = localStorage.getItem('WebRichesse_products');
      if (storedProducts) {
        return JSON.parse(storedProducts);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des produits depuis le stockage local:', error);
    }
    return [];
  },

  /**
   * Sauvegarde les produits dans le stockage local
   */
  saveProductsToStorage(products: Product[]): void {
    localStorage.setItem('WebRichesse_products', JSON.stringify(products));
  },

  /**
   * Met à jour les produits dans le stockage local
   * Conserve les produits existants qui ne sont pas dans la nouvelle liste
   */
  updateProductsInStorage(newProducts: Product[]): void {
    const existingProducts = this.getProductsFromStorage();
    const storeId = newProducts.length > 0 ? newProducts[0].storeId : null;
    
    // Filtrer les produits existants pour garder ceux qui ne sont pas de la même boutique
    const otherStoreProducts = storeId 
      ? existingProducts.filter(p => p.storeId !== storeId) 
      : existingProducts;
    
    // Combiner avec les nouveaux produits
    const updatedProducts = [...otherStoreProducts, ...newProducts];
    this.saveProductsToStorage(updatedProducts);
  },

  /**
   * Met à jour le fichier d'un produit
   */
  async updateProductFile(productId: string, fileData: any): Promise<Product> {
    try {
      const response = await api.post(`/products/upload`, { 
        product_id: productId,
        file_data: fileData
      });
      
      // Invalider le cache pour forcer un rechargement
      this.invalidateProductsCache();
      
      return response.data.product;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du fichier pour le produit ${productId}:`, error);
      throw error;
    }
  },

  /**
   * Met à jour la structure d'un cours
   */
  async updateCourseStructure(productId: string, courseData: any): Promise<any> {
    try {
      const response = await api.put(`/products/${productId}/course-structure`, courseData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la structure du cours ${productId}:`, error);
      throw error;
    }
  },

  /**
   * Récupère la structure d'un cours
   */
  async getCourseStructure(productId: string): Promise<any> {
    try {
      const response = await api.get(`/products/${productId}/course-structure`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la structure du cours ${productId}:`, error);
      throw error;
    }
  }
};

export default productService;