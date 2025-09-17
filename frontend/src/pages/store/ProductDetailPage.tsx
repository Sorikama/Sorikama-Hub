import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { Product, Store } from '../../types';
import { toast } from 'react-hot-toast';
import axios from 'axios';
// URL de base de l'API
const API_BASE_URL = 'http://localhost:8000/api';
import { StoreHeader } from '../../components/store/StoreHeader';
import { StoreFooter } from '../../components/store/StoreFooter';
import { PreviewBanner } from '../../components/store/PreviewBanner';
import { ShoppingCart, FileText, BookOpen, Briefcase, Check, AlertCircle } from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  // Utiliser useMatch pour détecter si nous sommes sur une URL de prévisualisation
  const previewMatch = useLocation().pathname.includes('/preview/');
  const { storeDomain, productId } = useParams<{ storeDomain: string; productId: string }>();
  const location = useLocation();
  const isPreview = new URLSearchParams(location.search).get('preview') === 'true' || previewMatch;
  
  if (!productId || !storeDomain) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="text-center p-6 sm:p-8 max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <div className="flex justify-center mb-4">
            <AlertCircle className="w-16 h-16 text-red-500" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            URL invalide
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            L'URL que vous avez saisie est incorrecte ou incomplète.
          </p>
          <Link 
            to="/"
            className="inline-block px-6 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }
  const [store, setStore] = useState<Store | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Récupérer la boutique par son domaine
        const storeResponse = await axios.get(`${API_BASE_URL}/stores/domain/${storeDomain}`);
        const storeData = storeResponse.data;
        setStore(storeData);
        
        // Récupérer le produit par son ID ou son URL personnalisée
        let productResponse;
        // À ce stade, productId est garanti d'être défini
        
        // Déterminer le type d'identifiant
        if (isPreview) {
          // Si c'est un mode prévisualisation, on utilise l'ID fourni (qui peut être private_id)
          // C'est une prévisualisation d'un produit non publié
          productResponse = await axios.get(`${API_BASE_URL}/products/product/${productId}`);
        } else if (productId.startsWith('private-')) {
          // C'est un private_id
          productResponse = await axios.get(`${API_BASE_URL}/products/product/${productId}`);
        } else if (productId.startsWith('public-')) {
          // C'est un public_id
          productResponse = await axios.get(`${API_BASE_URL}/products/product/${productId}`);
        } else if (productId.match(/^[0-9a-fA-F]{24}$/)) {
          // C'est un ID MongoDB
          productResponse = await axios.get(`${API_BASE_URL}/products/${productId}`);
        } else {
          // C'est une URL personnalisée
          productResponse = await axios.get(`${API_BASE_URL}/products/custom-url/${productId}`);
        }
        
        const productData = productResponse.data;
        
        // Vérifier que le produit appartient bien à cette boutique
        if (productData.storeId !== storeData.id) {
          throw new Error('Ce produit n\'appartient pas à cette boutique');
        }
        
        setProduct(productData);
        setError(null);
      } catch (err) {
        console.error('Erreur lors de la récupération des données:', err);
        setError('Produit introuvable. Veuillez vérifier l\'URL.');
        toast.error('Produit introuvable. Veuillez vérifier l\'URL.');
      } finally {
        setLoading(false);
      }
    };
    
    if (storeDomain && productId) {
      fetchData();
    }
  }, [storeDomain, productId]);
  
  // Formater le prix
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price);
  };
  
  // Icône en fonction du type de produit
  const getProductIcon = (type: string) => {
    switch (type) {
      case 'downloadable':
        return <FileText className="w-5 h-5" />;
      case 'course':
        return <BookOpen className="w-5 h-5" />;
      case 'service':
        return <Briefcase className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300 font-medium animate-pulse">Chargement du produit...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="text-center p-6 sm:p-8 max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <div className="flex justify-center mb-4">
            <AlertCircle className="w-16 h-16 text-red-500" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Produit non trouvé
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error}
          </p>
          <Link 
            to={`/${storeDomain}`}
            className="inline-block px-6 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow"
          >
            Retour à la boutique
          </Link>
        </div>
      </div>
    );
  }
  
  if (!store || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="text-center p-6 sm:p-8 max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <div className="flex justify-center mb-4">
            <AlertCircle className="w-16 h-16 text-amber-500" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Produit non disponible
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Le produit que vous recherchez n'existe pas ou n'est plus disponible.
          </p>
          <Link 
            to={`/${storeDomain}`}
            className="inline-block px-6 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow"
          >
            Voir d'autres produits
          </Link>
        </div>
      </div>
    );
  }
  
  // Appliquer le thème de la boutique
  const storeTheme = {
    primaryColor: store.theme?.primary_color || '#3B82F6',
    secondaryColor: store.theme?.secondary_color || '#1E40AF',
    accentColor: store.theme?.accent_color || '#DBEAFE',
    fontFamily: store.theme?.font_family || 'Inter, sans-serif',
    logoPosition: store.theme?.logo_position || 'left'
  };
  
  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ 
        fontFamily: storeTheme.fontFamily,
        '--primary-color': storeTheme.primaryColor,
        '--secondary-color': storeTheme.secondaryColor,
        '--accent-color': storeTheme.accentColor,
      } as React.CSSProperties}
    >
      {/* Bannière d'avertissement pour les produits non publiés */}
      {isPreview && <PreviewBanner />}
      
      {/* En-tête de la boutique */}
      <StoreHeader 
        store={store} 
        logoPosition={storeTheme.logoPosition}
      />
      
      {/* Contenu principal */}
      <main className="flex-grow container mx-auto px-4 sm:px-6 py-6 sm:py-8 border-t border-gray-100 dark:border-gray-800">
        {/* Fil d'Ariane */}
        <nav className="mb-6 text-sm">
          <ol className="flex flex-wrap items-center space-x-2">
            <li>
              <Link to={`/${storeDomain}`} className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light transition-colors">
                Boutique
              </Link>
            </li>
            <li className="text-gray-500 dark:text-gray-400">/</li>
            <li className="text-gray-700 dark:text-gray-300 font-medium truncate max-w-[200px]">
              {product?.name || 'Produit'}
            </li>
          </ol>
        </nav>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Image du produit */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
            {product && product.image ? (
              <img 
                src={product.image} 
                alt={product.name || 'Produit'} 
                className="w-full h-auto object-cover"
                loading="eager"
              />
            ) : (
              <div className="w-full aspect-video flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                <span className="text-gray-400 dark:text-gray-500 text-6xl font-light">
                  {product && product.name ? product.name.charAt(0) : '?'}
                </span>
              </div>
            )}
          </div>
          
          {/* Détails du produit */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 sm:p-6 border border-gray-200 dark:border-gray-700">
            {/* Type de produit et badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {product && product.type && (
                <span className="bg-primary-light text-primary dark:bg-primary-dark/20 dark:text-primary-light rounded-full px-3 py-1 text-sm font-medium flex items-center">
                  {getProductIcon(product.type)}
                  <span className="ml-1">
                    {product.type === 'downloadable' ? 'Téléchargeable' : 
                     product.type === 'course' ? 'Cours' : 'Service'}
                  </span>
                </span>
              )}
              
              {/* Badge pour produit gratuit */}
              {product && product.price === 0 && (
                <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full px-3 py-1 text-sm font-medium">
                  Gratuit
                </span>
              )}
              
              {/* Badge pour promotion */}
              {product && product.promotionalPrice && (
                <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full px-3 py-1 text-sm font-medium">
                  Promotion
                </span>
              )}
            </div>
            
            {/* Titre */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
              {product && product.name ? product.name : 'Produit'}
            </h1>
            
            {/* Prix */}
            <div className="mb-6">
              {product && (
                product.promotionalPrice ? (
                  <div className="flex items-center">
                    <span className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 line-through mr-3">
                      {formatPrice(product.price || 0)}
                    </span>
                    <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary dark:text-primary-light">
                      {formatPrice(product.promotionalPrice)}
                    </span>
                  </div>
                ) : (
                  <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                    {product.price === 0 ? 'Gratuit' : formatPrice(product.price || 0)}
                  </span>
                )
              )}
            </div>
            
            {/* Description */}
            <div className="prose dark:prose-invert max-w-none mb-6 text-gray-700 dark:text-gray-300">
              <p className="text-base sm:text-lg">{product && product.description ? product.description : 'Aucune description disponible.'}</p>
            </div>
            
            {/* Caractéristiques */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Ce que vous obtenez
              </h3>
              <ul className="space-y-3">
                {product && product.type === 'downloadable' && (
                  <>
                    <li className="flex items-start text-gray-700 dark:text-gray-300">
                      <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span>Téléchargement immédiat après l'achat</span>
                    </li>
                    <li className="flex items-start text-gray-700 dark:text-gray-300">
                      <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span>Accès à vie au contenu et aux mises à jour</span>
                    </li>
                  </>
                )}
                {product && product.type === 'course' && (
                  <>
                    <li className="flex items-start text-gray-700 dark:text-gray-300">
                      <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span>Accès illimité au cours et à tout son contenu</span>
                    </li>
                    <li className="flex items-start text-gray-700 dark:text-gray-300">
                      <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span>Ressources téléchargeables et exercices pratiques</span>
                    </li>
                  </>
                )}
                {product && product.type === 'service' && (
                  <li className="flex items-start text-gray-700 dark:text-gray-300">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Service personnalisé adapté à vos besoins spécifiques</span>
                  </li>
                )}
                <li className="flex items-start text-gray-700 dark:text-gray-300">
                  <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Support client réactif en cas de question ou problème</span>
                </li>
              </ul>
            </div>
            
            {/* Garantie */}
            <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="flex items-center mb-2">
                <Check className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                <span className="font-medium text-blue-800 dark:text-blue-300">Satisfaction garantie</span>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-400">Si vous n'êtes pas satisfait(e) de votre achat, contactez-nous dans les 30 jours pour un remboursement complet.</p>
            </div>
            
            {/* Bouton d'achat */}
            <button className="w-full bg-primary hover:bg-primary-dark text-white font-semibold text-lg py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5 border border-primary-dark/20">
              <ShoppingCart className="w-5 h-5 mr-3" />
              {product && product.price === 0 ? 'Télécharger gratuitement' : 'Acheter maintenant'}
            </button>
          </div>
        </div>
        
        {/* Informations supplémentaires */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Description détaillée */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 sm:p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-primary dark:text-primary-light" />
              Description détaillée
            </h2>
            <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
              <p className="text-base sm:text-lg">{product && product.description ? product.description : 'Aucune description disponible.'}</p>
              
              {/* Ici, vous pourriez ajouter plus de contenu de description si disponible */}
              {product && product.post_purchase_instructions && (
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700">
                  <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Instructions après achat</h3>
                  <p>{product.post_purchase_instructions}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Métadonnées et FAQ */}
          <div className="space-y-6">
            {/* Métadonnées */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 sm:p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Détails du produit
              </h2>
              <ul className="space-y-3 text-sm sm:text-base">
                {product && product.sku && (
                  <li className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <span className="text-gray-600 dark:text-gray-400">Référence</span>
                    <span className="text-gray-900 dark:text-white font-medium">{product.sku}</span>
                  </li>
                )}
                {product && product.category && (
                  <li className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <span className="text-gray-600 dark:text-gray-400">Catégorie</span>
                    <span className="text-gray-900 dark:text-white font-medium bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{product.category}</span>
                  </li>
                )}
                {product && product.type && (
                  <li className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <span className="text-gray-600 dark:text-gray-400">Type</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {product.type === 'downloadable' ? 'Téléchargeable' : 
                       product.type === 'course' ? 'Cours' : 'Service'}
                    </span>
                  </li>
                )}
                {product && product.tags && (
                  <li className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <span className="text-gray-600 dark:text-gray-400">Tags</span>
                    <div className="flex flex-wrap justify-end gap-1">
                      {product.tags.split(',').map((tag, index) => (
                        <span key={index} className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs px-2 py-1 rounded">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </li>
                )}
              </ul>
            </div>
            
            {/* FAQ si disponible */}
            {product && product.faq && Array.isArray(product.faq) && product.faq.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 sm:p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Questions fréquentes
                </h2>
                <div className="space-y-4">
                  {product.faq.map((item: any, index: number) => (
                    <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                        {item && item.question ? item.question : 'Question'}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {item && item.answer ? item.answer : 'Pas de réponse disponible.'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Partage social */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 sm:p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Partager ce produit
              </h2>
              <div className="flex space-x-4">
                <button className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </button>
                <button className="bg-blue-400 hover:bg-blue-500 text-white p-2 rounded-full transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </button>
                <button className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-full transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M18.042 13.045c-.23-.629-.832-1.01-1.57-1.01-1.388 0-2.564.916-2.564 2.35 0 1.357 1.176 2.35 2.564 2.35 1.388 0 2.564-.916 2.564-2.35 0-.181-.02-.354-.056-.52l-4.67-2.164v-1.079l4.67-2.164c.037-.166.056-.34.056-.52 0-1.357-1.176-2.35-2.564-2.35-1.388 0-2.564.916-2.564 2.35 0 .181.02.354.056.52l4.67 2.164v1.079l-4.67 2.164c-.037.166-.056.34-.056.52 0 1.357 1.176 2.35 2.564 2.35.738 0 1.34-.382 1.57-1.01" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Pied de page */}
      <StoreFooter 
        store={store}
        socialLinks={store.social_links || {}}
      />
    </div>
  );
};
