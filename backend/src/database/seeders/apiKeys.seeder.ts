// src/database/seeders/apiKeys.seeder.ts
import { ApiKeyModel } from '../models/apiKey.model';
import { UserModel } from '../models/user.model';
import { logger } from '../../utils/logger';
import crypto from 'crypto';

export const seedApiKeys = async (): Promise<void> => {
  try {
    logger.info('[SEEDER] Début du seeding des API keys...');
    
    // Trouver l'utilisateur admin
    const adminUser = await UserModel.findOne({ email: process.env.DEFAULT_ADMIN_EMAIL });
    
    if (!adminUser) {
      logger.warn('[SEEDER] Utilisateur admin non trouvé, skip du seeding des API keys');
      return;
    }
    
    // Vérifier si des API keys existent déjà
    const existingKeys = await ApiKeyModel.countDocuments({ userId: adminUser._id });
    
    if (existingKeys > 0) {
      logger.info('[SEEDER] API keys déjà existantes, skip du seeding');
      return;
    }
    
    // Créer une API key par défaut fixe pour le développement
    const defaultKey = 'sk_dev_default_key_12345678901234567890123456789012345678901234567890';
    const defaultHash = crypto.createHash('sha256').update(defaultKey).digest('hex');
    const defaultPrefix = defaultKey.substring(0, 8);
    
    const defaultApiKey = new ApiKeyModel({
      userId: adminUser._id,
      name: 'Default Development Key',
      keyHash: defaultHash,
      prefix: defaultPrefix,
      permissions: ['*'], // Toutes les permissions
      rateLimit: {
        requests: 10000,
        windowMs: 3600000 // 1 heure
      },
      allowedIPs: ['127.0.0.1', '::1', 'localhost'],
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Expire dans 30 jours
    });
    
    await defaultApiKey.save();
    
    // Créer une API key de développement aléatoire
    const { key: devKey, hash: devHash, prefix: devPrefix } = ApiKeyModel.generateApiKey();
    
    const devApiKey = new ApiKeyModel({
      userId: adminUser._id,
      name: 'Development Key',
      keyHash: devHash,
      prefix: devPrefix,
      permissions: ['*'], // Toutes les permissions
      rateLimit: {
        requests: 10000,
        windowMs: 3600000 // 1 heure
      },
      allowedIPs: ['127.0.0.1', '::1', 'localhost']
    });
    
    await devApiKey.save();
    
    // Créer une API key de test avec permissions limitées
    const { key: testKey, hash: testHash, prefix: testPrefix } = ApiKeyModel.generateApiKey();
    
    const testApiKey = new ApiKeyModel({
      userId: adminUser._id,
      name: 'Test Key',
      keyHash: testHash,
      prefix: testPrefix,
      permissions: [
        'read:soristore',
        'read:soripay',
        'read:soriwallet',
        'read:system'
      ],
      rateLimit: {
        requests: 1000,
        windowMs: 3600000 // 1 heure
      }
    });
    
    await testApiKey.save();
    
    logger.info('[SEEDER] API keys créées avec succès');
    logger.info(`[SEEDER] Default API Key: ${defaultKey}`);
    logger.info(`[SEEDER] Development API Key: ${devKey}`);
    logger.info(`[SEEDER] Test API Key: ${testKey}`);
    logger.warn('[SEEDER] ATTENTION: Sauvegardez ces clés, elles ne seront plus affichées !');
    
  } catch (error) {
    logger.error('[SEEDER] Erreur lors du seeding des API keys:', error);
    throw error;
  }
};