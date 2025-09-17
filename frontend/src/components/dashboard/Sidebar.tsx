import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  ShoppingCart, 
  Package, 
  Users, 
  DollarSign, 
  BarChart3, 
  Star, 
  Megaphone, 
  Zap, 
  Settings,
  ChevronLeft,
  ChevronRight,
  PenTool
} from 'lucide-react';
import { StoreSelector } from '../common/StoreSelector';

const menuItems = [
  { icon: Home, label: 'Accueil', path: '/dashboard' },
  { icon: ShoppingCart, label: 'Ventes', path: '/dashboard/sales' },
  { icon: Package, label: 'Produits', path: '/dashboard/products' },
  { icon: Users, label: 'Clients', path: '/dashboard/customers' },
  { icon: DollarSign, label: 'Revenus', path: '/dashboard/revenue' },
  { icon: BarChart3, label: 'Analytiques', path: '/dashboard/analytics' },
  { icon: Star, label: 'Avis', path: '/dashboard/reviews' },
  { icon: Megaphone, label: 'Marketing', path: '/dashboard/marketing' },
  { icon: Zap, label: 'Automatisations', path: '/dashboard/automations' },
  { icon: PenTool, label: 'Blog', path: '/dashboard/blog' },
  { icon: Settings, label: 'Paramètres', path: '/dashboard/settings' },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 ease-in-out relative`}>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-6 z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-1.5 shadow-md hover:shadow-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700"
        title={isCollapsed ? 'Étendre la sidebar' : 'Réduire la sidebar'}
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        )}
      </button>

      {/* Store Selector - Conditionnel */}
      {!isCollapsed && <StoreSelector />}
      
      {/* Logo réduit quand collapsed */}
      {isCollapsed && (
        <div className="px-4 py-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-theme-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>
          </div>
        </div>
      )}
      
      <nav className={`flex-1 ${isCollapsed ? 'px-2' : 'px-4'} py-6 space-y-1`}>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/dashboard'}
            className={({ isActive }) =>
              `flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-3'} py-2 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                isActive
                  ? 'bg-theme-primary-50 text-theme-primary border border-theme-primary border-opacity-20'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100'
              }`
            }
            title={isCollapsed ? item.label : undefined}
          >
            <item.icon className={`${isCollapsed ? 'w-5 h-5' : 'w-5 h-5 mr-3'} flex-shrink-0`} />
            {!isCollapsed && (
              <span className="truncate">{item.label}</span>
            )}
            
            {/* Tooltip pour mode réduit */}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                {item.label}
                <div className="absolute top-1/2 -left-1 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-gray-700"></div>
              </div>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};