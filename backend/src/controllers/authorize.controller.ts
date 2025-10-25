/**
 * Controller pour la page d'autorisation et gestion des tokens
 */

import { Request, Response } from 'express';
import { ServiceModel } from '../database/models/service.model';
import { ServiceAuthorizationModel } from '../database/models/serviceAuthorization.model';
import { logger } from '../utils/logger';

/**
 * Récupérer les informations du service pour la page d'autorisation
 */
export const getServiceInfo = async (req: Request, res: Response) => {
  try {
    const { serviceId } = req.params;

    const service = await ServiceModel.findById(serviceId);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service non trouvé'
      });
    }

    // Vérifier si l'utilisateur a déjà autorisé ce service
    const existingAuth = await ServiceAuthorizationModel.findOne({
      userId: (req as any).user._id,
      serviceId: service._id,
      isActive: true
    });

    res.json({
      success: true,
      service: {
        id: service._id,
        name: service.name,
        slug: service.slug,
        description: service.description,
        frontendUrl: service.frontendUrl,
        logo: '🔗', // TODO: Ajouter un champ logo dans le modèle
        color: 'blue' // TODO: Ajouter un champ color dans le modèle
      },
      alreadyAuthorized: !!existingAuth,
      authorization: existingAuth ? {
        scopes: existingAuth.scopes,
        expiresAt: existingAuth.expiresAt
      } : null
    });
  } catch (error: any) {
    logger.error('Erreur récupération service:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du service'
    });
  }
};

/**
 * Autoriser l'accès à un service
 */
export const authorizeService = async (req: Request, res: Response) => {
  try {
    const { serviceId } = req.params;
    const { scopes, redirectUrl } = req.body;
    const user = (req as any).user;

    // Vérifier que le service existe
    const service = await ServiceModel.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service non trouvé'
      });
    }

    // Vérifier si une autorisation existe déjà
    let authorization = await ServiceAuthorizationModel.findOne({
      userId: user._id,
      serviceId: service._id,
      isActive: true
    });

    if (authorization) {
      // Mettre à jour l'autorisation existante
      authorization.scopes = scopes || authorization.scopes;
      authorization.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 jours
      authorization.refreshExpiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 jours
      authorization.ipAddress = req.ip;
      authorization.userAgent = req.headers['user-agent'];
      await authorization.save();
    } else {
      // Créer une nouvelle autorisation
      const accessToken = (ServiceAuthorizationModel as any).generateAccessToken();
      const refreshToken = (ServiceAuthorizationModel as any).generateRefreshToken();

      authorization = await ServiceAuthorizationModel.create({
        userId: user._id,
        serviceId: service._id,
        accessToken,
        refreshToken,
        scopes: scopes || ['profile', 'email'],
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
        refreshExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 jours
        isActive: true,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
    }

    logger.info('✅ Autorisation accordée', {
      userId: user._id,
      userEmail: user.email,
      serviceId: service._id,
      serviceName: service.name,
      scopes: authorization.scopes
    });

    // Construire l'URL de redirection avec le token
    const redirect = redirectUrl || service.frontendUrl;
    const separator = redirect.includes('?') ? '&' : '?';
    const finalRedirectUrl = `${redirect}${separator}access_token=${authorization.accessToken}&token_type=Bearer&expires_in=${30 * 24 * 60 * 60}`;

    res.json({
      success: true,
      message: 'Autorisation accordée avec succès',
      authorization: {
        accessToken: authorization.accessToken,
        refreshToken: authorization.refreshToken,
        expiresAt: authorization.expiresAt,
        scopes: authorization.scopes
      },
      redirectUrl: finalRedirectUrl
    });
  } catch (error: any) {
    logger.error('Erreur autorisation service:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'autorisation'
    });
  }
};

/**
 * Révoquer l'accès à un service
 */
export const revokeAuthorization = async (req: Request, res: Response) => {
  try {
    const { serviceId } = req.params;
    const user = (req as any).user;

    const authorization = await ServiceAuthorizationModel.findOne({
      userId: user._id,
      serviceId,
      isActive: true
    });

    if (!authorization) {
      return res.status(404).json({
        success: false,
        message: 'Autorisation non trouvée'
      });
    }

    authorization.isActive = false;
    await authorization.save();

    logger.info('✅ Autorisation révoquée', {
      userId: user._id,
      serviceId
    });

    res.json({
      success: true,
      message: 'Autorisation révoquée avec succès'
    });
  } catch (error: any) {
    logger.error('Erreur révocation autorisation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la révocation'
    });
  }
};

/**
 * Lister les autorisations de l'utilisateur
 */
export const getUserAuthorizations = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const authorizations = await ServiceAuthorizationModel.find({
      userId: user._id,
      isActive: true
    }).populate('serviceId', 'name slug description frontendUrl');

    res.json({
      success: true,
      authorizations: authorizations.map(auth => ({
        id: auth._id,
        service: auth.serviceId,
        scopes: auth.scopes,
        expiresAt: auth.expiresAt,
        lastUsedAt: auth.lastUsedAt,
        createdAt: auth.createdAt
      }))
    });
  } catch (error: any) {
    logger.error('Erreur récupération autorisations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des autorisations'
    });
  }
};

/**
 * Vérifier un access token
 */
export const verifyAccessToken = async (req: Request, res: Response) => {
  try {
    const { accessToken } = req.body;

    const authorization = await ServiceAuthorizationModel.findOne({
      accessToken,
      isActive: true
    }).populate('userId', 'firstName lastName email role')
     .populate('serviceId', 'name slug');

    if (!authorization) {
      return res.status(401).json({
        success: false,
        message: 'Token invalide ou expiré'
      });
    }

    // Vérifier l'expiration
    if (authorization.expiresAt < new Date()) {
      return res.status(401).json({
        success: false,
        message: 'Token expiré',
        code: 'TOKEN_EXPIRED'
      });
    }

    // Mettre à jour lastUsedAt
    authorization.lastUsedAt = new Date();
    await authorization.save();

    res.json({
      success: true,
      user: authorization.userId,
      service: authorization.serviceId,
      scopes: authorization.scopes,
      expiresAt: authorization.expiresAt
    });
  } catch (error: any) {
    logger.error('Erreur vérification token:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification du token'
    });
  }
};

/**
 * Renouveler un access token avec le refresh token
 */
export const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    const authorization = await ServiceAuthorizationModel.findOne({
      refreshToken,
      isActive: true
    });

    if (!authorization) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token invalide'
      });
    }

    // Vérifier l'expiration du refresh token
    if (authorization.refreshExpiresAt < new Date()) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token expiré'
      });
    }

    // Générer un nouveau access token
    const newAccessToken = (ServiceAuthorizationModel as any).generateAccessToken();
    authorization.accessToken = newAccessToken;
    authorization.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 jours
    await authorization.save();

    logger.info('✅ Token renouvelé', {
      userId: authorization.userId,
      serviceId: authorization.serviceId
    });

    res.json({
      success: true,
      accessToken: newAccessToken,
      expiresAt: authorization.expiresAt
    });
  } catch (error: any) {
    logger.error('Erreur renouvellement token:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du renouvellement du token'
    });
  }
};
