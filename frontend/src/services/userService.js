/**
 * Service de gestion des utilisateurs
 * Centralise toute la logique métier liée aux utilisateurs
 */

import api from './api';
import { showSuccess, showError } from '../utils/toast';

/**
 * Récupérer la liste des utilisateurs avec pagination
 */
export const getUsers = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.role) queryParams.append('role', params.role);
    if (params.isBlocked !== undefined) queryParams.append('isBlocked', params.isBlocked);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response = await api.get(`/admin/users?${queryParams.toString()}`);
    
    // Gérer les deux formats (ancien et nouveau)
    const data = response.data.data;
    
    // Si data est un tableau, c'est l'ancien format
    if (Array.isArray(data)) {
      return {
        users: data,
        pagination: {
          page: params.page || 1,
          limit: params.limit || 15,
          total: data.length,
          pages: 1
        }
      };
    }
    
    // Sinon c'est le nouveau format avec { users: [], pagination: {} }
    return data;
  } catch (error) {
    console.error('Erreur getUsers:', error);
    showError(error.response?.data?.message || 'Erreur lors de la récupération des utilisateurs');
    throw error;
  }
};

/**
 * Récupérer TOUS les utilisateurs sans pagination
 */
export const getAllUsersNoPagination = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.search) queryParams.append('search', params.search);
    if (params.role) queryParams.append('role', params.role);
    if (params.isBlocked !== undefined) queryParams.append('isBlocked', params.isBlocked);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response = await api.get(`/admin/users/all?${queryParams.toString()}`);
    return response.data.data;
  } catch (error) {
    console.error('Erreur getAllUsersNoPagination:', error);
    showError(error.response?.data?.message || 'Erreur lors de la récupération de tous les utilisateurs');
    throw error;
  }
};

/**
 * Récupérer les détails d'un utilisateur
 */
export const getUserById = async (userId) => {
  try {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data.data;
  } catch (error) {
    console.error('Erreur getUserById:', error);
    showError(error.response?.data?.message || 'Erreur lors de la récupération des détails');
    throw error;
  }
};

/**
 * Récupérer les statistiques globales
 */
export const getUsersStats = async () => {
  try {
    const response = await api.get('/admin/users/stats/overview');
    return response.data.data;
  } catch (error) {
    console.error('Erreur getUsersStats:', error);
    showError(error.response?.data?.message || 'Erreur lors de la récupération des statistiques');
    throw error;
  }
};

/**
 * Bloquer un utilisateur
 */
export const blockUser = async (userId, reason) => {
  try {
    const response = await api.put(`/admin/users/${userId}/block`, { reason });
    showSuccess('Utilisateur bloqué avec succès');
    return response.data;
  } catch (error) {
    console.error('Erreur blockUser:', error);
    showError(error.response?.data?.message || 'Erreur lors du blocage de l\'utilisateur');
    throw error;
  }
};

/**
 * Débloquer un utilisateur
 */
export const unblockUser = async (userId) => {
  try {
    const response = await api.put(`/admin/users/${userId}/unblock`);
    showSuccess('Utilisateur débloqué avec succès');
    return response.data;
  } catch (error) {
    console.error('Erreur unblockUser:', error);
    showError(error.response?.data?.message || 'Erreur lors du déblocage de l\'utilisateur');
    throw error;
  }
};

/**
 * Révoquer toutes les sessions d'un utilisateur
 */
export const revokeUserSessions = async (userId) => {
  try {
    const response = await api.delete(`/admin/users/${userId}/sessions`);
    showSuccess('Sessions révoquées avec succès');
    return response.data;
  } catch (error) {
    console.error('Erreur revokeUserSessions:', error);
    showError(error.response?.data?.message || 'Erreur lors de la révocation des sessions');
    throw error;
  }
};

/**
 * Récupérer l'activité d'un utilisateur
 */
export const getUserActivity = async (userId) => {
  try {
    const response = await api.get(`/admin/users/${userId}/activity`);
    return response.data;
  } catch (error) {
    console.error('Erreur getUserActivity:', error);
    throw error;
  }
};

