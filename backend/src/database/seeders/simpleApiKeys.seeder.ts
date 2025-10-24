// src/database/seeders/simpleApiKeys.seeder.ts
import { SimpleApiKeyModel } from '../models/simpleApiKey.model';
import { logger } from '../../utils/logger';
import crypto from 'crypto';

export const seedSimpleApiKeys = async (): Promise<void> => {
  try {
    logger.info('[SEEDER] Début du seeding des Simple API keys...');
    
    // Clé système fixe pour le développement
    const systemKey = 'sk_59105e8b548140fe11e8bad8db2572f174a6266fe4b3c4ab';
    const systemHash = crypto.createHash('sha256').update(systemKey).digest('hex');
    
    // Vérifier si la clé système existe déjà
    const existingSystemKey = await SimpleApiKeyModel.findOne({ keyId: systemKey });
    
    if (!existingSystemKey) {
      const systemApiKey = new SimpleApiKeyModel({
        name: 'System API Key',
        description: 'Clé système pour les routes publiques et l\'authentification',
        keyId: systemKey,
        hashedKey: systemHash,
        permissions: ['admin'], // Permissions complètes
        isActive: true
      });
      
      await systemApiKey.save();
      logger.info(`[SEEDER] Clé système créée: ${systemKey}`);
    } else {
      logger.info('[SEEDER] Clé système déjà existante');
    }
    
    logger.info('[SEEDER] Simple API keys seedées avec succès');
    
  } catch (error) {
    logger.error('[SEEDER] Erreur lors du seeding des Simple API keys:', error);
    throw error;
  }
};