import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';

export const useSecureAuth = () => {
  const { user, loading, error } = useAuth();
  const [isSecure, setIsSecure] = useState(false);

  useEffect(() => {
    if (user && user.token) {
      // Vérifier que le token n'est pas expiré
      try {
        const tokenPayload = JSON.parse(atob(user.token.split('.')[1]));
        const isExpired = tokenPayload.exp * 1000 < Date.now();
        
        if (!isExpired) {
          setIsSecure(true);
        } else {
          setIsSecure(false);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du token:', error);
        setIsSecure(false);
      }
    } else {
      setIsSecure(false);
    }
  }, [user]);

  return {
    user,
    loading,
    error,
    isSecure,
    hasValidToken: !!user?.token && isSecure
  };
};

export const useApiCall = () => {
  const { user } = useAuth();

  const makeSecureCall = async (endpoint, options = {}) => {
    if (!user?.token) {
      throw new Error('Authentification incomplète');
    }

    const headers = {
      'Authorization': `Bearer ${user.token}`,
      'Content-Type': 'application/json',
      ...options.headers
    };

    const response = await fetch(`${import.meta.env.VITE_API_GATEWAY_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    return response.json();
  };

  return { makeSecureCall };
};