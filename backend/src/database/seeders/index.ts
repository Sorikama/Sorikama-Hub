// src/database/seeders/index.ts
import { logger } from '../../utils/logger';
import { seedPermissions } from './permissions.seeder';
import { seedRoles } from './roles.seeder';
import { seedAdmin } from './admin.seeder';
import { seedApiKeys } from './apiKeys.seeder';
import { seedSimpleApiKeys } from './simpleApiKeys.seeder';

export const runSeeders = async (force = false) => {
  try {
    logger.info('🌱 Démarrage des seeders...');
    
    // 1. Permissions (base)
    await seedPermissions();
    
    // 2. Rôles (dépend des permissions)
    await seedRoles();
    
    // 3. Admin (dépend des rôles)
    await seedAdmin();
    
    // 4. API Keys par défaut (dépend de l'admin) - optionnel
    try {
      await seedApiKeys();
    } catch (error) {
      logger.warn('⚠️ Seeder API Keys ignoré (peut ne pas exister)');
    }
    
    // 5. Simple API Keys (clé système)
    await seedSimpleApiKeys();
    
    logger.info('✅ Tous les seeders terminés avec succès');
    
  } catch (error) {
    logger.error('❌ Erreur lors de l\'exécution des seeders:', error);
    throw error;
  }
};

// Route pour relancer manuellement les seeders
export const createSeederRoutes = (app: any) => {
  app.post('/api/v1/system/seed', async (req: any, res: any) => {
    try {
      const { force } = req.body;
      await runSeeders(force);
      res.json({ success: true, message: 'Seeders exécutés avec succès' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erreur lors des seeders' });
    }
  });
};