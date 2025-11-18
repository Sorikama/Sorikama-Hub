/**
 * Service de gestion des autorisations
 * Gère la création, révocation et vérification des autorisations
 */

import { ServiceAuthorizationModel, IServiceAuthorization } from '../database/models/serviceAuthorization.model';
import { ServiceModel } from '../database/models/service.model';
import { UserModel } from '../database/models/user.model';
import * as tokenBlacklistService from './tokenBlacklist.service';
// import { triggerWebhook, WEBHOOK_EVENTS } from './webhook.service'; // Webhook désactivé
// import { logAudit } from './audit.service'; // Audit désactivé - utiliser logger
import { logger } from '../utils/logger';
import crypto from 'crypto';

interface CreateAuthorizationParams {
  userId: string;
  serviceId: string;
  token: string;
  scopes?: string[];
  ipAddress?: string;
  userAgent?: string;
}

interface RevokeAuthorizationParams {
  userId: string;
  serviceId: string;
  reason: string;
  revokedBy: 'user' | 'admin' | 'service' | 'system';
  adminId?: string;
}

/**
 * Créer une nouvelle autorisation
 */
export const createAuthorization = async (params: CreateAuthorizationParams): Promise<IServiceAuthorization> => {
  const { userId, serviceId, token, scopes = ['profile', 'email'], ipAddress, userAgent } = params;

  try {
    // Vérifier si une autorisation existe déjà
    const existingAuth = await ServiceAuthorizationModel.findOne({
      userId,
      serviceId,
      isActive: true,
      isRevoked: false
    });

    if (existingAuth) {
      // Mettre à jour l'autorisation existante
      existingAuth.accessToken = crypto.createHash('sha256').update(token).digest('hex');
      existingAuth.lastUsedAt = new Date();
      existingAuth.ipAddress = ipAddress;
      existingAuth.userAgent = userAgent;
      existingAuth.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 jours
      
      await existingAuth.save();
      
      logger.info('✅ Autorisation mise à jour', { userId, serviceId });
      return existingAuth;
    }

    // Créer une nouvelle autorisation
    const authorization = await ServiceAuthorizationModel.create({
      userId,
      serviceId,
      accessToken: crypto.createHash('sha256').update(token).digest('hex'),
      refreshToken: crypto.randomBytes(32).toString('hex'),
      scopes,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
      refreshExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 jours
      isActive: true,
      isRevoked: false,
      lastUsedAt: new Date(),
      ipAddress,
      userAgent
    });

    // Logger l'audit (désactivé)
    // await logAudit({
    //   userId,
    //   action: 'service_authorized',
    //   category: 'service',
    //   resource: 'authorization',
    //   resourceId: authorization._id.toString(),
    //   status: 'success',
    //   metadata: {
    //     ipAddress,
    //     userAgent
    //   }
    // });

    // Déclencher le webhook (désactivé)
    // const service = await ServiceModel.findById(serviceId);
    // await triggerWebhook(WEBHOOK_EVENTS.SERVICE_AUTHORIZED, {
    //   userId,
    //   serviceId,
    //   serviceName: service?.name,
    //   serviceSlug: service?.slug,
    //   scopes,
    //   timestamp: new Date().toISOString()
    // });

    logger.info('✅ Nouvelle autorisation créée', { userId, serviceId });
    return authorization;
  } catch (error) {
    logger.error('❌ Erreur création autorisation:', error);
    throw error;
  }
};

/**
 * Révoquer une autorisation
 */
export const revokeAuthorization = async (params: RevokeAuthorizationParams): Promise<boolean> => {
  const { userId, serviceId, reason, revokedBy, adminId } = params;

  try {
    // Trouver toutes les autorisations actives
    const authorizations = await ServiceAuthorizationModel.find({
      userId,
      serviceId,
      isActive: true,
      isRevoked: false
    });

    if (authorizations.length === 0) {
      logger.warn('⚠️ Aucune autorisation active trouvée', { userId, serviceId });
      return false;
    }

    // Révoquer toutes les autorisations
    for (const auth of authorizations) {
      auth.isRevoked = true;
      auth.revokedAt = new Date();
      auth.revokedReason = reason;
      auth.revokedBy = revokedBy;
      auth.isActive = false;
      await auth.save();
    }

    // Récupérer les infos du service
    const service = await ServiceModel.findById(serviceId);
    
    if (!service) {
      throw new Error('Service introuvable');
    }

    // Blacklister tous les tokens de cet utilisateur pour ce service (fonction non implémentée)
    // await tokenBlacklistService.revokeUserServiceTokens(userId, service.slug);

    // Logger l'audit (désactivé)
    // await logAudit({
    //   userId: adminId || userId,
    //   action: 'authorization_revoked',
    //   category: 'service',
    //   resource: 'authorization',
    //   resourceId: serviceId,
    //   status: 'success',
    //   metadata: {
    //     targetUserId: userId,
    //     reason,
    //     revokedBy,
    //     authorizationsRevoked: authorizations.length
    //   }
    // });

    // Déclencher le webhook SESSION_REVOKED (désactivé)
    // await triggerWebhook(WEBHOOK_EVENTS.SESSION_REVOKED, {
    //   userId,
    //   serviceId,
    //   serviceName: service.name,
    //   serviceSlug: service.slug,
    //   reason,
    //   revokedBy,
    //   timestamp: new Date().toISOString()
    // });

    logger.info('✅ Autorisation révoquée', {
      userId,
      serviceId,
      serviceName: service.name,
      reason,
      revokedBy,
      count: authorizations.length
    });

    return true;
  } catch (error) {
    logger.error('❌ Erreur révocation autorisation:', error);
    throw error;
  }
};

