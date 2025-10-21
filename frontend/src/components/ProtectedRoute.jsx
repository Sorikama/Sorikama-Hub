/**
 * Composant ProtectedRoute - Protection des routes authentifiées
 * 
 * Ce composant protège les pages qui nécessitent une authentification.
 * Si l'utilisateur n'est pas connecté, il est redirigé vers la page de connexion.
 * La page demandée est sauvegardée pour redirection après connexion.
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

/**
 * Composant de protection des routes
 * 
 * @param {Object} props - Props du composant
 * @param {React.ReactNode} props.children - Composant à protéger
 * @returns {React.ReactElement} Composant protégé ou redirection
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Afficher le loader pendant la vérification de l'authentification
  if (isLoading) {
    return <Loader message="Vérification de l'authentification..." />;
  }

  // Si pas authentifié, rediriger vers la page de connexion
  if (!isAuthenticated) {
    console.log('🔒 Accès refusé - Redirection vers /login');
    
    // Sauvegarder la page demandée pour redirection après connexion
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Utilisateur authentifié - afficher le composant protégé
  console.log('✅ Accès autorisé à la route protégée');
  return children;
}