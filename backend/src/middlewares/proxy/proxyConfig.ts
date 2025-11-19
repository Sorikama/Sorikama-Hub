/**
 * Configuration centralisée pour le proxy dynamique
 */

export const PROXY_CONFIG = {
  // Timeouts
  TIMEOUT: 30000, // 30 secondes
  PROXY_TIMEOUT: 30000,
  
  // Rate limiting
  RATE_LIMIT_WINDOW: 60000, // 1 minute
  MAX_REQUESTS_PER_WINDOW: 100,
  
  // Headers autorisés (whitelist)
  ALLOWED_HEADERS: new Set([
    'content-type',
    'content-length',
    'accept',
    'accept-encoding',
    'accept-language',
    'user-agent'
  ]),
  
  // Headers à supprimer (sécurité)
  BLOCKED_HEADERS: [
    'authorization',
    'cookie',
    'x-api-key'
  ]
} as const;
