/**
 * Gestion du cache des proxies
 * Utilise Redis en production, Map en mémoire en fallback
 */

import { logger } from '../../utils/logger';
import { redisService } from '../../services/redis.service';
import { ProxyConfiguration } from '../../config/proxy.config';

// Cache en mémoire (fallback si Redis non disponible)
const proxyCache = new Map<string, any>();

/**
 * Récupérer un proxy du cache
 */
export async function getProxyFromCache(serviceSlug: string): Promise<any | undefined> {
  // Si Redis est activé et disponible
  if (ProxyConfiguration.cache.useRedis && redisService.isReady()) {
    try {
      const cached = await redisService.getCache<any>(`proxy:${serviceSlug}`);
      return cached;
    } catch (error: any) {
      logger.warn('⚠️ Erreur Redis cache, fallback vers Map', { error: error.message });
    }
  }
  
  // Fallback vers Map en mémoire
  return proxyCache.get(serviceSlug);
}

/**
 * Ajouter un proxy au cache
 */
export async function addProxyToCache(serviceSlug: string, proxy: any): Promise<void> {
  // Si Redis est activé et disponible
  if (ProxyConfiguration.cache.useRedis && redisService.isReady()) {
    try {
      const ttl = ProxyConfiguration.cache.ttl > 0 ? ProxyConfiguration.cache.ttl : undefined;
      await redisService.setCache(`proxy:${serviceSlug}`, proxy, ttl);
      logger.debug('Proxy ajouté au cache Redis', { serviceSlug, ttl });
      return;
    } catch (error: any) {
      logger.warn('⚠️ Erreur Redis cache, fallback vers Map', { error: error.message });
    }
  }
  
  // Fallback vers Map en mémoire
  proxyCache.set(serviceSlug, proxy);
  logger.debug('Proxy ajouté au cache Map', { serviceSlug });
}

/**
 * Vérifier si un proxy existe dans le cache
 */
export async function hasProxyInCache(serviceSlug: string): Promise<boolean> {
  const proxy = await getProxyFromCache(serviceSlug);
  return proxy !== undefined && proxy !== null;
}

/**
 * Vider le cache des proxies
 */
export async function clearProxyCache(): Promise<void> {
  // Vider Redis si activé
  if (ProxyConfiguration.cache.useRedis && redisService.isReady()) {
    try {
      await redisService.clearCache();
    } catch (error: any) {
      logger.warn('⚠️ Erreur lors du vidage du cache Redis', { error: error.message });
    }
  }
  
  // Vider Map en mémoire
  proxyCache.clear();
  logger.info('🗑️ Cache des proxies vidé');
}
