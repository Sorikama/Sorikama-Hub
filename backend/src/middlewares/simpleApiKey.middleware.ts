// src/middlewares/simpleApiKey.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { SimpleApiKeyModel } from '../database/models/simpleApiKey.model';
import AppError from '../utils/AppError';
import { logger } from '../utils/logger';

// Cache des API keys (TTL: 5 minutes)
const simpleApiKeyCache = new Map<string, { apiKey: any; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000;

export const authenticateSimpleApiKey = (requiredPermissions?: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      let apiKey: string | undefined;
      
      // Extraction de l'API key depuis différentes sources
      if (req.headers['x-api-key']) {
        apiKey = req.headers['x-api-key'] as string;
      } else if (req.headers.authorization?.startsWith('Bearer ')) {
        apiKey = req.headers.authorization.split(' ')[1];
      } else if (req.query.api_key) {
        apiKey = req.query.api_key as string;
      }
      
      if (!apiKey) {
        logger.warn(`[SIMPLE_API_KEY] Tentative d'accès sans API key - IP: ${req.ip} - URL: ${req.originalUrl}`);
        return next(new AppError('API key requise', StatusCodes.UNAUTHORIZED));
      }
      
      // Vérification du format de l'API key
      if (!apiKey.startsWith('sk_')) {
        logger.warn(`[SIMPLE_API_KEY] Format d'API key invalide - IP: ${req.ip}`);
        return next(new AppError('Format d\'API key invalide', StatusCodes.UNAUTHORIZED));
      }
      
      // Vérification en cache d'abord
      const cached = simpleApiKeyCache.get(apiKey);
      let keyDoc;
      
      if (cached && cached.expires > Date.now()) {
        keyDoc = cached.apiKey;
      } else {
        // Vérification en base de données avec permissions
        keyDoc = await SimpleApiKeyModel.verifyApiKey(apiKey, requiredPermissions);
        
        if (keyDoc) {
          // Mise en cache
          simpleApiKeyCache.set(apiKey, {
            apiKey: keyDoc,
            expires: Date.now() + CACHE_TTL
          });
        }
      }
      
      if (!keyDoc) {
        const reason = requiredPermissions ? 'permissions insuffisantes' : 'invalide ou expirée';
        logger.warn(`[SIMPLE_API_KEY] API key ${reason} - IP: ${req.ip} - Required: ${requiredPermissions?.join(', ') || 'none'}`);
        return next(new AppError(`API key ${reason}`, StatusCodes.UNAUTHORIZED));
      }
      
      // Vérifier l'expiration
      if (keyDoc.isExpired()) {
        logger.warn(`[SIMPLE_API_KEY] API key expirée - Key: ${keyDoc.name} - IP: ${req.ip}`);
        return next(new AppError('API key expirée', StatusCodes.UNAUTHORIZED));
      }
      
      // Attacher les informations à la requête
      req.simpleApiKey = keyDoc;
      
      // Log de l'activité
      logger.info(`[SIMPLE_API_KEY] Accès autorisé - API Key: ${keyDoc.name} - Permissions: ${keyDoc.permissions.join(', ')} - IP: ${req.ip} - URL: ${req.originalUrl}`);
      
      next();
    } catch (error) {
      logger.error('[SIMPLE_API_KEY] Erreur d\'authentification API key:', error);
      return next(new AppError('Erreur d\'authentification', StatusCodes.INTERNAL_SERVER_ERROR));
    }
  };
};

// Middleware pour vérifier les permissions de l'API key (déprécié - utiliser authenticateSimpleApiKey avec permissions)
export const requireSimpleApiKeyPermissions = (requiredPermissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.simpleApiKey) {
      return next(new AppError('API key non trouvée sur la requête', StatusCodes.INTERNAL_SERVER_ERROR));
    }
    
    const hasPermissions = req.simpleApiKey.hasPermissions(requiredPermissions);
    
    if (!hasPermissions) {
      logger.warn(`[SIMPLE_API_KEY] Permissions insuffisantes - API Key: ${req.simpleApiKey.name} - Required: ${requiredPermissions.join(', ')} - Has: ${req.simpleApiKey.permissions.join(', ')}`);
      return next(new AppError(`Permissions insuffisantes. Requis: ${requiredPermissions.join(', ')}`, StatusCodes.FORBIDDEN));
    }
    
    next();
  };
};

// Middleware pour vérifier une permission spécifique
export const requireSimpleApiKeyPermission = (requiredPermission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.simpleApiKey) {
      return next(new AppError('API key non trouvée sur la requête', StatusCodes.INTERNAL_SERVER_ERROR));
    }
    
    const hasPermission = req.simpleApiKey.hasPermission(requiredPermission);
    
    if (!hasPermission) {
      logger.warn(`[SIMPLE_API_KEY] Permission insuffisante - API Key: ${req.simpleApiKey._id} - Required: ${requiredPermission} - Has: ${req.simpleApiKey.permissions.join(', ')}`);
      return next(new AppError(`Permission '${requiredPermission}' requise pour cette action`, StatusCodes.FORBIDDEN));
    }
    
    next();
  };
};

// Nettoyage du cache
export const clearSimpleApiKeyCache = (apiKey?: string) => {
  if (apiKey) {
    simpleApiKeyCache.delete(apiKey);
  } else {
    simpleApiKeyCache.clear();
  }
};

// Extension de l'interface Request
declare global {
  namespace Express {
    interface Request {
      simpleApiKey?: any;
    }
  }
}