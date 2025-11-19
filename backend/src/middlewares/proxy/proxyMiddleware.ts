/**
 * Middleware de proxy dynamique sécurisé (version refactorisée)
 * Route automatiquement les requêtes vers les services configurés
 */

import { Request, Response, NextFunction } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { logger } from '../../utils/logger';
import { PROXY_CONFIG } from './proxyConfig';
import { getProxyFromCache, addProxyToCache, hasProxyInCache } from './proxyCache';
import { checkRateLimit, getRateLimitCount } from './proxyRateLimit';
import { verifyToken, loadUser, verifyService, verifySession, verifyRoles } from './proxyAuth';
import { createSecureHeaders, cleanSensitiveHeaders, applySecureHeaders, handleRequestBody } from './proxyHeaders';

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
    // 1. EXTRAIRE LE SERVICE SLUG
    // ============================================
    const fullProxyPath = req.params.proxyPath || req.params[0];
    
    if (!fullProxyPath) {
      return res.status(400).json({
        success: false,
        message: 'Service non spécifié'
      });
    }
    
    const serviceSlug = fullProxyPath.includes('/') 
      ? fullProxyPath.split('/')[0] 
      : fullProxyPath;

    logger.info('🔄 Requête proxy reçue', {
      serviceSlug,
      method: req.method,
      url: req.originalUrl
    });

    // ============================================
    // 2. AUTHENTIFICATION ET AUTORISATION
    // ============================================
    const decoded = await verifyToken(req.headers.authorization);
    const user = await loadUser(decoded);
    const service = await verifyService(serviceSlug);
    const ssoSession = await verifySession(user._id.toString(), serviceSlug);
    
    verifyRoles(user, service);

    logger.info('✅ Authentification réussie', {
      userId: user._id,
      email: user.email,
      service: service.name
    });

    // ============================================
    // 3. RATE LIMITING
    // ============================================
    const isRateLimited = await checkRateLimit(user._id.toString(), serviceSlug);
    if (isRateLimited) {
      return res.status(429).json({
        success: false,
        message: 'Trop de requêtes. Veuillez réessayer plus tard.'
      });
    }

    // ============================================
    // 4. CRÉER OU RÉCUPÉRER LE PROXY
    // ============================================
    let proxy = await getProxyFromCache(serviceSlug);

    if (!proxy) {
      logger.info('🔧 Création du proxy pour', { service: service.name });
      
      proxy = createProxyMiddleware({
        target: service.backendUrl,
        changeOrigin: true,
        pathRewrite: (path: string, req: any) => {
          const fullPath = req.originalUrl || path;
          const newPath = fullPath.replace(`/api/v1/proxy/${serviceSlug}`, '/api');
          logger.debug('🔄 Path rewrite', { original: fullPath, rewritten: newPath });
          return newPath;
        },
        on: {
          proxyReq: (proxyReq: any, req: any, res: any) => {
            try {
              const user = req.user;
              const ssoSession = req.ssoSession;
              const currentService = req.service;
              
              if (!user || !ssoSession || !currentService) {
                logger.error('Données manquantes dans req');
                return;
              }
              
              // Créer et appliquer les headers sécurisés
              const secureHeaders = createSecureHeaders(user, ssoSession, currentService, req);
              
              // Nettoyer les headers sensibles AVANT d'écrire le body
              cleanSensitiveHeaders(proxyReq, req);
              
              // Appliquer les headers sécurisés
              applySecureHeaders(proxyReq, secureHeaders);
              
              // Gérer le body pour POST/PUT/PATCH
              handleRequestBody(proxyReq, req);
              
              logger.info('📤 Requête envoyée au service', {
                service: currentService.name,
                method: req.method,
                userId: user._id
              });
            } catch (error: any) {
              logger.error('❌ Erreur dans onProxyReq', error);
            }
          },
          proxyRes: (proxyRes: any, req: any, res: any) => {
            const responseTime = Date.now() - startTime;
            
            proxyRes.headers['X-Proxied-By'] = 'Sorikama-Hub';
            proxyRes.headers['X-Response-Time'] = `${responseTime}ms`;
            
            logger.info('📥 Réponse reçue du service', {
              statusCode: proxyRes.statusCode,
              responseTime: `${responseTime}ms`
            });
          },
          error: (err: any, req: any, res: any) => {
            const responseTime = Date.now() - startTime;
            
            logger.error('❌ Erreur proxy', {
              error: err.message,
              responseTime: `${responseTime}ms`
            });

            if (!res.headersSent) {
              res.status(502).json({
                success: false,
                message: 'Erreur de connexion au service'
              });
            }
          }
        },
        timeout: PROXY_CONFIG.TIMEOUT,
        proxyTimeout: PROXY_CONFIG.PROXY_TIMEOUT
      });

      await addProxyToCache(serviceSlug, proxy);
    }

    // ============================================
    // 5. AJOUTER LES DONNÉES À LA REQUÊTE
    // ============================================
    (req as any).user = user;
    (req as any).service = service;
    (req as any).ssoSession = ssoSession;

    // ============================================
    // 6. EXÉCUTER LE PROXY
    // ============================================
    return proxy(req, res, next);

  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    logger.error('❌ Erreur middleware proxy', {
      error: error.message,
      responseTime: `${responseTime}ms`
    });
    
    const statusCode = error.message.includes('Token') ? 401 
      : error.message.includes('Session') ? 403
      : error.message.includes('Permissions') ? 403
      : error.message.includes('Service') ? 404
      : 500;
    
    return res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};
