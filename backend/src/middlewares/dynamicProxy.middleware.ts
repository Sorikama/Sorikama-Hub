/**
 * Middleware de proxy dynamique pour les services externes
 * Route automatiquement les requêtes vers les services configurés
 */

import { Request, Response, NextFunction } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { ServiceModel } from '../database/models/service.model';
import { logger } from '../utils/logger';

// Cache des proxies pour éviter de recréer à chaque requête
const proxyCache = new Map<string, any>();

/**
 * Middleware de proxy dynamique
 */
export const dynamicProxyMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extraire le chemin proxy de l'URL
    // Format: /api/proxy/{proxyPath}/...
    const match = req.path.match(/^\/proxy\/([^\/]+)(\/.*)?$/);
    
    if (!match) {
      return next();
    }

    const [, proxyPath, remainingPath = ''] = match;

    // Chercher le service dans la base de données
    const service = await ServiceModel.findOne({
      proxyPath,
      enabled: true
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service non trouvé ou désactivé'
      });
    }

    // Vérifier l'authentification si requise
    if (service.requireAuth) {
      // Vérifier le token JWT
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'Authentification requise pour ce service'
        });
      }

      // Extraire et vérifier le token
      const token = authHeader.substring(7);
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        
        // Charger l'utilisateur
        const { UserModel } = require('../database/models/user.model');
        const user = await UserModel.findById(decoded.id);
        
        if (!user) {
          return res.status(401).json({
            success: false,
            message: 'Utilisateur non trouvé'
          });
        }

        // Ajouter l'utilisateur à la requête
        (req as any).user = user;

        // Vérifier les rôles autorisés
        if (service.allowedRoles.length > 0) {
          if (!service.allowedRoles.includes(user.role)) {
            return res.status(403).json({
              success: false,
              message: 'Vous n\'avez pas les permissions pour accéder à ce service'
            });
          }
        }
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: 'Token invalide ou expiré'
        });
      }
    }

    // Récupérer ou créer le proxy
    let proxy = proxyCache.get(service.proxyPath);
    
    if (!proxy) {
      proxy = createProxyMiddleware({
        target: service.backendUrl,
        changeOrigin: true,
        pathRewrite: {
          [`^/api/v1/proxy/${service.proxyPath}`]: ''
        },
        onProxyReq: (proxyReq, req, res) => {
          // Ajouter des headers personnalisés
          proxyReq.setHeader('X-Proxied-By', 'Sorikama-Hub');
          proxyReq.setHeader('X-Service-Name', service.name);
          
          // Transférer le token d'authentification si présent
          const authHeader = req.headers.authorization;
          if (authHeader) {
            proxyReq.setHeader('Authorization', authHeader);
          }

          logger.info('🔄 Proxy request', {
            service: service.name,
            path: req.path,
            target: service.backendUrl,
            user: (req as any).user?.email
          });
        },
        onProxyRes: (proxyRes, req, res) => {
          // Ajouter des headers de réponse
          proxyRes.headers['X-Proxied-By'] = 'Sorikama-Hub';
          proxyRes.headers['X-Service-Name'] = service.name;
        },
        onError: (err, req, res) => {
          logger.error('❌ Erreur proxy', {
            service: service.name,
            error: err.message,
            target: service.backendUrl
          });

          (res as Response).status(502).json({
            success: false,
            message: 'Erreur de connexion au service',
            service: service.name
          });
        }
      });

      // Mettre en cache
      proxyCache.set(service.proxyPath, proxy);
    }

    // Exécuter le proxy
    return proxy(req, res, next);

  } catch (error: any) {
    logger.error('❌ Erreur middleware proxy dynamique:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur interne du proxy'
    });
  }
};

/**
 * Vider le cache des proxies (utile après modification des services)
 */
export const clearProxyCache = () => {
  proxyCache.clear();
  logger.info('🗑️ Cache des proxies vidé');
};
