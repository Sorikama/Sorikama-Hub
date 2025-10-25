/**
 * Seeder pour créer le compte administrateur unique
 * 
 * Ce script crée automatiquement un compte admin avec :
 * - Email : admin@admin.fr
 * - Password : Admin@123
 * - Role : admin
 * 
 * Le compte est créé seulement s'il n'existe pas déjà
 */

import { UserModel } from '../models/user.model';
import { logger } from '../../utils/logger';
import { createBlindIndex } from '../../utils/crypto';

/**
 * Fonction pour créer le compte admin
 */
export async function seedAdmin() {
  try {
    // Email et mot de passe du compte admin
    const adminEmail = 'admin@admin.fr';
    const adminPassword = 'Admin@123';

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

    logger.info('🔑 Identifiants: admin@admin.fr / Admin@123');

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
    const adminEmail = 'admin@admin.fr';
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
