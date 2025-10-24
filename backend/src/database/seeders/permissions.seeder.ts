// src/database/seeders/permissions.seeder.ts
import { PermissionModel } from '../models/permission.model';
import { logger } from '../../utils/logger';

export const permissionsData = [
  // Permissions système
  { action: 'manage', subject: 'system', description: 'Gestion complète du système' },
  { action: 'read', subject: 'system', description: 'Lecture des informations système' },
  
  // Permissions utilisateurs
  { action: 'create', subject: 'user', description: 'Créer des utilisateurs' },
  { action: 'read', subject: 'user', description: 'Lire les informations utilisateur' },
  { action: 'update', subject: 'user', description: 'Modifier les utilisateurs' },
  { action: 'delete', subject: 'user', description: 'Supprimer des utilisateurs' },
  { action: 'manage', subject: 'user', description: 'Gestion complète des utilisateurs' },
  
  // Permissions rôles et permissions
  { action: 'create', subject: 'role', description: 'Créer des rôles' },
  { action: 'read', subject: 'role', description: 'Lire les rôles' },
  { action: 'update', subject: 'role', description: 'Modifier les rôles' },
  { action: 'delete', subject: 'role', description: 'Supprimer des rôles' },
  { action: 'assign', subject: 'role', description: 'Assigner des rôles aux utilisateurs' },
  
  { action: 'create', subject: 'permission', description: 'Créer des permissions' },
  { action: 'read', subject: 'permission', description: 'Lire les permissions' },
  { action: 'update', subject: 'permission', description: 'Modifier les permissions' },
  { action: 'delete', subject: 'permission', description: 'Supprimer des permissions' },
  
  // Permissions API Gateway
  { action: 'configure', subject: 'gateway', description: 'Configurer l\'API Gateway' },
  { action: 'monitor', subject: 'gateway', description: 'Surveiller l\'API Gateway' },
  { action: 'route', subject: 'gateway', description: 'Gérer le routage' },
  
  // Permissions services Sorikama
  { action: 'read', subject: 'soristore', description: 'Accès en lecture à SoriStore' },
  { action: 'write', subject: 'soristore', description: 'Accès en écriture à SoriStore' },
  { action: 'manage', subject: 'soristore', description: 'Gestion complète de SoriStore' },
  
  { action: 'read', subject: 'soripay', description: 'Accès en lecture à SoriPay' },
  { action: 'write', subject: 'soripay', description: 'Accès en écriture à SoriPay' },
  { action: 'manage', subject: 'soripay', description: 'Gestion complète de SoriPay' },
  
  { action: 'read', subject: 'soriwallet', description: 'Accès en lecture à SoriWallet' },
  { action: 'write', subject: 'soriwallet', description: 'Accès en écriture à SoriWallet' },
  { action: 'manage', subject: 'soriwallet', description: 'Gestion complète de SoriWallet' },
  
  { action: 'read', subject: 'sorilearn', description: 'Accès en lecture à SoriLearn' },
  { action: 'write', subject: 'sorilearn', description: 'Accès en écriture à SoriLearn' },
  { action: 'manage', subject: 'sorilearn', description: 'Gestion complète de SoriLearn' },
  
  { action: 'read', subject: 'sorihealth', description: 'Accès en lecture à SoriHealth' },
  { action: 'write', subject: 'sorihealth', description: 'Accès en écriture à SoriHealth' },
  { action: 'manage', subject: 'sorihealth', description: 'Gestion complète de SoriHealth' },
  
  { action: 'read', subject: 'soriaccess', description: 'Accès en lecture à SoriAccess' },
  { action: 'write', subject: 'soriaccess', description: 'Accès en écriture à SoriAccess' },
  { action: 'manage', subject: 'soriaccess', description: 'Gestion complète de SoriAccess' },
  
  // Permissions analytics et reporting
  { action: 'read', subject: 'analytics', description: 'Consulter les analytics' },
  { action: 'export', subject: 'analytics', description: 'Exporter les données analytics' },
  
  // Permissions notifications
  { action: 'send', subject: 'notification', description: 'Envoyer des notifications' },
  { action: 'manage', subject: 'notification', description: 'Gérer les notifications' },
  
  // Permissions audit et logs
  { action: 'read', subject: 'audit', description: 'Consulter les logs d\'audit' },
  { action: 'export', subject: 'audit', description: 'Exporter les logs d\'audit' },
];

export const seedPermissions = async (): Promise<void> => {
  try {
    logger.info('[SEEDER] Début du seeding des permissions...');
    
    for (const permData of permissionsData) {
      await PermissionModel.findOneAndUpdate(
        { action: permData.action, subject: permData.subject },
        permData,
        { upsert: true, new: true }
      );
    }
    
    const count = await PermissionModel.countDocuments();
    logger.info(`[SEEDER] ${count} permissions créées/mises à jour avec succès`);
  } catch (error) {
    logger.error('[SEEDER] Erreur lors du seeding des permissions:', error);
    throw error;
  }
};