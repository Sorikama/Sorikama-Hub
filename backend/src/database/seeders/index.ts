/**
 * Seeder principal - Initialise toute la base de données
 * 
 * Ordre d'exécution :
 * 1. Permissions et rôles (user, admin, super_admin)
 * 2. Compte administrateur par défaut
 * 3. Services externes (Masebuy)
 */

import { logger } from '../../utils/logger';
import { seedPermissions } from './permissions.seeder';
import { seedAdmin } from './admin.seeder';
import { seedServices } from './services.seeder';

/**
 * Fonction principale de seeding
 * À exécuter au premier démarrage ou via npm run db:seed
 */
export async function seedDatabase() {
  try {
    console.log('\n🌱 INITIALISATION DE LA BASE DE DONNÉES\n');
    console.log('═'.repeat(50));

    // 1. Créer les permissions et rôles système
    console.log('\n📋 Étape 1/3 : Permissions et rôles...');
    const permissionsResult = await seedPermissions();
    console.log(`   ✓ ${permissionsResult.permissionsCount} permissions`);
    console.log(`   ✓ ${permissionsResult.rolesCount} rôles système`);

    // 2. Créer le compte administrateur
    console.log('\n👤 Étape 2/3 : Compte administrateur...');
    const admin = await seedAdmin();
    console.log(`   ✓ Admin: ${admin.email}`);
    console.log(`   🔑 Mot de passe: Admin@123`);

    // 3. Créer les services externes
    console.log('\n🔌 Étape 3/3 : Services externes...');
    const servicesResult = await seedServices();
    if (servicesResult) {
      console.log(`   ✓ ${servicesResult.total} service(s) configuré(s)`);
      console.log(`   ✓ ${servicesResult.enabled} service(s) actif(s)`);
    }

    console.log('\n' + '═'.repeat(50));
    console.log('🎉 BASE DE DONNÉES INITIALISÉE AVEC SUCCÈS\n');
    console.log('📝 Identifiants admin:');
    console.log('   Email: admin@admin.fr');
    console.log('   Mot de passe: Admin@123\n');

    return {
      success: true,
      permissions: permissionsResult,
      admin,
      services: servicesResult
    };

  } catch (error) {
    console.error('\n❌ ERREUR LORS DE L\'INITIALISATION:', error);
    throw error;
  }
}

/**
 * Vérifier si la base de données a besoin d'être initialisée
 */
export async function needsSeeding(): Promise<boolean> {
  try {
    const { RoleModel } = require('../models/role.model');
    const { UserModel } = require('../models/user.model');

    // Vérifier si les rôles système existent
    const rolesCount = await RoleModel.countDocuments({ isSystem: true });
    
    // Vérifier si un admin existe
    const adminCount = await UserModel.countDocuments({ 
      role: { $in: ['admin', 'super_admin'] } 
    });

    return rolesCount < 3 || adminCount === 0;
  } catch (error) {
    logger.error('Erreur lors de la vérification du seeding:', error);
    return true; // En cas d'erreur, on considère qu'il faut seeder
  }
}
