// src/config/redis.ts
import Redis from 'ioredis';
import { logger } from '../utils/logger';
import { redisLogger, metricsLogger } from '../utils/redisLogger';

/**
 * Configuration et connexion Redis
 * Redis est utilisé pour :
 * - 🚀 Cache des données fréquemment accédées (utilisateurs, API keys)
 * - 📊 Stockage des métriques en temps réel (requêtes/sec, erreurs)
 * - 🔐 Sessions utilisateurs et tokens temporaires
 * - 🚦 Rate limiting distribué entre plusieurs instances
 */

// Configuration Redis avec retry automatique
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: 0,
  
  // Configuration de reconnexion automatique
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 5,
  lazyConnect: false, // Connexion immédiate
  
  // Timeout des opérations
  connectTimeout: 10000,
  commandTimeout: 5000,
  
  // Configuration des tentatives de reconnexion
  retryDelayOnClusterDown: 300,
  retryDelayOnReconnect: 100,
  maxRetriesPerRequest: 5,
  
  // Fonction de retry personnalisée
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    logger.warn(`🔄 Tentative de reconnexion Redis ${times}/10 dans ${delay}ms`);
    redisLogger.warn('REDIS_RETRY_ATTEMPT', { attempt: times, delay, maxAttempts: 10 });
    
    if (times > 10) {
      logger.error('❌ Échec définitif de connexion Redis après 10 tentatives');
      redisLogger.error('REDIS_CONNECTION_FAILED', { totalAttempts: times, reason: 'max_retries_exceeded' });
      return null; // Arrêter les tentatives
    }
    
    return delay;
  }
};

// Variables de suivi des connexions
let cacheRetryCount = 0;
let metricsRetryCount = 0;

// Instance Redis principale pour le cache
export const redisClient = new Redis({
  ...redisConfig,
  retryStrategy: (times: number) => {
    cacheRetryCount = times;
    const delay = Math.min(times * 50, 2000);
    redisLogger.warn('CACHE_RETRY_ATTEMPT', { attempt: times, delay, maxAttempts: 10 });
    
    if (times > 10) {
      redisLogger.error('CACHE_CONNECTION_FAILED', { totalAttempts: times });
      return null;
    }
    return delay;
  }
});

// Instance Redis dédiée aux métriques
export const redisMetrics = new Redis({
  ...redisConfig,
  db: 1,
  retryStrategy: (times: number) => {
    metricsRetryCount = times;
    const delay = Math.min(times * 50, 2000);
    metricsLogger.warn('METRICS_RETRY_ATTEMPT', { attempt: times, delay, maxAttempts: 10 });
    
    if (times > 10) {
      metricsLogger.error('METRICS_CONNECTION_FAILED', { totalAttempts: times });
      return null;
    }
    return delay;
  }
});

// Gestion des événements de connexion Redis Cache (silencieux)
redisClient.on('connect', () => {
  redisLogger.info('CACHE_CONNECTING', {
    host: redisConfig.host,
    port: redisConfig.port,
    db: 0,
    attempt: cacheRetryCount + 1,
    timestamp: new Date().toISOString()
  });
});

redisClient.on('ready', () => {
  redisLogger.info('CACHE_READY', {
    status: 'connected',
    db: 0,
    totalAttempts: cacheRetryCount + 1,
    connectionTime: new Date().toISOString()
  });
  cacheRetryCount = 0;
});

redisClient.on('error', (error) => {
  // Silencieux - logs dans fichier uniquement
  redisLogger.error('CACHE_ERROR', {
    error: error.message,
    code: error.code,
    errno: error.errno,
    attempt: cacheRetryCount,
    host: redisConfig.host,
    port: redisConfig.port,
    timestamp: new Date().toISOString()
  });
});

redisClient.on('close', () => {
  redisLogger.warn('CACHE_CLOSE', {
    reason: 'connection_closed',
    timestamp: new Date().toISOString()
  });
});

redisClient.on('reconnecting', (delay) => {
  redisLogger.info('CACHE_RECONNECTING', {
    delay,
    attempt: cacheRetryCount + 1,
    timestamp: new Date().toISOString()
  });
});

// Gestion des événements Redis Métriques (silencieux)
redisMetrics.on('connect', () => {
  metricsLogger.info('METRICS_CONNECTING', {
    host: redisConfig.host,
    port: redisConfig.port,
    db: 1,
    attempt: metricsRetryCount + 1,
    timestamp: new Date().toISOString()
  });
});

redisMetrics.on('ready', () => {
  metricsLogger.info('METRICS_READY', {
    status: 'connected',
    db: 1,
    totalAttempts: metricsRetryCount + 1,
    connectionTime: new Date().toISOString()
  });
  metricsRetryCount = 0;
});

redisMetrics.on('error', (error) => {
  // Silencieux - logs dans fichier uniquement
  metricsLogger.error('METRICS_ERROR', {
    error: error.message,
    code: error.code,
    errno: error.errno,
    attempt: metricsRetryCount,
    host: redisConfig.host,
    port: redisConfig.port,
    timestamp: new Date().toISOString()
  });
});

redisMetrics.on('close', () => {
  metricsLogger.warn('METRICS_CLOSE', {
    reason: 'connection_closed',
    timestamp: new Date().toISOString()
  });
});

