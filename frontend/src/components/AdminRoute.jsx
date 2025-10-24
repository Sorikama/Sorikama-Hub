/**
 * Composant de protection des routes admin
 * 
 * Vérifie que :
 * 1. L'utilisateur est connecté
 * 2. L'utilisateur a le rôle 'admin'
 * 
 * Si non, redirige vers la page d'accueil
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute({ children }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Attendre que l'authentification soit chargée
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification des autorisations...</p>
        </div>
      </div>
    );
  }

  // Si pas connecté, rediriger vers login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si connecté mais pas admin, rediriger vers dashboard
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // Si admin, afficher le contenu
  return children;
}
