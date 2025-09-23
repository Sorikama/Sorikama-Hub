// src/database/seeders/index.ts
import mongoose from 'mongoose';
import { seedPermissions } from './permissions';
import { seedRoles } from './roles';
import { seedAdmin } from './admin';
import { logger } from '../../utils/logger';
import { connectDB } from '../connexion';

const runSeeders = async () => {
  logger.info('Démarrage du processus de seeding...');
  
  // 1. Connexion à la base de données
  await connectDB();

  // 2. Exécution des seeders dans l'ordre
  await seedPermissions();
  await seedRoles();
  await seedAdmin();

  // 3. Déconnexion
  await mongoose.disconnect();
  logger.info('Processus de seeding terminé. Déconnexion de MongoDB.');
};

runSeeders().catch(error => {
  logger.error('Une erreur est survenue durant le seeding:', error);
  process.exit(1);
});