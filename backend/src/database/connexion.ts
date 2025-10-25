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
    // Configurer Mongoose
    mongoose.set('strictQuery', false); // Préparer pour Mongoose 7

    // Options de connexion
    const options = {
      serverSelectionTimeoutMS: 5000, // Timeout réduit à 5 secondes
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(MONGO_URI, options);
    logger.info('✅ Connexion à MongoDB réussie.');
  } catch (error) {
    logger.error('❌ Erreur de connexion à MongoDB:', error);
    logger.error('💡 Vérifiez que MongoDB est démarré: mongod --dbpath ./data/db');
    process.exit(1);
  }
};