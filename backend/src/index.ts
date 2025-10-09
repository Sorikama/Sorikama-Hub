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
import rateLimiter from './middlewares/rateLimiter.middleware';
import { handleUnauthorizedAttempts } from './middlewares/unauthorizedHandler.middleware';
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
import documentationRoutes from './routes/documentation.routes';
import dashboardRoutes from './routes/dashboard.routes';
import adminControlRoutes from './routes/admin-control.routes';
import authPortalRoutes from './routes/auth-portal.routes';
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
    app.use(express.json({ limit: '10kb' }));
    app.use(express.urlencoded({ extended: true, limit: '10kb' }));
    app.use('/api', rateLimiter);
    
    // Redis sera géré par RedisManager
    
    // Middlewares de logging et métriques
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
          customCss: '.swagger-ui .topbar { display: none }',
          customSiteTitle: 'Sorikama API Gateway Documentation',
          explorer: false,
          swaggerOptions: {
            defaultModelsExpandDepth: -1,
            docExpansion: 'list',
            requestInterceptor: (req: any) => {
              // Injecter automatiquement l'API key admin dans Swagger
              if (global.ADMIN_API_KEY) {
                req.headers['X-API-Key'] = global.ADMIN_API_KEY;
                console.log('🔑 API Key admin injectée automatiquement dans Swagger');
              }
              return req;
            }
          }
        }));

        logger.info(`📚 Documentation API disponible sur http://localhost:${PORT}/api-docs`);
        logger.info(`🔑 API Key Admin (auto-injectée): ${global.ADMIN_API_KEY}`);
        logger.info(`📖 Documentation HTML disponible sur http://localhost:${PORT}/documentation`);
        logger.info(`📊 Dashboard disponible sur http://localhost:${PORT}/dashboard`);
      } catch (e) {
        logger.error('❌ Erreur de chargement de la documentation Swagger:', e);
      }
    }

    // Route principale - redirige vers login si pas connecté
    app.get('/', (req, res) => {
      const sessionToken = req.query.session || req.headers['x-session-token'];
      
      // Si pas de session, rediriger vers login
      if (!sessionToken) {
        return res.redirect('/portal/login');
      }
      
      // Vérifier la session (import des sessions depuis auth-portal)
      const { portalSessions } = require('./routes/auth-portal.routes');
      const session = portalSessions?.get(sessionToken as string);
      
      if (!session || session.expires < Date.now()) {
        return res.redirect('/portal/login');
      }
      
      // Session valide - afficher la page avec statut connecté
      const connectedHTML = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sorikama API Gateway - Connecté</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
</head>
<body class="bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 min-h-screen">
    <div class="container mx-auto px-4 py-8">
        <!-- Header avec statut connecté -->
        <div class="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white border-opacity-20">
            <div class="flex justify-between items-center">
                <div>
                    <h1 class="text-3xl font-bold text-white mb-2">🚀 Sorikama API Gateway</h1>
                    <p class="text-green-300"><i class="fas fa-check-circle mr-2"></i>Connecté en tant que: <strong>${session.username}</strong></p>
                </div>
                <div class="text-right">
                    <div class="bg-green-500 bg-opacity-20 px-4 py-2 rounded-lg border border-green-400 border-opacity-50">
                        <span class="text-green-300 font-semibold"><i class="fas fa-shield-alt mr-2"></i>Session Active</span>
                    </div>
                    <a href="/portal/login" class="text-red-300 hover:text-red-200 text-sm mt-2 inline-block">
                        <i class="fas fa-sign-out-alt mr-1"></i>Se déconnecter
                    </a>
                </div>
            </div>
        </div>
        
        <!-- Navigation rapide -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <a href="/api-docs" class="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-20 hover:bg-opacity-20 transition-all">
                <div class="text-center">
                    <i class="fas fa-book text-blue-300 text-3xl mb-3"></i>
                    <h3 class="text-white font-semibold mb-2">Documentation API</h3>
                    <p class="text-blue-200 text-sm">Swagger UI avec toutes les routes</p>
                </div>
            </a>
            
            <a href="/dashboard" class="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-20 hover:bg-opacity-20 transition-all">
                <div class="text-center">
                    <i class="fas fa-chart-line text-green-300 text-3xl mb-3"></i>
                    <h3 class="text-white font-semibold mb-2">Dashboard</h3>
                    <p class="text-green-200 text-sm">Métriques et statistiques</p>
                </div>
            </a>
            
            <a href="/metrics/dashboard" class="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-20 hover:bg-opacity-20 transition-all">
                <div class="text-center">
                    <i class="fas fa-tachometer-alt text-purple-300 text-3xl mb-3"></i>
                    <h3 class="text-white font-semibold mb-2">Métriques</h3>
                    <p class="text-purple-200 text-sm">Performance en temps réel</p>
                </div>
            </a>
        </div>
        
        <!-- Informations système -->
        <div class="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
            <h2 class="text-xl font-bold text-white mb-4"><i class="fas fa-info-circle mr-2"></i>Informations API Gateway</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div class="text-blue-200">
                    <strong>Port:</strong> ${PORT}
                </div>
                <div class="text-blue-200">
                    <strong>Environnement:</strong> ${NODE_ENV}
                </div>
                <div class="text-blue-200">
                    <strong>Base URL:</strong> http://localhost:${PORT}/api/v1
                </div>
                <div class="text-blue-200">
                    <strong>Session:</strong> ${sessionToken.substring(0, 8)}...
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
      
      res.send(connectedHTML);
    });

    app.use('/swagger', swaggerRoutes);
    app.use('/docs', docsRoutes);
    app.use('/dashboard', dashboardRoutes);
    app.use('/portal', authPortalRoutes);

    const protectDocs = (req: Request, res: Response, next: NextFunction) => {
      const token = req.query.token as string;
      if (!token || token.length < 10) {
        return res.redirect('/swagger/login');
      }
      next();
    };
    app.use('/documentation', protectDocs, documentationRoutes);

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
      '/performance/metrics',
      '/performance/health',
      '/performance/cache-stats',
      '/admin/stats',
      '/admin/control',
      '/admin/gc',
      '/admin/optimize',
      '/metrics/dashboard',
      '/portal/login',
      '/portal/authenticate'
    ];
    
    // Middleware conditionnel pour l'API key
    app.use((req: Request, res: Response, next: NextFunction) => {
      // Vérifier si la route est publique
      const isPublicRoute = publicRoutes.some(route => req.path === route || req.path.startsWith(route));
      
      if (isPublicRoute) {
        console.log(`🔓 Route publique autorisée: ${req.path}`);
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
    
    // Routes de performance (publiques)
    const performanceRoutes = require('./routes/performance.routes').default;
    app.use('/performance', performanceRoutes);
    
    // Dashboard métriques
    const metricsDashboardRoutes = require('./routes/metrics-dashboard.routes').default;
    app.use('/metrics', metricsDashboardRoutes);
    
    // Routes admin
    const adminPublicRoutes = require('./routes/admin-public.routes').default;
    app.use('/admin', adminPublicRoutes);
    app.use('/admin', adminControlRoutes);
    
    app.use('/api/v1', apiRouter);

    app.all('*', (req: Request, res: Response, next: NextFunction) => {
      const err = new AppError(`La route ${req.originalUrl} n'existe pas sur ce serveur.`, StatusCodes.NOT_FOUND);
      next(err);
    });

    app.use(handleUnauthorizedAttempts);
    app.use(errorHandler);

    // Étape 4: Démarrage du serveur
    Banner.displayStartupStep('Démarrage du serveur HTTP', 'loading');
    
    server.listen(PORT, () => {
      Banner.displayStartupStep('Serveur HTTP démarré', 'success', `Port ${PORT}`);
      
      // Attendre un peu pour les connexions Redis
      setTimeout(async () => {
        await Banner.displayStartupComplete(Number(PORT));
        
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