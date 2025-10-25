/**
 * Hook personnalisé pour l'authentification sécurisée
 * Utilise l'instance API centralisée au lieu de fetch direct
 */

import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { authUtils } from '../services/api';
import api from '../services/api';

/**
 * Hook pour vérifier l'état de sécurité de l'authentification
 */
export const useSecureAuth = () => {
  const { user, isLoading, error, isAuthenticated } = useAuth();
  const [isSecure, setIsSecure] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur est authentifié via authUtils
    const authenticated = authUtils.isAuthenticated();
    
    if (authenticated && user) {
      setIsSecure(true);
    } else {
      setIsSecure(false);
    }
  }, [user, isAuthenticated]);

  return {
    user,
    loading: isLoading,
    error,
    isSecure,
    hasValidToken: isAuthenticated && isSecure
  };
};

/**
 * Hook pour faire des appels API sécurisés
 * Utilise l'instance API centralisée qui gère automatiquement les tokens
 */
export const useApiCall = () => {
  const { isAuthenticated } = useAuth();

  /**
   * Faire un appel API sécurisé
   * 
   * @param {string} endpoint - Endpoint de l'API (ex: '/users/me')
   * @param {Object} options - Options de la requête (method, body, etc.)
   * @returns {Promise} Réponse de l'API
   */
  const makeSecureCall = async (endpoint, options = {}) => {
    if (!isAuthenticated) {
      throw new Error('Authentification requise');
    }

    try {
      // Utiliser l'instance API centralisée qui gère automatiquement les tokens
      const method = options.method || 'GET';
      const config = {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      };

      let response;
      
      switch (method.toUpperCase()) {
        case 'GET':
          response = await api.get(endpoint, config);
          break;
        case 'POST':
          response = await api.post(endpoint, options.body, config);
          break;
        case 'PUT':
          response = await api.put(endpoint, options.body, config);
          break;
        case 'PATCH':
          response = await api.patch(endpoint, options.body, config);
          break;
        case 'DELETE':
          response = await api.delete(endpoint, config);
          break;
        default:
          throw new Error(`Méthode HTTP non supportée: ${method}`);
      }

      return response.data;
    } catch (error) {
      console.error('❌ Erreur appel API sécurisé:', error);
      throw error;
    }
  };

  return { makeSecureCall };
};