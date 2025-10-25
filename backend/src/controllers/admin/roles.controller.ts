/**
 * Contrôleur pour la gestion des rôles et permissions (Admin uniquement)
 */

import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { RoleModel } from '../../database/models/role.model';
import { PermissionModel } from '../../database/models/permission.model';
import { UserModel } from '../../database/models/user.model';
import AppError from '../../utils/AppError';
import { logger } from '../../utils/logger';
import { clearPermissionCache } from '../../middlewares/authorization.middleware';

/**
 * Récupérer tous les rôles avec leurs permissions
 */
export const getAllRoles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const roles = await RoleModel.find()
      .populate('permissions', 'action subject description')
      .sort({ name: 1 })
      .lean();

    // Compter les utilisateurs par rôle
    const rolesWithCounts = await Promise.all(
      roles.map(async (role) => {
        const userCount = await UserModel.countDocuments({ roles: role._id });
        return {
          ...role,
          userCount
        };
      })
    );

    logger.info('📋 Liste des rôles récupérée', {
      adminId: (req as any).user.id,
      count: roles.length
    });

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        roles: rolesWithCounts
      }
    });
  } catch (error) {
    logger.error('❌ Erreur lors de la récupération des rôles:', error);
    next(error);
  }
};

/**
 * Récupérer un rôle par ID
 */
export const getRoleById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { roleId } = req.params;

    const role = await RoleModel.findById(roleId)
      .populate('permissions', 'action subject description')
      .lean();

    if (!role) {
      throw new AppError('Rôle non trouvé', StatusCodes.NOT_FOUND);
    }

    // Récupérer les utilisateurs ayant ce rôle
    const users = await UserModel.find({ roles: roleId })
      .select('firstName lastName email')
      .limit(10)
      .lean();

    const userCount = await UserModel.countDocuments({ roles: roleId });

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        role,
        users,
        userCount
      }
    });
  } catch (error) {
    logger.error('❌ Erreur lors de la récupération du rôle:', error);
    next(error);
  }
};

/**
 * Créer un nouveau rôle
 */
export const createRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, permissions } = req.body;

    // Validation
    if (!name || !name.trim()) {
      throw new AppError('Le nom du rôle est requis', StatusCodes.BAD_REQUEST);
    }

    // Vérifier que le rôle n'existe pas déjà
    const existingRole = await RoleModel.findOne({ name: name.trim().toLowerCase() });
    if (existingRole) {
      throw new AppError('Un rôle avec ce nom existe déjà', StatusCodes.CONFLICT);
    }

    // Valider les permissions
    const validPermissions = [];
    if (permissions && Array.isArray(permissions)) {
      for (const permId of permissions) {
        const perm = await PermissionModel.findById(permId);
        if (perm) {
          validPermissions.push(permId);
        }
      }
    }

    // Créer le rôle
    const role = await RoleModel.create({
      name: name.trim().toLowerCase(),
      description: description?.trim() || '',
      permissions: validPermissions,
      isEditable: true
    });

    await role.populate('permissions', 'action subject description');

    logger.info('✅ Rôle créé', {
      adminId: (req as any).user.id,
      roleId: role._id,
      roleName: role.name
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Rôle créé avec succès',
      data: { role }
    });
  } catch (error) {
    logger.error('❌ Erreur lors de la création du rôle:', error);
    next(error);
  }
};

/**
 * Mettre à jour un rôle
 */
export const updateRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { roleId } = req.params;
    const { name, description, permissions } = req.body;

    const role = await RoleModel.findById(roleId);

    if (!role) {
      throw new AppError('Rôle non trouvé', StatusCodes.NOT_FOUND);
    }

    // Vérifier si le rôle est modifiable
    if (!role.isEditable) {
      throw new AppError('Ce rôle système ne peut pas être modifié', StatusCodes.FORBIDDEN);
    }

    // Mettre à jour les champs
    if (name && name.trim()) {
      // Vérifier l'unicité du nouveau nom
      const existingRole = await RoleModel.findOne({ 
        name: name.trim().toLowerCase(),
        _id: { $ne: roleId }
      });
      if (existingRole) {
        throw new AppError('Un rôle avec ce nom existe déjà', StatusCodes.CONFLICT);
      }
      role.name = name.trim().toLowerCase();
    }

    if (description !== undefined) {
      role.description = description.trim();
    }

    if (permissions && Array.isArray(permissions)) {
      // Valider les permissions
      const validPermissions = [];
      for (const permId of permissions) {
        const perm = await PermissionModel.findById(permId);
        if (perm) {
          validPermissions.push(permId);
        }
      }
      role.permissions = validPermissions;
    }

    await role.save();
    await role.populate('permissions', 'action subject description');

    // Nettoyer le cache des permissions pour tous les utilisateurs ayant ce rôle
    const usersWithRole = await UserModel.find({ roles: roleId }).select('_id');
    usersWithRole.forEach(user => clearPermissionCache(user._id));

    logger.info('✅ Rôle mis à jour', {
      adminId: (req as any).user.id,
      roleId: role._id,
      roleName: role.name
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Rôle mis à jour avec succès',
      data: { role }
    });
  } catch (error) {
    logger.error('❌ Erreur lors de la mise à jour du rôle:', error);
    next(error);
  }
};

