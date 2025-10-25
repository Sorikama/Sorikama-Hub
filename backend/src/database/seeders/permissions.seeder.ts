/**
 * Seeder pour les permissions par défaut
 */

import { PermissionModel } from '../models/permission.model';
import { RoleModel } from '../models/role.model';
import { logger } from '../../utils/logger';

/**
 * Permissions par défaut du système
 */
const defaultPermissions = [
  // Gestion des utilisateurs
  {
    action: 'read',
    subject: 'users',
    description: 'Voir la liste des utilisateurs'
  },
  {
    action: 'create',
    subject: 'users',
    description: 'Créer de nouveaux utilisateurs'
  },
  {
    action: 'update',
    subject: 'users',
    description: 'Modifier les utilisateurs'
  },
  {
    action: 'delete',
    subject: 'users',
    description: 'Supprimer des utilisateurs'
  },
  {
    action: 'block',
    subject: 'users',
    description: 'Bloquer/débloquer des utilisateurs'
  },

  // Gestion des rôles
  {
    action: 'read',
    subject: 'roles',
    description: 'Voir la liste des rôles'
  },
  {
    action: 'create',
    subject: 'roles',
    description: 'Créer de nouveaux rôles'
  },
  {
    action: 'update',
    subject: 'roles',
    description: 'Modifier les rôles'
  },
  {
    action: 'delete',
    subject: 'roles',
    description: 'Supprimer des rôles'
  },

  // Gestion des permissions
  {
    action: 'read',
    subject: 'permissions',
    description: 'Voir la liste des permissions'
  },
  {
    action: 'assign',
    subject: 'permissions',
    description: 'Assigner des permissions aux rôles'
  },

  // Gestion des services
  {
    action: 'read',
    subject: 'services',
    description: 'Voir la liste des services'
  },
  {
    action: 'create',
    subject: 'services',
    description: 'Créer de nouveaux services'
  },
  {
    action: 'update',
    subject: 'services',
    description: 'Modifier les services'
  },
  {
    action: 'delete',
    subject: 'services',
    description: 'Supprimer des services'
  },

  // Gestion des logs et audit
  {
    action: 'read',
    subject: 'logs',
    description: 'Voir les logs système'
  },
  {
    action: 'read',
    subject: 'audit',
    description: 'Voir l\'historique d\'audit'
  },

  // Gestion des statistiques
  {
    action: 'read',
    subject: 'stats',
    description: 'Voir les statistiques'
  },

  // Gestion de la configuration
  {
    action: 'read',
    subject: 'config',
    description: 'Voir la configuration système'
  },
  {
    action: 'update',
    subject: 'config',
    description: 'Modifier la configuration système'
  },

  // Accès aux services (pour tous les utilisateurs)
  {
    action: 'access',
    subject: 'services',
    description: 'Accéder aux services de la plateforme'
  }
];

/**
 * Les 3 rôles système par défaut (non modifiables)
 * D'autres rôles personnalisés peuvent être créés via l'interface
 */
const defaultRoles = [
  {
    name: 'super_admin',
    description: 'Super Administrateur - Accès complet et gestion de tous les admins',
    isEditable: false,
    isSystem: true,
    permissions: 'all' // Toutes les permissions
  },
  {
    name: 'admin',
    description: 'Administrateur - Gestion des utilisateurs et services',
    isEditable: false,
    isSystem: true,
    permissions: [
      'read:users', 'create:users', 'update:users', 'delete:users', 'block:users',
      'read:services', 'create:services', 'update:services', 'delete:services',
      'read:stats', 'read:logs', 'read:audit',
      'read:roles', 'read:permissions',
      'access:services'
    ]
  },
  {
    name: 'user',
    description: 'Utilisateur standard - Accès aux services de la plateforme',
    isEditable: false,
    isSystem: true,
    permissions: ['access:services'] // Seulement accès aux services
  }
];

/**
 * Seeder principal
 */
export async function seedPermissions() {
  try {
    logger.info('🌱 Début du seeding des permissions...');

    // 1. Créer ou mettre à jour les permissions (éviter les doublons)
    const createdPermissions = [];
    for (const perm of defaultPermissions) {
      const permission = await PermissionModel.findOneAndUpdate(
        { action: perm.action, subject: perm.subject },
        { 
          $set: {
            description: perm.description
          },
          $setOnInsert: {
            action: perm.action,
            subject: perm.subject
          }
        },
        { upsert: true, new: true }
      );
      createdPermissions.push(permission);
    }

    logger.info(`✅ ${createdPermissions.length} permissions créées/mises à jour`);

    // 2. Créer les 3 rôles système uniquement (éviter les doublons)
    let rolesCreated = 0;
    for (const roleData of defaultRoles) {
      let permissionIds;

      if (roleData.permissions === 'all') {
        // Super Admin : toutes les permissions
        permissionIds = createdPermissions.map(p => p._id);
      } else {
        // Admin et User : permissions spécifiques
        permissionIds = createdPermissions
          .filter(p => roleData.permissions.includes(`${p.action}:${p.subject}`))
          .map(p => p._id);
      }

      const role = await RoleModel.findOneAndUpdate(
        { name: roleData.name },
        {
          $set: {
            description: roleData.description,
            permissions: permissionIds,
            isEditable: false, // Rôles système non modifiables
            isSystem: true
          },
          $setOnInsert: {
            name: roleData.name
          }
        },
        { upsert: true, new: true }
      );

      if (role) {
        rolesCreated++;
        logger.info(`  ✓ Rôle "${roleData.name}" créé/mis à jour (${permissionIds.length} permissions)`);
      }
    }

    logger.info(`✅ ${rolesCreated} rôles système créés/mis à jour`);
    logger.info('🎉 Seeding des permissions terminé avec succès');

    return {
      success: true,
      permissionsCount: createdPermissions.length,
      rolesCount: rolesCreated
    };
  } catch (error) {
    logger.error('❌ Erreur lors du seeding des permissions:', error);
    throw error;
  }
}

/**
 * Fonction pour réinitialiser les permissions (développement uniquement)
 */
export async function resetPermissions() {
  try {
    logger.warn('⚠️ Réinitialisation des permissions...');

    // Supprimer toutes les permissions et rôles
    await PermissionModel.deleteMany({});
    await RoleModel.deleteMany({});

    // Re-créer les 3 rôles système
    await seedPermissions();

    logger.info('✅ Permissions réinitialisées - 3 rôles système recréés');
  } catch (error) {
    logger.error('❌ Erreur lors de la réinitialisation:', error);
    throw error;
  }
}
