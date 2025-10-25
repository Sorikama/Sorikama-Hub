/**
 * Script pour réinitialiser uniquement les rôles et permissions
 * Garde les utilisateurs intacts
 */

import mongoose from 'mongoose';
import { RoleModel } from '../database/models/role.model';
import { PermissionModel } from '../database/models/permission.model';
import { UserModel } from '../database/models/user.model';
import { seedPermissions } from '../database/seeders/permissions.seeder';
import { logger } from '../utils/logger';
import dotenv from 'dotenv';

dotenv.config();

const SYSTEM_ROLES = ['super_admin', 'admin', 'user'];

async function dbRefreshRoles() {
  try {
    console.log('\n🔄 RÉINITIALISATION DES RÔLES ET PERMISSIONS\n');

    // Connexion à la base de données
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || '';
    if (!mongoUri) {
      throw new Error('MONGODB_URI ou MONGO_URI non défini dans .env');
    }
    
    await mongoose.connect(mongoUri);
    logger.info('✅ Connecté à MongoDB');

    // 1. Vérifier les utilisateurs avec des rôles invalides
    const usersWithInvalidRoles = await UserModel.find({
      role: { $nin: SYSTEM_ROLES }
    });

    if (usersWithInvalidRoles.length > 0) {
      console.log(`\n⚠️  ${usersWithInvalidRoles.length} utilisateurs ont des rôles invalides`);
      console.log('   Migration vers le rôle "user"...');
      
      await UserModel.updateMany(
        { role: { $nin: SYSTEM_ROLES } },
        { $set: { role: 'user' } }
      );
      
      console.log('   ✓ Utilisateurs migrés vers "user"');
    }

    // 2. Supprimer tous les rôles et permissions
    const rolesCount = await RoleModel.countDocuments();
    const permissionsCount = await PermissionModel.countDocuments();

    await RoleModel.deleteMany({});
    await PermissionModel.deleteMany({});

    console.log(`\n🗑️  Suppression:`);
    console.log(`   ✓ ${rolesCount} rôles supprimés`);
    console.log(`   ✓ ${permissionsCount} permissions supprimées`);

    // 3. Recréer les rôles et permissions système
    console.log('\n🌱 Recréation des rôles système...');
    
    const result = await seedPermissions();
    
    console.log(`   ✓ ${result.permissionsCount} permissions créées`);
    console.log(`   ✓ ${result.rolesCount} rôles système créés`);

    // 4. Afficher le résumé
    const usersCount = await UserModel.countDocuments();
    const superAdminsCount = await UserModel.countDocuments({ role: 'super_admin' });
    const adminsCount = await UserModel.countDocuments({ role: 'admin' });
    const usersCountByRole = await UserModel.countDocuments({ role: 'user' });

    console.log('\n📊 État final:');
    console.log(`   - ${result.rolesCount} rôles système (super_admin, admin, user)`);
    console.log(`   - ${result.permissionsCount} permissions`);
    console.log(`   - ${usersCount} utilisateurs conservés:`);
    console.log(`     • ${superAdminsCount} super admin(s)`);
    console.log(`     • ${adminsCount} admin(s)`);
    console.log(`     • ${usersCountByRole} utilisateur(s)`);

    console.log('\n🎉 Rôles et permissions réinitialisés avec succès !\n');

    await mongoose.disconnect();
  } catch (error) {
    logger.error('❌ Erreur:', error);
    process.exit(1);
  }
}

dbRefreshRoles();