/**
 * Supprimer un rôle
 */
export const deleteRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { roleId } = req.params;

    const role = await RoleModel.findById(roleId);

    if (!role) {
      throw new AppError('Rôle non trouvé', StatusCodes.NOT_FOUND);
    }

    // Vérifier si le rôle est modifiable
    if (!role.isEditable) {
      throw new AppError('Ce rôle système ne peut pas être supprimé', StatusCodes.FORBIDDEN);
    }

    // Vérifier si des utilisateurs ont ce rôle
    const userCount = await UserModel.countDocuments({ roles: roleId });
    if (userCount > 0) {
      throw new AppError(
        `Impossible de supprimer ce rôle car ${userCount} utilisateur(s) l'utilisent`,
        StatusCodes.CONFLICT
      );
    }

    await RoleModel.findByIdAndDelete(roleId);

    logger.warn('🗑️ Rôle supprimé', {
      adminId: (req as any).user.id,
      roleId,
      roleName: role.name
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Rôle supprimé avec succès'
    });
  } catch (error) {
    logger.error('❌ Erreur lors de la suppression du rôle:', error);
    next(error);
  }
};

/**
 * Récupérer toutes les permissions disponibles
 */
export const getAllPermissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const permissions = await PermissionModel.find()
      .sort({ subject: 1, action: 1 })
      .lean();

    // Grouper par subject
    const groupedPermissions = permissions.reduce((acc: any, perm) => {
      if (!acc[perm.subject]) {
        acc[perm.subject] = [];
      }
      acc[perm.subject].push({
        id: perm._id,
        action: perm.action,
        subject: perm.subject,
        description: perm.description,
        fullPermission: `${perm.action}:${perm.subject}`
      });
      return acc;
    }, {});

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        permissions: groupedPermissions,
        total: permissions.length
      }
    });
  } catch (error) {
    logger.error('❌ Erreur lors de la récupération des permissions:', error);
    next(error);
  }
};

/**
 * Assigner des rôles à un utilisateur
 */
export const assignRolesToUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const { roleIds } = req.body;

    if (!roleIds || !Array.isArray(roleIds)) {
      throw new AppError('roleIds doit être un tableau', StatusCodes.BAD_REQUEST);
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError('Utilisateur non trouvé', StatusCodes.NOT_FOUND);
    }

    // Vérifier que tous les rôles existent
    const roles = await RoleModel.find({ _id: { $in: roleIds } });
    if (roles.length !== roleIds.length) {
      throw new AppError('Un ou plusieurs rôles sont invalides', StatusCodes.BAD_REQUEST);
    }

    // Assigner les rôles
    user.roles = roleIds;
    await user.save();

    // Nettoyer le cache des permissions
    clearPermissionCache(userId);

    logger.info('✅ Rôles assignés à l\'utilisateur', {
      adminId: (req as any).user.id,
      userId,
      roleIds
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Rôles assignés avec succès',
      data: {
        userId,
        roles: roles.map(r => ({ id: r._id, name: r.name }))
      }
    });
  } catch (error) {
    logger.error('❌ Erreur lors de l\'assignation des rôles:', error);
    next(error);
  }
};

/**
 * Récupérer les rôles d'un utilisateur
 */
export const getUserRoles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    const user = await UserModel.findById(userId)
      .populate({
        path: 'roles',
        populate: { path: 'permissions', select: 'action subject description' }
      })
      .lean();

    if (!user) {
      throw new AppError('Utilisateur non trouvé', StatusCodes.NOT_FOUND);
    }

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        userId,
        roles: user.roles
      }
    });
  } catch (error) {
    logger.error('❌ Erreur lors de la récupération des rôles utilisateur:', error);
    next(error);
  }
};


/**
 * Seeder les permissions par défaut
 */
