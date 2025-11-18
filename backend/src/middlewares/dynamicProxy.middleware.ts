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
import { UserModel } from '../database/models/user.model';
import { logger } from '../utils/logger';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';
import { decryptUserId, isEncryptedId, encryptUserId } from '../utils/encryption';
import { createSignedHeaders } from '../utils/hmacSignature';

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
  
  console.log('🟢 [MIDDLEWARE] dynamicProxyMiddleware DÉMARRÉ');
  console.log('   URL:', req.originalUrl);
  console.log('   Params:', req.params);
  
  try {
    // ============================================
    // 1. EXTRAIRE LE SERVICE
    // ============================================
    
    // Le paramètre peut être dans proxyPath ou dans params[0] selon le routage
    const fullProxyPath = req.params.proxyPath || req.params[0];
    
    console.log('🟢 [MIDDLEWARE] fullProxyPath extrait:', fullProxyPath);
    
    if (!fullProxyPath) {
      logger.warn('❌ Proxy path manquant');
      return res.status(400).json({
        success: false,
        message: 'Service non spécifié'
      });
    }
    
    // Extraire le slug du service (premier segment)
    // Ex: "masebuy/stores/my-stores" -> serviceSlug = "masebuy"
    const serviceSlug = fullProxyPath.includes('/') 
      ? fullProxyPath.split('/')[0] 
      : fullProxyPath;
    
    console.log('🟢 [MIDDLEWARE] serviceSlug:', serviceSlug);

    console.log('🔵 [DEBUG] Avant logger.info');
    
    logger.info('🔄 Requête proxy reçue', {
      serviceSlug,
      fullProxyPath,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip
    });

    console.log('🔵 [DEBUG] Après logger.info, avant recherche service');

    // ============================================
    // 2. VÉRIFIER QUE LE SERVICE EXISTE
    // ============================================
    
    const service = await ServiceModel.findOne({
      slug: serviceSlug,
      enabled: true
    });
    
    console.log('🔵 [DEBUG] Service trouvé:', service ? service.name : 'NULL');

    if (!service) {
      logger.warn('❌ Service non trouvé ou désactivé', { serviceSlug });
      return res.status(404).json({
        success: false,
        message: 'Service non trouvé ou désactivé'
      });
    }

    console.log('🔵 [DEBUG] Service validé, détails:', {
      name: service.name,
      slug: service.slug,
      backendUrl: service.backendUrl
    });

    logger.info('✅ Service trouvé', {
      name: service.name,
      slug: service.slug,
      backendUrl: service.backendUrl
    });

    // ============================================
    // 3. VÉRIFIER L'AUTHENTIFICATION
    // ============================================
    
    console.log('🔵 [DEBUG] Début vérification authentification');
    const authHeader = req.headers.authorization;
    console.log('🔵 [DEBUG] authHeader présent:', !!authHeader);
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('🔵 [DEBUG] Token manquant ou invalide');
      logger.warn('❌ Token manquant', { serviceSlug });
      return res.status(401).json({
        success: false,
        message: 'Authentification requise'
      });
    }

    console.log('🔵 [DEBUG] Token présent, extraction...');
    const token = authHeader.substring(7);
    let decoded: any;
    let userId: string;
    let user: any;

    try {
      console.log('🔵 [DEBUG] Vérification JWT...');
      // Vérifier le token JWT
      decoded = jwt.verify(token, JWT_SECRET) as any;
      console.log('🔵 [DEBUG] JWT vérifié, decoded:', { hasId: !!decoded.id, email: decoded.email });
      
      logger.info('🔍 Token décodé', {
        hasId: !!decoded.id,
        email: decoded.email,
        service: decoded.service
      });

      console.log('🔵 [DEBUG] Déchiffrement de l\'ID utilisateur...');
      
      console.log('🔵 [DEBUG] Vérification si ID chiffré...');
      if (isEncryptedId(decoded.id)) {
        console.log('🔵 [DEBUG] ID chiffré détecté, déchiffrement...');
        userId = decryptUserId(decoded.id);
        logger.debug('🔐 ID déchiffré');
      } else {
        console.log('🔵 [DEBUG] ID non chiffré');
        userId = decoded.id;
      }

      console.log('🔵 [DEBUG] Recherche utilisateur avec ID:', userId);
      // Charger l'utilisateur
      user = await UserModel.findById(userId);
      console.log('🔵 [DEBUG] Utilisateur trouvé:', user ? user.email : 'NULL');

      if (!user) {
        console.log('🔵 [DEBUG] Utilisateur NULL');
        logger.warn('❌ Utilisateur non trouvé', { userId });
        return res.status(401).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
      }

      console.log('🔵 [DEBUG] Vérification isActive:', user.isActive);
      if (!user.isActive) {
        logger.warn('❌ Compte désactivé', { userId, email: user.email });
        return res.status(401).json({
          success: false,
          message: 'Compte désactivé'
        });
      }

      console.log('🔵 [DEBUG] Utilisateur validé');
      logger.info('✅ Utilisateur authentifié', {
        userId: user._id,
        email: user.email
      });

    } catch (error: any) {
      console.log('🔵 [DEBUG] ERREUR validation token:', error.message);
      logger.error('❌ Erreur validation token:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Token invalide ou expiré'
      });
    }

    // ============================================
    // 4. VÉRIFIER LA SESSION SSO
    // ============================================
    
    console.log('🔵 [DEBUG] Recherche session SSO pour userId:', user._id.toString(), 'serviceId:', service.slug);
    const ssoSession = await SSOSessionModel.findOne({
      userId: user._id.toString(),
      serviceId: service.slug,
      expiresAt: { $gt: new Date() }
    });
    console.log('🔵 [DEBUG] Session SSO trouvée:', ssoSession ? ssoSession.sessionId : 'NULL');

    if (!ssoSession) {
      console.log('🔵 [DEBUG] Session SSO NULL ou expirée');
      logger.warn('❌ Session SSO non trouvée ou expirée', {
        userId: user._id,
        serviceId: service.slug
      });
      return res.status(403).json({
        success: false,
        message: 'Session expirée. Veuillez vous reconnecter.'
      });
    }

    console.log('🔵 [DEBUG] Session SSO valide');
    logger.info('✅ Session SSO valide', {
      sessionId: ssoSession.sessionId,
      expiresAt: ssoSession.expiresAt
    });

    // ============================================
    // 5. VÉRIFIER LES RÔLES AUTORISÉS
    // ============================================
    
    console.log('🔵 [DEBUG] Vérification rôles, allowedRoles:', service.allowedRoles);
    if (service.allowedRoles && service.allowedRoles.length > 0) {
      console.log('🔵 [DEBUG] Rôle utilisateur:', user.role);
      if (!service.allowedRoles.includes(user.role)) {
        console.log('🔵 [DEBUG] Rôle non autorisé');
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
      console.log('🔵 [DEBUG] Rôle autorisé');
    }

    // ============================================
    // 6. RATE LIMITING PAR UTILISATEUR
    // ============================================
    
    console.log('🔵 [DEBUG] Rate limiting...');
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
    
    console.log('🔵 [DEBUG] Rate limit count:', userLimit.count, '/', maxRequests);
    
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
    // 7. CRÉER OU RÉCUPÉRER LE PROXY
    // ============================================
    
    console.log('🔵 [DEBUG] Récupération proxy pour:', service.slug);
    let proxy = proxyCache.get(service.slug);
    console.log('🔵 [DEBUG] Proxy en cache:', !!proxy);

    if (!proxy) {
      console.log('🔵 [DEBUG] Création nouveau proxy');
      logger.info('🔧 Création du proxy pour', { service: service.name });
      
      proxy = createProxyMiddleware({
        target: service.backendUrl,
        changeOrigin: true,
        pathRewrite: (path: string, req: any) => {
          // Utiliser originalUrl pour avoir le chemin complet
          const fullPath = req.originalUrl || path;
          // Transformer /api/v1/proxy/masebuy/stores/my-stores
          // en /api/stores/my-stores
          const newPath = fullPath.replace(`/api/v1/proxy/${service.slug}`, '/api');
          console.log('🔵 [DEBUG] Path rewrite:', fullPath, '->', newPath);
          logger.debug('🔄 Path rewrite', { 
            original: fullPath, 
            rewritten: newPath 
          });
          return newPath;
        },
        on: {
          proxyReq: (proxyReq: any, req: any, res: any) => {
          console.log('🟢🟢🟢 [DEBUG] ========================================');
          console.log('🟢🟢🟢 [DEBUG] onProxyReq APPELÉ !');
          console.log('🟢🟢🟢 [DEBUG] ========================================');
          
          try {
            console.log('🔵 [DEBUG] onProxyReq callback démarré');
            const user = req.user;
            const ssoSession = req.ssoSession;
            const currentService = req.service;
            
            console.log('🔵 [DEBUG] Vérification données req:', {
              hasUser: !!user,
              hasSession: !!ssoSession,
              hasService: !!currentService
            });
            
            if (!user || !ssoSession || !currentService) {
              console.error('❌ [DEBUG] Données manquantes dans req:', { 
                hasUser: !!user, 
                hasSession: !!ssoSession, 
                hasService: !!currentService 
              });
              return;
            }
            
            // ============================================
            // HEADERS SÉCURISÉS POUR LE SERVICE EXTERNE
            // ============================================
            
            console.log('🔵 [DEBUG] Chiffrement userId...');
            // Informations utilisateur (chiffrées)
            const encryptedUserId = encryptUserId(user._id.toString());
            console.log('🔵 [DEBUG] userId chiffré:', encryptedUserId.substring(0, 20) + '...');
            
            // 🔒 SÉCURITÉ : Créer une signature HMAC des headers
            console.log('🔵 [DEBUG] Création headers signés...');
            const signedHeaders = createSignedHeaders(
              encryptedUserId,
              user.email,
              user.role,
              currentService.slug
            );
            console.log('🔵 [DEBUG] Headers signés créés, nombre:', Object.keys(signedHeaders).length);
            
            // Ajouter tous les headers signés
            Object.entries(signedHeaders).forEach(([key, value]) => {
              proxyReq.setHeader(key, value as string);
              console.log('🔵 [DEBUG] Header ajouté:', key);
            });
            
            // Headers additionnels
            console.log('🔵 [DEBUG] Ajout headers additionnels...');
            proxyReq.setHeader('X-Session-Id', ssoSession.sessionId);
            proxyReq.setHeader('X-Service-Name', currentService.name);
            proxyReq.setHeader('X-Proxy-Timestamp', new Date().toISOString());
            
            // Forwarded headers
            proxyReq.setHeader('X-Forwarded-For', req.ip);
            proxyReq.setHeader('X-Forwarded-Proto', req.protocol);
            proxyReq.setHeader('X-Forwarded-Host', req.hostname);
            
            // 🔒 SÉCURITÉ : Supprimer TOUS les headers sensibles (whitelist plutôt que blacklist)
            const allowedHeaders = new Set([
              'content-type',
              'content-length',
              'accept',
              'accept-encoding',
              'accept-language',
              'user-agent'
            ]);
            
            // Supprimer tous les headers non autorisés
            Object.keys(req.headers).forEach(header => {
              if (!allowedHeaders.has(header.toLowerCase()) && !header.toLowerCase().startsWith('x-')) {
                proxyReq.removeHeader(header);
              }
            });
            
            // Supprimer explicitement les headers critiques
            proxyReq.removeHeader('authorization');
            proxyReq.removeHeader('cookie');
            proxyReq.removeHeader('x-api-key');
            
            console.log('🔵 [DEBUG] onProxyReq terminé, envoi vers:', currentService.backendUrl);
            logger.info('📤 Requête envoyée au service', {
              service: currentService.name,
              method: req.method,
              path: req.path,
              target: currentService.backendUrl,
              userId: user._id,
              email: user.email
            });
          } catch (error: any) {
            console.error('❌ [DEBUG] ERREUR dans onProxyReq:', error.message);
            console.error('❌ [DEBUG] Stack:', error.stack);
            logger.error('❌ Erreur dans onProxyReq:', error);
          }
          },
          proxyRes: (proxyRes: any, req: any, res: any) => {
          const responseTime = Date.now() - startTime;
          const contentType = proxyRes.headers['content-type'] || '';
          
          // Ajouter des headers de réponse
          proxyRes.headers['X-Proxied-By'] = 'Sorikama-Hub';
          proxyRes.headers['X-Response-Time'] = `${responseTime}ms`;
          
          // ⚠️ DÉTECTER SI LE BACKEND RETOURNE DU HTML AU LIEU DE JSON
          if (contentType.includes('text/html') && !contentType.includes('application/json')) {
            logger.warn('⚠️ Le backend retourne du HTML au lieu de JSON !', {
              service: service.name,
              statusCode: proxyRes.statusCode,
              contentType,
              url: req.originalUrl,
              target: service.backendUrl,
              userId: req.user._id
            });
            
            // Si c'est une erreur 404 ou 500, c'est probablement que le backend n'est pas démarré
            if (proxyRes.statusCode === 404) {
              logger.error('❌ Le backend MaseBuy semble ne pas avoir cette route', {
                service: service.name,
                path: req.path,
                target: service.backendUrl
              });
            } else if (proxyRes.statusCode >= 500) {
              logger.error('❌ Le backend MaseBuy a une erreur serveur', {
                service: service.name,
                statusCode: proxyRes.statusCode,
                target: service.backendUrl
              });
            }
          }
          
          logger.info('📥 Réponse reçue du service', {
            service: service.name,
            statusCode: proxyRes.statusCode,
            contentType,
            responseTime: `${responseTime}ms`,
            userId: req.user._id
          });
          },
          error: (err: any, req: any, res: any) => {
          const responseTime = Date.now() - startTime;
          
          console.error('❌ [DEBUG] ERREUR PROXY:', err.message);
          console.error('❌ [DEBUG] Stack:', err.stack);
          console.error('❌ [DEBUG] Code:', err.code);
          
          logger.error('❌ Erreur proxy', {
            service: service.name,
            error: err.message,
            code: err.code,
            target: service.backendUrl,
            responseTime: `${responseTime}ms`,
            userId: req.user?._id
          });

          if (!res.headersSent) {
            res.status(502).json({
              success: false,
              message: 'Erreur de connexion au service',
              service: service.name,
              error: err.message
            });
          }
          }
        },
        timeout: 30000, // 30 secondes
        proxyTimeout: 30000
      });

      // Mettre en cache
      proxyCache.set(service.slug, proxy);
    }

    // ============================================
    // 8. AJOUTER L'UTILISATEUR À LA REQUÊTE (AVANT D'EXÉCUTER LE PROXY)
    // ============================================
    
    console.log('🔵 [DEBUG] Ajout user/service/session à req');
    (req as any).user = user;
    (req as any).service = service;
    (req as any).ssoSession = ssoSession;

    // ============================================
    // 9. EXÉCUTER LE PROXY
    // ============================================
    
    console.log('🔵 [DEBUG] Exécution du proxy vers:', service.backendUrl);
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
