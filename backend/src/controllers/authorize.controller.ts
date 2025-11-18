import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import { ServiceModel } from '../database/models/service.model';
import { UserModel } from '../database/models/user.model';
import { SSOSessionModel } from '../database/models/ssoSession.model';
import AppError from '../utils/AppError';
import { logger } from '../utils/logger';
import { JWT_SECRET } from '../config';
import { encryptUserId } from '../utils/encryption';
import { 
  revokeAuthorization as revokeAuth, 
  getUserAuthorizations as getAuths,
  createAuthorization 
} from '../services/authorization.service';

// ============================================
// STOCKAGE TEMPORAIRE DES CODES D'AUTORISATION
// ============================================
// En production, utiliser Redis pour le partage entre instances
interface AuthorizationCode {
  code: string;
  userId: string;
  serviceSlug: string;
  redirectUrl: string;
  createdAt: number;
  expiresAt: number;
}

const authorizationCodes = new Map<string, AuthorizationCode>();

// Nettoyer les codes expirés toutes les 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [code, data] of authorizationCodes.entries()) {
    if (data.expiresAt < now) {
      authorizationCodes.delete(code);
      logger.debug(`Code d'autorisation expiré supprimé: ${code}`);
    }
  }
}, 5 * 60 * 1000);

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
    const { reason = 'user_request' } = req.body;

    logger.info(`Révocation autorisation`, {
      userId,
      serviceId,
      reason
    });

    const revoked = await revokeAuth({
      userId,
      serviceId,
      reason,
      revokedBy: 'user'
    });

    if (!revoked) {
      return next(new AppError('Aucune autorisation active trouvée', StatusCodes.NOT_FOUND));
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Autorisation révoquée avec succès'
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

    const authorizations = await getAuths(userId);

    // Formater les données pour la réponse
    const formattedAuths = authorizations.map(auth => {
      const service = auth.serviceId as any;
      return {
        id: auth._id,
        service: {
          id: service._id,
          name: service.name,
          slug: service.slug,
          description: service.description,
          frontendUrl: service.frontendUrl
        },
        scopes: auth.scopes,
        createdAt: auth.createdAt,
        lastUsedAt: auth.lastUsedAt,
        expiresAt: auth.expiresAt
      };
    });

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: {
        authorizations: formattedAuths,
        count: formattedAuths.length
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
 * Génère un CODE temporaire au lieu d'un token (plus sécurisé)
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
    // 4. GÉNÉRER UN CODE D'AUTORISATION TEMPORAIRE
    // ============================================
    // SÉCURITÉ: Le code est temporaire (5 min) et à usage unique
    // Le token JWT ne sera généré que lors de l'échange du code

    const code = crypto.randomBytes(32).toString('hex');
    const now = Date.now();
    const expiresIn = 5 * 60 * 1000; // 5 minutes

    authorizationCodes.set(code, {
      code,
      userId: user._id.toString(),
      serviceSlug,
      redirectUrl,
      createdAt: now,
      expiresAt: now + expiresIn
    });

    logger.info(`✅ Code d'autorisation généré`, {
      userId: user._id,
      email: user.email,
      service: serviceSlug,
      serviceName: service.name,
      codeExpiry: '5 minutes'
    });

    // ============================================
    // 5. RETOURNER LE CODE (pas le token!)
    // ============================================

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: `Autorisation accordée pour ${service.name}`,
      data: {
        code, // Code temporaire à échanger
        expiresIn: 300, // 5 minutes en secondes
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

/**
 * Échanger un code d'autorisation contre un token JWT
 * Route appelée par le service externe depuis son backend
 */
export const exchangeAuthorizationCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.body;

    if (!code) {
      return next(new AppError('Code d\'autorisation manquant', StatusCodes.BAD_REQUEST));
    }

    // ============================================
    // 1. VÉRIFIER QUE LE CODE EXISTE
    // ============================================

    const authData = authorizationCodes.get(code);

    if (!authData) {
      logger.warn(`Code d'autorisation invalide ou expiré: ${code}`);
      return next(new AppError('Code d\'autorisation invalide ou expiré', StatusCodes.UNAUTHORIZED));
    }

    // ============================================
    // 2. VÉRIFIER QUE LE CODE N'EST PAS EXPIRÉ
    // ============================================

    if (authData.expiresAt < Date.now()) {
      authorizationCodes.delete(code);
      logger.warn(`Code d'autorisation expiré: ${code}`);
      return next(new AppError('Code d\'autorisation expiré', StatusCodes.UNAUTHORIZED));
    }

    // ============================================
    // 3. SUPPRIMER LE CODE (usage unique)
    // ============================================

    authorizationCodes.delete(code);
    logger.debug(`Code d'autorisation utilisé et supprimé: ${code}`);

    // ============================================
    // 4. RÉCUPÉRER LES DONNÉES UTILISATEUR
    // ============================================

    const user = await UserModel.findById(authData.userId).populate({
      path: 'roles',
      populate: { path: 'permissions' }
    });

    if (!user || !user.isActive) {
      return next(new AppError('Utilisateur introuvable ou inactif', StatusCodes.UNAUTHORIZED));
    }

    // ============================================
    // 5. RÉCUPÉRER LE SERVICE
    // ============================================

    const service = await ServiceModel.findOne({
      slug: authData.serviceSlug,
      enabled: true
    });

    if (!service) {
      return next(new AppError('Service introuvable ou désactivé', StatusCodes.NOT_FOUND));
    }

    // ============================================
    // 6. COLLECTER LES PERMISSIONS
    // ============================================

    const permissions = new Set<string>();
    (user.roles as any[]).forEach(role => {
      role.permissions.forEach((perm: any) => {
        permissions.add(`${perm.action}:${perm.subject}`);
      });
    });

    // ============================================
    // 7. CHIFFRER L'ID UTILISATEUR
    // ============================================

    const encryptedUserId = encryptUserId(user._id.toString());
    
    logger.info('🔐 ID utilisateur chiffré pour le token:', {
      originalId: user._id.toString(),
      encryptedId: encryptedUserId,
      encryptedLength: encryptedUserId.length,
      hasSeparator: encryptedUserId.includes(':')
    });

    // ============================================
    // 8. GÉNÉRER LE TOKEN JWT
    // ============================================

    const tokenPayload = {
      id: encryptedUserId,
      email: user.email,
      role: user.role,
      roles: (user.roles as any[]).map(r => r.name),
      permissions: Array.from(permissions),
      service: authData.serviceSlug,
      serviceName: service.name
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: '24h'
    });

    // ============================================
    // 9. PRÉPARER LES INFOS UTILISATEUR
    // ============================================

    const userData = {
      id: encryptedUserId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      roles: (user.roles as any[]).map(r => r.name)
    };

    logger.info(`✅ Token JWT généré après échange de code`, {
      userId: user._id,
      email: user.email,
      service: authData.serviceSlug
    });

    // ============================================
    // 10. CRÉER L'AUTORISATION EN BASE
    // ============================================
    
    await createAuthorization({
      userId: user._id.toString(),
      serviceId: service._id.toString(),
      token,
      scopes: ['profile', 'email'],
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    // ============================================
    // 11. CRÉER UNE SESSION SSO
    // ============================================
    
    const sessionId = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 heures

    await SSOSessionModel.create({
      sessionId,
      userId: user._id.toString(),
      serviceId: service.slug,
      accessToken: token,
      scopes: ['profile', 'email'],
      expiresAt,
      userInfo: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });

    logger.info(`✅ Session SSO créée`, {
      userId: user._id,
      serviceId: service.slug,
      sessionId,
      expiresAt
    });

    // ============================================
    // 12. RETOURNER LE TOKEN
    // ============================================

    res.status(StatusCodes.OK).json({
      status: 'success',
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
    logger.error('Erreur lors de l\'échange du code:', error);
    next(error);
  }
};
