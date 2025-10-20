// src/middlewares/serviceProxy.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { ServiceManager } from '../services/serviceManager.service';
import { logger } from '../utils/logger';

export interface ServiceProxyRequest extends Request {
  serviceId?: string;
  targetService?: any;
  proxyPath?: string;
}

/**
 * Middleware pour identifier et valider les requêtes vers les services
 */
export const serviceIdentifier = async (req: ServiceProxyRequest, res: Response, next: NextFunction) => {
  try {
    // Extraire l'ID du service depuis l'URL
    const pathParts = req.path.split('/');
    const serviceIndex = pathParts.indexOf('proxy');
    
    if (serviceIndex !== -1 && pathParts[serviceIndex + 1]) {
      const serviceId = pathParts[serviceIndex + 1];
      const proxyPath = '/' + pathParts.slice(serviceIndex + 2).join('/');
      
      // Récupérer les informations du service
      const service = await ServiceManager.getServiceById(serviceId);
      
      if (!service) {
        return res.status(404).json({
          success: false,
          message: `Service '${serviceId}' non trouvé`
        });
      }
      
      if (service.status !== 'active') {
        return res.status(503).json({
          success: false,
          message: `Service '${service.name}' indisponible (${service.status})`
        });
      }
      
      // Ajouter les informations à la requête
      req.serviceId = serviceId;
      req.targetService = service;
      req.proxyPath = proxyPath;
      
      logger.info(`🔄 Requête proxy vers ${service.name}`, {
        serviceId,
        path: proxyPath,
        method: req.method,
        userAgent: req.get('User-Agent')
      });
    }
    
    next();
  } catch (error: any) {
    logger.error('Erreur service identifier:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'identification du service'
    });
  }
};

/**
 * Middleware pour valider les redirections
 */
export const validateRedirect = (req: Request, res: Response, next: NextFunction) => {
  const { redirect_url } = req.query;
  
  if (redirect_url) {
    try {
      const url = new URL(redirect_url as string);
      
      // Liste des domaines autorisés
      const allowedDomains = [
        'localhost',
        '127.0.0.1',
        process.env.ALLOWED_DOMAIN || 'sorikama.com'
      ];
      
      const isAllowed = allowedDomains.some(domain => 
        url.hostname === domain || url.hostname.endsWith('.' + domain)
      );
      
      if (!isAllowed) {
        return res.status(400).json({
          success: false,
          message: 'URL de redirection non autorisée'
        });
      }
      
      logger.info(`✅ URL de redirection validée: ${redirect_url}`);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'URL de redirection invalide'
      });
    }
  }
  
  next();
};

/**
 * Middleware pour logger les requêtes de services
 */
export const serviceRequestLogger = (req: ServiceProxyRequest, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Intercepter la réponse pour logger les métriques
  const originalSend = res.send;
  res.send = function(data) {
    const responseTime = Date.now() - startTime;
    
    if (req.serviceId) {
      logger.info(`📊 Métriques service ${req.serviceId}`, {
        serviceId: req.serviceId,
        method: req.method,
        path: req.proxyPath,
        statusCode: res.statusCode,
        responseTime,
        contentLength: data ? data.length : 0
      });
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

/**
 * Middleware pour gérer les erreurs de services
 */
export const serviceErrorHandler = (error: any, req: ServiceProxyRequest, res: Response, next: NextFunction) => {
  logger.error(`❌ Erreur service ${req.serviceId || 'unknown'}:`, {
    serviceId: req.serviceId,
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method
  });
  
  // Réponse d'erreur standardisée
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Erreur interne du service',
    serviceId: req.serviceId,
    timestamp: new Date().toISOString()
  });
};

/**
 * Middleware pour vérifier les permissions de service
 */
export const checkServicePermissions = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { serviceId } = req;
    const userId = req.user?.id || req.portalUser?.id;
    
    if (!serviceId || !userId) {
      return next();
    }
    
    // Ici on pourrait ajouter une logique de permissions plus complexe
    // Pour l'instant, on vérifie juste que l'utilisateur est authentifié
    
    logger.info(`🔐 Vérification permissions service`, {
      serviceId,
      userId,
      method: req.method
    });
    
    next();
  } catch (error: any) {
    logger.error('Erreur vérification permissions:', error);
    res.status(403).json({
      success: false,
      message: 'Permissions insuffisantes'
    });
  }
};