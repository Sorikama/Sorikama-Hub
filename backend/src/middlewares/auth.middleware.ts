// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';
import AppError from '../utils/AppError';
import { UserModel } from '../database/models/user.model';
import { logger } from '../utils/logger';

// Étend l'interface Request d'Express pour y ajouter la propriété 'user'
declare global {
  namespace Express {
    interface Request {
      user?: any;
      sessionId?: string;
    }
  }
}

interface UserPayload {
  id: string;
  roles: string[];
  sessionId?: string;
  iat?: number;
  exp?: number;
}

// Cache des sessions actives
const activeSessions = new Map<string, { userId: string; expires: number }>();

/**
 * Middleware d'authentification renforcé
 */
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token;
    
    // Extraction du token depuis différentes sources
    // Priorité 1 : Cookie httpOnly (le plus sécurisé)
    if (req.cookies?.access_token) {
      token = req.cookies.access_token;
    }
    // Priorité 2 : Header Authorization (pour compatibilité API)
    else if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Priorité 3 : Cookie legacy
    else if (req.cookies?.token) {
      token = req.cookies.token;
    }
    // Priorité 4 : Header custom
    else if (req.headers['x-access-token']) {
      token = req.headers['x-access-token'] as string;
    }

    if (!token) {
      logger.warn(`[AUTH] Tentative d'accès sans token - IP: ${req.ip} - URL: ${req.originalUrl}`);
      return next(new AppError('Token d\'authentification requis', StatusCodes.UNAUTHORIZED));
    }

    // Vérification du token
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    
    // Vérification de la session si présente
    if (decoded.sessionId) {
      const session = activeSessions.get(decoded.sessionId);
      if (!session || session.expires < Date.now()) {
        logger.warn(`[AUTH] Session expirée ou invalide - User: ${decoded.id} - Session: ${decoded.sessionId}`);
        return next(new AppError('Session expirée', StatusCodes.UNAUTHORIZED));
      }
    }

    // Récupération des données utilisateur complètes
    const user = await UserModel.findById(decoded.id)
      .populate({
        path: 'roles',
        populate: { path: 'permissions' }
      })
      .select('-password');

    if (!user) {
      logger.warn(`[AUTH] Utilisateur non trouvé - ID: ${decoded.id}`);
      return next(new AppError('Utilisateur non trouvé', StatusCodes.UNAUTHORIZED));
    }

    if (!user.isActive) {
      logger.warn(`[AUTH] Compte désactivé - User: ${user._id}`);
      return next(new AppError('Compte désactivé', StatusCodes.FORBIDDEN));
    }

    // Attacher les données à la requête
    req.user = user;
    req.sessionId = decoded.sessionId;
    
    // Log de l'activité
    logger.info(`[AUTH] Accès autorisé - User: ${user._id} - IP: ${req.ip} - URL: ${req.originalUrl}`);
    
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn(`[AUTH] Token invalide - IP: ${req.ip} - Error: ${error.message}`);
      return next(new AppError('Token invalide', StatusCodes.UNAUTHORIZED));
    }
    
    logger.error('[AUTH] Erreur d\'authentification:', error);
    return next(new AppError('Erreur d\'authentification', StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

/**
 * Middleware pour restreindre l'accès en fonction des permissions.
 * Doit être utilisé APRÈS le middleware 'protect'.
 * @param requiredPermissions Les permissions requises pour accéder à la route.
 */
export const hasPermission = (...requiredPermissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Utilisateur non trouvé sur la requête. Le middleware \'protect\' doit être utilisé avant.', StatusCodes.INTERNAL_SERVER_ERROR));
    }

    // Aplatir toutes les permissions de tous les rôles de l'utilisateur
    const userPermissions = new Set<string>();
    req.user.roles.forEach((role: any) => {
      role.permissions.forEach((perm: any) => {
        userPermissions.add(`${perm.action}:${perm.subject}`);
      });
    });

    // Vérifier si l'utilisateur a toutes les permissions requises
    const hasRequiredPermissions = requiredPermissions.every(p => userPermissions.has(p));

    if (!hasRequiredPermissions) {
      return next(new AppError('Vous n\'avez pas la permission d\'effectuer cette action.', StatusCodes.FORBIDDEN));
    }

    next();
  };
};