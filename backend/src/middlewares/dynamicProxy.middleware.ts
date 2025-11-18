/**
 * Middleware de proxy dynamique sécurisé pour les services externes
 * Route automatiquement les requêtes vers les services configurés
 * 
 * Sécurité :
 * - Validation JWT avec déchiffrement d'ID
 * - Vérification de session SSO
 * - Rate limiting par utilisateur
 * - Logging complet des requêtes
 * - Headers sécurisés
 */

import { Request, Response, NextFunction } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { ServiceModel } from '../database/models/service.model';
import { SSOSessionModel } from '../database/models/ssoSession.model';
import { logger } from '../utils/logger';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';

// Cache des proxies pour éviter de recréer à chaque requête
const proxyCache = new Map<string, any>();

// Rate limiting par utilisateur (simple, en production utiliser Redis)
const userRequestCounts = new Map<string, { count: number; resetAt: number }>();

/**
 * Middleware de proxy dynamique sécurisé
 */
export const dynamicProxyMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();
  
  try {
    // ============================================
    // 1. EXTRAIRE LE SERVICE
    // ============================================
    
    const proxyPath = req.params.proxyPath;
    
    if (!proxyPath) {
      logger.warn('❌ Proxy path manquant');
      return res.status(400).json({
        success: false,
        message: 'Service non spécifié'
      });
    }

    logger.info('🔄 Requête proxy reçue', {
      proxyPath,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip
    });

    // ============================================
    // 2. VÉRIFIER QUE LE SERVICE EXISTE
    // ============================================
    
    const service = await ServiceModel.findOne({
      slug: proxyPath,
      enabled: true
    });

    if (!service) {
      logger.warn('❌ Service non trouvé ou désactivé', { proxyPath });
      return res.status(404).json({
        success: false,
        message: 'Service non trouvé ou désactivé'
      });
    }

    logger.info('✅ Service trouvé', {
      name: service.name,
      slug: service.slug,
      backendUrl: service.backendUrl
    });

    // ============================================
    // 3. VÉRIFIER L'AUTHENTIFICATION
    // ============================================
    
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('❌ Token manquant', { proxyPath });
      return res.status(401).json({
        success: false,
        message: 'Authentification requise'
      });
    }

    const token = authHeader.substring(7);
    let decoded: any;
    let userId: string;
    let user: any;

    try {
      // Vérifier le token JWT
      decoded = jwt.verify(token, JWT_SECRET) as any;
      
      logger.info('🔍 Token décodé', {
        hasId: !!decoded.id,
        email: decoded.email,
        service: decoded.service
      });

      // Déchiffrer l'ID utilisateur si nécessaire
      const { decryptUserId, isEncryptedId } = require('../utils/encryption');
      const { UserModel } = require('../database/models/user.model');
      
      if (isEncryptedId(decoded.id)) {
        userId = decryptUserId(decoded.id);
        logger.debug('🔐 ID déchiffré');
      } else {
        userId = decoded.id;
      }

      // Charger l'utilisateur
      user = await UserModel.findById(userId);

      if (!user) {
        logger.warn('❌ Utilisateur non trouvé', { userId });
        return res.status(401).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
      }

      if (!user.isActive) {
        logger.warn('❌ Compte désactivé', { userId, email: user.email });
        return res.status(401).json({
          success: false,
          message: 'Compte désactivé'
        });
      }

      logger.info('✅ Utilisateur authentifié', {
        userId: user._id,
        email: user.email
      });

    } catch (error: any) {
      logger.error('❌ Erreur validation token:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Token invalide ou expiré'
      });
    }

    // ============================================
    // 4. VÉRIFIER LA SESSION SSO
    // ============================================
    
    const ssoSession = await SSOSessionModel.findOne({
      userId: user._id.toString(),
      serviceId: service.slug,
      expiresAt: { $gt: new Date() }
    });

    if (!ssoSession) {
      logger.warn('❌ Session SSO non trouvée ou expirée', {
        userId: user._id,
        serviceId: service.slug
      });
      return res.status(403).json({
        success: false,
        message: 'Session expirée. Veuillez vous reconnecter.'
      });
    }

    logger.info('✅ Session SSO valide', {
      sessionId: ssoSession.sessionId,
      expiresAt: ssoSession.expiresAt
    });

    // ============================================
    // 5. VÉRIFIER LES RÔLES AUTORISÉS
    // ============================================
    
    if (service.allowedRoles && service.allowedRoles.length > 0) {
      if (!service.allowedRoles.includes(user.role)) {
        logger.warn('❌ Rôle non autorisé', {
          userId: user._id,
          userRole: user.role,
          allowedRoles: service.allowedRoles
        });
        return res.status(403).json({
          success: false,
          message: 'Permissions insuffisantes'
        });
      }
    }

    // ============================================
    // 6. RATE LIMITING PAR UTILISATEUR
    // ============================================
    
    const userKey = `${user._id}_${service.slug}`;
    const now = Date.now();
    const rateLimitWindow = 60000; // 1 minute
    const maxRequests = 100; // 100 requêtes par minute
    
    let userLimit = userRequestCounts.get(userKey);
    
    if (!userLimit || userLimit.resetAt < now) {
      userLimit = { count: 0, resetAt: now + rateLimitWindow };
    }
    
    userLimit.count++;
    userRequestCounts.set(userKey, userLimit);
    
    if (userLimit.count > maxRequests) {
      logger.warn('❌ Rate limit dépassé', {
        userId: user._id,
        service: service.slug,
        count: userLimit.count
      });
      return res.status(429).json({
        success: false,
        message: 'Trop de requêtes. Veuillez réessayer plus tard.'
      });
    }

    // ============================================
    // 7. AJOUTER L'UTILISATEUR À LA REQUÊTE
    // ============================================
    
    (req as any).user = user;
    (req as any).service = service;
    (req as any).ssoSession = ssoSession;

    // ============================================
    // 8. CRÉER OU RÉCUPÉRER LE PROXY
    // ============================================
    
    let proxy = proxyCache.get(service.slug);

    if (!proxy) {
      logger.info('🔧 Création du proxy pour', { service: service.name });
      
      proxy = createProxyMiddleware(<any>{
        target: service.backendUrl,
        changeOrigin: true,
        pathRewrite: (path: string) => {
          // Transformer /api/v1/proxy/masebuy/stores/my-stores
          // en /api/stores/my-stores
          const newPath = path.replace(`/api/v1/proxy/${service.slug}`, '/api');
          logger.debug('🔄 Path rewrite', { 
            original: path, 
            rewritten: newPath 
          });
          return newPath;
        },
        onProxyReq: (proxyReq: any, req: any) => {
          const user = req.user;
          const ssoSession = req.ssoSession;
          
          // ============================================
          // HEADERS SÉCURISÉS POUR LE SERVICE EXTERNE
          // ============================================
          
          // Informations utilisateur (chiffrées)
          const { encryptUserId } = require('../utils/encryption');
          const encryptedUserId = encryptUserId(user._id.toString());
          
          proxyReq.setHeader('X-User-Id', encryptedUserId);
          proxyReq.setHeader('X-User-Email', user.email);
          proxyReq.setHeader('X-User-Role', user.role);
          proxyReq.setHeader('X-Session-Id', ssoSession.sessionId);
          
          // Informations service
          proxyReq.setHeader('X-Service-Id', service.slug);
          proxyReq.setHeader('X-Service-Name', service.name);
          
          // Informations proxy
          proxyReq.setHeader('X-Proxied-By', 'Sorikama-Hub');
          proxyReq.setHeader('X-Proxy-Timestamp', new Date().toISOString());
          
          // Forwarded headers
          proxyReq.setHeader('X-Forwarded-For', req.ip);
          proxyReq.setHeader('X-Forwarded-Proto', req.protocol);
          proxyReq.setHeader('X-Forwarded-Host', req.hostname);
          
          // Supprimer les headers sensibles
          proxyReq.removeHeader('authorization');
          proxyReq.removeHeader('cookie');
          
          logger.info('📤 Requête envoyée au service', {
            service: service.name,
            method: req.method,
            path: req.path,
            target: service.backendUrl,
            userId: user._id,
            email: user.email
          });
        },
        onProxyRes: (proxyRes: any, req: any) => {
          const responseTime = Date.now() - startTime;
          
          // Ajouter des headers de réponse
          proxyRes.headers['X-Proxied-By'] = 'Sorikama-Hub';
          proxyRes.headers['X-Response-Time'] = `${responseTime}ms`;
          
          logger.info('📥 Réponse reçue du service', {
            service: service.name,
            statusCode: proxyRes.statusCode,
            responseTime: `${responseTime}ms`,
            userId: req.user._id
          });
        },
        onError: (err: any, req: any, res: any) => {
          const responseTime = Date.now() - startTime;
          
          logger.error('❌ Erreur proxy', {
            service: service.name,
            error: err.message,
            target: service.backendUrl,
            responseTime: `${responseTime}ms`,
            userId: req.user?._id
          });

          if (!res.headersSent) {
            res.status(502).json({
              success: false,
              message: 'Erreur de connexion au service',
              service: service.name
            });
          }
        },
        timeout: 30000, // 30 secondes
        proxyTimeout: 30000
      });

      // Mettre en cache
      proxyCache.set(service.slug, proxy);
    }

    // ============================================
    // 9. EXÉCUTER LE PROXY
    // ============================================
    
    return proxy(req, res, next);

  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    logger.error('❌ Erreur middleware proxy dynamique:', {
      error: error.message,
      stack: error.stack,
      responseTime: `${responseTime}ms`
    });
    
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
