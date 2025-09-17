import React, { useEffect, useState, useMemo } from 'react';
import { Store, Product } from '../../types';
import { productService } from '../../services/productService';
import { StoreHeader } from './StoreHeader';
import { ProductGrid } from './ProductGrid';
import { ProductCard } from './ProductCard';
import { StoreFooter } from './StoreFooter';
import { Search } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface StorePreviewProps {
  store: Store;
}

export const StorePreview: React.FC<StorePreviewProps> = ({ store }) => {
  useTheme(); // Utiliser le contexte de thème pour accéder aux fonctionnalités de thème
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('newest');
  // Pas besoin de showFilters car la sidebar est toujours visible
  
  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const productsPerPage = 6;
  
  // Filtres
  const [priceRange, setPriceRange] = useState<{min: number, max: number | null}>({min: 0, max: null});
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showFreeOnly, setShowFreeOnly] = useState<boolean>(false);
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Récupérer tous les produits publiés de la boutique sans authentification
        const response = await productService.getPublicProductsByStore(store.id);
        console.log('Produits bruts reçus de l\'API:', response);
        console.log('Exemple de produit:', response[0]);
        const publishedProducts = response.filter(product => product.isActive === true);
        setAllProducts(publishedProducts);
        setFilteredProducts(publishedProducts); // Initialiser filteredProducts avec tous les produits
        setProducts(publishedProducts);
        setError(null);
      } catch (err) {
        console.error('Erreur lors de la récupération des produits:', err);
        setError('Impossible de charger les produits. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [store.id]);
  
  // Extraire les catégories uniques des produits
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    allProducts.forEach(product => {
      if (product.category) {
        uniqueCategories.add(product.category);
      }
    });
    return Array.from(uniqueCategories).sort();
  }, [allProducts]);
  
  // Extraire le prix maximum des produits
  const maxPrice = useMemo(() => {
    if (allProducts.length === 0) return 0;
    return Math.max(...allProducts.map(product => product.price));
  }, [allProducts]);
  
  // Filtrer et trier les produits
  useEffect(() => {
    let filtered = [...allProducts];
    
    // Appliquer la recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) || 
        (product.description && product.description.toLowerCase().includes(query))
      );
    }
    
    // Appliquer le filtre de catégorie
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    // Appliquer le filtre de produits gratuits
    if (showFreeOnly) {
      console.log('Filtrage des produits gratuits activé');
      console.log('Produits avant filtrage:', filtered.length);
      console.log('Prix des produits:', filtered.map(p => p.price).slice(0, 10));
      
      // Vérifier si le prix est 0 ou si le modèle de tarification est 'free'
      filtered = filtered.filter(product => {
        const isFree = product.price === 0 || product.pricingModel === 'free';
        return isFree;
      });
      
      console.log('Produits gratuits trouvés:', filtered.length);
      console.log('Prix des produits gratuits:', filtered.map(p => p.price).slice(0, 5));
    }
    // Appliquer le filtre de prix (seulement si on ne montre pas uniquement les produits gratuits)
    else if (priceRange.min > 0 || priceRange.max !== null) {
      filtered = filtered.filter(product => {
        const price = product.promotionalPrice || product.price;
        return price >= priceRange.min && (priceRange.max === null || price <= priceRange.max);
      });
    }
    
    // Appliquer le tri
    switch (sortOption) {
      case 'price_asc':
        filtered.sort((a, b) => {
          const priceA = a.promotionalPrice || a.price;
          const priceB = b.promotionalPrice || b.price;
          return priceA - priceB;
        });
        break;
      case 'price_desc':
        filtered.sort((a, b) => {
          const priceA = a.promotionalPrice || a.price;
          const priceB = b.promotionalPrice || b.price;
          return priceB - priceA;
        });
        break;
      case 'newest':
        filtered.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'oldest':
        filtered.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case 'name_asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }
    
    // Sauvegarder les produits filtrés
    setFilteredProducts(filtered);
    
    // Réinitialiser la page courante si les filtres changent
    setCurrentPage(1);
  }, [allProducts, searchQuery, sortOption, selectedCategory, priceRange, showFreeOnly]);
  
  // Appliquer la pagination
  useEffect(() => {
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    console.log('Produits filtrés total:', filteredProducts.length);
    console.log('Produits affichés (page courante):', currentProducts.length);
    console.log('Page courante:', currentPage, 'sur', Math.ceil(filteredProducts.length / productsPerPage));
    setProducts(currentProducts);
  }, [filteredProducts, currentPage, productsPerPage]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };
  
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value);
  };
  
  // Appliquer le thème de la boutique
  const storeTheme = {
    primaryColor: store.theme?.primary_color || '#3B82F6',
    secondaryColor: store.theme?.secondary_color || '#1E40AF',
    accentColor: store.theme?.accent_color || '#DBEAFE',
    fontFamily: store.theme?.font_family || 'Inter, sans-serif',
    logoPosition: store.theme?.logo_position || 'left',
    heroLayout: store.theme?.hero_layout || 'centered',
    productLayout: store.theme?.product_layout || 'grid'
  };
  
  return (
    <div 
      className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors duration-300"
      style={{ 
        fontFamily: storeTheme.fontFamily,
        '--primary-color': storeTheme.primaryColor,
        '--secondary-color': storeTheme.secondaryColor,
        '--accent-color': storeTheme.accentColor,
      } as React.CSSProperties}
    >
      {/* En-tête de la boutique */}
      <StoreHeader 
        store={store} 
        logoPosition={storeTheme.logoPosition}
      />
      
      {/* Contenu principal */}
      <main className="flex-grow container mx-auto px-3 sm:px-4 py-6 sm:py-8 transition-colors duration-300 border-t border-gray-100 dark:border-gray-800">
        {/* Hero Section */}
        <section className={`mb-12 ${storeTheme.heroLayout === 'centered' ? 'text-center' : ''}`}>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white transition-colors">
            {store.name}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto transition-colors">
            {store.description}
          </p>
        </section>
        
        {/* Barre de recherche principale */}
        <div className="mb-6 sm:mb-8">
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un produit..."
              className="w-full py-2 sm:py-3 px-4 sm:px-5 pr-10 sm:pr-12 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-light transition-colors shadow-sm text-sm sm:text-base"
            />
            <button 
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light transition-colors"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </form>
        </div>
        
        {/* Section des produits avec sidebar */}
        <section className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Sidebar pour les filtres */}
          <div className="w-full lg:w-64 shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4 sticky top-20 transition-colors duration-300 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors">
                Filtres
              </h3>
              
              {/* Sélecteur de tri */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Trier par
                </label>
                <select
                  value={sortOption}
                  onChange={handleSortChange}
                  className="w-full py-2 px-3 rounded-md border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-light transition-colors"
                >
                  <option value="newest">Plus récents</option>
                  <option value="oldest">Plus anciens</option>
                  <option value="price_asc">Prix croissant</option>
                  <option value="price_desc">Prix décroissant</option>
                  <option value="name_asc">Nom (A-Z)</option>
                  <option value="name_desc">Nom (Z-A)</option>
                </select>
              </div>
              
              {/* Filtre par catégorie */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Catégorie
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full py-2 px-3 rounded-md border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-light transition-colors"
                >
                  <option value="">Toutes les catégories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              {/* Filtre pour produits gratuits */}
              <div className="mb-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="freeOnly"
                    checked={showFreeOnly}
                    onChange={(e) => setShowFreeOnly(e.target.checked)}
                    className="h-5 w-5 text-primary focus:ring-primary border-2 border-gray-200 dark:border-gray-600 rounded transition-colors cursor-pointer"
                  />
                  <label htmlFor="freeOnly" className="ml-2 block text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                    Produits gratuits uniquement
                  </label>
                </div>
              </div>
              
              {/* Filtre par prix */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prix
                </label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>0 XOF</span>
                    <span>{maxPrice.toLocaleString()} XOF</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="0"
                      max={maxPrice}
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({...priceRange, min: parseInt(e.target.value) || 0})}
                      placeholder="Min"
                      disabled={showFreeOnly}
                      className={`w-full py-2 px-2 sm:px-3 rounded-md border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-light transition-colors text-sm ${showFreeOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                      inputMode="numeric"
                    />
                    <span className="text-gray-500 dark:text-gray-400">-</span>
                    <input
                      type="number"
                      min="0"
                      max={maxPrice}
                      value={priceRange.max === null ? '' : priceRange.max}
                      onChange={(e) => setPriceRange({...priceRange, max: e.target.value === '' ? null : parseInt(e.target.value) || 0})}
                      placeholder="Max"
                      disabled={showFreeOnly}
                      className={`w-full py-2 px-2 sm:px-3 rounded-md border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-light transition-colors text-sm ${showFreeOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                      inputMode="numeric"
                    />
                  </div>
                </div>
              </div>
              
              {/* Bouton de réinitialisation des filtres */}
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setPriceRange({min: 0, max: null});
                  setSearchQuery('');
                  setSortOption('newest');
                  setShowFreeOnly(false);
                }}
                className="w-full py-3 px-4 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors font-medium text-sm active:bg-gray-300 dark:active:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 border border-gray-300 dark:border-gray-700"
              >
                Réinitialiser les filtres
              </button>
            </div>
          </div>
          
          {/* Contenu principal - Liste des produits */}
          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-700 dark:text-red-400 transition-colors border border-red-100 dark:border-red-900/30">
                {error}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400 transition-colors">
                {searchQuery ? `Aucun produit ne correspond à "${searchQuery}"` : 'Aucun produit disponible pour le moment.'}
              </div>
            ) : (
              <div>
                <div className="mb-4 text-sm text-gray-600 dark:text-gray-300 transition-colors">
                  {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''}
                </div>
                <ProductGrid layout={storeTheme.productLayout}>
                  {products.map(product => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      storeDomain={store.domaine}
                    />
                  ))}
                </ProductGrid>
                
                {/* Pagination */}
                {filteredProducts.length > productsPerPage && (
                  <div className="mt-8 flex justify-center">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 rounded-md ${currentPage === 1 ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'} border-2 border-gray-200 dark:border-gray-600 transition-colors shadow-sm`}
                      >
                        Précédent
                      </button>
                      
                      {Array.from({ length: Math.ceil(filteredProducts.length / productsPerPage) }).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentPage(index + 1)}
                          className={`px-3 py-1 rounded-md ${currentPage === index + 1 ? 'bg-primary text-white border-2 border-primary-dark/20' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-gray-200 dark:border-gray-600'} transition-colors shadow-sm`}
                        >
                          {index + 1}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredProducts.length / productsPerPage)))}
                        disabled={currentPage === Math.ceil(filteredProducts.length / productsPerPage)}
                        className={`px-3 py-1 rounded-md ${currentPage === Math.ceil(filteredProducts.length / productsPerPage) ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'} border-2 border-gray-200 dark:border-gray-600 transition-colors shadow-sm`}
                      >
                        Suivant
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
      
      {/* Pied de page */}
      <StoreFooter 
        store={store}
        socialLinks={store.social_links || {}}
      />
    </div>
  );
};
