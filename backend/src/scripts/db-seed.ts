/**
 * Script pour exécuter uniquement les seeders
 * Équivalent de "php artisan db:seed" de Laravel
 */

import mongoose from 'mongoose';
import { seedPermissions } from '../database/seeders/permissions.seeder';
import { logger } from '../utils/logger';
import dotenv from 'dotenv';

dotenv.config();

async function dbSeed() {
  try {
    console.log('\n🌱 EXÉCUTION DES SEEDERS\n');

    // Connexion à la base de données
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || '';
    if (!mongoUri) {
      throw new Error('MONGODB_URI ou MONGO_URI non défini dans .env');
    }
    
    await mongoose.connect(mongoUri);
    logger.info('✅ Connecté à MongoDB');

    // Exécuter le seeder des permissions et rôles
    const result = await seedPermissions();
    
    console.log('\n📊 Résultats:');
    console.log(`   ✓ ${result.permissionsCount} permissions créées/mises à jour`);
    console.log(`   ✓ ${result.rolesCount} rôles système créés/mis à jour`);
    console.log('');
    console.log('🎉 Seeders exécutés avec succès !\n');

    await mongoose.disconnect();
  } catch (error) {
    logger.error('❌ Erreur:', error);
    process.exit(1);
  }
}

dbSeed();
