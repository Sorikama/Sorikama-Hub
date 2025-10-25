/**
 * Script pour nettoyer les anciens rôles et ne garder que les 3 rôles système
 */

import mongoose from 'mongoose';
import { RoleModel } from '../database/models/role.model';
import { UserModel } from '../database/models/user.model';
import { logger } from '../utils/logger';
import dotenv from 'dotenv';

dotenv.config();

const SYSTEM_ROLES = ['super_admin', 'admin', 'user'];

async function cleanOldRoles() {
  try {
    // Connexion à la base de données
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || '';
    if (!mongoUri) {
      throw new Error('MONGODB_URI ou MONGO_URI non défini dans .env');
    }
    await mongoose.connect(mongoUri);
    logger.info('✅ Connecté à MongoDB');

    // 1. Récupérer tous les rôles actuels
    const allRoles = await RoleModel.find();
    console.log(`\n📋 Rôles actuels en base: ${allRoles.length}`);
    allRoles.forEach(role => {
      console.log(`   - ${role.name}`);
    });

    // 2. Identifier les rôles à supprimer
    const rolesToDelete = allRoles.filter(role => !SYSTEM_ROLES.includes(role.name));
    
    if (rolesToDelete.length === 0) {
      console.log('\n✅ Aucun ancien rôle à supprimer. Base de données propre !');
      await mongoose.disconnect();
      return;
    }

    console.log(`\n⚠️  Rôles à supprimer: ${rolesToDelete.length}`);
    rolesToDelete.forEach(role => {
      console.log(`   - ${role.name}`);
    });

    // 3. Vérifier si des utilisateurs ont ces rôles
    const usersWithOldRoles = await UserModel.find({
      role: { $in: rolesToDelete.map(r => r.name) }
    });

    if (usersWithOldRoles.length > 0) {
      console.log(`\n⚠️  ${usersWithOldRoles.length} utilisateurs ont des anciens rôles`);
      console.log('   Migration vers le rôle "user"...');
      
      // Migrer ces utilisateurs vers le rôle "user"
      await UserModel.updateMany(
        { role: { $in: rolesToDelete.map(r => r.name) } },
        { $set: { role: 'user' } }
      );
      
      console.log('   ✅ Utilisateurs migrés vers "user"');
    }

    // 4. Supprimer les anciens rôles
    const deleteResult = await RoleModel.deleteMany({
      name: { $nin: SYSTEM_ROLES }
    });

    console.log(`\n✅ ${deleteResult.deletedCount} anciens rôles supprimés`);

    // 5. Afficher les rôles restants
    const remainingRoles = await RoleModel.find();
    console.log(`\n📋 Rôles système restants: ${remainingRoles.length}`);
    remainingRoles.forEach(role => {
      console.log(`   ✓ ${role.name}`);
    });

    console.log('\n🎉 Nettoyage terminé avec succès !');
    console.log('💡 Redémarre l\'application pour que le seeder recréé les 3 rôles système.\n');

    await mongoose.disconnect();
  } catch (error) {
    logger.error('❌ Erreur:', error);
    process.exit(1);
  }
}

cleanOldRoles();
