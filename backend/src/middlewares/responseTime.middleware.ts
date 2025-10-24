// src/middlewares/responseTime.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { MetricsService } from '../config/redis';

// Seuils d'alerte pour les temps de réponse (en millisecondes)
const RESPONSE_TIME_THRESHOLDS = {
  WARNING: 1000,   // 1 seconde
  CRITICAL: 3000,  // 3 secondes
  SEVERE: 5000     // 5 secondes
};

export const responseTimeMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Intercepter la fin de la réponse
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Enregistrer les métriques
    recordResponseTimeMetrics(req, res, responseTime);
    
    // Vérifier les seuils et générer des alertes
    checkResponseTimeAlerts(req, responseTime);
    
    // Appeler la méthode originale
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

/**
 * Enregistre les métriques de temps de réponse
 */
async function recordResponseTimeMetrics(req: Request, res: Response, responseTime: number) {
  try {
    // Métriques générales
    await MetricsService.recordTimeSeries('api.response_time', responseTime);
    await MetricsService.increment('api.requests.total');
    
    // Métriques par méthode HTTP
    const method = req.method.toLowerCase();
    await MetricsService.recordTimeSeries(`api.response_time.${method}`, responseTime);
    await MetricsService.increment(`api.requests.method.${method}`);
    
    // Métriques par code de statut
    const statusCode = res.statusCode;
    const statusCategory = Math.floor(statusCode / 100) + 'xx';
    await MetricsService.increment(`api.responses.${statusCategory}`);
    
    if (statusCode >= 400) {
      await MetricsService.increment('api.errors.total');
      await MetricsService.increment(`api.errors.${statusCategory}`);
    }
    
    // Métriques par endpoint
    const endpoint = req.route?.path || req.path;
    if (endpoint) {
      await MetricsService.recordTimeSeries(`api.response_time.endpoint.${endpoint}`, responseTime);
    }
    
    // Log détaillé pour les requêtes lentes
    if (responseTime > RESPONSE_TIME_THRESHOLDS.WARNING) {
      logger.warn(`🐌 Requête lente détectée`, {
        method: req.method,
        url: req.originalUrl,
        responseTime: `${responseTime}ms`,
        statusCode: res.statusCode,
        userAgent: req.get('User-Agent'),
        ip: req.ip
      });
    }
    
  } catch (error) {
    logger.error('❌ Erreur enregistrement métriques temps de réponse:', error);
  }
}

/**
 * Vérifie les seuils de temps de réponse et génère des alertes
 */
function checkResponseTimeAlerts(req: Request, responseTime: number) {
  const method = req.method;
  const url = req.originalUrl;
  
  if (responseTime > RESPONSE_TIME_THRESHOLDS.SEVERE) {
    logger.error(`🚨 ALERTE CRITIQUE - Temps de réponse TRÈS ÉLEVÉ`, {
      level: 'SEVERE',
      responseTime: `${responseTime}ms`,
      threshold: `${RESPONSE_TIME_THRESHOLDS.SEVERE}ms`,
      method,
      url,
      timestamp: new Date().toISOString()
    });
    
    // Enregistrer l'alerte critique
    MetricsService.increment('alerts.response_time.severe');
    
  } else if (responseTime > RESPONSE_TIME_THRESHOLDS.CRITICAL) {
    logger.error(`⚠️ ALERTE - Temps de réponse CRITIQUE`, {
      level: 'CRITICAL',
      responseTime: `${responseTime}ms`,
      threshold: `${RESPONSE_TIME_THRESHOLDS.CRITICAL}ms`,
      method,
      url,
      timestamp: new Date().toISOString()
    });
    
    // Enregistrer l'alerte critique
    MetricsService.increment('alerts.response_time.critical');
    
  } else if (responseTime > RESPONSE_TIME_THRESHOLDS.WARNING) {
    logger.warn(`⚡ ATTENTION - Temps de réponse ÉLEVÉ`, {
      level: 'WARNING',
      responseTime: `${responseTime}ms`,
      threshold: `${RESPONSE_TIME_THRESHOLDS.WARNING}ms`,
      method,
      url,
      timestamp: new Date().toISOString()
    });
    
    // Enregistrer l'alerte d'avertissement
    MetricsService.increment('alerts.response_time.warning');
  }
}

/**
 * Middleware pour les requêtes très lentes (timeout)
 */
export const slowRequestTimeoutMiddleware = (timeoutMs: number = 30000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        logger.error(`⏰ TIMEOUT - Requête abandonnée après ${timeoutMs}ms`, {
          method: req.method,
          url: req.originalUrl,
          timeout: `${timeoutMs}ms`,
          timestamp: new Date().toISOString()
        });
        
        MetricsService.increment('alerts.request.timeout');
        
        res.status(408).json({
          success: false,
          error: 'Request Timeout',
          message: `La requête a pris plus de ${timeoutMs}ms à traiter`,
          timestamp: new Date().toISOString()
        });
      }
    }, timeoutMs);
    
    // Nettoyer le timeout quand la réponse est envoyée
    res.on('finish', () => {
      clearTimeout(timeout);
    });
    
    next();
  };
};