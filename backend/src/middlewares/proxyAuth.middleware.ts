/**
 * Middleware de vérification des autorisations pour le proxy
 * 
 * Vérifie que :
 * 1. L'utilisateur est authentifié
 * 2. L'utilisateur a autorisé le service (session SSO active)
 * 3. Le service est actif
 * 4. Les scopes requis sont présents
 */

import { Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { SSOSessionModel } from '../database/models/ssoSession.model';
import { ServiceModel } from '../database/models/service.model';
import AppError from '../utils/AppError';
import { logger } from '../utils/logger';

/**
 * Vérifie que l'utilisateur a une session SSO active pour le service
 */
export const verifyServiceAuthorization = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { serviceId } = req.params;
    const userId = req.user?.id;

    // Vérifier que l'utilisateur est authentifié
    if (!userId) {
      logger.warn('❌ Tentative d\'accès proxy sans authentification');
      throw new AppError(
        'Authentification requise pour accéder à ce service',
        StatusCodes.UNAUTHORIZED
      );
    }

    // Vérifier que le service existe et est actif
    const service = await ServiceModel.findOne({ id: serviceId });
    
    if (!service) {
      logger.warn('❌ Service non trouvé', { serviceId, userId });
      throw new AppError(
        'Service non trouvé',
        StatusCodes.NOT_FOUND
      );
    }

    if (service.status !== 'active') {
      logger.warn('❌ Tentative d\'accès à un service inactif', { serviceId, userId, status: service.status });
      throw new AppError(
        `Le service ${service.name} est actuellement ${service.status === 'maintenance' ? 'en maintenance' : 'inactif'}`,
        StatusCodes.SERVICE_UNAVAILABLE
      );
    }

    // Vérifier que le proxy est activé pour ce service
    if (!service.ssoEnabled) {
      logger.warn('❌ Proxy non activé pour ce service', { serviceId, userId });
      throw new AppError(
        'Le proxy n\'est pas activé pour ce service',
        StatusCodes.FORBIDDEN
      );
    }

    // Vérifier qu'une session SSO active existe
    const ssoSession = await SSOSessionModel.findOne({
      userId,
      serviceId,
      expiresAt: { $gt: new Date() }
    });

    if (!ssoSession) {
      logger.warn('❌ Aucune session SSO active', { serviceId, userId });
      throw new AppError(
        'Vous devez d\'abord autoriser ce service. Veuillez vous connecter via SSO.',
        StatusCodes.FORBIDDEN
      );
    }

    // Vérifier les scopes si nécessaire
    // TODO: Implémenter la vérification des scopes selon l'endpoint

    // Attacher les informations au request pour les utiliser plus tard
    req.service = service;
    req.ssoSession = ssoSession;

    logger.info('✅ Autorisation proxy validée', {
      userId,
      serviceId,
      sessionId: ssoSession.sessionId
    });

    next();

  } catch (error) {
    next(error);
  }
};

/**
 * Vérifie les scopes requis pour un endpoint spécifique
 * 
 * @param requiredScopes - Liste des scopes requis
 */
export const requireScopes = (...requiredScopes: string[]) => {
  return async (req: any, res: Response, next: NextFunction) => {
    try {
      const ssoSession = req.ssoSession;

      if (!ssoSession) {
        throw new AppError(
          'Session SSO non trouvée',
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }

      // Récupérer les scopes de la session
      const userScopes = ssoSession.scopes || [];

      // Vérifier que tous les scopes requis sont présents
      const hasAllScopes = requiredScopes.every(scope => userScopes.includes(scope));

      if (!hasAllScopes) {
        logger.warn('❌ Scopes insuffisants', {
          userId: req.user?.id,
          serviceId: req.params.serviceId,
          required: requiredScopes,
          available: userScopes
        });

        throw new AppError(
          `Permissions insuffisantes. Scopes requis : ${requiredScopes.join(', ')}`,
          StatusCodes.FORBIDDEN
        );
      }

      next();

    } catch (error) {
      next(error);
    }
  };
};
