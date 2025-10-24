// src/database/seeders/roles.seeder.ts
import { RoleModel } from '../models/role.model';
import { PermissionModel } from '../models/permission.model';
import { logger } from '../../utils/logger';

export const rolesData = [
  {
    name: 'superadmin',
    description: 'Administrateur système avec tous les droits',
    permissions: ['manage:system', 'manage:user', 'manage:role', 'manage:permission', 'configure:gateway', 'monitor:gateway', 'route:gateway'],
    isEditable: false
  },
  {
    name: 'admin',
    description: 'Administrateur avec droits étendus',
    permissions: [
      'read:system', 'manage:user', 'read:role', 'assign:role', 'read:permission',
      'monitor:gateway', 'manage:soristore', 'manage:soripay', 'manage:soriwallet',
      'manage:sorilearn', 'manage:sorihealth', 'manage:soriaccess',
      'read:analytics', 'export:analytics', 'manage:notification', 'read:audit'
    ],
    isEditable: true
  },
  {
    name: 'moderator',
    description: 'Modérateur avec droits de gestion limités',
    permissions: [
      'read:user', 'update:user', 'read:role', 'read:permission',
      'write:soristore', 'write:soripay', 'write:sorilearn',
      'read:analytics', 'send:notification'
    ],
    isEditable: true
  },
  {
    name: 'premium',
    description: 'Utilisateur premium avec accès étendu',
    permissions: [
      'read:user', 'write:soristore', 'write:soripay', 'write:soriwallet',
      'write:sorilearn', 'write:sorihealth', 'write:soriaccess',
      'read:analytics'
    ],
    isEditable: true
  },
  {
    name: 'user',
    description: 'Utilisateur standard',
    permissions: [
      'read:user', 'read:soristore', 'read:soripay', 'read:soriwallet',
      'read:sorilearn', 'read:sorihealth', 'read:soriaccess'
    ],
    isEditable: true
  },
  {
    name: 'guest',
    description: 'Invité avec accès limité',
    permissions: ['read:soristore'],
    isEditable: false
  }
];

export const seedRoles = async (): Promise<void> => {
  try {
    logger.info('[SEEDER] Début du seeding des rôles...');
    
    for (const roleData of rolesData) {
      // Récupérer les IDs des permissions
      const permissionIds: string[] = [];
      
      for (const permString of roleData.permissions) {
        const [action, subject] = permString.split(':');
        const permission = await PermissionModel.findOne({ action, subject });
        
        if (permission) {
          permissionIds.push(permission._id);
        } else {
          logger.warn(`[SEEDER] Permission non trouvée: ${permString}`);
        }
      }
      
      // Créer ou mettre à jour le rôle
      await RoleModel.findOneAndUpdate(
        { name: roleData.name },
        {
          name: roleData.name,
          description: roleData.description,
          permissions: permissionIds,
          isEditable: roleData.isEditable
        },
        { upsert: true, new: true }
      );
    }
    
    const count = await RoleModel.countDocuments();
    logger.info(`[SEEDER] ${count} rôles créés/mis à jour avec succès`);
  } catch (error) {
    logger.error('[SEEDER] Erreur lors du seeding des rôles:', error);
    throw error;
  }
};