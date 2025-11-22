/**
 * Authentification et autorisation pour le proxy
 */

import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../config';
import { ServiceModel } from '../../database/models/service.model';
import { SSOSessionModel } from '../../database/models/ssoSession.model';
import { UserModel } from '../../database/models/user.model';
import { decryptUserId, isEncryptedId } from '../../utils/encryption';
import { logger } from '../../utils/logger';

/**
 * Vérifier et décoder le token JWT
 */
export async function verifyToken(authHeader: string | undefined): Promise<any> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Token manquant');
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    logger.debug('Token JWT vérifié', { email: decoded.email });
    return decoded;
  } catch (error) {
    logger.error('Token JWT invalide', error);
    throw new Error('Token invalide ou expiré');
  }
}

/**
 * Charger l'utilisateur depuis la base de données
 */
export async function loadUser(decoded: any): Promise<any> {
  // Déchiffrer l'ID utilisateur si nécessaire
  let userId = decoded.id;
  
  logger.info('🔍 Chargement utilisateur', { 
    originalId: decoded.id,
    isEncrypted: isEncryptedId(decoded.id) 
  });
  
  if (isEncryptedId(decoded.id)) {
    try {
      userId = decryptUserId(decoded.id);
      logger.info('✅ ID utilisateur déchiffré', { userId });
    } catch (error: any) {
      logger.error('❌ Erreur déchiffrement ID', { 
        error: error.message,
        originalId: decoded.id 
      });
      throw new Error('ID utilisateur invalide');
    }
  }

  // Charger l'utilisateur
  const user = await UserModel.findById(userId);

  if (!user) {
    logger.error('❌ Utilisateur non trouvé', { userId });
    throw new Error('Utilisateur non trouvé');
  }

  if (!user.isActive) {
    logger.error('❌ Compte désactivé', { userId, email: user.email });
    throw new Error('Compte désactivé');
  }

  logger.info('✅ Utilisateur chargé', { 
    userId: user._id,
    email: user.email 
  });
  return user;
}

/**
 * Vérifier le service
 */
export async function verifyService(serviceSlug: string): Promise<any> {
  const service = await ServiceModel.findOne({
    slug: serviceSlug,
    enabled: true
  });

  if (!service) {
    throw new Error('Service non trouvé ou désactivé');
  }

  logger.debug('Service vérifié', { name: service.name });
  return service;
}

/**
 * Vérifier ou créer la session SSO
 */
export async function verifySession(userId: string, serviceSlug: string): Promise<any> {
  // Chercher une session SSO existante
  let ssoSession = await SSOSessionModel.findOne({
    userId: userId,
    serviceId: serviceSlug,
    expiresAt: { $gt: new Date() }
  });

  // Si pas de session, en créer une automatiquement
  if (!ssoSession) {
    logger.info('Création automatique d\'une session SSO', { userId, serviceSlug });
    
    const crypto = require('crypto');
    const sessionId = crypto.randomBytes(32).toString('hex');
    const accessToken = crypto.randomBytes(32).toString('hex');
    
    ssoSession = await SSOSessionModel.create({
      sessionId,
      userId,
      serviceId: serviceSlug,
      accessToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
      createdAt: new Date()
    });
    
    logger.info('✅ Session SSO créée automatiquement', { sessionId });
  }

  logger.debug('Session SSO vérifiée', { sessionId: ssoSession.sessionId });
  return ssoSession;
}

/**
 * Vérifier les rôles autorisés
 */
export function verifyRoles(user: any, service: any): void {
  if (service.allowedRoles && service.allowedRoles.length > 0) {
    if (!service.allowedRoles.includes(user.role)) {
      throw new Error('Permissions insuffisantes');
    }
  }
  logger.debug('Rôles vérifiés', { userRole: user.role });
}
