import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import authService from '../services/authService';
import storeService from '../services/storeService';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
  hasStores: boolean | null;
  checkEmailAvailability: (email: string) => Promise<boolean>;
  checkUserHasStores: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasStores, setHasStores] = useState<boolean | null>(null);

  // Vérifier si l'utilisateur a des boutiques
  const checkUserHasStores = async (): Promise<boolean> => {
    if (!user) return false;
    
    console.log('Vérification des boutiques pour l\'utilisateur:', user.id);
    
    // Vérifier d'abord le localStorage pour une réponse rapide
    const localStores = storeService.getStoresFromStorage();
    const hasLocalStores = localStores && localStores.length > 0;
    console.log('Boutiques trouvées dans localStorage:', localStores , );
    
    if (hasLocalStores) {
      console.log('Boutiques trouvées dans localStorage:', localStores);
      setHasStores(true);
      // Continuer à vérifier l'API en arrière-plan, mais retourner true immédiatement
      storeService.getStores(true).catch(err => {
        console.error('Erreur lors de la mise à jour des boutiques depuis l\'API:', err);
      });
      return true;
    }
    
    try {
      console.log('Récupération des boutiques depuis l\'API...');
      const stores = await storeService.getStores(true); // Force refresh
      const hasUserStores = stores && stores.length > 0;
      console.log('Boutiques récupérées depuis l\'API:', stores);
      setHasStores(hasUserStores);
      return hasUserStores;
    } catch (error) {
      console.error('Erreur lors de la vérification des boutiques via API:', error);
      // On a déjà vérifié le localStorage, donc on retourne false
      setHasStores(false);
      return false;
    }
  };

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('WebRichesse_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        
        // Vérifier la validité du token en récupérant les informations utilisateur
        const validateToken = async () => {
          try {
            const userData = await authService.getCurrentUser();
            if (userData) {
              setUser(userData.user);
              setHasStores(userData.hasStores);
              localStorage.setItem('WebRichesse_user', JSON.stringify(userData.user));
              console.log('Utilisateur authentifié avec hasStores =', userData.hasStores);
            } else {
              // Si l'API renvoie null, le token n'est plus valide
              await logout();
            }
          } catch (error) {
            console.error('Error validating token:', error);
          } finally {
            setLoading(false);
          }
        };
        
        validateToken();
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('WebRichesse_user');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      console.log('Tentative de connexion avec email:', email);
      const loggedInUser = await authService.login(email, password);
      setUser(loggedInUser);
      console.log('Utilisateur connecté:', loggedInUser);
      
      // Récupérer les informations utilisateur complètes, y compris hasStores
      const userData = await authService.getCurrentUser();
      if (userData) {
        console.log('Informations utilisateur après connexion:', userData);
        setHasStores(userData.hasStores);
        return userData.hasStores;
      }
      
      // Si on ne peut pas récupérer les informations complètes, utiliser le localStorage
      const localStores = storeService.getStoresFromStorage();
      const hasLocalStores = localStores && localStores.length > 0;
      
      if (hasLocalStores) {
        console.log('Boutiques trouvées dans localStorage après connexion:', localStores);
        setHasStores(true);
        return true;
      }
      
      // Par défaut, on suppose qu'il n'y a pas de boutiques
      setHasStores(false);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const registeredUser = await authService.register(name, email, password);
      setUser(registeredUser);
      
      // Un nouvel utilisateur n'a pas de boutiques
      setHasStores(false);
      return false;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setHasStores(null);
      setLoading(false);
    }
  };

  const checkEmailAvailability = async (email: string): Promise<boolean> => {
    try {
      return await authService.checkEmailAvailability(email);
    } catch (error) {
      console.error('Email check error:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      loading,
      hasStores,
      checkEmailAvailability,
      checkUserHasStores
    }}>
      {children}
    </AuthContext.Provider>
  );
};