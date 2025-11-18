/**
 * Controller pour les routes service-user
 * Permet aux services externes d'accéder aux données utilisateur via le proxy
 */

import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { UserModel } from '../database/models/user.model';
import AppError from '../utils/AppError';
import { logger } from '../utils/logger';
import { decryptUserId, isEncryptedId } from '../utils/encryption';

/**
 * Récupérer le profil utilisateur
 * Route appelée par les services externes avec l'ID utilisateur chiffré
 */
export const getUserProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Récupérer l'ID utilisateur depuis le header (envoyé par le service externe)
    const encryptedUserId = req.headers['x-user-id'] as string;

    if (!encryptedUserId) {
      logger.warn('Header X-User-Id manquant');
      return next(new AppError('ID utilisateur manquant', StatusCodes.BAD_REQUEST));
    }

    // Déchiffrer l'ID utilisateur
    let userId: string;
    try {
      if (isEncryptedId(encryptedUserId)) {
        userId = decryptUserId(encryptedUserId);
        logger.debug('ID utilisateur déchiffré', { encryptedUserId, userId });
      } else {
        userId = encryptedUserId;
      }
    } catch (error) {
      logger.error('Erreur déchiffrement ID utilisateur:', error);
      return next(new AppError('ID utilisateur invalide', StatusCodes.BAD_REQUEST));
    }

    // Récupérer l'utilisateur
    const user = await UserModel.findById(userId).populate({
      path: 'roles',
      populate: { path: 'permissions' }
    });

    if (!user) {
      logger.warn('Utilisateur non trouvé', { userId });
      return next(new AppError('Utilisateur non trouvé', StatusCodes.NOT_FOUND));
    }

    if (!user.isActive) {
      logger.warn('Compte désactivé', { userId, email: user.email });
      return next(new AppError('Compte désactivé', StatusCodes.FORBIDDEN));
    }

    // Collecter les permissions
    const permissions = new Set<string>();
    (user.roles as any[]).forEach(role => {
      role.permissions.forEach((perm: any) => {
        permissions.add(`${perm.action}:${perm.subject}`);
      });
    });

    // Retourner le profil utilisateur
    const profile = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      roles: (user.roles as any[]).map(r => r.name),
      permissions: Array.from(permissions),
      isActive: user.isActive,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    logger.info('Profil utilisateur récupéré', {
      userId: user._id,
      email: user.email,
      service: req.headers['x-service-api-key'] ? 'Service externe' : 'Direct'
    });

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: {
        user: profile
      }
    });

  } catch (error) {
    logger.error('Erreur récupération profil utilisateur:', error);
    next(error);
  }
};
