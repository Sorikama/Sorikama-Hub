/**
 * Rate limiting par utilisateur
 * Utilise Redis en production, Map en mémoire en fallback
 */

import { PROXY_CONFIG } from './proxyConfig';
import { logger } from '../../utils/logger';
import { redisService } from '../../services/redis.service';
import { ProxyConfiguration } from '../../config/proxy.config';

interface RateLimitInfo {
  count: number;
  resetAt: number;
}

// Rate limiting en mémoire (fallback si Redis non disponible)
const userRequestCounts = new Map<string, RateLimitInfo>();

/**
 * Vérifier et incrémenter le compteur de requêtes pour un utilisateur (Redis)
 */
async function checkRateLimitRedis(userId: string, serviceSlug: string): Promise<boolean> {
  try {
    const userKey = `${userId}_${serviceSlug}`;
    const count = await redisService.incrementRateLimit(
      userKey, 
      ProxyConfiguration.rateLimit.window
    );
    
    if (count > ProxyConfiguration.rateLimit.maxRequests) {
      logger.warn('❌ Rate limit dépassé (Redis)', {
        userId,
        service: serviceSlug,
        count
      });
      return true;
    }
    
    return false;
  } catch (error: any) {
    logger.error('❌ Erreur Redis rate limit', { error: error.message });
    throw error;
  }
}

/**
 * Vérifier et incrémenter le compteur de requêtes pour un utilisateur (Map)
 */
function checkRateLimitMemory(userId: string, serviceSlug: string): boolean {
  const userKey = `${userId}_${serviceSlug}`;
  const now = Date.now();
  
  let userLimit = userRequestCounts.get(userKey);
  
  // Réinitialiser si la fenêtre est expirée
  if (!userLimit || userLimit.resetAt < now) {
    userLimit = { 
      count: 0, 
      resetAt: now + ProxyConfiguration.rateLimit.window
    };
  }
  
  userLimit.count++;
  userRequestCounts.set(userKey, userLimit);
  
  // Vérifier si la limite est dépassée
  if (userLimit.count > ProxyConfiguration.rateLimit.maxRequests) {
    logger.warn('❌ Rate limit dépassé (Memory)', {
      userId,
      service: serviceSlug,
      count: userLimit.count
    });
    return true;
  }
  
  return false;
}

/**
 * Vérifier et incrémenter le compteur de requêtes pour un utilisateur
 * 
 * @returns true si la limite est dépassée, false sinon
 */
export async function checkRateLimit(userId: string, serviceSlug: string): Promise<boolean> {
  // Si rate limiting désactivé
  if (!ProxyConfiguration.rateLimit.enabled) {
    return false;
  }
  
  // Si Redis est activé et disponible
  if (ProxyConfiguration.rateLimit.useRedis && redisService.isReady()) {
    try {
      return await checkRateLimitRedis(userId, serviceSlug);
    } catch (error: any) {
      logger.warn('⚠️ Erreur Redis rate limit, fallback vers Map', { error: error.message });
    }
  }
  
  // Fallback vers Map en mémoire
  return checkRateLimitMemory(userId, serviceSlug);
}

/**
 * Obtenir le nombre de requêtes pour un utilisateur
 */
export async function getRateLimitCount(userId: string, serviceSlug: string): Promise<number> {
  // Si Redis est activé et disponible
  if (ProxyConfiguration.rateLimit.useRedis && redisService.isReady()) {
    try {
      const userKey = `${userId}_${serviceSlug}`;
      return await redisService.getRateLimit(userKey);
    } catch (error: any) {
      logger.warn('⚠️ Erreur Redis rate limit, fallback vers Map', { error: error.message });
    }
  }
  
  // Fallback vers Map en mémoire
  const userKey = `${userId}_${serviceSlug}`;
  const userLimit = userRequestCounts.get(userKey);
  return userLimit?.count || 0;
}
