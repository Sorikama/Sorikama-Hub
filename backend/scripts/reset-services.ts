/**
 * Script pour réinitialiser la collection services
 * Utile en cas de problème d'index
 * 
 * Usage: npx ts-node scripts/reset-services.ts
 */

import mongoose from 'mongoose';
import { connectDB } from '../src/database/connexion';
import { resetServicesCollection, seedServices } from '../src/database/seeders/services.seeder';
import { logger } from '../src/utils/logger';

async function main() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await connectDB();
    
    console.log('🗑️ Réinitialisation de la collection services...');
    await resetServicesCollection();
    
    console.log('🌱 Seeding des services par défaut...');
    await seedServices();
    
    console.log('✅ Terminé !');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

main();
