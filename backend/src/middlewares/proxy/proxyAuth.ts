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
  if (isEncryptedId(decoded.id)) {
    userId = decryptUserId(decoded.id);
    logger.debug('ID utilisateur déchiffré');
  }

  // Charger l'utilisateur
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new Error('Utilisateur non trouvé');
  }

  if (!user.isActive) {
    throw new Error('Compte désactivé');
  }

  logger.debug('Utilisateur chargé', { email: user.email });
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
 * Vérifier la session SSO
 */
export async function verifySession(userId: string, serviceSlug: string): Promise<any> {
  const ssoSession = await SSOSessionModel.findOne({
    userId: userId,
    serviceId: serviceSlug,
    expiresAt: { $gt: new Date() }
  });

  if (!ssoSession) {
    throw new Error('Session SSO expirée');
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
