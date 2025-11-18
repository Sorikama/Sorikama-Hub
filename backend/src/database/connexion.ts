// src/database/connection.ts
import mongoose from 'mongoose';
import { logger } from '../utils/logger';
import { MONGO_URI } from '../config';

export const connectDB = async () => {
  if (!MONGO_URI) {
    console.error('❌ MONGO_URI non défini');
    process.exit(1);
  }

  try {
    console.log('🔄 Tentative de connexion à MongoDB...');
    mongoose.set('strictQuery', false);
    const options = {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };
    await mongoose.connect(MONGO_URI, options);
    console.log('✅ Connexion à MongoDB réussie');
    logger.info('✅ Connexion à MongoDB réussie');
  } catch (error) {
    console.error('❌ Erreur MongoDB:', error);
    logger.error('❌ Erreur MongoDB:', error);
    process.exit(1);
  }
};