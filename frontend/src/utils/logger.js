/**
 * Logger conditionnel pour la sécurité
 * 
 * En production, les logs sensibles sont désactivés
 * En développement, tous les logs sont affichés
 */

const isDevelopment = import.meta.env.MODE === 'development';

/**
 * Logger sécurisé
 * Désactive automatiquement les logs en production
 */
export const logger = {
  /**
   * Log d'information (désactivé en production)
   */
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  /**
   * Log d'information (désactivé en production)
   */
  info: (...args) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },

  /**
   * Log de debug (désactivé en production)
   */
  debug: (...args) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },

  /**
   * Log d'avertissement (toujours actif mais sanitisé)
   */
  warn: (...args) => {
    if (isDevelopment) {
      console.warn(...args);
    } else {
      // En production, logger sans détails sensibles
      console.warn('Avertissement détecté');
    }
  },

  /**
   * Log d'erreur (toujours actif mais sanitisé)
   */
  error: (...args) => {
    if (isDevelopment) {
      console.error(...args);
    } else {
      // En production, logger sans détails sensibles
      console.error('Une erreur est survenue');
    }
  },

  /**
   * Log de succès (désactivé en production)
   */
  success: (...args) => {
    if (isDevelopment) {
      console.log('✅', ...args);
    }
  }
};

/**
 * Sanitiser les données sensibles avant de les logger
 * 
 * @param {any} data - Données à sanitiser
 * @returns {any} Données sanitisées
 */
export const sanitizeForLog = (data) => {
  if (!data) return data;

  // Si c'est un objet
  if (typeof data === 'object') {
    const sanitized = { ...data };

    // Masquer les champs sensibles
    const sensitiveFields = [
      'password',
      'token',
      'accessToken',
      'refreshToken',
      'authorization',
      'apiKey',
      'secret'
    ];

    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '***HIDDEN***';
      }
    });

    return sanitized;
  }

  return data;
};

export default logger;
