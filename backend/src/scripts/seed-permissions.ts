/**
 * Script pour seeder les permissions par défaut
 * Usage: npm run seed:permissions
 */

import mongoose from 'mongoose';
import { seedPermissions } from '../database/seeders/permissions.seeder';
import { logger } from '../utils/logger';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

async function main() {
  try {
    // Connexion à MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sorikama_gateway';
    
    logger.info('📡 Connexion à MongoDB...');
    await mongoose.connect(mongoUri);
    logger.info('✅ Connecté à MongoDB');

    // Exécuter le seeder
    const result = await seedPermissions();

    logger.info('📊 Résultat du seeding:');
    logger.info(`   - Permissions: ${result.permissionsCount}`);
    logger.info(`   - Rôles: ${result.rolesCount}`);

    // Fermer la connexion
    await mongoose.connection.close();
    logger.info('👋 Connexion fermée');

    process.exit(0);
  } catch (error) {
    logger.error('❌ Erreur:', error);
    process.exit(1);
  }
}

main();