/**
 * Révoquer toutes les autorisations d'un utilisateur
 */
export const revokeAllUserAuthorizations = async (
  userId: string,
  reason: string,
  revokedBy: 'user' | 'admin' | 'system',
  adminId?: string
): Promise<number> => {
  try {
    const authorizations = await ServiceAuthorizationModel.find({
      userId,
      isActive: true,
      isRevoked: false
    }).populate('serviceId');

    let revokedCount = 0;

    for (const auth of authorizations) {
      const service = auth.serviceId as any;
      
      auth.isRevoked = true;
      auth.revokedAt = new Date();
      auth.revokedReason = reason;
      auth.revokedBy = revokedBy;
      auth.isActive = false;
      await auth.save();

      // Blacklister les tokens (fonction non implémentée)
      // if (service && service.slug) {
      //   await tokenBlacklistService.revokeUserServiceTokens(userId, service.slug);
      // }

      // Déclencher le webhook (désactivé)
      // await triggerWebhook(WEBHOOK_EVENTS.SESSION_REVOKED, {
      //   userId,
      //   serviceId: service._id,
      //   serviceName: service.name,
      //   serviceSlug: service.slug,
      //   reason,
      //   revokedBy,
      //   timestamp: new Date().toISOString()
      // });

      revokedCount++;
    }

    // Logger l'audit (désactivé)
    // await logAudit({
    //   userId: adminId || userId,
    //   action: 'all_authorizations_revoked',
    //   category: 'service',
    //   resource: 'authorization',
    //   status: 'success',
    //   metadata: {
    //     targetUserId: userId,
    //     reason,
    //     revokedBy,
    //     count: revokedCount
    //   }
    // });

    logger.info('✅ Toutes les autorisations révoquées', {
      userId,
      count: revokedCount,
      reason,
      revokedBy
    });

    return revokedCount;
  } catch (error) {
    logger.error('❌ Erreur révocation toutes autorisations:', error);
    throw error;
  }
};

/**
 * Obtenir les autorisations actives d'un utilisateur
 */
export const getUserAuthorizations = async (userId: string): Promise<IServiceAuthorization[]> => {
  try {
    const authorizations = await ServiceAuthorizationModel.find({
      userId,
      isActive: true,
      isRevoked: false
    })
      .populate('serviceId')
      .sort({ createdAt: -1 });

    return authorizations;
  } catch (error) {
    logger.error('❌ Erreur récupération autorisations:', error);
    throw error;
  }
};

/**
 * Vérifier si un utilisateur a une autorisation active pour un service
 */
export const hasActiveAuthorization = async (userId: string, serviceId: string): Promise<boolean> => {
  try {
    const authorization = await ServiceAuthorizationModel.findOne({
      userId,
      serviceId,
      isActive: true,
      isRevoked: false,
      expiresAt: { $gt: new Date() }
    });

    return !!authorization;
  } catch (error) {
    logger.error('❌ Erreur vérification autorisation:', error);
    return false;
  }
};

/**
 * Mettre à jour la dernière utilisation d'une autorisation
 */
export const updateLastUsed = async (userId: string, serviceId: string): Promise<void> => {
  try {
    await ServiceAuthorizationModel.updateOne(
      {
        userId,
        serviceId,
        isActive: true,
        isRevoked: false
      },
      {
        $set: { lastUsedAt: new Date() }
      }
    );
  } catch (error) {
    logger.error('❌ Erreur mise à jour lastUsedAt:', error);
  }
};

/**
 * Nettoyer les autorisations expirées
 */
export const cleanupExpiredAuthorizations = async (): Promise<number> => {
  try {
    const result = await ServiceAuthorizationModel.updateMany(
      {
        isActive: true,
        expiresAt: { $lt: new Date() }
      },
      {
        $set: {
          isActive: false,
          isRevoked: true,
          revokedAt: new Date(),
          revokedReason: 'expired',
          revokedBy: 'system'
        }
      }
    );

    if (result.modifiedCount > 0) {
      logger.info(`🧹 ${result.modifiedCount} autorisations expirées nettoyées`);
    }

    return result.modifiedCount;
  } catch (error) {
    logger.error('❌ Erreur nettoyage autorisations:', error);
    return 0;
  }
};
