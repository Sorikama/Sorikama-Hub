/**
 * Middleware de rate limiting avancé avec tracking en base de données
 */

import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { RateLimitModel } from '../database/models/rateLimit.model';
import AppError from '../utils/AppError';
import { logger } from '../utils/logger';

export interface RateLimitConfig {
  windowMs: number; // Durée de la fenêtre en ms
  maxRequests: number; // Nombre max de requêtes
  service?: string; // Service concerné
  blockDuration?: number; // Durée du blocage en ms (défaut: 15 min)
  skipSuccessfulRequests?: boolean; // Ne compter que les erreurs
  keyGenerator?: (req: Request) => string; // Générateur de clé personnalisé
}

/**
 * Créer un middleware de rate limiting
 */
export const createRateLimit = (config: RateLimitConfig) => {
  const {
    windowMs,
    maxRequests,
    service,
    blockDuration = 15 * 60 * 1000, // 15 minutes par défaut
    skipSuccessfulRequests = false,
    keyGenerator,
  } = config;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Récupérer l'ID utilisateur
      const userId = (req as any).user?.id || (req as any).apiKey?.userId;
      
      if (!userId) {
        // Pas d'utilisateur identifié, on laisse passer
        return next();
      }

      const now = new Date();
      const windowStart = new Date(now.getTime() - windowMs);
      const windowEnd = new Date(now.getTime() + windowMs);

      // Générer la clé de tracking
      const endpoint = keyGenerator ? keyGenerator(req) : req.path;

      // Chercher ou créer l'entrée de rate limit
      let rateLimit = await RateLimitModel.findOne({
        userId,
        service,
        endpoint,
        windowEnd: { $gt: now },
      });

      // Vérifier si l'utilisateur est bloqué
      if (rateLimit?.isBlocked && rateLimit.blockedUntil && rateLimit.blockedUntil > now) {
        const retryAfter = Math.ceil((rateLimit.blockedUntil.getTime() - now.getTime()) / 1000);
        
        logger.warn('🚫 Rate limit - Utilisateur bloqué', {
          userId,
          service,
          endpoint,
          blockedUntil: rateLimit.blockedUntil,
          retryAfter,
        });

        res.setHeader('Retry-After', retryAfter.toString());
        res.setHeader('X-RateLimit-Limit', maxRequests.toString());
        res.setHeader('X-RateLimit-Remaining', '0');
        res.setHeader('X-RateLimit-Reset', rateLimit.blockedUntil.getTime().toString());

        return next(new AppError(
          `Trop de requêtes. Réessayez dans ${retryAfter} secondes.`,
          StatusCodes.TOO_MANY_REQUESTS
        ));
      }

      // Créer une nouvelle fenêtre si nécessaire
      if (!rateLimit || rateLimit.windowEnd < now) {
        rateLimit = await RateLimitModel.create({
          userId,
          service,
          endpoint,
          requestCount: 1,
          windowStart,
          windowEnd,
          isBlocked: false,
          lastRequest: now,
        });
      } else {
        // Incrémenter le compteur
        rateLimit.requestCount += 1;
        rateLimit.lastRequest = now;

        // Vérifier si la limite est dépassée
        if (rateLimit.requestCount > maxRequests) {
          rateLimit.isBlocked = true;
          rateLimit.blockedUntil = new Date(now.getTime() + blockDuration);
          
          await rateLimit.save();

          const retryAfter = Math.ceil(blockDuration / 1000);

          logger.warn('⚠️ Rate limit dépassé - Utilisateur bloqué', {
            userId,
            service,
            endpoint,
            requestCount: rateLimit.requestCount,
            maxRequests,
            blockedUntil: rateLimit.blockedUntil,
          });

          res.setHeader('Retry-After', retryAfter.toString());
          res.setHeader('X-RateLimit-Limit', maxRequests.toString());
          res.setHeader('X-RateLimit-Remaining', '0');
          res.setHeader('X-RateLimit-Reset', rateLimit.blockedUntil.getTime().toString());

          return next(new AppError(
            `Limite de requêtes dépassée. Réessayez dans ${retryAfter} secondes.`,
            StatusCodes.TOO_MANY_REQUESTS
          ));
        }

        await rateLimit.save();
      }

      // Ajouter les headers de rate limit
      const remaining = Math.max(0, maxRequests - rateLimit.requestCount);
      res.setHeader('X-RateLimit-Limit', maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', remaining.toString());
      res.setHeader('X-RateLimit-Reset', rateLimit.windowEnd.getTime().toString());

      // Logger si on approche de la limite
      if (remaining <= 5) {
        logger.warn('⚠️ Rate limit - Approche de la limite', {
          userId,
          service,
          endpoint,
          remaining,
          maxRequests,
        });
      }

      next();
    } catch (error) {
      logger.error('❌ Erreur dans le rate limiting:', error);
      // En cas d'erreur, on laisse passer pour ne pas bloquer le service
      next();
    }
  };
};

/**
 * Rate limiting global (toutes les routes)
 */
export const globalRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 1000, // 1000 requêtes par 15 min
  blockDuration: 15 * 60 * 1000, // Blocage de 15 min
});

/**
 * Rate limiting pour les routes sensibles (auth, admin)
 */
export const strictRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requêtes par 15 min
  blockDuration: 30 * 60 * 1000, // Blocage de 30 min
});

/**
 * Rate limiting pour les routes publiques
 */
export const publicRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requêtes par minute
  blockDuration: 5 * 60 * 1000, // Blocage de 5 min
});
