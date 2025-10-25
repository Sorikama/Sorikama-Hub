/**
 * Middleware d'authentification et d'autorisation pour les routes admin
 * 
 * Ce middleware vérifie que :
 * 1. L'utilisateur est authentifié (JWT valide)
 * 2. L'utilisateur a le rôle 'admin'
 * 3. Le compte n'est pas bloqué
 */

import { Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import AppError from '../utils/AppError';
import { logger } from '../utils/logger';

/**
 * Middleware pour vérifier que l'utilisateur est un administrateur
 * 
 * Doit être utilisé APRÈS le middleware d'authentification JWT
 * qui ajoute req.user à la requête
 */
export const requireAdmin = async (req: any, res: Response, next: NextFunction) => {
  try {
    // Vérifier que l'utilisateur est authentifié
    if (!req.user) {
      logger.warn('❌ Tentative d\'accès admin sans authentification');
      throw new AppError(
        'Authentification requise pour accéder à cette ressource',
        StatusCodes.UNAUTHORIZED
      );
    }

    // Vérifier que l'utilisateur a le rôle admin ou super_admin
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      logger.warn('❌ Tentative d\'accès admin par un utilisateur non-admin', {
        userId: req.user.id,
        email: req.user.email,
        role: req.user.role
      });
      
      throw new AppError(
        'Accès refusé. Vous devez être administrateur pour accéder à cette ressource',
        StatusCodes.FORBIDDEN
      );
    }

    // Vérifier que le compte n'est pas bloqué
    if (req.user.isBlocked) {
      logger.warn('❌ Tentative d\'accès par un compte admin bloqué', {
        userId: req.user.id,
        email: req.user.email
      });
      
      throw new AppError(
        'Votre compte a été bloqué. Contactez le support',
        StatusCodes.FORBIDDEN
      );
    }

    // Tout est OK, l'utilisateur est admin et peut continuer
    logger.info('✅ Accès admin autorisé', {
      userId: req.user.id,
      email: req.user.email,
      route: req.originalUrl
    });

    next();

  } catch (error) {
    next(error);
  }
};

/**
 * Middleware optionnel pour vérifier si l'utilisateur est admin
 * sans bloquer la requête si ce n'est pas le cas
 * 
 * Ajoute req.isAdmin = true/false
 */
export const checkIfAdmin = async (req: any, res: Response, next: NextFunction) => {
  try {
    req.isAdmin = false;
    req.isSuperAdmin = false;

    if (req.user && !req.user.isBlocked) {
      if (req.user.role === 'admin' || req.user.role === 'super_admin') {
        req.isAdmin = true;
      }
      if (req.user.role === 'super_admin') {
        req.isSuperAdmin = true;
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};
