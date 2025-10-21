/**
 * Contexte d'authentification global pour Sorikama Hub
 * 
 * Ce contexte gère l'état d'authentification dans toute l'application :
 * - État utilisateur (connecté/déconnecté)
 * - Actions d'authentification (inscription, connexion, déconnexion)
 * - Gestion des erreurs
 * - Processus d'inscription en 2 étapes
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService, authUtils } from '../services/api.js';
import { useToast } from './ToastContext.jsx';

// Création du contexte d'authentification
const AuthContext = createContext();

/**
 * État initial de l'authentification
 */
const initialState = {
  user: null,                    // Données de l'utilisateur connecté
  isAuthenticated: false,        // État de connexion
  isLoading: true,              // Chargement en cours
  error: null,                  // Message d'erreur
  verificationToken: null       // Token pour le processus d'inscription
};

/**
 * Actions disponibles pour modifier l'état d'authentification
 */
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',                    // Définir l'état de chargement
  SET_USER: 'SET_USER',                          // Définir l'utilisateur connecté
  SET_ERROR: 'SET_ERROR',                        // Définir une erreur
  LOGOUT: 'LOGOUT',                              // Déconnecter l'utilisateur
  SET_VERIFICATION_TOKEN: 'SET_VERIFICATION_TOKEN', // Sauver le token de vérification
  CLEAR_ERROR: 'CLEAR_ERROR'                     // Effacer les erreurs
};

/**
 * Reducer pour gérer les changements d'état d'authentification
 * 
 * @param {Object} state - État actuel
 * @param {Object} action - Action à exécuter
 * @returns {Object} Nouvel état
 */
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return { 
        ...state, 
        isLoading: action.payload 
      };
      
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,  // True si user existe
        isLoading: false,
        error: null
      };
      
    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
      
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        verificationToken: null
      };
      
    case AUTH_ACTIONS.SET_VERIFICATION_TOKEN:
      return {
        ...state,
        verificationToken: action.payload,
        error: null
      };
      
    case AUTH_ACTIONS.CLEAR_ERROR:
      return { 
        ...state, 
        error: null 
      };
      
    default:
      return state;
  }
}

