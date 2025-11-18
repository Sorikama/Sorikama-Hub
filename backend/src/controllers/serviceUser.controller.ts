/**
 * Contrôleur pour la gestion des utilisateurs par les services externes
 * Permet aux services de récupérer et mettre à jour les infos utilisateur
 */

import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import bcrypt from 'bcrypt';
import { ServiceModel } from '../database/models/service.model';
import { UserModel } from '../database/models/user.model';
import { decryptUserId } from '../utils/encryption';
import { logger } from '../utils/logger';
// import { logAudit } from '../services/audit.service'; // Audit désactivé - utiliser logger
// import { triggerWebhook, WEBHOOK_EVENTS } from '../services/webhook.service'; // Webhook désactivé
import AppError from '../utils/AppError';

/**
 * GET /api/service-user/profile
 * Récupérer les informations de l'utilisateur connecté
 * 
 * Headers:
 * - X-Service-Api-Key: Clé API du service
 * - X-User-Id: ID utilisateur chiffré
 */
export const getUserProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceApiKey = req.headers['x-service-api-key'] as string;
    const encryptedUserId = req.headers['x-user-id'] as string;

    // Vérifier la clé API
    if (!serviceApiKey) {
      return next(new AppError('Clé API manquante', StatusCodes.UNAUTHORIZED));
    }

    const service = await ServiceModel.findOne({
      apiKey: serviceApiKey,
      enabled: true
    });

    if (!service) {
      logger.warn('🚫 Tentative d\'accès avec clé API invalide', {
        apiKey: serviceApiKey.substring(0, 10) + '...',
        ip: req.ip
      });
      return next(new AppError('Clé API invalide', StatusCodes.UNAUTHORIZED));
    }

    // Déchiffrer l'ID utilisateur
    if (!encryptedUserId) {
      return next(new AppError('ID utilisateur manquant', StatusCodes.BAD_REQUEST));
    }

    let userId: string;
    try {
      userId = decryptUserId(encryptedUserId);
    } catch (error) {
      return next(new AppError('ID utilisateur invalide', StatusCodes.BAD_REQUEST));
    }

    // Récupérer l'utilisateur
    const user = await UserModel.findById(userId).populate('roles');

    if (!user) {
      return next(new AppError('Utilisateur introuvable', StatusCodes.NOT_FOUND));
    }

    if (!user.isActive) {
      return next(new AppError('Compte utilisateur désactivé', StatusCodes.FORBIDDEN));
    }

    // Logger l'accès
    logger.info('👤 Profil utilisateur consulté', {
      service: service.name,
      userId,
      email: user.email
    });

    // Retourner les infos utilisateur
    res.status(StatusCodes.OK).json({
      status: 'success',
      data: {
        user: {
          id: encryptedUserId, // ID chiffré
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          roles: (user.roles as any[]).map(r => r.name),
          isActive: user.isActive,
          isVerified: user.isVerified,
          lastLoginAt: user.lastLoginAt
        }
      }
    });

  } catch (error) {
    logger.error('❌ Erreur récupération profil:', error);
    next(error);
  }
};

/**
 * PATCH /api/service-user/profile
 * Mettre à jour les informations de l'utilisateur
 * 
 * Headers:
 * - X-Service-Api-Key: Clé API du service
 * - X-User-Id: ID utilisateur chiffré
 * 
 * Body:
 * - firstName: Prénom (optionnel)
 * - lastName: Nom (optionnel)
 */
