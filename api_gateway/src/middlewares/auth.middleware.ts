// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { config } from '../config';
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

// Cette interface doit correspondre à ce que vous mettez dans votre token
interface UserPayload {
  id: string;
  roles: string[];
}


/**
 * Middleware pour protéger les routes. Vérifie le token JWT.
 */
export const protect = (req: Request, res: Response, next: NextFunction) => {
  let token;
  // On vérifie si le token est dans le header "Authorization"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError("Vous n'êtes pas connecté.Veuillez vous connecter pour obtenir l'accès.", 401));
  }

  try {
    // Vérification du token
    const decoded = jwt.verify(token, config.jwt.secret!) as UserPayload;

    // Attacher l'utilisateur à la requête
    req.user = decoded;

    next(); // Tout est bon, on passe à la suite (le proxy)
  } catch (err) {
    return next(new AppError('Token invalide ou expiré.', 401));
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