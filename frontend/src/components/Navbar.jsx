/**
 * Composant Navbar - Barre de navigation principale
 * 
 * Affiche la navigation principale de l'application avec :
 * - Logo et nom de l'application
 * - Menu différent selon l'état d'authentification
 * - Informations utilisateur si connecté
 * - Boutons de connexion/inscription si non connecté
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  /**
   * Gérer la déconnexion utilisateur
   */
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/'); // Rediriger vers l'accueil après déconnexion
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Logo et nom de l'application */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                Sorikama Hub
              </h1>
            </Link>
          </div>

          {/* Menu de navigation */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              // Menu utilisateur connecté
              <>
                {/* Informations utilisateur */}
                <div className="flex items-center space-x-3">
                  <div className="hidden sm:block">
                    <span className="text-sm text-gray-700">
                      Bonjour, <span className="font-medium">{user?.firstName}</span>
                    </span>
                  </div>
                  
                  {/* Avatar utilisateur */}
                  <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 font-medium text-sm">
                      {user?.firstName?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Liens de navigation */}
                <Link
                  to="/profile"
                  className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Mon Profil
                </Link>

                {/* Bouton de déconnexion */}
                <button
                  onClick={handleLogout}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors duration-200"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              // Menu utilisateur non connecté
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Connexion
                </Link>
                
                <Link
                  to="/signup"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors duration-200"
                >
                  Inscription
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}