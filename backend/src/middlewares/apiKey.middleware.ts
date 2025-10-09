// src/middlewares/apiKey.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ApiKeyModel } from '../database/models/apiKey.model';
import AppError from '../utils/AppError';
import { logger } from '../utils/logger';

// Cache des API keys (TTL: 5 minutes)
const apiKeyCache = new Map<string, { apiKey: any; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000;

// Rate limiting par API key
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export const authenticateApiKey = async (req: Request, res: Response, next: NextFunction) => {
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
      logger.warn(`[API_KEY] Tentative d'accès sans API key - IP: ${req.ip} - URL: ${req.originalUrl}`);
      // Marquer pour le rate limiting
      req.isUnauthorizedAttempt = true;
      return next(new AppError('API key requise', StatusCodes.UNAUTHORIZED));
    }
    
    // Vérification du format de l'API key
    if (!apiKey.startsWith('sk_') || apiKey.length !== 67) {
      logger.warn(`[API_KEY] Format d'API key invalide - IP: ${req.ip}`);
      return next(new AppError('Format d\'API key invalide', StatusCodes.UNAUTHORIZED));
    }
    
    // Vérification en cache d'abord
    const cached = apiKeyCache.get(apiKey);
    let keyDoc;
    
    if (cached && cached.expires > Date.now()) {
      keyDoc = cached.apiKey;
    } else {
      // Vérification en base de données
      keyDoc = await ApiKeyModel.verifyApiKey(apiKey);
      
      if (keyDoc) {
        // Mise en cache
        apiKeyCache.set(apiKey, {
          apiKey: keyDoc,
          expires: Date.now() + CACHE_TTL
        });
      }
    }
    
    if (!keyDoc) {
      logger.warn(`[API_KEY] API key invalide ou expirée - IP: ${req.ip}`);
      return next(new AppError('API key invalide ou expirée', StatusCodes.UNAUTHORIZED));
    }
    
    // Vérification que l'utilisateur est actif
    if (!keyDoc.userId.isActive) {
      logger.warn(`[API_KEY] Compte utilisateur désactivé - User: ${keyDoc.userId._id} - IP: ${req.ip}`);
      return next(new AppError('Compte utilisateur désactivé', StatusCodes.FORBIDDEN));
    }
    
    // Vérification des IPs autorisées
    if (keyDoc.allowedIPs && keyDoc.allowedIPs.length > 0) {
      const clientIP = req.ip;
      if (!keyDoc.allowedIPs.includes(clientIP)) {
        logger.warn(`[API_KEY] IP non autorisée - IP: ${clientIP} - User: ${keyDoc.userId._id}`);
        return next(new AppError('IP non autorisée pour cette API key', StatusCodes.FORBIDDEN));
      }
    }
    
    // Rate limiting par API key
    const rateLimitKey = keyDoc._id;
    const now = Date.now();
    const rateLimit = rateLimitStore.get(rateLimitKey);
    
    if (rateLimit) {
      if (now < rateLimit.resetTime) {
        if (rateLimit.count >= keyDoc.rateLimit.requests) {
          logger.warn(`[API_KEY] Rate limit dépassé - API Key: ${keyDoc._id} - User: ${keyDoc.userId._id}`);
          return next(new AppError('Rate limit dépassé pour cette API key', StatusCodes.TOO_MANY_REQUESTS));
        }
        rateLimit.count++;
      } else {
        // Reset du compteur
        rateLimitStore.set(rateLimitKey, {
          count: 1,
          resetTime: now + keyDoc.rateLimit.windowMs
        });
      }
    } else {
      rateLimitStore.set(rateLimitKey, {
        count: 1,
        resetTime: now + keyDoc.rateLimit.windowMs
      });
    }
    
    // Attacher les informations à la requête
    req.user = keyDoc.userId;
    req.apiKey = keyDoc;
    
    // Log de l'activité
    logger.info(`[API_KEY] Accès autorisé - API Key: ${keyDoc.name} - User: ${keyDoc.userId._id} - IP: ${req.ip} - URL: ${req.originalUrl}`);
    
    next();
  } catch (error) {
    logger.error('[API_KEY] Erreur d\'authentification API key:', error);
    return next(new AppError('Erreur d\'authentification', StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

// Middleware pour vérifier les permissions de l'API key
export const requireApiKeyPermissions = (requiredPermissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.apiKey) {
      return next(new AppError('API key non trouvée sur la requête', StatusCodes.INTERNAL_SERVER_ERROR));
    }
    
    const hasPermissions = requiredPermissions.every(permission => 
      req.apiKey.permissions.includes(permission) || req.apiKey.permissions.includes('*')
    );
    
    if (!hasPermissions) {
      logger.warn(`[API_KEY] Permissions insuffisantes - API Key: ${req.apiKey._id} - Required: ${requiredPermissions.join(', ')}`);
      return next(new AppError('Permissions insuffisantes pour cette API key', StatusCodes.FORBIDDEN));
    }
    
    next();
  };
};

// Nettoyage du cache
export const clearApiKeyCache = (apiKey?: string) => {
  if (apiKey) {
    apiKeyCache.delete(apiKey);
  } else {
    apiKeyCache.clear();
  }
};

// Extension de l'interface Request
declare global {
  namespace Express {
    interface Request {
      apiKey?: any;
      isUnauthorizedAttempt?: boolean;
    }
  }
  var swaggerSessions: Map<string, { expires: number; apiKey: string }>;
}