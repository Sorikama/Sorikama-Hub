// src/index.ts
import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import mongoose from 'mongoose';
import http from 'http';

// Import de nos modules internes
import { PORT, NODE_ENV } from './config/environments';
import { logger } from './utils/logger';
import { RedisManager } from './utils/redisManager';
import { Banner } from './utils/banner';
import './utils/performanceOptimizer'; // Démarrage automatique
import apiRouter from './routes';
import { errorHandler } from './middlewares/errorHandler.middleware';
import { MonitoringService } from './services/monitoring.service';
import { LogsGenerator } from './services/logsGenerator.service';
import { httpRequestLogger, logSystemEvent } from './middlewares/realLogging.middleware';
import rateLimiter from './middlewares/rateLimiter.middleware';
import { handleUnauthorizedAttempts } from './middlewares/unauthorizedHandler.middleware';
import { securityHeaders, detectInjection, requestSizeLimit, validateUserAgent, timingAttackProtection } from './middlewares/security.middleware';
import AppError from './utils/AppError';
import { StatusCodes } from 'http-status-codes';

import swaggerUi from 'swagger-ui-express';
import YAML from 'js-yaml';
import fs from 'fs';
import { connectDB } from './database/connexion';
import path from 'path';
import authRoutes from './routes/auth.routes';
import proxyRoutes from './routes/proxy.routes';
import swaggerRoutes from './routes/swagger.routes';
import docsRoutes from './routes/docs.routes';

import dashboardRoutes from './routes/dashboard.routes';
import adminControlRoutes from './routes/admin-control.routes';
import authPortalRoutes, { verifyPortalSession } from './routes/auth-portal.routes';
import cookieParser from 'cookie-parser';
import { responseTimeMiddleware, slowRequestTimeoutMiddleware } from './middlewares/responseTime.middleware';
import { httpLoggingMiddleware } from './utils/applicationLogger';
import { BrowserLauncher } from './utils/browserLauncher';

import './database/models';

const app: Application = express();
const server = http.createServer(app);

