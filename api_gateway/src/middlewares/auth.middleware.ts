// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import AppError from '../utils/AppError';
import { verifyToken } from '../auth/auth.service';
import { UserModel } from '../database/models/user.model';

// Étend l'interface Request d'Express pour y ajouter la propriété 'user'
declare global {
  namespace Express {
    interface Request {
      user?: any; // Utiliser un type plus spécifique si possible, ex: IUser
    }
  }
}

/**
 * Middleware pour protéger les routes. Vérifie le token JWT.
 */
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Non autorisé. Token manquant.', StatusCodes.UNAUTHORIZED));
    }

    const token = authHeader.split(' ')[1];
    
    // 1. Vérifier le token
    const decoded: any = verifyToken(token); // Le payload du token

    // 2. Vérifier si l'utilisateur existe toujours
    const currentUser = await UserModel.findById(decoded.id).populate({
      path: 'roles',
      populate: { path: 'permissions' }
    });
    
    if (!currentUser) {
      return next(new AppError('L\'utilisateur associé à ce token n\'existe plus.', StatusCodes.UNAUTHORIZED));
    }

    // 3. Vérifier si l'utilisateur est actif
    if (!currentUser.isActive) {
      return next(new AppError('Ce compte utilisateur est désactivé.', StatusCodes.FORBIDDEN));
    }
    
    // 4. Attacher l'utilisateur à la requête
    req.user = currentUser;
    next();
  } catch (error) {
    return next(new AppError('Non autorisé. Token invalide ou expiré.', StatusCodes.UNAUTHORIZED));
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