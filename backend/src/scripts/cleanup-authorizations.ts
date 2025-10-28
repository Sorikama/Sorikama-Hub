/**
 * Script de nettoyage des autorisations expirées
 * À exécuter périodiquement (cron job)
 */

import mongoose from 'mongoose';
import { cleanupExpiredAuthorizations } from '../services/authorization.service';
import { logger } from '../utils/logger';
import { MONGO_URI } from '../config';

const runCleanup = async () => {
  try {
    logger.info('🧹 Démarrage du nettoyage des autorisations expirées...');

    // Connexion à MongoDB
    await mongoose.connect(MONGO_URI);
    logger.info('✅ Connecté à MongoDB');

    // Nettoyer les autorisations expirées
    const count = await cleanupExpiredAuthorizations();

    if (count > 0) {
      logger.info(`✅ ${count} autorisations expirées nettoyées`);
    } else {
      logger.info('✅ Aucune autorisation expirée à nettoyer');
    }

    // Déconnexion
    await mongoose.disconnect();
    logger.info('🔌 Déconnecté de MongoDB');

    process.exit(0);
  } catch (error) {
    logger.error('❌ Erreur lors du nettoyage:', error);
    process.exit(1);
  }
};

// Exécuter le nettoyage
runCleanup();
