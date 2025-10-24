// src/middlewares/authorization.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import AppError from '../utils/AppError';
import { UserModel } from '../database/models/user.model';
import { logger } from '../utils/logger';

export interface AuthorizationRule {
  resource: string;
  action: string;
  conditions?: {
    field?: string;
    operator?: 'eq' | 'ne' | 'in' | 'nin' | 'gt' | 'lt' | 'contains';
    value?: any;
  }[];
  contextCheck?: (req: Request, user: any) => boolean;
}

// Cache des permissions utilisateur (TTL: 5 minutes)
const permissionCache = new Map<string, { permissions: Set<string>; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Récupération des permissions avec cache
const getUserPermissions = async (userId: string): Promise<Set<string>> => {
  const cached = permissionCache.get(userId);
  if (cached && cached.expires > Date.now()) {
    return cached.permissions;
  }

  try {
    const user = await UserModel.findById(userId)
      .populate({
        path: 'roles',
        populate: { path: 'permissions' }
      });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    const permissions = new Set<string>();
    user.roles.forEach((role: any) => {
      role.permissions.forEach((perm: any) => {
        permissions.add(`${perm.action}:${perm.subject}`);
      });
    });

    // Mise en cache
    permissionCache.set(userId, {
      permissions,
      expires: Date.now() + CACHE_TTL
    });

    return permissions;
  } catch (error) {
    logger.error(`[AUTH] Erreur lors de la récupération des permissions pour ${userId}:`, error);
    return new Set();
  }
};

// Middleware d'autorisation avancé
export const authorize = (rules: AuthorizationRule | AuthorizationRule[]) => {
  const ruleArray = Array.isArray(rules) ? rules : [rules];
  
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Utilisateur non authentifié', StatusCodes.UNAUTHORIZED));
    }

    try {
      const userPermissions = await getUserPermissions(req.user.id);
      
      // Vérifier chaque règle (OR logic entre les règles)
      const hasAccess = await Promise.all(ruleArray.map(async (rule) => {
        const requiredPermission = `${rule.action}:${rule.resource}`;
        
        // Vérification de base des permissions
        if (!userPermissions.has(requiredPermission)) {
          return false;
        }
        
        // Vérification des conditions contextuelles
        if (rule.conditions) {
          for (const condition of rule.conditions) {
            if (!evaluateCondition(req, condition)) {
              return false;
            }
          }
        }
        
        // Vérification personnalisée
        if (rule.contextCheck && !rule.contextCheck(req, req.user)) {
          return false;
        }
        
        return true;
      }));

      if (!hasAccess.some(Boolean)) {
        logger.warn(`[AUTH] Accès refusé - User: ${req.user.id} - Resource: ${ruleArray.map(r => `${r.action}:${r.resource}`).join(', ')} - IP: ${req.ip}`);
        return next(new AppError('Accès refusé à cette ressource', StatusCodes.FORBIDDEN));
      }

      next();
    } catch (error) {
      logger.error('[AUTH] Erreur lors de la vérification des autorisations:', error);
      return next(new AppError('Erreur d\'autorisation', StatusCodes.INTERNAL_SERVER_ERROR));
    }
  };
};

// Évaluation des conditions
const evaluateCondition = (req: Request, condition: any): boolean => {
  const { field, operator, value } = condition;
  
  if (!field || !operator) return true;
  
  const fieldValue = getFieldValue(req, field);
  
  switch (operator) {
    case 'eq':
      return fieldValue === value;
    case 'ne':
      return fieldValue !== value;
    case 'in':
      return Array.isArray(value) && value.includes(fieldValue);
    case 'nin':
      return Array.isArray(value) && !value.includes(fieldValue);
    case 'gt':
      return fieldValue > value;
    case 'lt':
      return fieldValue < value;
    case 'contains':
      return typeof fieldValue === 'string' && fieldValue.includes(value);
    default:
      return true;
  }
};

// Extraction de valeur de champ
const getFieldValue = (req: Request, field: string): any => {
  const parts = field.split('.');
  let value: any = req;
  
  for (const part of parts) {
    value = value?.[part];
  }
  
  return value;
};

// Middleware pour vérifier la propriété des ressources
export const checkResourceOwnership = (resourceIdField: string = 'params.id') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Utilisateur non authentifié', StatusCodes.UNAUTHORIZED));
    }

    const resourceId = getFieldValue(req, resourceIdField);
    
    if (!resourceId) {
      return next(new AppError('ID de ressource manquant', StatusCodes.BAD_REQUEST));
    }

    // Vérifier si l'utilisateur est propriétaire ou admin
    const isAdmin = req.user.roles?.some((role: any) => role.name === 'admin');
    const isOwner = req.user.id === resourceId || req.body?.userId === req.user.id;
    
    if (!isAdmin && !isOwner) {
      logger.warn(`[AUTH] Tentative d'accès non autorisé - User: ${req.user.id} - Resource: ${resourceId} - IP: ${req.ip}`);
      return next(new AppError('Vous ne pouvez accéder qu\'à vos propres ressources', StatusCodes.FORBIDDEN));
    }

    next();
  };
};

// Middleware pour les rôles hiérarchiques
export const requireMinimumRole = (minimumRole: string) => {
  const roleHierarchy = ['guest', 'user', 'premium', 'moderator', 'admin', 'superadmin'];
  
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.roles?.length) {
      return next(new AppError('Aucun rôle assigné', StatusCodes.FORBIDDEN));
    }

    const userRoles = req.user.roles.map((role: any) => role.name);
    const minRoleIndex = roleHierarchy.indexOf(minimumRole);
    
    const hasRequiredRole = userRoles.some(role => {
      const userRoleIndex = roleHierarchy.indexOf(role);
      return userRoleIndex >= minRoleIndex;
    });

    if (!hasRequiredRole) {
      logger.warn(`[AUTH] Rôle insuffisant - User: ${req.user.id} - Required: ${minimumRole} - Has: ${userRoles.join(', ')} - IP: ${req.ip}`);
      return next(new AppError(`Rôle minimum requis: ${minimumRole}`, StatusCodes.FORBIDDEN));
    }

    next();
  };
};

// Nettoyage du cache des permissions
export const clearPermissionCache = (userId?: string) => {
  if (userId) {
    permissionCache.delete(userId);
  } else {
    permissionCache.clear();
  }
};