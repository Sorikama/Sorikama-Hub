// src/middlewares/metrics.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { MetricsService } from '../config/redis';
import { logger } from '../utils/logger';

/**
 * Middleware de collecte de métriques en temps réel
 * 
 * Ce middleware collecte automatiquement :
 * - 📊 Nombre total de requêtes par endpoint
 * - ⏱️ Temps de réponse moyen par route
 * - ❌ Nombre d'erreurs par code de statut
 * - 🔥 Requêtes par seconde (RPS)
 * - 📈 Métriques de performance système
 */

// Interface pour typer les métriques de requête
interface RequestMetrics {
  method: string;
  path: string;
  statusCode: number;
  responseTime: number;
  userAgent?: string;
  ip: string;
}

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Enregistrer le timestamp de début de requête
  const startTime = Date.now();
  
  // Intercepter la fin de la réponse pour collecter les métriques
  const originalSend = res.send;
  
  res.send = function(data) {
    // Calculer le temps de réponse
    const responseTime = Date.now() - startTime;
    
    // Préparer les données de métriques
    const metrics: RequestMetrics = {
      method: req.method,
      path: req.route?.path || req.path,
      statusCode: res.statusCode,
      responseTime,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    };
    
    // Collecter les métriques de manière asynchrone (non-bloquant)
    collectMetrics(metrics).catch(error => {
      logger.error('❌ Erreur collecte métriques:', error);
    });
    
    // Appeler la méthode send originale
    return originalSend.call(this, data);
  };
  
  next();
};

/**
 * Fonction de collecte des métriques
 * Enregistre toutes les métriques importantes dans Redis
 */
async function collectMetrics(metrics: RequestMetrics): Promise<void> {
  try {
    const { method, path, statusCode, responseTime, ip } = metrics;
    
    // 1. Compteurs globaux
    await MetricsService.increment('api.requests.total');
    await MetricsService.increment(`api.requests.method.${method.toLowerCase()}`);
    await MetricsService.increment(`api.requests.status.${statusCode}`);
    
    // 2. Métriques par endpoint
    const endpointKey = `${method}:${path}`.replace(/[^a-zA-Z0-9:]/g, '_');
    await MetricsService.increment(`api.endpoints.${endpointKey}.requests`);
    
    // 3. Temps de réponse (série temporelle pour graphiques)
    await MetricsService.recordTimeSeries('api.response_time', responseTime);
    await MetricsService.recordTimeSeries(`api.endpoints.${endpointKey}.response_time`, responseTime);
    
    // 4. Erreurs (codes 4xx et 5xx)
    if (statusCode >= 400) {
      await MetricsService.increment('api.errors.total');
      await MetricsService.increment(`api.errors.${Math.floor(statusCode / 100)}xx`);
    }
    
    // 5. Requêtes par seconde (RPS) - fenêtre glissante de 1 minute
    const currentMinute = Math.floor(Date.now() / 60000);
    await MetricsService.increment(`api.rps.minute.${currentMinute}`);
    
    // 6. IPs uniques (pour détecter le trafic)
    const ipKey = `api.unique_ips.${Math.floor(Date.now() / 3600000)}`; // Par heure
    await MetricsService.increment(ipKey);
    
    logger.debug(`📊 Métriques collectées: ${method} ${path} ${statusCode} ${responseTime}ms`);
    
  } catch (error) {
    logger.error('❌ Erreur lors de la collecte des métriques:', error);
  }
}

/**
 * Middleware spécialisé pour les métriques d'API Key
 * Collecte des statistiques d'utilisation par API Key
 */
export const apiKeyMetricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Vérifier si une API key est présente
  const apiKey = req.headers['x-api-key'] as string;
  
  if (apiKey && req.apiKey) {
    // Collecter les métriques d'utilisation de l'API Key
    collectApiKeyMetrics(req.apiKey._id, req.method, req.path).catch(error => {
      logger.error('❌ Erreur métriques API Key:', error);
    });
  }
  
  next();
};

/**
 * Collecte des métriques spécifiques aux API Keys
 */
async function collectApiKeyMetrics(apiKeyId: string, method: string, path: string): Promise<void> {
  try {
    // Métriques par API Key
    await MetricsService.increment(`apikey.${apiKeyId}.requests.total`);
    await MetricsService.increment(`apikey.${apiKeyId}.requests.${method.toLowerCase()}`);
    
    // Dernière utilisation
    const timestamp = Date.now();
    await MetricsService.recordTimeSeries(`apikey.${apiKeyId}.last_used`, timestamp);
    
    logger.debug(`🔑 Métriques API Key collectées: ${apiKeyId} ${method} ${path}`);
    
  } catch (error) {
    logger.error('❌ Erreur métriques API Key:', error);
  }
}