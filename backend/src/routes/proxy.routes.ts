// src/routes/proxy.routes.ts
import { Router, Request, Response, NextFunction } from 'express';
import { protect } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/authorization.middleware';
import { 
  securityHeaders, 
  validateHeaders, 
  allowedMethods, 
  validatePayloadSize, 
  dynamicRateLimit, 
  sanitizeQuery, 
  logSuspiciousActivity 
} from '../middlewares/requestFilter.middleware';
import { dataInspection } from '../middlewares/security.middleware';
import { handleUnauthorizedAttempts } from '../middlewares/unauthorizedHandler.middleware';
import { createAdvancedProxy, getProxyMetrics } from '../services/proxy.service';
import { routingEngine } from '../services/routingEngine.service';
import { logger } from '../utils/logger';
import AppError from '../utils/AppError';
import { StatusCodes } from 'http-status-codes';

const router = Router();

// ===================================================================================
// --- 🔒 Middlewares de Sécurité Globaux ---
// ===================================================================================

// 1. Sécurité de base
router.use(securityHeaders);
router.use(validateHeaders);
router.use(logSuspiciousActivity);
router.use(dataInspection); // Inspection des données contre les injections
router.use(sanitizeQuery);
router.use(validatePayloadSize());

// 2. Authentification (API Key ou JWT)
router.use((req, res, next) => {
  // Essayer d'abord l'authentification par API Key
  const hasApiKey = req.headers['x-api-key'] || 
                   (req.headers.authorization?.startsWith('Bearer ') && req.headers.authorization.split(' ')[1]?.startsWith('sk_')) ||
                   req.query.api_key;
  
  if (hasApiKey) {
    // Import dynamique pour éviter les dépendances circulaires
    import('../middlewares/apiKey.middleware').then(({ authenticateApiKey }) => {
      authenticateApiKey(req, res, next);
    }).catch(() => {
      // Fallback vers JWT si erreur
      protect(req, res, next);
    });
  } else {
    // Sinon utiliser l'authentification JWT
    protect(req, res, next);
  }
});

// 3. Rate limiting dynamique
router.use(dynamicRateLimit);

// ===================================================================================
// --- 📋 Route de Métriques et Santé ---
// ===================================================================================

router.get('/gateway/health', (req: Request, res: Response) => {
  const healthStatus = routingEngine.getHealthStatus();
  const metrics = getProxyMetrics();
  
  const services = Array.from(healthStatus.entries()).map(([name, healthy]) => {
    const serviceMetrics = metrics.get(name);
    return {
      name,
      healthy,
      metrics: serviceMetrics ? {
        requests: serviceMetrics.requestCount,
        errors: serviceMetrics.errorCount,
        avgResponseTime: serviceMetrics.requestCount > 0 
          ? Math.round(serviceMetrics.totalResponseTime / serviceMetrics.requestCount)
          : 0,
        lastRequest: serviceMetrics.lastRequestTime
      } : null
    };
  });
  
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    gateway: {
      version: '1.0.0',
      uptime: process.uptime()
    },
    services
  });
});

router.get('/gateway/routes', authorize({ resource: 'gateway', action: 'read' }), (req: Request, res: Response) => {
  const routes = routingEngine.getRoutes().map(route => ({
    name: route.name,
    path: route.path,
    methods: route.methods,
    permissions: route.permissions,
    healthy: routingEngine.getHealthStatus().get(route.name)
  }));
  
  res.json({ routes });
});

// ===================================================================================
// --- 🚀 Routage Dynamique Intelligent ---
// ===================================================================================

// Middleware de routage principal
router.use('*', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Trouver la route correspondante
    const route = routingEngine.findRoute(req);
    
    if (!route) {
      logger.warn(`[GATEWAY] Route non trouvée: ${req.method} ${req.path} - User: ${req.user?.id} - IP: ${req.ip}`);
      return next(new AppError('Service non disponible', StatusCodes.NOT_FOUND));
    }
    
    // Vérifier les méthodes autorisées
    if (!route.methods.includes(req.method)) {
      return next(new AppError(`Méthode ${req.method} non autorisée pour ce service`, StatusCodes.METHOD_NOT_ALLOWED));
    }
    
    // Vérifier les permissions
    const authRules = route.permissions.map(perm => {
      const [action, resource] = perm.split(':');
      return { resource, action };
    });
    
    // Appliquer l'autorisation
    const authMiddleware = authorize(authRules);
    
    authMiddleware(req, res, (authError) => {
      if (authError) {
        return next(authError);
      }
      
      // Obtenir l'URL cible (avec load balancing si configuré)
      const targetUrl = routingEngine.getTargetUrl(route);
      
      // Créer et exécuter le proxy
      const proxy = createAdvancedProxy(route, targetUrl);
      
      // Log de la redirection
      logger.info(`[GATEWAY] Routing ${req.method} ${req.originalUrl} -> ${route.name} (${targetUrl})`);
      
      // Exécuter le proxy
      proxy(req, res, next);
    });
    
  } catch (error) {
    logger.error('[GATEWAY] Erreur de routage:', error);
    next(new AppError('Erreur interne du gateway', StatusCodes.INTERNAL_SERVER_ERROR));
  }
});

export default router;