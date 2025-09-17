import React, { useState } from 'react';
import { Search, ExternalLink, User, Moon, Sun, LogOut, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useStore } from '../../contexts/StoreContext';

// Mapping des routes vers les titres de pages
const getPageTitle = (pathname: string): string => {
  const routes: Record<string, string> = {
    '/dashboard': 'Tableau de bord',
    '/dashboard/products': 'Produits',
    '/dashboard/sales': 'Ventes',
    '/dashboard/customers': 'Clients',
    '/dashboard/revenue': 'Revenus',
    '/dashboard/analytics': 'Analytiques',
    '/dashboard/reviews': 'Avis',
    '/dashboard/marketing': 'Marketing',
    '/dashboard/automations': 'Automatisations',
    '/dashboard/settings': 'Paramètres',
    '/dashboard/settings/appearance': 'Apparence',
    '/dashboard/settings/configurations': 'Configurations',
    '/dashboard/settings/notifications': 'Notifications',
    '/dashboard/settings/team': 'Équipe',
    '/dashboard/settings/profile': 'Mon Profil',
    '/dashboard/settings/analytics': 'Analytiques',
    '/dashboard/settings/domain': 'Nom de domaine',
    '/dashboard/settings/pricing': 'Tarification',
    '/dashboard/create-store': 'Créer une boutique'
  };

  // Gestion des routes dynamiques (ex: /dashboard/products/123/edit)
  if (pathname.includes('/dashboard/products/') && pathname.includes('/edit')) {
    return ' Modifier le produit';
  }

  return routes[pathname] || 'Dashboard';
};

export const Navbar: React.FC = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { selectedStore } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const currentPageTitle = getPageTitle(location.pathname);
  const canGoBack = location.pathname !== '/dashboard';

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center flex-1">
          {/* Bouton retour */}
          {canGoBack && (
            <button
              onClick={handleGoBack}
              className="p-2 text-gray-500 hover:text-theme-primary dark:text-gray-400 dark:hover:text-theme-primary transition-colors mr-3 rounded-lg hover:bg-theme-primary-50 dark:hover:bg-gray-700"
              title="Retour"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          {/* Titre de la page */}
          <div className="mr-6">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {currentPageTitle}
            </h1>
          </div>

          {/* Barre de recherche */}
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher des produits, clients..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-theme-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {selectedStore && (
            <button
              className="flex items-center px-3 py-2 text-sm font-medium text-theme-primary hover:text-theme-secondary transition-colors"
              onClick={() => window.open(`${window.location.origin}/${selectedStore.domaine}`, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Visiter ma boutique
            </button>
          )}

          <button
            onClick={toggleTheme}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <User className="w-5 h-5" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-10">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-600">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                </div>
                <div className="py-1">
                  <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors">
                    <User className="w-4 h-4 mr-3" />
                    Mon profil
                  </button>
                  <button
                    onClick={logout}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Se déconnecter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};