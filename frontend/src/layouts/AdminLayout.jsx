/**
 * Layout Admin Professionnel - Sorikama Hub
 * Design moderne avec React Icons
 */

import { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiHome,
  FiUsers,
  FiShield,
  FiClock,
  FiFileText,
  FiLink,
  FiBell,
  FiActivity,
  FiZap,
  FiHeart,
  FiPackage,
  FiMenu,
  FiX,
  FiSun,
  FiMoon,
  FiLogOut,
  FiUser,
  FiChevronDown
} from 'react-icons/fi';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Menu de navigation avec React Icons
  const menuSections = [
    {
      title: 'Principal',
      items: [
        { title: 'Dashboard', icon: FiHome, path: '/admin/dashboard' },
        { title: 'Utilisateurs', icon: FiUsers, path: '/admin/users' },
        { title: 'Documentation Utilisateur', icon: FiFileText, path: '/admin/documentation' },
        { title: 'Documentation Technique', icon: FiFileText, path: '/admin/technical-docs' },
      ]
    },
    {
      title: 'Sécurité & Accès',
      items: [
        { title: 'Rôles & Permissions', icon: FiShield, path: '/admin/roles' },
      ]
    },
    {
      title: 'Services Externes',
      items: [
        { title: 'Gestion Services', icon: FiPackage, path: '/admin/services' },
      ]
    },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      await logout();
      navigate('/login');
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

        {/* ========== HEADER HORIZONTAL ========== */}
        <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-50 shadow-sm">
          <div className="h-full px-4 flex items-center justify-between">

            {/* Left: Logo + Toggle */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {isSidebarOpen ? (
                  <FiX className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                ) : (
                  <FiMenu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                )}
              </button>

              <Link to="/admin/dashboard" className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white">Sorikama Hub</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Administration</p>
                </div>
              </Link>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Administrateur</p>
                  </div>
                  <FiChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                      </div>
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <FiHome className="w-4 h-4" />
                        <span>Dashboard utilisateur</span>
                      </Link>
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <FiUser className="w-4 h-4" />
                        <span>Mon profil</span>
                      </Link>
                      <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left"
                      >
                        <FiLogOut className="w-4 h-4" />
                        <span>Déconnexion</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* ========== SIDEBAR VERTICAL - DESIGN PROFESSIONNEL ========== */}
        <aside className={`
          fixed top-16 left-0 bottom-0 z-40
          bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
          transition-all duration-300 ease-in-out overflow-y-auto
          ${isSidebarOpen ? 'w-64' : 'w-0 lg:w-20'}
        `}>
          <div className="h-full flex flex-col">
            {/* Navigation */}
            <nav className="flex-1 px-3 py-6 space-y-6">
              {menuSections.map((section, idx) => (
                <div key={idx}>
                  {/* Section Title */}
                  {isSidebarOpen && (
                    <div className="px-3 mb-2">
                      <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                        {section.title}
                      </h3>
                    </div>
                  )}

                  {/* Separator for collapsed sidebar */}
                  {!isSidebarOpen && idx > 0 && (
                    <div className="my-3 mx-auto w-8 h-px bg-gray-200 dark:bg-gray-700" />
                  )}

                  {/* Menu Items */}
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.path);

                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`
                            group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                            ${active
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200'
                            }
                          `}
                          title={!isSidebarOpen ? item.title : ''}
                        >
                          {/* Active Border */}
                          {active && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 dark:bg-blue-400 rounded-r-full" />
                          )}

                          <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-blue-600 dark:text-blue-400' : ''}`} />

                          {isSidebarOpen && (
                            <span className="text-sm flex-1">{item.title}</span>
                          )}

                          {/* Tooltip when sidebar closed */}
                          {!isSidebarOpen && (
                            <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap pointer-events-none z-50 shadow-lg">
                              {item.title}
                              <div className="absolute right-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-r-gray-900 dark:border-r-gray-700" />
                            </div>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {/* Sidebar Footer */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <Link
                to="/dashboard"
                className="group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200 transition-all"
                title={!isSidebarOpen ? 'Retour au site' : ''}
              >
                <FiHome className="w-5 h-5 flex-shrink-0" />
                {isSidebarOpen && (
                  <div className="flex-1">
                    <p className="text-sm font-medium">Retour au site</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">Dashboard utilisateur</p>
                  </div>
                )}
                {!isSidebarOpen && (
                  <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap pointer-events-none z-50 shadow-lg">
                    Retour au site
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-r-gray-900 dark:border-r-gray-700" />
                  </div>
                )}
              </Link>
            </div>
          </div>
        </aside>

        {/* ========== MAIN CONTENT ========== */}
        <main className={`
          pt-16 transition-all duration-300
          ${isSidebarOpen ? 'lg:pl-64' : 'lg:pl-20'}
        `}>
          <div className="p-6 lg:p-8 max-w-[1600px]">
            <Outlet />
          </div>
        </main>

        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
