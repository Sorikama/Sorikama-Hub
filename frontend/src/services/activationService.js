/**
 * Service pour l'activation de compte
 * Utilise l'instance API centralisée pour la gestion des tokens
 */

import api from './api';

/**
 * Vérifier si un token d'activation est valide
 * 
 * @param {string} token - Token d'activation
 * @returns {Promise} Données de validation
 */
export const checkActivationToken = async (token) => {
  try {
    const response = await api.get(`/auth/activation/check/${token}`);
    return response.data;
  } catch (error) {
    console.error('❌ Erreur vérification token activation:', error);
    throw error;
  }
};

/**
 * Activer le compte avec un token
 * 
 * @param {string} token - Token d'activation
 * @param {string} password - Nouveau mot de passe
 * @param {string} confirmPassword - Confirmation du mot de passe
 * @returns {Promise} Données d'activation
 */
export const activateAccount = async (token, password, confirmPassword) => {
  try {
    const response = await api.post(`/auth/activation/activate/${token}`, {
      password,
      confirmPassword
    });
    return response.data;
  } catch (error) {
    console.error('❌ Erreur activation compte:', error);
    throw error;
  }
};

/**
 * Renvoyer un email d'activation
 * 
 * @param {string} email - Email de l'utilisateur
 * @returns {Promise} Confirmation d'envoi
 */
export const resendActivationEmail = async (email) => {
  try {
    const response = await api.post(`/auth/activation/resend`, {
      email
    });
    return response.data;
  } catch (error) {
    console.error('❌ Erreur renvoi email activation:', error);
    throw error;
  }
};