const startServer = async () => {
  try {
    // Affichage du banner
    await Banner.displayBanner();
    
    // Étape 1: Démarrage de Redis
    Banner.displayStartupStep('Démarrage de Redis', 'loading');
    const redisStarted = await RedisManager.startRedis();
    
    if (redisStarted) {
      Banner.displayStartupStep('Redis démarré avec succès', 'success', 'Port 6379');
    } else {
      Banner.displayStartupStep('Redis non disponible', 'error', 'Mode dégradé activé');
    }
    
    // Étape 2: Connexion à la base de données
    Banner.displayStartupStep('Connexion à MongoDB', 'loading');
    await connectDB();
    Banner.displayStartupStep('MongoDB connecté', 'success');

    app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "https://cdn.tailwindcss.com", "https://cdn.jsdelivr.net", "'unsafe-inline'"],
            styleSrc: ["'self'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com", "'unsafe-inline'"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:"],
            objectSrc: ["'none'"],
            scriptSrcAttr: ["'unsafe-inline'"],
            connectSrc: ["'self'"],
            upgradeInsecureRequests: []
          },
        },
        xPoweredBy: false,
        frameguard: { action: 'deny' },
        xssFilter: true,
        noSniff: true,
      })
    );

    const corsOptions = {
      origin: NODE_ENV === 'development' ? '*' : 'https://www.votre-site-de-production.com',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'Accept'],
      credentials: true
    };
    app.use(cors(corsOptions));
    app.use(cookieParser());
    
    // Middlewares de sécurité
    app.use(securityHeaders);
    app.use(requestSizeLimit);
    app.use(validateUserAgent);
    app.use(detectInjection);
    app.use(timingAttackProtection);
    
    app.use(express.json({ limit: '1mb' }));
    app.use(express.urlencoded({ extended: true, limit: '1mb' }));
    app.use('/api', rateLimiter);
    
    // Redis sera géré par RedisManager
    
    // Middlewares de logging et métriques
    app.use(httpRequestLogger); // VRAI logging des requêtes
    app.use(httpLoggingMiddleware);
    app.use(responseTimeMiddleware);
    app.use(slowRequestTimeoutMiddleware(30000)); // 30 secondes timeout
    
    const { metricsMiddleware, apiKeyMetricsMiddleware } = require('./middlewares/metrics.middleware');
    app.use(metricsMiddleware);
    app.use(apiKeyMetricsMiddleware);

    app.use(express.static(path.join(__dirname, '../public')));

    // Étape 3: Initialisation des données
    Banner.displayStartupStep('Initialisation des données', 'loading');
    const { runSeeders, createSeederRoutes } = require('./database/seeders/index');
    await runSeeders();
    Banner.displayStartupStep('Données initialisées', 'success');
    
    // Route pour relancer les seeders manuellement
    createSeederRoutes(app);
    
    // Configuration Swagger
    if (NODE_ENV === 'development') {

      try {
        // Supprimez ou commentez la ligne suivante car on utilise l'import d'en haut
        // const yaml = require('yaml');

        const swaggerPath = path.join(__dirname, '../openapi.yaml');

        console.log('🔍 Chemin du fichier YAML:', swaggerPath);
        console.log('🔍 Fichier existe?', fs.existsSync(swaggerPath));

        let swaggerSpec;
        if (fs.existsSync(swaggerPath)) {
          console.log('📝 Lecture du fichier YAML...');
          const yamlContent = fs.readFileSync(swaggerPath, 'utf8');
          console.log('📝 Taille du contenu YAML:', yamlContent.length, 'caractères');
          console.log('📝 Début du contenu:', yamlContent.substring(0, 100));

          swaggerSpec = YAML.load(yamlContent) as any;
          console.log('📝 Parsing YAML terminé');

          console.log('📝 Contenu YAML chargé:', Object.keys(swaggerSpec));
          console.log('📝 Paths trouvés:', Object.keys(swaggerSpec.paths || {}));

          if (!swaggerSpec.components) swaggerSpec.components = {};
          if (!swaggerSpec.components.securitySchemes) swaggerSpec.components.securitySchemes = {};

          swaggerSpec.components.securitySchemes.ApiKeyAuth = {
            type: 'apiKey',
            in: 'header',
            name: 'X-API-Key',
            description: 'API Key pour l\'authentification Gateway'
          };

          swaggerSpec.servers = [{ url: `http://localhost:${PORT}/api/v1` }];
          swaggerSpec.security = [{ ApiKeyAuth: [] }, { bearerAuth: [] }];

          console.log('✅ Fichier OpenAPI YAML chargé avec succès');
        } else {
          console.log('⚠️ Fichier OpenAPI YAML non trouvé, utilisation du schéma par défaut');
          swaggerSpec = {
            openapi: '3.0.0',
            info: {
              title: 'Sorikama API Gateway',
              version: '1.0.0',
              description: 'API Gateway centralisée pour l\'écosystème Sorikama.'
            },
            servers: [{ url: `http://localhost:${PORT}/api/v1` }],
            components: {
              securitySchemes: {
                ApiKeyAuth: {
                  type: 'apiKey',
                  in: 'header',
                  name: 'X-API-Key',
                  description: 'API Key pour l\'authentification'
                },
                bearerAuth: {
                  type: 'http',
                  scheme: 'bearer',
                  bearerFormat: 'JWT'
                }
              }
            },
            security: [{ ApiKeyAuth: [] }, { bearerAuth: [] }],
            paths: {}
          };
          console.log('⚠️ Fichier OpenAPI YAML non trouvé, utilisation du schéma par défaut');
        }

        console.log('📝 Spec finale - Titre:', swaggerSpec.info?.title);
        console.log('📝 Spec finale - Paths:', Object.keys(swaggerSpec.paths || {}));
        console.log('📝 Spec finale - Components:', Object.keys(swaggerSpec.components || {}));

        app.use('/api-docs', (req, res, next) => {
          res.removeHeader('Content-Security-Policy');
          next();
        });

        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
          customSiteTitle: 'Sorikama API Gateway - Documentation',
          explorer: false,
          swaggerOptions: {
            defaultModelsExpandDepth: -1,
            docExpansion: 'list',
            requestInterceptor: (req: any) => {
              if (global.ADMIN_API_KEY) {
                req.headers['X-API-Key'] = global.ADMIN_API_KEY;
                console.log('🔑 API Key admin injectée automatiquement dans Swagger');
              }
              return req;
            }
          }
        }));

        logger.info('API Key Admin générée automatiquement');
      } catch (e) {
        logger.error('❌ Erreur de chargement de la documentation Swagger:', e);
      }
    }

    // Route principale - redirige selon l'état de connexion
    app.get('/', (req, res) => {
      const sessionToken = req.cookies.sorikama_session;
      
      if (sessionToken) {
        const { portalSessions } = require('./routes/auth-portal.routes');
        const session = portalSessions?.get(sessionToken);
        
        if (session && session.expires > Date.now()) {
          return res.redirect('/api');
        }
      }
      
      res.redirect('/portal/login');
    });
    
    // Route API - dashboard connecté
    app.get('/api', verifyPortalSession, (req: any, res) => {
      const user = req.portalUser;
      const { portalSessions } = require('./routes/auth-portal.routes');
      const session = portalSessions.get(user.sessionToken);
      
      // Lire le fichier HTML et injecter les données
      const fs = require('fs');
      let dashboardHTML = fs.readFileSync(path.join(__dirname, '../public/views/dashboard.html'), 'utf8');
      
      // Injecter les données dans le HTML
      const sessionData = {
        username: user.username,
        apiKey: user.apiKey,
        sessionToken: user.sessionToken.substring(0, 8) + '...',
        expiresAt: session?.expires || Date.now() + 86400000,
        createdAt: session?.createdAt || Date.now(),
        environment: NODE_ENV,
        port: PORT,
        baseUrl: `http://localhost:${PORT}/api/v1`,
        uptime: Math.floor(process.uptime())
      };
      
      // Injecter les données JavaScript
      const scriptInjection = `
        <script>
          window.sessionData = ${JSON.stringify(sessionData)};
          window.serverUptime = ${Math.floor(process.uptime())};
          
          // Populate data on load
          document.addEventListener('DOMContentLoaded', function() {
            document.getElementById('username').textContent = '${sessionData.username}';
            document.getElementById('apiKey').textContent = '${sessionData.apiKey}';
            document.getElementById('sessionId').textContent = '${sessionData.sessionToken}';
            document.getElementById('sessionExpires').textContent = new Date(${sessionData.expiresAt}).toLocaleString();
            document.getElementById('environment').textContent = '${sessionData.environment}';
            document.getElementById('port').textContent = '${sessionData.port}';
            document.getElementById('baseUrl').textContent = '${sessionData.baseUrl}';
            document.getElementById('uptime').textContent = formatUptime(${sessionData.uptime});
          });
        </script>
      `;
      
      // Injecter le script avant la fermeture du body
      dashboardHTML = dashboardHTML.replace('</body>', scriptInjection + '</body>');
      
      res.send(dashboardHTML);
    });

    app.use('/swagger', swaggerRoutes);
    app.use('/docs', docsRoutes);
    app.use('/dashboard', verifyPortalSession, dashboardRoutes);
    app.use('/portal', authPortalRoutes);
    
    // Nouvelles routes
    const dependenciesRoutes = require('./routes/dependencies.routes').default;
    const systemHealthRoutes = require('./routes/system-health.routes').default;
    const apiKeysManagerRoutes = require('./routes/api-keys-manager.routes').default;
    const logsViewerRoutes = require('./routes/logs-viewer.routes').default;
    
    app.use('/dependencies', verifyPortalSession, dependenciesRoutes);
    app.use('/system', verifyPortalSession, systemHealthRoutes);
    app.use('/api-keys', verifyPortalSession, apiKeysManagerRoutes);
    app.use('/logs', verifyPortalSession, logsViewerRoutes);
    
    const servicesManagerRoutes = require('./routes/services-manager.routes').default;
    const monitoringRoutes = require('./routes/monitoring.routes').default;
    app.use('/services', verifyPortalSession, servicesManagerRoutes);
    app.use('/monitoring', verifyPortalSession, monitoringRoutes);
    app.use('/api-docs', verifyPortalSession);

    app.get('/api/v1/system/health', (req, res) => {
      res.json({
        success: true,
        data: {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          gateway: {
            version: '1.0.0',
            uptime: process.uptime()
          }
        }
      });
    });

    // Middleware d'authentification API Key obligatoire pour toutes les routes API
    const { authenticateApiKey } = require('./middlewares/apiKey.middleware');
    
    // Routes qui ne nécessitent PAS d'API key
    const publicRoutes = [
      '/api/v1/system/health',
      '/api/v1/system/seed',
      '/portal/login',
      '/portal/authenticate',
      '/portal/logout'
    ];
    
    // Middleware conditionnel pour l'API key
    app.use((req: Request, res: Response, next: NextFunction) => {
      // Routes protégées par session portail (pas d'API key nécessaire)
      const portalProtectedRoutes = [
        '/dependencies',
        '/system',
        '/api-keys',
        '/logs',
        '/services',
        '/admin',
        '/performance',
        '/api-docs',
        '/dashboard',
        '/api'
      ];
      
      // Routes publiques (pas d'authentification)
      const isPublicRoute = publicRoutes.some(route => req.path === route || req.path.startsWith(route));
      
      // Routes protégées par session portail
      const isPortalRoute = portalProtectedRoutes.some(route => req.path.startsWith(route));
      
      if (isPublicRoute) {
        console.log(`🔓 Route publique autorisée: ${req.path}`);
        return next();
      }
      
      if (isPortalRoute) {
        console.log(`🔐 Route protégée par session portail: ${req.path}`);
        return next();
      }
      
      // Routes API nécessitent une clé
      if (req.path.startsWith('/api/v1')) {
        console.log(`🔐 Vérification API key requise pour: ${req.path}`);
        authenticateApiKey(req, res, next);
      } else {
        next();
      }
    });
    
    // Routes admin (avec API key)
    const adminRoutes = require('./routes/admin.routes').default;
    app.use('/api/v1/admin', adminRoutes);
    
    // Routes de performance (protégées)
    const performanceRoutes = require('./routes/performance.routes').default;
    const performanceDashboardRoutes = require('./routes/performance-dashboard.routes').default;
    app.use('/performance', performanceRoutes);
    app.use('/performance', performanceDashboardRoutes);
    

    
    // Routes admin (protégées)
    const adminPublicRoutes = require('./routes/admin-public.routes').default;
    app.use('/admin', verifyPortalSession, adminPublicRoutes);
    app.use('/admin', adminControlRoutes);
    
    app.use('/api/v1', apiRouter);

    app.all('*', (req: Request, res: Response, next: NextFunction) => {
      const err = new AppError(`La route ${req.originalUrl} n'existe pas sur ce serveur.`, StatusCodes.NOT_FOUND);
      next(err);
    });

    app.use(handleUnauthorizedAttempts);
    app.use(errorHandler);

    // Étape 4: Initialisation des logs
    Banner.displayStartupStep('Initialisation des logs', 'loading');
    LogsGenerator.initialize();
    logSystemEvent('Système de logs initialisé', 'info');
    Banner.displayStartupStep('Logs initialisés', 'success');
    
    // Étape 5: Démarrage du monitoring
    Banner.displayStartupStep('Démarrage du monitoring', 'loading');
    MonitoringService.startMonitoring(5); // Monitoring toutes les 5 minutes
    Banner.displayStartupStep('Monitoring démarré', 'success');
    
    // Étape 5: Démarrage du serveur
    Banner.displayStartupStep('Démarrage du serveur HTTP', 'loading');
    
    server.listen(PORT, () => {
      Banner.displayStartupStep('Serveur HTTP démarré', 'success', `Port ${PORT}`);
      logSystemEvent(`Serveur HTTP démarré sur le port ${PORT}`, 'info');
      
      // Attendre un peu pour les connexions Redis
      setTimeout(async () => {
        await Banner.displayStartupComplete(Number(PORT));
        logger.info(`🌐 Accès au portail: http://localhost:${PORT}/portal/login`);
        logSystemEvent('Démarrage complet du système Sorikama Hub', 'info', { port: PORT });
        
        // Lancement automatique du navigateur
        setTimeout(() => {
          BrowserLauncher.autoLaunch(Number(PORT));
        }, 2000);
      }, 1000);
    });

  } catch (error) {
    Banner.displayStartupStep('Erreur critique', 'error', error.message);
    logger.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

startServer();

const gracefulShutdown = (signal: string) => {
  process.on(signal, async () => {
    logger.warn(`Signal [${signal}] reçu. Arrêt du serveur...`);

    server.close(async () => {
      logger.info('🛑 Serveur HTTP fermé.');
      
      // Nettoyage des ressources
      const { PerformanceOptimizer } = require('./utils/performanceOptimizer');
      PerformanceOptimizer.cleanup();
      
      // Arrêt du monitoring
      MonitoringService.stopMonitoring();
      
      await RedisManager.stopRedis();
      logger.info('🔌 Redis arrêté.');
      await mongoose.disconnect();
      logger.info('🔌 Déconnexion de MongoDB réussie.');
      process.exit(0);
    });
  });
};

gracefulShutdown('SIGINT');
gracefulShutdown('SIGTERM');