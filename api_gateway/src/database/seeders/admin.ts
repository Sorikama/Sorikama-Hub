// src/database/seeders/admin.ts
import { UserModel } from '../models/user.model';
import { RoleModel } from '../models/role.model';
import { logger } from '../../utils/logger';
import { DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD } from '../../config';
import { createBlindIndex } from '../../utils/crypto';

export const seedAdmin = async () => {
  try {
    if (!DEFAULT_ADMIN_EMAIL || !DEFAULT_ADMIN_PASSWORD) {
      logger.warn('Email ou mot de passe de l\'admin par défaut non défini. Skip seeding admin.');
      return;
    }

    const adminRole = await RoleModel.findOne({ name: 'admin' });
    if (!adminRole) {
      logger.error('Le rôle "admin" n\'a pas été trouvé. Assurez-vous d\'initialiser les rôles avant.');
      return;
    }

    // On calcule d'abord le hash pour faire la recherche
    const adminEmailHash = createBlindIndex(DEFAULT_ADMIN_EMAIL);
    // On vérifie si un admin existe déjà en utilisant le hash
    const adminExists = await UserModel.findOne({ emailHash: adminEmailHash });

    if (!adminExists) {
      // On réutilise le hash déjà calculé
      await UserModel.create({
        firstName: 'Admin',
        lastName: 'Sorikama',
        email: DEFAULT_ADMIN_EMAIL,
        emailHash: adminEmailHash,
        password: DEFAULT_ADMIN_PASSWORD,
        roles: [adminRole._id],
        isVerified: true,
        isActive: true,
      });
      logger.info('Utilisateur admin créé avec succès.');
    } else {
      logger.info('Utilisateur admin existe déjà.');
    }
  } catch (error) {
    logger.error("Erreur lors de la création de l'admin:", error);
  }
};