/**
 * Script pour réinitialiser complètement la base de données
 * Équivalent de "php artisan migrate:fresh --seed" de Laravel
 */

import mongoose from 'mongoose';
import { RoleModel } from '../database/models/role.model';
import { PermissionModel } from '../database/models/permission.model';
import { UserModel } from '../database/models/user.model';
import { seedPermissions } from '../database/seeders/permissions.seeder';
import { logger } from '../utils/logger';
import dotenv from 'dotenv';
import * as readline from 'readline';

dotenv.config();

// Interface pour poser des questions
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}

async function dbFresh() {
  try {
    console.log('\n🔄 RÉINITIALISATION DE LA BASE DE DONNÉES\n');
    console.log('⚠️  ATTENTION : Cette action va supprimer TOUTES les données !');
    console.log('   - Tous les utilisateurs');
    console.log('   - Tous les rôles');
    console.log('   - Toutes les permissions');
    console.log('   - Toutes les autres collections\n');

    const answer = await question('Êtes-vous sûr de vouloir continuer ? (oui/non) : ');
    
    if (answer.toLowerCase() !== 'oui') {
      console.log('\n❌ Opération annulée.\n');
      rl.close();
      process.exit(0);
    }

    // Connexion à la base de données
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || '';
    if (!mongoUri) {
      throw new Error('MONGODB_URI ou MONGO_URI non défini dans .env');
    }
    
    await mongoose.connect(mongoUri);
    logger.info('✅ Connecté à MongoDB');

    console.log('\n🗑️  Suppression de toutes les données...\n');

    // 1. Supprimer toutes les collections
    const collections = await mongoose.connection.db.collections();
    let deletedCount = 0;

    for (const collection of collections) {
      const count = await collection.countDocuments();
      await collection.deleteMany({});
      console.log(`   ✓ ${collection.collectionName}: ${count} documents supprimés`);
      deletedCount += count;
    }

    console.log(`\n✅ ${deletedCount} documents supprimés au total`);

    // 2. Réinitialiser les seeders
    console.log('\n🌱 Exécution des seeders...\n');

    // Seeder des permissions et rôles
    const result = await seedPermissions();
    
    console.log(`   ✓ ${result.permissionsCount} permissions créées`);
    console.log(`   ✓ ${result.rolesCount} rôles système créés`);

    // 3. Créer un utilisateur admin par défaut (optionnel)
    const createAdmin = await question('\nVoulez-vous créer un utilisateur admin par défaut ? (oui/non) : ');
    
    if (createAdmin.toLowerCase() === 'oui') {
      const bcrypt = require('bcrypt');
      const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@sorikama.com';
      const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123';

      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      const adminUser = await UserModel.create({
        email: adminEmail,
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'System',
        role: 'super_admin',
        isEmailVerified: true,
        isBlocked: false
      });

      console.log(`\n   ✓ Super Admin créé:`);
      console.log(`     Email: ${adminEmail}`);
      console.log(`     Password: ${adminPassword}`);
      console.log(`     ⚠️  Changez ce mot de passe en production !`);
    }

    console.log('\n🎉 Base de données réinitialisée avec succès !\n');
    console.log('📋 Résumé:');
    console.log(`   - ${result.permissionsCount} permissions`);
    console.log(`   - ${result.rolesCount} rôles système (super_admin, admin, user)`);
    if (createAdmin.toLowerCase() === 'oui') {
      console.log(`   - 1 super admin par défaut`);
    }
    console.log('');

    await mongoose.disconnect();
    rl.close();
  } catch (error) {
    logger.error('❌ Erreur:', error);
    rl.close();
    process.exit(1);
  }
}

dbFresh();