/**
 * Provider du contexte d'authentification
 * Enveloppe l'application et fournit l'état + actions d'auth à tous les composants
 */
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const toast = useToast();

  /**
   * Initialisation de l'authentification au démarrage de l'app
   * Vérifie si l'utilisateur était déjà connecté
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔍 Vérification de l\'authentification existante...');
        
        if (authUtils.isAuthenticated()) {
          // Token existe - récupérer les données utilisateur
          const user = authUtils.getUser();
          
          if (user) {
            // Données utilisateur en cache - les utiliser
            console.log('✅ Utilisateur trouvé en cache:', user.email);
            dispatch({ type: AUTH_ACTIONS.SET_USER, payload: user });
          } else {
            // Token existe mais pas de données - récupérer le profil
            console.log('🔄 Récupération du profil utilisateur...');
            const profileData = await authService.getProfile();
            dispatch({ type: AUTH_ACTIONS.SET_USER, payload: profileData.data.user });
          }
        } else {
          // Pas de token - utilisateur non connecté
          console.log('ℹ️ Aucune authentification trouvée');
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
      } catch (error) {
        console.error('❌ Erreur initialisation auth:', error);
        
        // Token invalide ou expiré - nettoyer et déconnecter
        authUtils.clearStorage();
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
    };

    initializeAuth();
  }, []);

  /**
   * Actions d'authentification disponibles dans le contexte
   */
  const actions = {
    /**
     * ÉTAPE 1 : Demande d'inscription
     * Envoie les données utilisateur et reçoit un token de vérification
     * 
     * @param {Object} userData - Données du formulaire d'inscription
     * @returns {Promise} Réponse du serveur
     */
    async register(userData) {
      try {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
        dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
        
        console.log('📝 Démarrage du processus d\'inscription...');
        const response = await authService.register(userData);
        
        // Sauvegarder le token de vérification pour l'étape 2
        dispatch({ 
          type: AUTH_ACTIONS.SET_VERIFICATION_TOKEN, 
          payload: response.data.verificationToken 
        });
        
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        console.log('✅ Code de vérification envoyé');
        
        // Afficher un toast de succès
        toast.success('Code de vérification envoyé à votre email !');
        
        return response;
        
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Erreur lors de l\'inscription';
        console.error('❌ Erreur inscription:', errorMessage);
        dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
        throw error;
      }
    },

    /**
     * ÉTAPE 2 : Validation du compte
     * Valide le code reçu par email et finalise la création du compte
     * 
     * @param {string} code - Code de vérification à 6 chiffres
     * @returns {Promise} Réponse du serveur avec user et tokens
     */
    async verify(code) {
      try {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
        dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
        
        if (!state.verificationToken) {
          throw new Error('Token de vérification manquant. Veuillez recommencer l\'inscription.');
        }
        
        console.log('🔍 Vérification du code d\'inscription...');
        const response = await authService.verify({
          verificationToken: state.verificationToken,
          code
        });
        
        // Utilisateur créé et connecté automatiquement
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: response.data.user });
        console.log('✅ Compte créé et utilisateur connecté');
        
        // Afficher un toast de succès
        toast.success(`Bienvenue ${response.data.user.firstName} ! Votre compte a été créé avec succès.`);
        
        return response;
        
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Code de vérification invalide';
        console.error('❌ Erreur vérification:', errorMessage);
        dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
        throw error;
      }
    },

    /**
     * Connexion utilisateur
     * Authentifie avec email/password
     * 
     * @param {Object} credentials - Email et mot de passe
     * @returns {Promise} Réponse du serveur
     */
    async login(credentials) {
      try {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
        dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
        
        console.log('🚪 Tentative de connexion...');
        const response = await authService.login(credentials);
        
        // Utilisateur connecté
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: response.data.user });
        console.log('✅ Connexion réussie');
        
        // Afficher un toast de succès
        toast.success(`Bon retour ${response.data.user.firstName} !`);
        
        return response;
        
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Email ou mot de passe incorrect';
        console.error('❌ Erreur connexion:', errorMessage);
        dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
        throw error;
      }
    },

    /**
     * Déconnexion utilisateur
     * Invalide les tokens et nettoie l'état
     * IMPORTANT : Ne déconnecte QUE si le backend répond OK
     */
    async logout() {
      try {
        console.log('🚪 Déconnexion en cours...');
        const result = await authService.logout();
        
        // Si la déconnexion a réussi, mettre à jour l'état
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
        console.log('✅ Déconnexion réussie');
        
        // Afficher un toast de succès
        if (result?.warning) {
          toast.warning(result.warning);
        } else {
          toast.success('Vous avez été déconnecté avec succès');
        }
        
        // Retourner le résultat (peut contenir un warning)
        return result;
        
      } catch (error) {
        console.error('❌ Erreur lors de la déconnexion:', error);
        
        // Définir l'erreur dans l'état pour que le composant puisse l'afficher
        const errorMessage = error.message || 'Erreur lors de la déconnexion';
        dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
        
        // Propager l'erreur pour que le composant puisse la gérer
        throw error;
      }
    },

    /**
     * Mise à jour du profil utilisateur
     * 
     * @param {Object} profileData - Nouvelles données du profil
     * @returns {Promise} Profil mis à jour
     */
    async updateProfile(profileData) {
      try {
        dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
        
        console.log('✏️ Mise à jour du profil...');
        const response = await authService.updateProfile(profileData);
        
        // Mettre à jour l'utilisateur dans l'état
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: response.data.user });
        console.log('✅ Profil mis à jour');
        
        // Afficher un toast de succès
        toast.success('Profil mis à jour avec succès !');
        
        return response;
        
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Erreur lors de la mise à jour du profil';
        console.error('❌ Erreur mise à jour profil:', errorMessage);
        dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
        throw error;
      }
    },

    /**
     * Mise à jour du mot de passe
     * 
     * @param {Object} passwordData - Ancien et nouveau mot de passe
     * @returns {Promise} Confirmation
     */
    async updatePassword(passwordData) {
      try {
        dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
        
        console.log('🔒 Mise à jour du mot de passe...');
        const response = await authService.updatePassword(passwordData);
        
        console.log('✅ Mot de passe mis à jour');
        
        // Afficher un toast de succès
        toast.success('Mot de passe mis à jour avec succès !');
        
        return response;
        
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Erreur lors de la mise à jour du mot de passe';
        console.error('❌ Erreur mise à jour mot de passe:', errorMessage);
        dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
        throw error;
      }
    },

    /**
     * Régénération de l'API Key personnelle
     * L'ancienne clé devient invalide
     * 
     * @returns {Promise} Nouvelle API Key
     */
    async regenerateApiKey() {
      try {
        dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
        
        console.log('🔄 Régénération de l\'API Key...');
        const response = await authService.regenerateApiKey();
        
        // Mettre à jour l'utilisateur avec la nouvelle clé
        const updatedUser = { ...state.user, apiKey: response.data.apiKey };
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: updatedUser });
        
        console.log('✅ API Key régénérée');
        
        // Afficher un toast de succès
        toast.success('API Key régénérée avec succès !');
        
        return response;
        
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Erreur lors de la régénération de l\'API Key';
        console.error('❌ Erreur régénération API Key:', errorMessage);
        dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
        throw error;
      }
    },

    /**
     * Effacer les messages d'erreur
     */
    clearError() {
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
    }
  };

  // Valeur fournie par le contexte (état + actions)
  const contextValue = {
    // État
    ...state,
    // Actions
    ...actions
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook personnalisé pour utiliser le contexte d'authentification
 * 
 * @returns {Object} État et actions d'authentification
 * @throws {Error} Si utilisé en dehors d'un AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  
  return context;
}