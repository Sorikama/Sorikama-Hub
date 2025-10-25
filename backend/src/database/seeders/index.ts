// src/database/seeders/index.ts
import { logger } from '../../utils/logger';
import { seedPermissions } from './permissions.seeder';
// import { seedRoles } from './roles.seeder'; // Désactivé - seedPermissions() crée déjà les 3 rôles système
import { seedAdmin } from './admin.seeder';

export const runSeeders = async (force = false) => {
  try {
    logger.info('🌱 Démarrage des seeders...');
    
    // 1. Permissions et rôles système (3 rôles uniquement)
    await seedPermissions();
    
    // Note: seedRoles() a été supprimé car seedPermissions() crée déjà les 3 rôles système
    // Les rôles personnalisés peuvent être créés via l'interface admin
    
    // 2. Admin (dépend des rôles)
    await seedAdmin();
    
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