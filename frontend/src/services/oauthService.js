/**
 * Service OAuth/SSO pour Sorikama Hub
 * 
 * Gère les opérations d'autorisation pour les services externes
 */

import api from './api';

/**
 * Récupérer les informations d'un service par son slug
 * 
 * @param {string} serviceSlug - Slug du service
 * @returns {Promise} Données du service
 */
export const getServiceBySlug = async (serviceSlug) => {
  try {
    console.log('🔍 Récupération du service:', serviceSlug);
    const response = await api.get(`/auth/services/${serviceSlug}`);
    console.log('✅ Service récupéré:', response.data.data.service.name);
    return response.data.data.service;
  } catch (error) {
    console.error('❌ Erreur récupération service:', error);
    throw error;
  }
};

/**
 * Autoriser un service externe à accéder au compte utilisateur
 * 
 * @param {string} serviceSlug - Slug du service
 * @param {string} redirectUrl - URL de callback du service
 * @returns {Promise} Token d'autorisation et données utilisateur
 */
export const authorizeService = async (serviceSlug, redirectUrl) => {
  try {
    console.log('🔐 Demande d\'autorisation pour:', serviceSlug);
    const response = await api.post('/auth/authorize', {
      service: serviceSlug,
      redirectUrl: redirectUrl
    });
    console.log('✅ Autorisation accordée');
    return response.data.data;
  } catch (error) {
    console.error('❌ Erreur autorisation:', error);
    throw error;
  }
};

/**
 * Récupérer le profil utilisateur actuel
 * 
 * @returns {Promise} Données utilisateur
 */
export const getCurrentUser = async () => {
  try {
    console.log('👤 Récupération du profil utilisateur');
    const response = await api.get('/auth/me');
    console.log('✅ Profil récupéré:', response.data.data.user.email);
    return response.data.data.user;
  } catch (error) {
    console.error('❌ Erreur récupération profil:', error);
    throw error;
  }
};
