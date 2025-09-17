import React, { useState } from 'react';
import { Product } from '../../types';
import { FileText, BookOpen, Briefcase, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
  storeDomain: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, storeDomain }) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  // Gérer le clic sur la carte
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsLoading(true);
    // Utiliser navigate au lieu de window.location pour éviter le rechargement
    setTimeout(() => {
      navigate(getProductUrl());
    }, 300); // Un petit délai pour montrer le spinner
  };
  // Déterminer l'URL du produit
  const getProductUrl = () => {
    if (product.custom_url) {
      return `/${storeDomain}/${product.custom_url}`;
    } else if (product.public_id) {
      // Utiliser public_id pour les produits publiés
      return `/${storeDomain}/product/${product.public_id}`;
    } else if (product.private_id) {
      // Utiliser private_id pour les produits non publiés
      return `/${storeDomain}/product/${product.private_id}${!product.is_published ? '?preview=true' : ''}`;
    } else {
      // Fallback sur l'ID du produit
      return `/${storeDomain}/product/${product.id}`;
    }
  };
  
  // Icône en fonction du type de produit
  const getProductIcon = () => {
    switch (product.type) {
      case 'downloadable':
        return <FileText className="w-4 h-4" />;
      case 'course':
        return <BookOpen className="w-4 h-4" />;
      case 'service':
        return <Briefcase className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };
  
  // Formater le prix
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price);
  };
  
  return (
    <Link
      to={getProductUrl()} 
      onClick={handleClick}
      className="block bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-colors duration-200 hover:shadow-lg group focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-light relative"
    >
      {/* Indicateur de chargement */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 flex items-center justify-center z-10">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      )}
      {/* Image du produit */}
      <div className="relative aspect-video bg-gray-100 dark:bg-gray-700 transition-colors duration-200">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 transition-colors duration-200">
            <span className="text-gray-400 dark:text-gray-500 text-4xl font-light transition-colors duration-200">
              {product.name.charAt(0)}
            </span>
          </div>
        )}
        
        {/* Badge du type de produit */}
        <div className="absolute top-2 left-2 bg-white dark:bg-gray-800 text-primary dark:text-primary-light rounded-full px-2 py-1 text-xs font-medium flex items-center shadow-sm transition-colors duration-200">
          {getProductIcon()}
          <span className="ml-1 hidden xs:inline">
            {product.type === 'downloadable' ? 'Téléchargeable' : 
             product.type === 'course' ? 'Cours' : 'Service'}
          </span>
        </div>

        {/* Badge prix spécial pour les produits gratuits */}
        {product.price === 0 && (
          <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full px-2 py-1 text-xs font-medium shadow-sm">
            Gratuit
          </div>
        )}
      </div>
      
      {/* Contenu du produit */}
      <div className="p-3 sm:p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2 transition-colors duration-200 group-hover:text-primary dark:group-hover:text-primary-light text-sm sm:text-base">
          {product.name}
        </h3>
        
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-3 line-clamp-2 transition-colors duration-200">
          {product.description}
        </p>
        
        {/* Prix */}
        <div className="flex items-center justify-between mt-2">
          <div>
            {product.promotionalPrice ? (
              <div className="flex items-center">
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-through mr-2 transition-colors duration-200">
                  {formatPrice(product.price)}
                </span>
                <span className="text-base sm:text-lg font-bold text-primary dark:text-primary-light transition-colors duration-200">
                  {formatPrice(product.promotionalPrice)}
                </span>
              </div>
            ) : (
              <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white transition-colors duration-200">
                {product.price === 0 ? 'Gratuit' : formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};
