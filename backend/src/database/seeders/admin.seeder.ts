/**
 * Seeder pour créer le compte administrateur unique
 * 
 * Ce script crée automatiquement un compte admin avec :
 * - Email : depuis DEFAULT_ADMIN_EMAIL (.env)
 * - Password : depuis DEFAULT_ADMIN_PASSWORD (.env)
 * - Role : admin
 * 
 * Le compte est créé seulement s'il n'existe pas déjà
 */

import { UserModel } from '../models/user.model';
import { logger } from '../../utils/logger';
import { createBlindIndex } from '../../utils/crypto';
import { DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD } from '../../config';

/**
 * Fonction pour créer le compte admin
 */
export async function seedAdmin() {
  try {
    // Email et mot de passe du compte admin depuis .env
    const adminEmail = DEFAULT_ADMIN_EMAIL || 'admin@sorikama.com';
    const adminPassword = DEFAULT_ADMIN_PASSWORD || 'Admin@123';

    // Vérifier si le compte admin existe déjà en utilisant le blind index
    const emailHash = createBlindIndex(adminEmail.toLowerCase());
    const existingAdmin = await UserModel.findOne({ emailHash });

    if (existingAdmin) {
      logger.info('✅ Compte admin existant');
      return existingAdmin;
    }

    // Créer le compte admin
    const admin = await UserModel.create({
      firstName: 'Admin',
      lastName: 'Sorikama',
      email: adminEmail,
      emailHash: emailHash,
      password: adminPassword,
      role: 'admin',
      isVerified: true,
      isActive: true,
      isBlocked: false,
      loginCount: 0,
    });

    logger.info('✅ Compte admin créé', {
      email: adminEmail,
      role: admin.role
    });

    logger.info(`🔑 Identifiants: ${adminEmail} / ${adminPassword}`);

    return admin;

  } catch (error: any) {
    logger.error('❌ Erreur création compte admin:', error);
    throw error;
  }
}

/**
 * Fonction pour supprimer le compte admin (utile pour les tests)
 */
export async function removeAdmin() {
  try {
    const adminEmail = DEFAULT_ADMIN_EMAIL || 'admin@sorikama.com';
    const emailHash = createBlindIndex(adminEmail.toLowerCase());
    const result = await UserModel.deleteOne({ emailHash });

    if (result.deletedCount > 0) {
      logger.info('🗑️ Compte admin supprimé');
    } else {
      logger.info('ℹ️ Aucun compte admin à supprimer');
    }

    return result;
  } catch (error: any) {
    logger.error('❌ Erreur lors de la suppression du compte admin:', error);
    throw error;
  }
}
