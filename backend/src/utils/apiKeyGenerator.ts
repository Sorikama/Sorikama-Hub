import crypto from 'crypto';
import { SimpleApiKeyModel } from '../database/models/simpleApiKey.model';

/**
 * Génère une API Key unique pour un utilisateur
 * @param userId - L'ID de l'utilisateur
 * @param userName - Le nom de l'utilisateur pour la description
 * @returns L'API Key générée
 */
export const generateUserApiKey = async (userId: string, userName: string): Promise<string> => {
  // Générer une clé unique avec préfixe utilisateur
  const keyId = `uk_${crypto.randomBytes(16).toString('hex')}`;
  
  // Hacher la clé pour le stockage sécurisé
  const hashedKey = crypto.createHash('sha256').update(keyId).digest('hex');
  
  // Créer l'entrée dans la base de données
  await SimpleApiKeyModel.create({
    name: `User API Key - ${userName}`,
    description: `Clé API personnelle pour l'utilisateur ${userName} (ID: ${userId})`,
    keyId: keyId,
    hashedKey: hashedKey,
    permissions: ['read', 'write'], // Permissions utilisateur standard
    isActive: true,
    userId: userId // Ajouter une référence à l'utilisateur
  });
  
  return keyId;
};

/**
 * Régénère une API Key pour un utilisateur existant
 * @param userId - L'ID de l'utilisateur
 * @param userName - Le nom de l'utilisateur
 * @returns La nouvelle API Key
 */
export const regenerateUserApiKey = async (userId: string, userName: string): Promise<string> => {
  // Désactiver l'ancienne clé
  await SimpleApiKeyModel.updateMany(
    { userId: userId, isActive: true },
    { isActive: false }
  );
  
  // Générer une nouvelle clé
  return generateUserApiKey(userId, userName);
};