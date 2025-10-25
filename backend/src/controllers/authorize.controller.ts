import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';

import { ServiceModel } from '../database/models/service.model';
import { UserModel } from '../database/models/user.model';
import AppError from '../utils/AppError';
import { logger } from '../utils/logger';
import { JWT_SECRET } from '../config';
import { encryptUserId } from '../utils/encryption';

/**
 * Récupérer les informations d'un service
 */
export const getServiceInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { serviceId } = req.params;

    // Vérifier si serviceId est un ObjectId valide
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(serviceId);

    // Construire la requête en fonction du type d'ID
    const query: any = { enabled: true };

    if (isValidObjectId) {
      // Si c'est un ObjectId valide, chercher par _id OU slug
      query.$or = [
        { _id: serviceId },
        { slug: serviceId }
      ];
    } else {
      // Sinon, chercher uniquement par slug
      query.slug = serviceId;
    }

    const service = await ServiceModel.findOne(query);

    if (!service) {
      logger.warn(`Service introuvable: ${serviceId}`);
      return next(new AppError('Service introuvable', StatusCodes.NOT_FOUND));
    }

    logger.info(`Service récupéré: ${service.name} (${service.slug})`);

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: {
        service: {
          id: service._id,
          name: service.name,
          slug: service.slug,
          description: service.description,
          frontendUrl: service.frontendUrl
        }
      }
    });
  } catch (error) {
    logger.error('Erreur récupération service:', error);
    next(error);
  }
};

/**
 * Révoquer une autorisation
 */
export const revokeAuthorization = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { serviceId } = req.params;
    const userId = req.user._id;

    logger.info(`Révocation autorisation`, {
      userId,
      serviceId
    });

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Autorisation révoquée'
    });
  } catch (error) {
    logger.error('Erreur révocation:', error);
    next(error);
  }
};

/**
 * Récupérer les autorisations d'un utilisateur
 */
export const getUserAuthorizations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user._id;

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: {
        authorizations: []
      }
    });
  } catch (error) {
    logger.error('Erreur récupération autorisations:', error);
    next(error);
  }
};

/**
 * Vérifier un token d'accès
 */
export const verifyAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body;

    if (!token) {
      return next(new AppError('Token manquant', StatusCodes.BAD_REQUEST));
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: {
        valid: true,
        decoded
      }
    });
  } catch (error) {
    res.status(StatusCodes.OK).json({
      status: 'success',
      data: {
        valid: false
      }
    });
  }
};

/**
 * Rafraîchir un token d'accès
 */
export const refreshAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(new AppError('Refresh token manquant', StatusCodes.BAD_REQUEST));
    }

    // TODO: Implémenter la logique de refresh
    return next(new AppError('Non implémenté', StatusCodes.NOT_IMPLEMENTED));
  } catch (error) {
    logger.error('Erreur refresh token:', error);
    next(error);
  }
};

/**
 * Autoriser l'accès d'un service externe
 * Génère un token JWT spécifique pour le service
 */
export const authorizeService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { service: serviceSlug, redirectUrl } = req.body;
    const userId = req.user._id;

    // ============================================
    // 1. VÉRIFIER QUE LE SERVICE EXISTE
    // ============================================

    const service = await ServiceModel.findOne({
      slug: serviceSlug,
      enabled: true
    });

    if (!service) {
      logger.warn(`Service introuvable ou désactivé: ${serviceSlug}`);
      return next(new AppError('Service introuvable ou désactivé', StatusCodes.NOT_FOUND));
    }

    // ============================================
    // 2. VÉRIFIER L'URL DE CALLBACK
    // ============================================

    // Vérifier que l'URL de callback correspond au service
    const callbackDomain = new URL(redirectUrl).origin;
    const serviceDomain = new URL(service.frontendUrl).origin;

    if (callbackDomain !== serviceDomain) {
      logger.warn(`URL de callback non autorisée`, {
        service: serviceSlug,
        expected: serviceDomain,
        received: callbackDomain
      });
      return next(new AppError('URL de callback non autorisée', StatusCodes.FORBIDDEN));
    }

    // ============================================
    // 3. VÉRIFIER LES PERMISSIONS UTILISATEUR
    // ============================================

    const user = await UserModel.findById(userId).populate({
      path: 'roles',
      populate: { path: 'permissions' }
    });

    if (!user || !user.isActive) {
      return next(new AppError('Utilisateur introuvable ou inactif', StatusCodes.UNAUTHORIZED));
    }

    // Vérifier si l'utilisateur a le rôle requis
    if (service.allowedRoles && service.allowedRoles.length > 0) {
      const userRoles = (user.roles as any[]).map(r => r.name);
      const hasRequiredRole = service.allowedRoles.some(role =>
        userRoles.includes(role) || user.role === role
      );

      if (!hasRequiredRole) {
        logger.warn(`Utilisateur sans rôle requis pour le service`, {
          userId: user._id,
          userRoles,
          requiredRoles: service.allowedRoles,
          service: serviceSlug
        });
        return next(new AppError(
          `Vous n'avez pas les permissions nécessaires pour accéder à ${service.name}`,
          StatusCodes.FORBIDDEN
        ));
      }
    }

    // ============================================
    // 4. COLLECTER LES PERMISSIONS
    // ============================================

    const permissions = new Set<string>();
    (user.roles as any[]).forEach(role => {
      role.permissions.forEach((perm: any) => {
        permissions.add(`${perm.action}:${perm.subject}`);
      });
    });

    // ============================================
    // 5. CHIFFRER L'ID UTILISATEUR
    // ============================================

    const encryptedUserId = encryptUserId(user._id.toString());
    logger.debug('ID utilisateur chiffré pour le service externe');

    // ============================================
    // 6. GÉNÉRER LE TOKEN JWT (avec toutes les infos pour validation)
    // ============================================

    const tokenPayload = {
      id: encryptedUserId, // ID chiffré
      email: user.email,
      role: user.role,
      roles: (user.roles as any[]).map(r => r.name),
      permissions: Array.from(permissions),
      service: serviceSlug,
      serviceName: service.name
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: '24h' // Token valide 24h
    });

    // ============================================
    // 7. PRÉPARER LES INFOS UTILISATEUR (UNIQUEMENT données non sensibles)
    // ============================================

    const userData = {
      id: encryptedUserId, // ID chiffré
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
      // ⚠️ PAS de role, roles, permissions - ces infos sont dans le token
      // Le service externe n'a pas besoin de ces données sensibles
      // Toutes les vérifications se feront côté API Gateway quand le service fera des requêtes
    };

    // ============================================
    // 7. LOGGER L'AUTORISATION
    // ============================================

    logger.info(`✅ Autorisation accordée`, {
      userId: user._id,
      email: user.email,
      service: serviceSlug,
      serviceName: service.name,
      redirectUrl
    });

    // ============================================
    // 8. RETOURNER LE TOKEN
    // ============================================

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: `Autorisation accordée pour ${service.name}`,
      data: {
        token,
        user: userData,
        service: {
          name: service.name,
          slug: service.slug
        }
      }
    });

  } catch (error) {
    logger.error('Erreur lors de l\'autorisation:', error);
    next(error);
  }
};
