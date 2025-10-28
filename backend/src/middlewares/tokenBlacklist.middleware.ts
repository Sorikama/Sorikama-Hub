/**
 * Middleware pour vérifier si un token est blacklisté
 */

import { Request, Response, NextFunction } from 'express';
import { tokenBlacklistService } from '../services/tokenBlacklist.service';
import { logger } from '../utils/logger';
import AppError from '../utils/AppError';
import { StatusCodes } from 'http-status-codes';

/**
 * Vérifier si le token est blacklisté
 */
export const checkTokenBlacklist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Récupérer le token depuis l'en-tête Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);

    // Vérifier si le token est blacklisté
    const isBlacklisted = await tokenBlacklistService.isBlacklisted(token);

    if (isBlacklisted) {
      logger.warn('🚫 Token blacklisté utilisé', {
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });

      return next(new AppError(
        'Ce token a été révoqué. Veuillez vous reconnecter.',
        StatusCodes.UNAUTHORIZED
      ));
    }

    // Vérifier si tous les tokens de l'utilisateur/service sont révoqués
    if (req.user) {
      const userId = req.user._id || req.user.id;
      const service = (req.user as any).service;

      if (userId && service) {
        const areRevoked = await tokenBlacklistService.areUserServiceTokensRevoked(userId, service);
        
        if (areRevoked) {
          logger.warn('🚫 Tous les tokens utilisateur/service révoqués', {
            userId,
            service,
            ip: req.ip
          });

          return next(new AppError(
            'Votre accès à ce service a été révoqué. Veuillez vous reconnecter.',
            StatusCodes.UNAUTHORIZED
          ));
        }
      }
    }

    next();
  } catch (error) {
    logger.error('❌ Erreur vérification blacklist:', error);
    // En cas d'erreur, on laisse passer (fail-open) pour ne pas bloquer le service
    next();
  }
};
