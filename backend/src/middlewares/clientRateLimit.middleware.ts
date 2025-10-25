/**
 * Middleware de rate limiting côté client
 * 
 * Limite le nombre de requêtes par utilisateur/IP pour prévenir les abus
 */

import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import AppError from '../utils/AppError';
import { logger } from '../utils/logger';

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
  blockUntil?: number;
}

// Stockage en mémoire des compteurs (en production, utiliser Redis)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Nettoyer les entrées expirées toutes les 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now && (!entry.blocked || (entry.blockUntil && entry.blockUntil < now))) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Obtenir l'identifiant du client
 */
function getClientId(req: Request): string {
  // Utiliser l'ID utilisateur si authentifié
  if (req.user?.id) {
    return `user_${req.user.id}`;
  }
  
  // Sinon utiliser l'IP
  return req.ip || req.socket.remoteAddress || 'unknown';
}

/**
 * Options de configuration du rate limiting
 */
export interface RateLimitOptions {
  windowMs?: number;        // Fenêtre de temps en ms (défaut: 15 minutes)
  maxRequests?: number;     // Nombre max de requêtes (défaut: 100)
  blockDuration?: number;   // Durée de blocage en ms (défaut: 1 heure)
  skipSuccessfulRequests?: boolean; // Ne pas compter les requêtes réussies
  skipFailedRequests?: boolean;     // Ne pas compter les requêtes échouées
  message?: string;         // Message d'erreur personnalisé
}

/**
 * Créer un middleware de rate limiting
 */
export const createRateLimit = (options: RateLimitOptions = {}) => {
  const {
    windowMs = 15 * 60 * 1000,        // 15 minutes
    maxRequests = 100,
    blockDuration = 60 * 60 * 1000,   // 1 heure
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    message = 'Trop de requêtes, veuillez réessayer plus tard'
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const clientId = getClientId(req);
    const now = Date.now();
    
    let entry = rateLimitStore.get(clientId);
    
    // Vérifier si le client est bloqué
    if (entry?.blocked && entry.blockUntil && entry.blockUntil > now) {
      const remainingTime = Math.ceil((entry.blockUntil - now) / 1000);
      logger.warn('Client bloqué par rate limiting', {
        clientId,
        remainingTime,
        url: req.originalUrl
      });
      
      res.setHeader('X-RateLimit-Blocked', 'true');
      res.setHeader('X-RateLimit-Reset', entry.blockUntil.toString());
      res.setHeader('Retry-After', remainingTime.toString());
      
      return next(new AppError(
        `${message}. Réessayez dans ${remainingTime} secondes`,
        StatusCodes.TOO_MANY_REQUESTS
      ));
    }
    
    // Initialiser ou réinitialiser l'entrée si nécessaire
    if (!entry || entry.resetTime < now) {
      entry = {
        count: 0,
        resetTime: now + windowMs,
        blocked: false
      };
      rateLimitStore.set(clientId, entry);
    }
    
    // Incrémenter le compteur
    entry.count++;
    
    // Ajouter les headers de rate limiting
    res.setHeader('X-RateLimit-Limit', maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - entry.count).toString());
    res.setHeader('X-RateLimit-Reset', entry.resetTime.toString());
    
    // Vérifier si la limite est dépassée
    if (entry.count > maxRequests) {
      entry.blocked = true;
      entry.blockUntil = now + blockDuration;
      
      logger.warn('Limite de requêtes dépassée', {
        clientId,
        count: entry.count,
        maxRequests,
        url: req.originalUrl
      });
      
      res.setHeader('X-RateLimit-Blocked', 'true');
      res.setHeader('Retry-After', Math.ceil(blockDuration / 1000).toString());
      
      return next(new AppError(message, StatusCodes.TOO_MANY_REQUESTS));
    }
    
    // Hook pour ne pas compter certaines requêtes
    if (skipSuccessfulRequests || skipFailedRequests) {
      const originalSend = res.send;
      res.send = function(data: any) {
        const statusCode = res.statusCode;
        
        if (
          (skipSuccessfulRequests && statusCode >= 200 && statusCode < 300) ||
          (skipFailedRequests && statusCode >= 400)
        ) {
          entry!.count--;
        }
        
        return originalSend.call(this, data);
      };
    }
    
    next();
  };
};

/**
 * Rate limiting par défaut pour les routes publiques
 */
export const publicRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  maxRequests: 100,
  message: 'Trop de requêtes depuis cette IP'
});

/**
 * Rate limiting strict pour les routes sensibles (login, register, etc.)
 */
export const strictRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  maxRequests: 5,
  blockDuration: 30 * 60 * 1000,  // 30 minutes
  message: 'Trop de tentatives, compte temporairement bloqué'
});

/**
 * Rate limiting pour les API
 */
export const apiRateLimit = createRateLimit({
  windowMs: 60 * 1000,  // 1 minute
  maxRequests: 60,
  skipSuccessfulRequests: true,
  message: 'Limite d\'API dépassée'
});

/**
 * Obtenir les statistiques de rate limiting pour un client
 */
export const getRateLimitStats = (req: Request): RateLimitEntry | null => {
  const clientId = getClientId(req);
  return rateLimitStore.get(clientId) || null;
};

/**
 * Réinitialiser le rate limiting pour un client
 */
export const resetRateLimit = (req: Request): boolean => {
  const clientId = getClientId(req);
  return rateLimitStore.delete(clientId);
};
