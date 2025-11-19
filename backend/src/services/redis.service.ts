/**
 * Service Redis pour le cache et rate limiting
 */

import Redis from 'ioredis';
import { ProxyConfiguration } from '../config/proxy.config';
import { logger } from '../utils/logger';

class RedisService {
  private client: Redis | null = null;
  private isConnected = false;

  /**
   * Initialiser la connexion Redis
   */
  async connect(): Promise<void> {
    if (this.client) {
      return;
    }

    try {
      this.client = new Redis(ProxyConfiguration.redis.url, {
        connectTimeout: ProxyConfiguration.redis.connectTimeout,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true
      });

      this.client.on('connect', () => {
        this.isConnected = true;
        logger.info('✅ Redis connecté');
      });

      this.client.on('error', (error) => {
        this.isConnected = false;
        logger.error('❌ Erreur Redis', { error: error.message });
      });

      this.client.on('close', () => {
        this.isConnected = false;
        logger.warn('⚠️ Connexion Redis fermée');
      });

      await this.client.connect();
    } catch (error: any) {
      logger.error('❌ Impossible de se connecter à Redis', { error: error.message });
      throw error;
    }
  }

  /**
   * Fermer la connexion Redis
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
      this.isConnected = false;
      logger.info('🔌 Redis déconnecté');
    }
  }

  /**
   * Vérifier si Redis est connecté
   */
  isReady(): boolean {
    return this.isConnected && this.client !== null;
  }

  /**
   * Obtenir le client Redis
   */
  getClient(): Redis | null {
    return this.client;
  }

  // ============================================
  // CACHE OPERATIONS
  // ============================================

  /**
   * Stocker une valeur dans le cache
   */
  async setCache(key: string, value: any, ttl?: number): Promise<void> {
    if (!this.isReady()) {
      throw new Error('Redis non connecté');
    }

    const fullKey = `${ProxyConfiguration.redis.keyPrefix}cache:${key}`;
    const serializedValue = JSON.stringify(value);

    if (ttl && ttl > 0) {
      await this.client!.setex(fullKey, ttl, serializedValue);
    } else {
      await this.client!.set(fullKey, serializedValue);
    }

    logger.debug('Cache stocké', { key: fullKey, ttl });
  }

  /**
   * Récupérer une valeur du cache
   */
  async getCache<T>(key: string): Promise<T | null> {
    if (!this.isReady()) {
      throw new Error('Redis non connecté');
    }

    const fullKey = `${ProxyConfiguration.redis.keyPrefix}cache:${key}`;
    const value = await this.client!.get(fullKey);

    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error('Erreur parsing cache', { key: fullKey, error });
      return null;
    }
  }

  /**
   * Supprimer une valeur du cache
   */
  async deleteCache(key: string): Promise<void> {
    if (!this.isReady()) {
      throw new Error('Redis non connecté');
    }

    const fullKey = `${ProxyConfiguration.redis.keyPrefix}cache:${key}`;
    await this.client!.del(fullKey);
    logger.debug('Cache supprimé', { key: fullKey });
  }

  /**
   * Vider tout le cache
   */
  async clearCache(): Promise<void> {
    if (!this.isReady()) {
      throw new Error('Redis non connecté');
    }

    const pattern = `${ProxyConfiguration.redis.keyPrefix}cache:*`;
    const keys = await this.client!.keys(pattern);
    
    if (keys.length > 0) {
      await this.client!.del(...keys);
      logger.info('🗑️ Cache vidé', { count: keys.length });
    }
  }

  // ============================================
  // RATE LIMITING OPERATIONS
  // ============================================

  /**
   * Incrémenter le compteur de rate limiting
   * Retourne le nombre actuel de requêtes
   */
  async incrementRateLimit(key: string, window: number): Promise<number> {
    if (!this.isReady()) {
      throw new Error('Redis non connecté');
    }

    const fullKey = `${ProxyConfiguration.redis.keyPrefix}rate:${key}`;
    
    // Utiliser une transaction pour atomicité
    const multi = this.client!.multi();
    multi.incr(fullKey);
    multi.expire(fullKey, Math.ceil(window / 1000));
    
    const results = await multi.exec();
    
    if (!results || !results[0] || results[0][0]) {
      throw new Error('Erreur lors de l\'incrémentation du rate limit');
    }

    const count = results[0][1] as number;
    logger.debug('Rate limit incrémenté', { key: fullKey, count });
    
    return count;
  }

  /**
   * Obtenir le compteur actuel de rate limiting
   */
  async getRateLimit(key: string): Promise<number> {
    if (!this.isReady()) {
      throw new Error('Redis non connecté');
    }

    const fullKey = `${ProxyConfiguration.redis.keyPrefix}rate:${key}`;
    const count = await this.client!.get(fullKey);
    
    return count ? parseInt(count, 10) : 0;
  }

  /**
   * Réinitialiser le compteur de rate limiting
   */
  async resetRateLimit(key: string): Promise<void> {
    if (!this.isReady()) {
      throw new Error('Redis non connecté');
    }

    const fullKey = `${ProxyConfiguration.redis.keyPrefix}rate:${key}`;
    await this.client!.del(fullKey);
    logger.debug('Rate limit réinitialisé', { key: fullKey });
  }

  // ============================================
  // HEALTH CHECK
  // ============================================

  /**
   * Vérifier la santé de Redis
   */
  async healthCheck(): Promise<{ status: string; latency?: number }> {
    if (!this.isReady()) {
      return { status: 'disconnected' };
    }

    try {
      const start = Date.now();
      await this.client!.ping();
      const latency = Date.now() - start;
      
      return { status: 'healthy', latency };
    } catch (error: any) {
      return { status: 'error' };
    }
  }
}

// Instance singleton
export const redisService = new RedisService();
