import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useToastContext } from './ToastContext';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Utiliser les toasts si disponibles (éviter l'erreur de contexte)
  let toast = null;
  try {
    toast = useToastContext();
  } catch (e) {
    // ToastContext pas encore disponible
  }

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userApiKey = localStorage.getItem('userApiKey');
    
    if (token && userApiKey) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/me');
      const userData = response.data.data?.user || response.data.user;
      
      setUser({
        ...userData,
        token: localStorage.getItem('token'),
        apiKey: localStorage.getItem('userApiKey')
      });
      setError(null);
    } catch (error) {
      console.error('Erreur de vérification auth:', error);
      clearAuthData();
    } finally {
      setLoading(false);
    }
  };

  const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userApiKey');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setError(null);
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/auth/login', { email, password });
      const { user, tokens } = response.data.data;
      
      if (!tokens?.accessToken || !user?.apiKey) {
        throw new Error('Données d\'authentification incomplètes');
      }
      
      // Stocker tous les tokens et données utilisateur
      localStorage.setItem('token', tokens.accessToken);
      localStorage.setItem('userApiKey', user.apiKey);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser({
        ...user,
        token: tokens.accessToken,
        apiKey: user.apiKey
      });
      
      toast?.success('Connexion réussie !');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur de connexion';
      setError(errorMessage);
      toast?.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/auth/register', userData);
      
      console.log('Réponse backend signup:', response.data); // Debug
      
      // L'inscription retourne un verificationToken
      const result = {
        message: response.data.message,
        requiresVerification: true,
        verificationToken: response.data.data?.verificationToken,
        email: userData.email
      };
      
      console.log('Résultat à retourner:', result); // Debug
      return result;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur d\'inscription';
      setError(errorMessage);
      toast?.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const verify = async (verificationData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/auth/verify', {
        verificationToken: verificationData.verificationToken,
        code: verificationData.code
      });
      
      const { user, tokens } = response.data.data;
      
      if (!tokens?.accessToken || !user?.apiKey) {
        throw new Error('Données de vérification incomplètes');
      }
      
      // Stocker tous les tokens et données utilisateur
      localStorage.setItem('token', tokens.accessToken);
      localStorage.setItem('userApiKey', user.apiKey);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser({
        ...user,
        token: tokens.accessToken,
        apiKey: user.apiKey
      });
      toast?.success('Compte vérifié avec succès !');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Code de vérification invalide ou expiré';
      setError(errorMessage);
      toast?.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      clearAuthData();
    }
  };

  const updateProfile = async (userData) => {
    try {
      const response = await api.patch('/auth/update-me', userData);
      const updatedUser = response.data.data?.user || response.data.user;
      
      const userWithTokens = {
        ...updatedUser,
        token: localStorage.getItem('token'),
        apiKey: localStorage.getItem('userApiKey')
      };
      
      setUser(userWithTokens);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      toast?.success('Profil mis à jour avec succès !');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur de mise à jour';
      setError(errorMessage);
      toast?.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const regenerateApiKey = async () => {
    try {
      const response = await api.post('/auth/regenerate-api-key');
      const { apiKey } = response.data.data;
      
      localStorage.setItem('userApiKey', apiKey);
      setUser(prev => ({ ...prev, apiKey }));
      
      toast?.success('API Key régénérée avec succès !');
      return apiKey;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur de régénération';
      setError(errorMessage);
      toast?.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    verify,
    logout,
    updateProfile,
    regenerateApiKey,
    checkAuth,
    clearError: () => setError(null)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};