export const seedPermissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Import dynamique du seeder
    const seederModule = require('../../database/seeders/permissions.seeder');
    const result = await seederModule.seedPermissions();

    logger.info('🌱 Permissions seedées via API', {
      adminId: (req as any).user.id,
      result
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Permissions et rôles par défaut créés avec succès',
      data: result
    });
  } catch (error) {
    logger.error('❌ Erreur lors du seeding des permissions:', error);
    next(error);
  }
};

/**
 * Exporter les rôles
 */
export const exportRoles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isEditable = req.query.isEditable as string;

    // Construction du filtre
    const filter: any = {};
    if (isEditable !== undefined) {
      filter.isEditable = isEditable === 'true';
    }

    // Récupérer les rôles
    const roles = await RoleModel.find(filter)
      .populate('permissions', 'action subject description')
      .sort({ name: 1 })
      .lean();

    // Compter les utilisateurs par rôle
    const rolesWithCounts = await Promise.all(
      roles.map(async (role) => {
        const userCount = await UserModel.countDocuments({ roles: role._id });
        return {
          ...role,
          userCount,
          permissions: role.permissions.map((p: any) => ({
            id: p._id,
            action: p.action,
            subject: p.subject,
            fullPermission: `${p.action}:${p.subject}`
          }))
        };
      })
    );

    logger.info('📥 Export des rôles', {
      adminId: (req as any).user.id,
      count: rolesWithCounts.length,
      filter
    });

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        roles: rolesWithCounts
      }
    });
  } catch (error) {
    logger.error('❌ Erreur lors de l\'export des rôles:', error);
    next(error);
  }
};

/**
 * Importer des rôles
 */
export const importRoles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const mode = req.body.mode || 'create'; // create, update, merge
    const rolesData = req.body.roles || [];

    if (!Array.isArray(rolesData) || rolesData.length === 0) {
      throw new AppError('Format de données invalide', StatusCodes.BAD_REQUEST);
    }

    let created = 0;
    let updated = 0;
    let errors = 0;
    const errorDetails: any[] = [];

    for (const roleData of rolesData) {
      try {
        const { name, description, permissions } = roleData;

        if (!name) {
          errors++;
          errorDetails.push({ name, error: 'Nom requis' });
          continue;
        }

        // Vérifier si le rôle existe
        const existingRole = await RoleModel.findOne({ name });

        // Traiter les permissions
        let permissionIds: any[] = [];
        if (permissions && Array.isArray(permissions)) {
          // Si ce sont des strings (format "action:subject")
          if (typeof permissions[0] === 'string') {
            const permissionDocs = await Promise.all(
              permissions.map(async (perm: string) => {
                const [action, subject] = perm.split(':');
                return await PermissionModel.findOne({ action, subject });
              })
            );
            permissionIds = permissionDocs.filter(p => p).map(p => p!._id);
          } else {
            // Si ce sont déjà des IDs
            permissionIds = permissions;
          }
        }

        if (mode === 'create' && !existingRole) {
          // Créer un nouveau rôle
          await RoleModel.create({
            name,
            description,
            permissions: permissionIds,
            isEditable: true
          });
          created++;
        } else if (mode === 'update' && existingRole) {
          // Mettre à jour le rôle existant
          if (!existingRole.isEditable) {
            errors++;
            errorDetails.push({ name, error: 'Rôle système non modifiable' });
            continue;
          }
          existingRole.description = description || existingRole.description;
          existingRole.permissions = permissionIds.length > 0 ? permissionIds : existingRole.permissions;
          await existingRole.save();
          updated++;
        } else if (mode === 'merge') {
          if (existingRole) {
            // Mettre à jour
            if (existingRole.isEditable) {
              existingRole.description = description || existingRole.description;
              existingRole.permissions = permissionIds.length > 0 ? permissionIds : existingRole.permissions;
              await existingRole.save();
              updated++;
            } else {
              errors++;
              errorDetails.push({ name, error: 'Rôle système non modifiable' });
            }
          } else {
            // Créer
            await RoleModel.create({
              name,
              description,
              permissions: permissionIds,
              isEditable: true
            });
            created++;
          }
        }
      } catch (error) {
        errors++;
        errorDetails.push({ 
          name: roleData.name, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    logger.info('📥 Import rôles terminé', {
      adminId: (req as any).user.id,
      mode,
      created,
      updated,
      errors
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: `Import terminé: ${created} créés, ${updated} mis à jour, ${errors} erreurs`,
      data: {
        created,
        updated,
        errors,
        errorDetails: errors > 0 ? errorDetails : undefined
      }
    });

  } catch (error) {
    logger.error('❌ Erreur lors de l\'import des rôles:', error);
    next(error);
  }
};