redisMetrics.on('reconnecting', (delay) => {
  metricsLogger.info('METRICS_RECONNECTING', {
    delay,
    attempt: metricsRetryCount + 1,
    timestamp: new Date().toISOString()
  });
});

// Fonction pour vérifier le statut des connexions
export const getRedisStatus = () => {
  return {
    cache: {
      status: redisClient.status,
      retryCount: cacheRetryCount
    },
    metrics: {
      status: redisMetrics.status,
      retryCount: metricsRetryCount
    }
  };
};

// Log initial du statut (silencieux)
setTimeout(() => {
  const status = getRedisStatus();
  redisLogger.info('REDIS_STATUS_CHECK', status);
}, 2000);

// Méthodes utilitaires pour le cache
export class CacheService {
  
  /**
   * Met en cache une donnée avec TTL (Time To Live)
   * @param key - Clé unique pour identifier la donnée
   * @param data - Données à mettre en cache (objet ou string)
   * @param ttlSeconds - Durée de vie en secondes (défaut: 5 minutes)
   */
  static async set(key: string, data: any, ttlSeconds: number = 300): Promise<void> {
    try {
      if (redisClient.status !== 'ready') {
        logger.warn('⚠️ Redis non disponible, cache ignoré');
        return;
      }
      const serializedData = typeof data === 'string' ? data : JSON.stringify(data);
      await redisClient.setex(key, ttlSeconds, serializedData);
      logger.debug(`📦 Cache SET: ${key} (TTL: ${ttlSeconds}s)`);
    } catch (error) {
      // Silencieux si Redis non disponible
    }
  }

  /**
   * Récupère une donnée du cache
   * @param key - Clé de la donnée à récupérer
   * @returns Données désérialisées ou null si non trouvé
   */
  static async get(key: string): Promise<any> {
    try {
      if (redisClient.status !== 'ready') {
        return null;
      }
      const data = await redisClient.get(key);
      if (!data) return null;
      
      // Tentative de désérialisation JSON, sinon retour string
      try {
        return JSON.parse(data);
      } catch {
        return data;
      }
    } catch (error) {
      // Silencieux si Redis non disponible
      return null;
    }
  }

  /**
   * Supprime une ou plusieurs clés du cache
   * @param keys - Clé(s) à supprimer
   */
  static async delete(...keys: string[]): Promise<void> {
    try {
      await redisClient.del(...keys);
      logger.debug(`🗑️ Cache DELETE: ${keys.join(', ')}`);
    } catch (error) {
      // Silencieux si Redis non disponible
    }
  }

  /**
   * Vérifie si une clé existe dans le cache
   * @param key - Clé à vérifier
   * @returns true si la clé existe
   */
  static async exists(key: string): Promise<boolean> {
    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      // Silencieux si Redis non disponible
      return false;
    }
  }
}

// Service de métriques temps réel
export class MetricsService {
  
  /**
   * Incrémente un compteur de métriques
   * @param metric - Nom de la métrique (ex: 'api.requests.total')
   * @param value - Valeur à ajouter (défaut: 1)
   */
  static async increment(metric: string, value: number = 1): Promise<void> {
    try {
      if (redisMetrics.status !== 'ready') {
        return;
      }
      await redisMetrics.incrby(metric, value);
      // Définir une expiration de 24h pour éviter l'accumulation
      await redisMetrics.expire(metric, 86400);
    } catch (error) {
      // Silencieux si Redis non disponible
    }
  }

  /**
   * Enregistre une métrique avec timestamp pour les graphiques
   * @param metric - Nom de la métrique
   * @param value - Valeur à enregistrer
   */
  static async recordTimeSeries(metric: string, value: number): Promise<void> {
    try {
      const timestamp = Date.now();
      const key = `timeseries:${metric}`;
      
      // Ajouter la valeur avec timestamp
      await redisMetrics.zadd(key, timestamp, `${timestamp}:${value}`);
      
      // Garder seulement les 1000 dernières entrées
      await redisMetrics.zremrangebyrank(key, 0, -1001);
      
      // Expiration de 24h
      await redisMetrics.expire(key, 86400);
    } catch (error) {
      // Silencieux si Redis non disponible
    }
  }

  /**
   * Récupère les valeurs d'une métrique
   * @param metric - Nom de la métrique
   * @returns Valeur actuelle de la métrique
   */
  static async get(metric: string): Promise<number> {
    try {
      if (redisMetrics.status !== 'ready') {
        return 0;
      }
      const value = await redisMetrics.get(metric);
      return value ? parseInt(value) : 0;
    } catch (error) {
      // Silencieux si Redis non disponible
      return 0;
    }
  }

  /**
   * Récupère les données de série temporelle pour les graphiques
   * @param metric - Nom de la métrique
   * @param limit - Nombre de points à récupérer (défaut: 100)
   * @returns Array de {timestamp, value}
   */
  static async getTimeSeries(metric: string, limit: number = 100): Promise<Array<{timestamp: number, value: number}>> {
    try {
      const key = `timeseries:${metric}`;
      const data = await redisMetrics.zrevrange(key, 0, limit - 1);
      
      return data.map(item => {
        const [timestamp, value] = item.split(':');
        return {
          timestamp: parseInt(timestamp),
          value: parseFloat(value)
        };
      });
    } catch (error) {
      // Silencieux si Redis non disponible
      return [];
    }
  }
}