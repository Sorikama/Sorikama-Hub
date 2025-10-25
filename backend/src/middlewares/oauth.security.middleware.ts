/**
 * Middlewares de sécurité OAuth
 * Implémentation des protections critiques
 */

import { Request, Response, NextFunction } from 'express';
import { ServiceModel } from '../database/models/service.model';
import { logger } from '../utils/logger';
import rateLimit from 'express-rate-limit';

/**
 * 1. Vérifier que le redirect URL est dans la whitelist
 */
export const validateRedirectUrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { serviceId } = req.params;
    const { redirectUrl } = req.body;

    if (!redirectUrl) {
      return res.status(400).json({
        success: false,
        message: 'redirect_url est requis'
      });
    }

    // Charger le service
    const service = await ServiceModel.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service non trouvé'
      });
    }

    // Vérifier si le service a une whitelist
    // Pour l'instant, on accepte toutes les URLs du même domaine que frontendUrl
    const serviceUrl = new URL(service.frontendUrl);
    const requestUrl = new URL(redirectUrl);

    // Vérifier que le domaine correspond
    if (serviceUrl.hostname !== requestUrl.hostname) {
      logger.warn('⚠️ Tentative de redirection vers un domaine non autorisé', {
        serviceId: service._id,
        serviceName: service.name,
        expectedDomain: serviceUrl.hostname,
        requestedDomain: requestUrl.hostname,
        userId: (req as any).user?._id
      });

      return res.status(403).json({
        success: false,
        message: 'Redirect URL non autorisé. Le domaine doit correspondre au service.'
      });
    }

    next();
  } catch (error: any) {
    logger.error('Erreur validation redirect URL:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la validation'
    });
  }
};

/**
 * 2. Rate Limiting pour les autorisations
 */
export const authorizationRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 tentatives max par IP
  message: {
    success: false,
    message: 'Trop de tentatives d\'autorisation. Réessayez dans 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('🚨 Rate limit dépassé pour autorisation', {
      ip: req.ip,
      userId: (req as any).user?._id,
      serviceId: req.params.serviceId
    });

    res.status(429).json({
      success: false,
      message: 'Trop de tentatives d\'autorisation. Réessayez dans 15 minutes.'
    });
  }
});

/**
 * 3. Vérifier le state parameter (protection CSRF)
 */
export const validateState = (req: Request, res: Response, next: NextFunction) => {
  const { state } = req.body;

  if (!state) {
    logger.warn('⚠️ State parameter manquant', {
      userId: (req as any).user?._id,
      serviceId: req.params.serviceId
    });

    return res.status(400).json({
      success: false,
      message: 'State parameter requis pour la sécurité'
    });
  }

  // Le state sera vérifié côté client
  // Ici on s'assure juste qu'il est présent
  next();
};

/**
 * 4. Valider les scopes demandés
 */
export const validateScopes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { serviceId } = req.params;
    const { scopes } = req.body;

    if (!scopes || !Array.isArray(scopes)) {
      return res.status(400).json({
        success: false,
        message: 'Scopes requis (array)'
      });
    }

    // Scopes disponibles par défaut
    const availableScopes = ['profile', 'email', 'services'];

    // Vérifier que tous les scopes demandés sont valides
    const invalidScopes = scopes.filter(s => !availableScopes.includes(s));

    if (invalidScopes.length > 0) {
      logger.warn('⚠️ Scopes invalides demandés', {
        userId: (req as any).user?._id,
        serviceId,
        invalidScopes
      });

      return res.status(400).json({
        success: false,
        message: `Scopes invalides: ${invalidScopes.join(', ')}`,
        availableScopes
      });
    }

    next();
  } catch (error: any) {
    logger.error('Erreur validation scopes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la validation des scopes'
    });
  }
};

/**
 * 5. Détecter les changements d'IP suspects
 */
export const detectSuspiciousIp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Import statique au lieu de dynamique
    const { ServiceAuthorizationModel } = require('../database/models/serviceAuthorization.model');
    const { serviceId } = req.params;
    const user = (req as any).user;
    const currentIp = req.ip;

    // Chercher une autorisation existante
    const existingAuth = await ServiceAuthorizationModel.findOne({
      userId: user._id,
      serviceId,
      isActive: true
    });

    if (existingAuth && existingAuth.ipAddress && existingAuth.ipAddress !== currentIp) {
      logger.warn('⚠️ Changement d\'IP détecté', {
        userId: user._id,
        userEmail: user.email,
        serviceId,
        oldIp: existingAuth.ipAddress,
        newIp: currentIp
      });

      // On log mais on ne bloque pas (l'utilisateur peut avoir changé de réseau)
      // En production, on pourrait envoyer une notification à l'utilisateur
    }

    next();
  } catch (error: any) {
    logger.error('Erreur détection IP:', error);
    // On ne bloque pas en cas d'erreur
    next();
  }
};

/**
 * 6. Logger toutes les tentatives d'autorisation
 */
export const logAuthorizationAttempt = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  const { serviceId } = req.params;

  logger.info('🔐 Tentative d\'autorisation', {
    userId: user._id,
    userEmail: user.email,
    serviceId,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    timestamp: new Date().toISOString()
  });

  next();
};
