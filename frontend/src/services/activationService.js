/**
 * Service pour l'activation de compte
 */

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7000/api/v1';

/**
 * Vérifier si un token d'activation est valide
 */
export const checkActivationToken = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/auth/activation/check/${token}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Activer le compte avec un token
 */
export const activateAccount = async (token, password, confirmPassword) => {
  try {
    const response = await axios.post(`${API_URL}/auth/activation/activate/${token}`, {
      password,
      confirmPassword
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Renvoyer un email d'activation
 */
export const resendActivationEmail = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/auth/activation/resend`, {
      email
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
