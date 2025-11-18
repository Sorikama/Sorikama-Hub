/**
 * Script pour exécuter uniquement les seeders
 * Équivalent de "php artisan db:seed" de Laravel
 */

import mongoose from 'mongoose';
import { seedDatabase } from '../database/seeders';
import { logger } from '../utils/logger';
import dotenv from 'dotenv';

dotenv.config();

async function dbSeed() {
  try {
    // Connexion à la base de données
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || '';
    if (!mongoUri) {
      throw new Error('MONGODB_URI ou MONGO_URI non défini dans .env');
    }
    
    await mongoose.connect(mongoUri);
    logger.info('✅ Connecté à MongoDB');

    // Exécuter tous les seeders
    await seedDatabase();

    await mongoose.disconnect();
  } catch (error) {
    logger.error('❌ Erreur:', error);
    process.exit(1);
  }
}

dbSeed();