/**
 * Récupérer les statistiques d'un utilisateur
 */
export const getUserStats = async (userId) => {
  try {
    const response = await api.get(`/admin/users/${userId}/stats`);
    return response.data;
  } catch (error) {
    console.error('Erreur getUserStats:', error);
    throw error;
  }
};

/**
 * Exporter les utilisateurs avec filtres avancés
 */
export const exportUsers = async ({ format = 'json', filters = {}, fields = [] }) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.role) queryParams.append('role', filters.role);
    if (filters.isBlocked !== undefined) queryParams.append('isBlocked', filters.isBlocked);
    if (filters.search) queryParams.append('search', filters.search);

    const response = await api.get(`/admin/users/all?${queryParams.toString()}`);
    const users = response.data.data.users;

    // Filtrer les champs si spécifié
    let exportData = users;
    if (fields.length > 0) {
      exportData = users.map(user => {
        const filtered = {};
        fields.forEach(field => {
          if (user[field] !== undefined) {
            filtered[field] = user[field];
          }
        });
        return filtered;
      });
    }

    // Générer le fichier selon le format
    let blob, filename;
    const timestamp = new Date().toISOString().split('T')[0];

    if (format === 'json') {
      blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      filename = `users-export-${timestamp}.json`;
    } else if (format === 'csv') {
      const csv = convertToCSV(exportData);
      blob = new Blob([csv], { type: 'text/csv' });
      filename = `users-export-${timestamp}.csv`;
    } else if (format === 'excel') {
      // Pour Excel, on utilise CSV pour l'instant (peut être amélioré avec une lib comme xlsx)
      const csv = convertToCSV(exportData);
      blob = new Blob([csv], { type: 'text/csv' });
      filename = `users-export-${timestamp}.csv`;
    }

    // Télécharger le fichier
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showSuccess(`${exportData.length} utilisateurs exportés avec succès`);
    return { success: true, count: exportData.length };
  } catch (error) {
    console.error('Erreur exportUsers:', error);
    showError(error.response?.data?.message || 'Erreur lors de l\'export');
    throw error;
  }
};

/**
 * Importer des utilisateurs
 */
export const importUsers = async ({ file, mode = 'create' }) => {
  try {
    // Lire le contenu du fichier
    const fileContent = await readFileContent(file);
    let users = [];

    // Parser selon le type de fichier
    if (file.type === 'application/json') {
      const data = JSON.parse(fileContent);
      users = Array.isArray(data) ? data : (data.users || []);
    } else if (file.name.endsWith('.csv') || file.type === 'text/csv') {
      users = parseCSV(fileContent);
    } else {
      throw new Error('Format de fichier non supporté');
    }

    // Envoyer les données au backend
    const response = await api.post('/admin/users/import', {
      users,
      mode
    });

    showSuccess(response.data.message || 'Import réussi');
    return response.data;
  } catch (error) {
    console.error('Erreur importUsers:', error);
    showError(error.response?.data?.message || error.message || 'Erreur lors de l\'import');
    throw error;
  }
};

/**
 * Lire le contenu d'un fichier
 */
function readFileContent(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
}

/**
 * Parser un fichier CSV
 */
function parseCSV(csvContent) {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  // Première ligne = en-têtes
  const headers = lines[0].split(',').map(h => h.trim());
  
  // Lignes suivantes = données
  const users = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const user = {};
    
    headers.forEach((header, index) => {
      if (values[index]) {
        user[header] = values[index];
      }
    });
    
    // Vérifier que l'utilisateur a au moins un email
    if (user.email) {
      users.push(user);
    }
  }
  
  return users;
}

/**
 * Convertir un tableau d'objets en CSV
 */
function convertToCSV(data) {
  if (!data || data.length === 0) return '';

  // Récupérer les en-têtes
  const headers = Object.keys(data[0]);
  
  // Créer la ligne d'en-tête
  const csvHeaders = headers.join(',');
  
  // Créer les lignes de données
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      // Échapper les virgules et guillemets
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',');
  });
  
  return [csvHeaders, ...csvRows].join('\n');
}
