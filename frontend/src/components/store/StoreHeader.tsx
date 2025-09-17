import React, { useState } from 'react';
import { Store } from '../../types';
import { Moon, Sun, Store as StoreIcon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Link } from 'react-router-dom';

interface StoreHeaderProps {
  store: Store;
  logoPosition: string;
}

export const StoreHeader: React.FC<StoreHeaderProps> = ({ store, logoPosition }) => {
  const { isDark, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implémenter la recherche ici
    console.log('Recherche:', searchQuery);
  };
  
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm transition-colors duration-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo et nom de la boutique */}
          <Link 
            to={`/${store.domaine}`} 
            className={`flex items-center ${logoPosition === 'center' ? 'mx-auto' : ''} hover:opacity-90 transition-opacity`}
            aria-label="Accueil de la boutique"
          >
            {store.logo_url ? (
              <img 
                src={store.logo_url} 
                alt={`${store.name} logo`} 
                className="h-10 w-auto mr-3"
              />
            ) : (
              <div className="h-10 w-10 rounded-md flex items-center justify-center mr-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors duration-200">
                <StoreIcon className="w-6 h-6" />
              </div>
            )}
            <h1 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
              {store.name}
            </h1>
          </Link>
          
          {/* Actions */}
          <div className="flex items-center space-x-4">            
            {/* Bouton mode sombre/clair */}
            <button 
              onClick={toggleTheme}
              className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Image de couverture si disponible */}
      {store.cover_image_url && (
        <div className="w-full h-48 md:h-64 lg:h-80 bg-cover bg-center" style={{ backgroundImage: `url(${store.cover_image_url})` }}>
          <div className="w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center px-4 drop-shadow-lg">
              Bienvenue sur {store.name}
            </h2>
          </div>
        </div>
      )}
    </header>
  );
};
