/**
 * Configuration avancée du proxy dynamique
 * Centralise toutes les configurations liées au proxy
 */

export const ProxyConfiguration = {
  // ============================================
  // TIMEOUTS
  // ============================================
  timeouts: {
    // Timeout général pour les requêtes proxy
    request: parseInt(process.env.PROXY_TIMEOUT || '30000'),
    
    // Timeout pour la connexion au service
    connection: parseInt(process.env.PROXY_CONNECTION_TIMEOUT || '5000'),
    
    // Timeout pour la réponse du service
    response: parseInt(process.env.PROXY_RESPONSE_TIMEOUT || '30000')
  },

  // ============================================
  // RATE LIMITING
  // ============================================
  rateLimit: {
    // Fenêtre de temps (en millisecondes)
    window: parseInt(process.env.RATE_LIMIT_WINDOW || '60000'), // 1 minute
    
    // Nombre maximum de requêtes par fenêtre
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    
    // Activer/désactiver le rate limiting
    enabled: process.env.RATE_LIMIT_ENABLED !== 'false',
    
    // Utiliser Redis pour le rate limiting (recommandé en production)
    useRedis: process.env.RATE_LIMIT_USE_REDIS === 'true'
  },

  // ============================================
  // CACHE
  // ============================================
  cache: {
    // Activer/désactiver le cache des proxies
    enabled: process.env.PROXY_CACHE_ENABLED !== 'false',
    
    // TTL du cache (en secondes) - 0 = infini
    ttl: parseInt(process.env.PROXY_CACHE_TTL || '0'),
    
    // Utiliser Redis pour le cache (recommandé en production)
    useRedis: process.env.PROXY_CACHE_USE_REDIS === 'true'
  },

  // ============================================
  // SÉCURITÉ
  // ============================================
  security: {
    // Headers autorisés (whitelist)
    allowedHeaders: [
      'content-type',
      'content-length',
      'accept',
      'accept-encoding',
      'accept-language',
      'user-agent'
    ],
    
    // Headers à bloquer (blacklist)
    blockedHeaders: [
      'authorization',
      'cookie',
      'x-api-key',
      'x-csrf-token'
    ],
    
    // Vérifier la signature HMAC
    verifyHmacSignature: process.env.VERIFY_HMAC_SIGNATURE !== 'false',
    
    // Durée de validité de la signature (en secondes)
    signatureMaxAge: parseInt(process.env.SIGNATURE_MAX_AGE || '300') // 5 minutes
  },

  // ============================================
  // LOGGING
  // ============================================
  logging: {
    // Niveau de log (debug, info, warn, error)
    level: process.env.PROXY_LOG_LEVEL || 'info',
    
    // Logger les requêtes
    logRequests: process.env.PROXY_LOG_REQUESTS !== 'false',
    
    // Logger les réponses
    logResponses: process.env.PROXY_LOG_RESPONSES !== 'false',
    
    // Logger les headers (attention aux données sensibles)
    logHeaders: process.env.PROXY_LOG_HEADERS === 'true',
    
    // Logger le body (attention aux données sensibles)
    logBody: process.env.PROXY_LOG_BODY === 'true'
  },

  // ============================================
  // PERFORMANCE
  // ============================================
  performance: {
    // Seuil pour les requêtes lentes (en ms)
    slowRequestThreshold: parseInt(process.env.SLOW_REQUEST_THRESHOLD || '1000'),
    
    // Activer la compression gzip
    enableCompression: process.env.PROXY_COMPRESSION !== 'false',
    
    // Taille minimale pour la compression (en bytes)
    compressionThreshold: parseInt(process.env.COMPRESSION_THRESHOLD || '1024')
  },

  // ============================================
  // REDIS (optionnel)
  // ============================================
  redis: {
    // URL de connexion Redis
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    
    // Préfixe pour les clés Redis
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'sorikama:proxy:',
    
    // Timeout de connexion Redis
    connectTimeout: parseInt(process.env.REDIS_CONNECT_TIMEOUT || '5000')
  }
} as const;

/**
 * Valider la configuration au démarrage
 */
export function validateProxyConfiguration(): void {
  const config = ProxyConfiguration;
  
  // Vérifier les timeouts
  if (config.timeouts.request < 1000) {
    console.warn('⚠️ PROXY_TIMEOUT trop court (< 1s), risque de timeouts fréquents');
  }
  
  // Vérifier le rate limiting
  if (config.rateLimit.maxRequests < 10) {
    console.warn('⚠️ RATE_LIMIT_MAX_REQUESTS trop bas (< 10), risque de blocages');
  }
  
  // Vérifier Redis si activé
  if (config.cache.useRedis || config.rateLimit.useRedis) {
    if (!config.redis.url) {
      console.error('❌ Redis activé mais REDIS_URL non défini');
      throw new Error('Configuration Redis invalide');
    }
  }
  
  console.log('✅ Configuration du proxy validée');
}
