// src/database/connection.ts
import mongoose from 'mongoose';
import { logger } from '../utils/logger';
import { MONGO_URI } from '../config';

export const connectDB = async () => {
  if (!MONGO_URI) {
    logger.error('MONGO_URI n\'est pas défini dans les variables d\'environnement.');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI);
    logger.info('Connexion à MongoDB réussie.');
  } catch (error) {
    logger.error('Erreur de connexion à MongoDB:', error);
    process.exit(1);
  }
};