/**
 * Service de gestion des rôles
 * Centralise toute la logique métier liée aux rôles
 */

import api from './api';
import { showSuccess, showError } from '../utils/toast';

/**
 * Récupérer tous les rôles
 */
export const getRoles = async () => {
  try {
    const response = await api.get('/admin/roles');
    return response.data.data;
  } catch (error) {
    console.error('Erreur getRoles:', error);
    showError(error.response?.data?.message || 'Erreur lors de la récupération des rôles');
    throw error;
  }
};

/**
 * Récupérer un rôle par ID
 */
export const getRoleById = async (roleId) => {
  try {
    const response = await api.get(`/admin/roles/${roleId}`);
    return response.data.data;
  } catch (error) {
    console.error('Erreur getRoleById:', error);
    showError(error.response?.data?.message || 'Erreur lors de la récupération du rôle');
    throw error;
  }
};

/**
 * Créer un rôle
 */
export const createRole = async (roleData) => {
  try {
    const response = await api.post('/admin/roles', roleData);
    showSuccess('Rôle créé avec succès');
    return response.data;
  } catch (error) {
    console.error('Erreur createRole:', error);
    showError(error.response?.data?.message || 'Erreur lors de la création du rôle');
    throw error;
  }
};

/**
 * Mettre à jour un rôle
 */
export const updateRole = async (roleId, roleData) => {
  try {
    const response = await api.put(`/admin/roles/${roleId}`, roleData);
    showSuccess('Rôle mis à jour avec succès');
    return response.data;
  } catch (error) {
    console.error('Erreur updateRole:', error);
    showError(error.response?.data?.message || 'Erreur lors de la mise à jour du rôle');
    throw error;
  }
};

/**
 * Supprimer un rôle
 */
export const deleteRole = async (roleId) => {
  try {
    const response = await api.delete(`/admin/roles/${roleId}`);
    showSuccess('Rôle supprimé avec succès');
    return response.data;
  } catch (error) {
    console.error('Erreur deleteRole:', error);
    showError(error.response?.data?.message || 'Erreur lors de la suppression du rôle');
    throw error;
  }
};

/**
 * Récupérer toutes les permissions
 */
export const getAllPermissions = async () => {
  try {
    const response = await api.get('/admin/roles/permissions/all');
    return response.data.data;
  } catch (error) {
    console.error('Erreur getAllPermissions:', error);
    showError(error.response?.data?.message || 'Erreur lors de la récupération des permissions');
    throw error;
  }
};

/**
 * Exporter les rôles avec filtres avancés
 */
export const exportRoles = async ({ format = 'json', filters = {}, fields = [] }) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.isEditable !== undefined) queryParams.append('isEditable', filters.isEditable);

    const response = await api.get(`/admin/roles/export?${queryParams.toString()}`);
    const roles = response.data.data.roles || [];

    // Filtrer les champs si spécifié
    let exportData = roles;
    if (fields.length > 0) {
      exportData = roles.map(role => {
        const filtered = {};
        fields.forEach(field => {
          if (role[field] !== undefined) {
            // Traitement spécial pour les permissions
            if (field === 'permissions' && Array.isArray(role[field])) {
              filtered[field] = role[field].map(p => p.fullPermission || `${p.action}:${p.subject}`);
            } else {
              filtered[field] = role[field];
            }
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
      filename = `roles-export-${timestamp}.json`;
    } else if (format === 'csv') {
      const csv = convertToCSV(exportData);
      blob = new Blob([csv], { type: 'text/csv' });
      filename = `roles-export-${timestamp}.csv`;
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

    showSuccess(`${exportData.length} rôles exportés avec succès`);
    return { success: true, count: exportData.length };
  } catch (error) {
    console.error('Erreur exportRoles:', error);
    showError(error.response?.data?.message || 'Erreur lors de l\'export');
    throw error;
  }
};

/**
 * Importer des rôles
 */
export const importRoles = async ({ file, mode = 'create' }) => {
  try {
    // Lire le contenu du fichier
    const fileContent = await readFileContent(file);
    let roles = [];

    // Parser selon le type de fichier
    if (file.type === 'application/json' || file.name.endsWith('.json')) {
      const data = JSON.parse(fileContent);
      roles = Array.isArray(data) ? data : (data.roles || []);
    } else if (file.name.endsWith('.csv') || file.type === 'text/csv') {
      roles = parseCSV(fileContent);
    } else {
      throw new Error('Format de fichier non supporté');
    }

    // Envoyer les données au backend
    const response = await api.post('/admin/roles/import', {
      roles,
      mode
    });

    showSuccess(response.data.message || 'Import réussi');
    return response.data;
  } catch (error) {
    console.error('Erreur importRoles:', error);
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
  const roles = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const role = {};
    
    headers.forEach((header, index) => {
      if (values[index]) {
        // Traitement spécial pour les permissions
        if (header === 'permissions') {
          role[header] = values[index].split(';').map(p => p.trim());
        } else {
          role[header] = values[index];
        }
      }
    });
    
    // Vérifier que le rôle a au moins un nom
    if (role.name) {
      roles.push(role);
    }
  }
  
  return roles;
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
      
      // Traitement spécial pour les tableaux (permissions)
      if (Array.isArray(value)) {
        const arrayValue = value.join(';');
        return `"${arrayValue}"`;
      }
      
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',');
  });
  
  return [csvHeaders, ...csvRows].join('\n');
}
