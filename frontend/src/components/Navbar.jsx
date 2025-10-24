/**
 * Navbar - Barre de navigation responsive (Mobile First)
 * Avec dropdown menu pour utilisateur connecté
 */

import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      setIsDropdownOpen(false);
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group flex-shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-900 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <span className="text-white font-bold text-base sm:text-lg">S</span>
            </div>
            <span className="text-lg sm:text-xl font-bold text-gray-900">
              Sorikama
            </span>
          </Link>

          {/* Navigation Desktop & Mobile */}
          <div className="flex items-center gap-3 sm:gap-4">
            {isAuthenticated ? (
              // Utilisateur connecté - Dropdown Menu
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 sm:gap-3 hover:bg-gray-50 rounded-xl px-2 sm:px-3 py-2 transition-colors duration-200"
                >
                  {/* Avatar */}
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                    <span className="text-white font-bold text-xs sm:text-sm">
                      {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                    </span>
                  </div>
                  
                  {/* Nom (caché sur très petit écran) */}
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-gray-900 leading-tight">
                      {user?.firstName}
                    </p>
                    <p className="text-xs text-gray-500 leading-tight">
                      {user?.email?.length > 20 ? user?.email?.substring(0, 20) + '...' : user?.email}
                    </p>
                  </div>

                  {/* Icône dropdown */}
                  <svg 
                    className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 py-2 animate-fade-in-scale">
                    {/* Info utilisateur (visible sur mobile dans le dropdown) */}
                    <div className="px-4 py-3 border-b border-gray-100 sm:hidden">
                      <p className="text-sm font-semibold text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {user?.email}
                      </p>
                    </div>

                    {/* Menu items */}
                    <Link
                      to="/dashboard"
                      onClick={() => setIsDropdownOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                        isActive('/dashboard')
                          ? 'bg-gray-50 text-gray-900'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Dashboard
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                        isActive('/profile')
                          ? 'bg-gray-50 text-gray-900'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Mon Profil
                    </Link>

                    {/* Menu Admin - Visible seulement pour les admins */}
                    {user?.role === 'admin' && (
                      <>
                        <div className="border-t border-gray-100 my-2"></div>
                        <div className="px-4 py-2">
                          <p className="text-xs font-semibold text-gray-500 uppercase">Administration</p>
                        </div>
                        
                        <Link
                          to="/admin/users"
                          onClick={() => setIsDropdownOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                            isActive('/admin/users')
                              ? 'bg-gray-50 text-gray-900'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          Utilisateurs
                        </Link>

                        <Link
                          to="/services-admin"
                          onClick={() => setIsDropdownOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                            isActive('/services-admin')
                              ? 'bg-gray-50 text-gray-900'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Services SSO
                        </Link>
                      </>
                    )}

                    <div className="border-t border-gray-100 my-2"></div>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors duration-200 w-full"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Utilisateur non connecté - Bouton Connexion uniquement
              <Link
                to="/login"
                className="bg-gray-900 text-white px-5 sm:px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all duration-300 shadow-sm hover:shadow-md whitespace-nowrap"
              >
                Connexion
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
