// src/middlewares/realLogging.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { logger, securityLogger, performanceLogger, requestLogger, alertsLogger } from '../utils/logger';

export interface LoggingRequest extends Request {
  startTime?: number;
  userAgent?: string;
  realIP?: string;
}

/**
 * Middleware pour logger toutes les requêtes HTTP
 */
export const httpRequestLogger = (req: LoggingRequest, res: Response, next: NextFunction) => {
  req.startTime = Date.now();
  req.userAgent = req.get('User-Agent') || 'Unknown';
  req.realIP = req.ip || req.connection.remoteAddress || 'Unknown';

  // Logger la requête entrante
  requestLogger.info(`📥 ${req.method} ${req.originalUrl} - IP: ${req.realIP} - UA: ${req.userAgent}`);

  // Intercepter la réponse
  const originalSend = res.send;
  res.send = function(data) {
    const responseTime = Date.now() - (req.startTime || Date.now());
    const statusCode = res.statusCode;
    
    // Logger la réponse
    const logMessage = `📤 ${req.method} ${req.originalUrl} - ${statusCode} - ${responseTime}ms - ${req.realIP}`;
    
    if (statusCode >= 500) {
      logger.error(logMessage);
      alertsLogger.error(`🚨 Erreur serveur: ${logMessage}`);
    } else if (statusCode >= 400) {
      logger.warn(logMessage);
      if (statusCode === 401 || statusCode === 403) {
        securityLogger.warn(`🔐 Accès refusé: ${logMessage}`);
      }
    } else {
      requestLogger.info(logMessage);
    }

    // Logger les performances lentes
    if (responseTime > 1000) {
      performanceLogger.warn(`🐌 Requête lente: ${logMessage}`);
      alertsLogger.warn(`⚠️ Performance: Requête lente détectée - ${responseTime}ms`);
    }

    return originalSend.call(this, data);
  };

  next();
};

/**
 * Logger les erreurs d'authentification
 */
export const logAuthAttempt = (username: string, success: boolean, ip: string, userAgent: string) => {
  const message = `🔐 Tentative de connexion - User: ${username} - IP: ${ip} - Success: ${success}`;
  
  if (success) {
    securityLogger.info(message);
    logger.info(`✅ Connexion réussie pour ${username}`);
  } else {
    securityLogger.warn(message);
    alertsLogger.warn(`🚨 Échec de connexion pour ${username} depuis ${ip}`);
    logger.warn(`❌ Échec de connexion pour ${username}`);
  }
};

/**
 * Logger les actions sensibles
 */
export const logSecurityEvent = (event: string, userId?: string, details?: any) => {
  const message = `🛡️ ${event}${userId ? ` - User: ${userId}` : ''}${details ? ` - Details: ${JSON.stringify(details)}` : ''}`;
  securityLogger.info(message);
  logger.info(message);
};

/**
 * Logger les métriques de performance
 */
export const logPerformanceMetric = (metric: string, value: number, unit: string = 'ms') => {
  const message = `📊 ${metric}: ${value}${unit}`;
  performanceLogger.info(message);
  
  // Alertes pour les métriques critiques
  if (metric.includes('memory') && value > 80) {
    alertsLogger.warn(`⚠️ Utilisation mémoire élevée: ${value}%`);
  }
  if (metric.includes('cpu') && value > 90) {
    alertsLogger.warn(`⚠️ Utilisation CPU élevée: ${value}%`);
  }
};

/**
 * Logger les événements Redis
 */
export const logRedisEvent = (event: string, details?: any) => {
  const message = `🔴 Redis ${event}${details ? ` - ${JSON.stringify(details)}` : ''}`;
  const { redisLogger } = require('../utils/logger');
  redisLogger.info(message);
  logger.debug(message);
};

/**
 * Logger les événements de services
 */
export const logServiceEvent = (serviceId: string, event: string, success: boolean, responseTime?: number) => {
  const message = `🔗 Service ${serviceId} - ${event} - Success: ${success}${responseTime ? ` - ${responseTime}ms` : ''}`;
  
  if (success) {
    logger.info(message);
  } else {
    logger.error(message);
    alertsLogger.error(`🚨 Service ${serviceId} en erreur: ${event}`);
  }
  
  if (responseTime) {
    logPerformanceMetric(`Service ${serviceId} response time`, responseTime);
  }
};

/**
 * Logger les événements SSO
 */
export const logSSOEvent = (event: string, serviceId: string, userId?: string, success: boolean = true) => {
  const message = `🔐 SSO ${event} - Service: ${serviceId}${userId ? ` - User: ${userId}` : ''} - Success: ${success}`;
  securityLogger.info(message);
  logger.info(message);
  
  if (!success) {
    alertsLogger.warn(`⚠️ Échec SSO: ${event} pour ${serviceId}`);
  }
};

/**
 * Logger les événements système
 */
export const logSystemEvent = (event: string, level: 'info' | 'warn' | 'error' = 'info', details?: any) => {
  const message = `⚙️ Système: ${event}${details ? ` - ${JSON.stringify(details)}` : ''}`;
  
  switch (level) {
    case 'error':
      logger.error(message);
      alertsLogger.error(`🚨 ${message}`);
      break;
    case 'warn':
      logger.warn(message);
      alertsLogger.warn(`⚠️ ${message}`);
      break;
    default:
      logger.info(message);
  }
};