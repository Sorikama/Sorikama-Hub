// src/database/seeders/admin.seeder.ts
import bcrypt from 'bcrypt';
import { UserModel } from '../models/user.model';
import { RoleModel } from '../models/role.model';
import { ApiKeyModel } from '../models/apiKey.model';
import { logger } from '../../utils/logger';

export const seedAdmin = async () => {
  try {
    logger.info('👨‍💼 Seeding admin...');
    
    // Vérifier si l'admin existe déjà par emailHash
    const { createBlindIndex } = require('../../utils/crypto');
    const adminEmailHash = createBlindIndex('admin@sorikama.com');
    let adminUser = await UserModel.findOne({ emailHash: adminEmailHash });
    
    if (!adminUser) {
      // Récupérer le rôle superadmin
      const superadminRole = await RoleModel.findOne({ name: 'superadmin' });
      if (!superadminRole) {
        throw new Error('Rôle superadmin non trouvé. Exécutez d\'abord le seeder des rôles.');
      }
      
      // Créer l'utilisateur admin
      const hashedPassword = await bcrypt.hash('Admin@123', 12);
      
      adminUser = await UserModel.create({
        firstName: 'Super',
        lastName: 'Admin',
        email: 'admin@sorikama.com',
        emailHash: adminEmailHash,
        password: hashedPassword,
        roles: [superadminRole._id],
        isActive: true,
        isVerified: true
      });
      
      logger.info('✅ Utilisateur admin créé avec succès');
    } else {
      logger.info('ℹ️ Utilisateur admin existe déjà - mise à jour de l\'API key');
    }
    
    // Révoquer l'ancienne API key admin si elle existe
    await ApiKeyModel.updateMany(
      { userId: adminUser._id, name: 'Admin Default Key' },
      { isActive: false, revokedAt: new Date() }
    );
    
    // Générer une nouvelle API key pour l'admin
    const newApiKey = await ApiKeyModel.generateApiKey({
      userId: adminUser._id,
      name: 'Admin Default Key',
      permissions: ['*'], // Toutes les permissions
      rateLimit: {
        requests: 10000,
        windowMs: 60000 // 1 minute
      }
    });
    
    // Stocker la clé en variable globale pour l'utiliser dans l'app
    global.ADMIN_API_KEY = newApiKey.key;
    
    logger.info('✅ Nouvelle API key admin générée');
    logger.info(`🔑 API Key Admin: ${newApiKey.key}`);
    
    return {
      adminUser,
      apiKey: newApiKey.key
    };
    
  } catch (error) {
    logger.error('❌ Erreur lors du seeding admin:', error);
    throw error;
  }
};

// Extension globale pour TypeScript
declare global {
  var ADMIN_API_KEY: string;
}