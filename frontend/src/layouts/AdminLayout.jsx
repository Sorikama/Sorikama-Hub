/**
 * Layout principal pour l'espace administrateur
 * 
 * Contient :
 * - Header avec logo et infos utilisateur
 * - Menu latéral avec navigation
 * - Zone de contenu principale
 * - Thème clair/sombre
 */

import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [theme, setTheme] = useState('light');

  // Menu de navigation admin
  const menuItems = [
    {
      title: 'Vue d\'ensemble',
      icon: '📊',
      path: '/admin/dashboard',
      description: 'Statistiques globales'
    },
    {
      title: 'Utilisateurs',
      icon: '👥',
      path: '/admin/users',
      description: 'Gestion des utilisateurs'
    },
    {
      title: 'Rôles & Permissions',
      icon: '🔐',
      path: '/admin/roles',
      description: 'Gestion des accès'
    },
    {
      title: 'Rate Limiting',
      icon: '⏱️',
      path: '/admin/rate-limit',
      description: 'Limites de requêtes'
    },
    {
      title: 'Audit Trail',
      icon: '📜',
      path: '/admin/audit',
      description: 'Journal d\'audit'
    },
    {
      title: 'Webhooks',
      icon: '🔔',
      path: '/admin/webhooks',
      description: 'Notifications externes'
    },
    {
      title: 'Services SSO',
      icon: '🔗',
      path: '/services-admin',
      description: 'Services externes'
    },
    {
      title: 'Logs Système',
      icon: '📝',
      path: '/admin/logs',
      description: 'Journaux d\'événements'
    },
    {
      title: 'Performances',
      icon: '⚡',
      path: '/admin/performance',
      description: 'Métriques de performance'
    },
    {
      title: 'Santé Système',
      icon: '🏥',
      path: '/admin/health',
      description: 'État du système'
    },
    {
      title: 'API Keys',
      icon: '🔑',
      path: '/admin/api-keys',
      description: 'Gestion des clés API'
    },
    {
      title: 'Dépendances',
      icon: '📦',
      path: '/admin/dependencies',
      description: 'Packages et versions'
    }
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      await logout();
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              
              {/* Logo & Toggle */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors lg:hidden"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">S</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Sorikama Hub</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Administration</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4">
                
                {/* Theme Switcher */}
                <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setTheme('light')}
                    className={`p-2 rounded-md transition-colors ${theme === 'light' ? 'bg-white dark:bg-gray-600 shadow-sm' : ''}`}
                    title="Mode clair"
                  >
                    ☀️
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`p-2 rounded-md transition-colors ${theme === 'dark' ? 'bg-white dark:bg-gray-600 shadow-sm' : ''}`}
                    title="Mode sombre"
                  >
                    🌙
                  </button>
                </div>

                {/* Status */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">En ligne</span>
                </div>

                {/* User Menu */}
                <div className="flex items-center gap-3 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
                      👑 Administrateur
                    </p>
                  </div>
                </div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Déconnexion"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex">
          
          {/* Sidebar */}
          <aside className={`
            fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] z-30
            bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
            transition-all duration-300 overflow-y-auto
            ${isSidebarOpen ? 'w-64' : 'w-0 lg:w-20'}
          `}>
            <nav className="p-4 space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                    ${isActive(item.path)
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <span className="text-2xl">{item.icon}</span>
                  {isSidebarOpen && (
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{item.title}</p>
                      <p className={`text-xs truncate ${isActive(item.path) ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                        {item.description}
                      </p>
                    </div>
                  )}
                </Link>
              ))}
            </nav>

            {/* Retour au site */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <Link
                to="/dashboard"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
              >
                <span className="text-2xl">🏠</span>
                {isSidebarOpen && (
                  <div>
                    <p className="font-semibold text-sm">Retour au site</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Dashboard utilisateur</p>
                  </div>
                )}
              </Link>
            </div>
          </aside>

          {/* Main Content */}
          <main className={`
            flex-1 transition-all duration-300
            ${isSidebarOpen ? 'lg:ml-0' : 'lg:ml-0'}
          `}>
            <div className="p-4 sm:p-6 lg:p-8">
              <Outlet />
            </div>
          </main>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
