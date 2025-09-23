// src/database/seeders/roles.ts
import { RoleModel } from '../models/role.model';
import { PermissionModel } from '../models/permission.model';
import { logger } from '../../utils/logger';

export const seedRoles = async () => {
  try {
    // 1. Rôle "user" (utilisateur standard)
    const userPermissions = await PermissionModel.find({
      subject: 'maison',
      action: { $in: ['create', 'read', 'update'] },
    });

    await RoleModel.findOneAndUpdate(
      { name: 'user' },
      {
        name: 'user',
        description: 'Accès de base pour les utilisateurs connectés.',
        permissions: userPermissions.map(p => p._id),
        isEditable: true,
      },
      { upsert: true, new: true }
    );

    // 2. Rôle "admin"
    const allPermissions = await PermissionModel.find({}); // L'admin a toutes les permissions

    await RoleModel.findOneAndUpdate(
      { name: 'admin' },
      {
        name: 'admin',
        description: 'Accès complet à toute l\'application.',
        permissions: allPermissions.map(p => p._id),
        isEditable: false, // Ce rôle ne devrait pas être modifié
      },
      { upsert: true, new: true }
    );
    
    logger.info('Rôles initialisés avec succès.');
  } catch (error) {
    logger.error('Erreur lors de l\'initialisation des rôles:', error);
  }
};