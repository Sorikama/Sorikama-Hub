// src/database/seeders/permissions.ts
import { PermissionModel } from '../models/permission.model';
import { logger } from '../../utils/logger';

// Définissez ici toutes les permissions de votre application
const permissions = [
  // Permissions pour les utilisateurs
  { action: 'manage', subject: 'user', description: 'Gérer tous les utilisateurs' },
  { action: 'create', subject: 'user', description: 'Créer un utilisateur' },
  { action: 'read', subject: 'user', description: 'Lire les informations des utilisateurs' },
  { action: 'update', subject: 'user', description: 'Mettre à jour un utilisateur' },
  { action: 'delete', subject: 'user', description: 'Supprimer un utilisateur' },

  // Permissions pour les maisons
  { action: 'manage', subject: 'maison', description: 'Gérer toutes les maisons' },
  { action: 'create', subject: 'maison', description: 'Créer une maison' },
  { action: 'read', subject: 'maison', description: 'Lire les informations d\'une maison' },
  { action: 'update', subject: 'maison', description: 'Mettre à jour une maison' },
  { action: 'delete', subject: 'maison', description: 'Supprimer une maison' },
  
  // Permissions pour les rôles
  { action: 'manage', subject: 'role', description: 'Gérer les rôles et permissions' },
];

export const seedPermissions = async () => {
  try {
    for (const p of permissions) {
      // Trouve ou crée la permission pour éviter les doublons
      await PermissionModel.findOneAndUpdate(
        { action: p.action, subject: p.subject },
        p,
        { upsert: true, new: true }
      );
    }
    logger.info('Permissions initialisées avec succès.');
  } catch (error) {
    logger.error('Erreur lors de l\'initialisation des permissions:', error);
  }
};