export const updateUserProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceApiKey = req.headers['x-service-api-key'] as string;
    const encryptedUserId = req.headers['x-user-id'] as string;
    const { firstName, lastName } = req.body;

    // Vérifier la clé API
    if (!serviceApiKey) {
      return next(new AppError('Clé API manquante', StatusCodes.UNAUTHORIZED));
    }

    const service = await ServiceModel.findOne({
      apiKey: serviceApiKey,
      enabled: true
    });

    if (!service) {
      return next(new AppError('Clé API invalide', StatusCodes.UNAUTHORIZED));
    }

    // Déchiffrer l'ID utilisateur
    if (!encryptedUserId) {
      return next(new AppError('ID utilisateur manquant', StatusCodes.BAD_REQUEST));
    }

    let userId: string;
    try {
      userId = decryptUserId(encryptedUserId);
    } catch (error) {
      return next(new AppError('ID utilisateur invalide', StatusCodes.BAD_REQUEST));
    }

    // Récupérer l'utilisateur
    const user = await UserModel.findById(userId).populate('roles');

    if (!user) {
      return next(new AppError('Utilisateur introuvable', StatusCodes.NOT_FOUND));
    }

    if (!user.isActive) {
      return next(new AppError('Compte utilisateur désactivé', StatusCodes.FORBIDDEN));
    }

    // Mettre à jour les champs
    const updates: any = {};
    if (firstName !== undefined) {
      updates.firstName = firstName;
      user.firstName = firstName;
    }
    if (lastName !== undefined) {
      updates.lastName = lastName;
      user.lastName = lastName;
    }

    // Sauvegarder
    await user.save();

    // Logger l'action
    // await logAudit({
      userId,
      action: 'profile_updated',
      category: 'user',
      resource: 'profile',
      status: 'success',
      metadata: {
        service: service.name,
        updates
      }
    });

    // Webhook (désactivé)
    // await triggerWebhook(WEBHOOK_EVENTS.PROFILE_UPDATED, {
    //   userId: encryptedUserId,
    //   email: user.email,
    //   updates,
    //   service: service.slug,
    //   timestamp: new Date().toISOString()
    // });

    logger.info('✅ Profil utilisateur mis à jour', {
      service: service.name,
      userId,
      updates
    });

    // Retourner les nouvelles infos
    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Profil mis à jour avec succès',
      data: {
        user: {
          id: encryptedUserId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          roles: (user.roles as any[]).map(r => r.name)
        }
      }
    });

  } catch (error) {
    logger.error('❌ Erreur mise à jour profil:', error);
    next(error);
  }
};

/**
 * PUT /api/service-user/password
 * Changer le mot de passe de l'utilisateur
 * 
 * Headers:
 * - X-Service-Api-Key: Clé API du service
 * - X-User-Id: ID utilisateur chiffré
 * 
 * Body:
 * - currentPassword: Mot de passe actuel
 * - newPassword: Nouveau mot de passe
 */
export const changeUserPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceApiKey = req.headers['x-service-api-key'] as string;
    const encryptedUserId = req.headers['x-user-id'] as string;
    const { currentPassword, newPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword) {
      return next(new AppError('Mot de passe actuel et nouveau requis', StatusCodes.BAD_REQUEST));
    }

    if (newPassword.length < 8) {
      return next(new AppError('Le nouveau mot de passe doit contenir au moins 8 caractères', StatusCodes.BAD_REQUEST));
    }

    // Vérifier la clé API
    if (!serviceApiKey) {
      return next(new AppError('Clé API manquante', StatusCodes.UNAUTHORIZED));
    }

    const service = await ServiceModel.findOne({
      apiKey: serviceApiKey,
      enabled: true
    });

    if (!service) {
      return next(new AppError('Clé API invalide', StatusCodes.UNAUTHORIZED));
    }

    // Déchiffrer l'ID utilisateur
    if (!encryptedUserId) {
      return next(new AppError('ID utilisateur manquant', StatusCodes.BAD_REQUEST));
    }

    let userId: string;
    try {
      userId = decryptUserId(encryptedUserId);
    } catch (error) {
      return next(new AppError('ID utilisateur invalide', StatusCodes.BAD_REQUEST));
    }

    // Récupérer l'utilisateur avec le mot de passe
    const user = await UserModel.findById(userId).select('+password');

    if (!user) {
      return next(new AppError('Utilisateur introuvable', StatusCodes.NOT_FOUND));
    }

    if (!user.isActive) {
      return next(new AppError('Compte utilisateur désactivé', StatusCodes.FORBIDDEN));
    }

    // Vérifier le mot de passe actuel
    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      logger.warn('⚠️ Tentative de changement de mot de passe avec mauvais mot de passe actuel', {
        userId,
        service: service.name
      });
      return next(new AppError('Mot de passe actuel incorrect', StatusCodes.UNAUTHORIZED));
    }

    // Mettre à jour le mot de passe
    user.password = newPassword;
    await user.save();

    // Logger l'action
    // await logAudit({
      userId,
      action: 'password_changed',
      category: 'security',
      resource: 'password',
      status: 'success',
      metadata: {
        service: service.name
      }
    });

    logger.info('🔒 Mot de passe changé', {
      service: service.name,
      userId,
      email: user.email
    });

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Mot de passe changé avec succès'
    });

  } catch (error) {
    logger.error('❌ Erreur changement mot de passe:', error);
    next(error);
  }
};
