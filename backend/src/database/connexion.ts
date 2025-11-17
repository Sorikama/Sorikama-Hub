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
    mongoose.set('strictQuery', false);
    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };
    await mongoose.connect(MONGO_URI, options);
  } catch (error) {
    console.error('❌ Erreur MongoDB:', error);
    process.exit(1);
  }
};