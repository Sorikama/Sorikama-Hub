// src/services/proxy.service.ts
import { createProxyMiddleware, Options, RequestHandler } from 'http-proxy-middleware';
import { Request, Response } from 'express';
import { ClientRequest, IncomingMessage } from 'http';
import { logger } from '../utils/logger';
import { ServiceRoute } from './routingEngine.service';
import { encryptUserId } from '../utils/encryption';

// Métriques de performance
interface ProxyMetrics {
  requestCount: number;
  errorCount: number;
  totalResponseTime: number;
  lastRequestTime: number;
}

const metrics = new Map<string, ProxyMetrics>();

/**
 * Crée un proxy avancé avec retry, timeout et métriques
 */
export const createAdvancedProxy = (route: ServiceRoute, targetUrl: string): RequestHandler => {
  const options: any = {
    target: targetUrl,
    changeOrigin: true,
    timeout: route.timeout || 30000,
    
    onProxyReq: (proxyReq: ClientRequest, req: Request, _res: Response) => {
      const startTime = Date.now();
      req.startTime = startTime;
      
      logger.info(`[PROXY] ${req.method} ${req.originalUrl} -> ${targetUrl}${req.url}`);
      
      // En-têtes de sécurité
      if (req.user) {
        // Chiffrer l'ID utilisateur pour la sécurité
        const userId = req.user._id || req.user.id;
        const encryptedUserId = encryptUserId(userId.toString());
        
        proxyReq.setHeader('X-User-Id', encryptedUserId);
        proxyReq.setHeader('X-User-Email', req.user.email);
        
        if (req.user.roles) {
          const roleNames = req.user.roles.map((r: any) => r.name || r).join(',');
          proxyReq.setHeader('X-User-Roles', roleNames);
          
          const permissions = new Set<string>();
          req.user.roles.forEach((role: any) => {
            if (role.permissions) {
              role.permissions.forEach((perm: any) => {
                permissions.add(`${perm.action}:${perm.subject}`);
              });
            }
          });
          proxyReq.setHeader('X-User-Permissions', Array.from(permissions).join(','));
        }
      }
      
      // En-têtes de traçabilité
      const requestId = req.headers['x-request-id'] || generateRequestId();
      proxyReq.setHeader('X-Request-ID', requestId);
      proxyReq.setHeader('X-Forwarded-For', req.ip || 'unknown');
      proxyReq.setHeader('X-Gateway-Version', '1.0.0');
      proxyReq.setHeader('X-Service-Name', route.name);
      
      // Mise à jour des métriques
      updateMetrics(route.name, 'request');
    },
    
    onProxyRes: (proxyRes: IncomingMessage, req: Request, _res: Response) => {
      const responseTime = Date.now() - (req.startTime || Date.now());
      
      // En-têtes de réponse
      proxyRes.headers['X-Response-Time'] = `${responseTime}ms`;
      proxyRes.headers['X-Gateway'] = 'Sorikama-Hub';
      
      // Log de performance
      logger.info(`[PROXY] Response: ${proxyRes.statusCode} in ${responseTime}ms`);
      
      // Mise à jour des métriques
      updateMetrics(route.name, 'response', responseTime);
      
      if (proxyRes.statusCode && proxyRes.statusCode >= 400) {
        updateMetrics(route.name, 'error');
      }
    },
    
    onError: async (err: any, req: Request, res: Response) => {
      const responseTime = Date.now() - (req.startTime || Date.now());
      
      logger.error(`[PROXY] Error for ${route.name} after ${responseTime}ms:`, {
        error: err.message,
        code: err.code,
        target: targetUrl,
        method: req.method,
        url: req.originalUrl
      });
      
      updateMetrics(route.name, 'error');
      
      // Retry logic
      const retryCount = req.retryCount || 0;
      if (route.retries && retryCount < route.retries) {
        req.retryCount = retryCount + 1;
        logger.info(`[PROXY] Retry ${req.retryCount}/${route.retries} for ${route.name}`);
        
        // Attendre avant retry
        await new Promise(resolve => setTimeout(resolve, 1000 * (req.retryCount || 1)));
        return; // Le proxy va automatiquement retry
      }
      
      if (!res.headersSent) {
        const errorResponse = {
          error: 'Service Unavailable',
          message: `Le service ${route.name} est temporairement indisponible`,
          code: err.code || 'PROXY_ERROR',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id']
        };
        
        // Déterminer le code de statut approprié
        let statusCode = 502; // Bad Gateway par défaut
        
        if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
          statusCode = 503; // Service Unavailable
        } else if (err.code === 'ETIMEDOUT') {
          statusCode = 504; // Gateway Timeout
        }
        
        res.status(statusCode).json(errorResponse);
      }
    }
  };
  
  return createProxyMiddleware(options);
};

// Fonction de compatibilité (deprecated)
export const createProxy = (target: string): RequestHandler => {
  const options: any = {
    target,
    changeOrigin: true,
    onProxyReq: (proxyReq: ClientRequest, req: Request, _res: Response) => {
      logger.info(`[PROXY] Redirection : ${req.method} ${req.originalUrl} -> ${target}${req.url}`);
      if (req.user) {
        // Chiffrer l'ID utilisateur
        const encryptedUserId = encryptUserId(req.user.id.toString());
        proxyReq.setHeader('X-User-Id', encryptedUserId);
        if (Array.isArray(req.user.roles)) {
          const roleNames = req.user.roles.map((r: any) => r.name).join(',');
          proxyReq.setHeader('X-User-Roles', roleNames);
        }
      }
    },
    onError: (err: any, _req: Request, res: Response) => {
      logger.error(`[PROXY] Erreur de proxy vers ${target}:`, err);
      if (!res.headersSent) {
        res.status(502).json({
          message: 'Bad Gateway',
          error: `Impossible de contacter le service en amont.`,
        });
      }
    },
  };
  return createProxyMiddleware(options);
};

// Génération d'ID de requête unique
const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};

// Mise à jour des métriques
const updateMetrics = (serviceName: string, type: 'request' | 'response' | 'error', responseTime?: number): void => {
  const current = metrics.get(serviceName) || {
    requestCount: 0,
    errorCount: 0,
    totalResponseTime: 0,
    lastRequestTime: 0
  };
  
  switch (type) {
    case 'request':
      current.requestCount++;
      current.lastRequestTime = Date.now();
      break;
    case 'response':
      if (responseTime) {
        current.totalResponseTime += responseTime;
      }
      break;
    case 'error':
      current.errorCount++;
      break;
  }
  
  metrics.set(serviceName, current);
};

// Récupération des métriques
export const getProxyMetrics = (): Map<string, ProxyMetrics> => {
  return new Map(metrics);
};

// Reset des métriques
export const resetMetrics = (): void => {
  metrics.clear();
};

// Extension de l'interface Request
declare global {
  namespace Express {
    interface Request {
      startTime?: number;
      retryCount?: number;
    }
  }
}