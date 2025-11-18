// src/index.ts
import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import mongoose from 'mongoose';
import http from 'http';

// Import de nos modules internes
import { PORT, NODE_ENV, BASE_URL, FRONTEND_URL, BACKEND_URL } from './config/environments';
import { logger } from './utils/logger';
import { RedisManager } from './utils/redisManager';
import { Banner } from './utils/banner';
import './utils/performanceOptimizer'; // Démarrage automatique
import apiRouter from './routes';
import { errorHandler } from './middlewares/errorHandler.middleware';
import { MonitoringService } from './services/monitoring.service';
import { LogsGenerator } from './services/logsGenerator.service';
import { httpRequestLogger, logSystemEvent } from './middlewares/realLogging.middleware';
import { PortManager } from './utils/portManager';
import rateLimiter from './middlewares/rateLimiter.middleware';
import { handleUnauthorizedAttempts } from './middlewares/unauthorizedHandler.middleware';
import { securityHeaders, detectInjection, requestSizeLimit, validateUserAgent, timingAttackProtection } from './middlewares/security.middleware';
import { verifyCsrf } from './middlewares/csrf.middleware';
import { publicRateLimit } from './middlewares/clientRateLimit.middleware';
import { validateInput, strictValidation, validateEmail, validatePassword } from './middlewares/inputValidation.middleware';
import { advancedSecurityMiddleware } from './middlewares/advancedSecurity.middleware';
import AppError from './utils/AppError';
import { StatusCodes } from 'http-status-codes';

import swaggerUi from 'swagger-ui-express';
import YAML from 'js-yaml';
import fs from 'fs';
import { connectDB } from './database/connexion';
import path from 'path';
import authRoutes from './routes/auth.routes';
import { ServiceModel } from './database/models/service.model';
import proxyRoutes from './routes/proxy.routes';
import swaggerRoutes from './routes/swagger.routes';
import docsRoutes from './routes/docs.routes';
import cookieParser from 'cookie-parser';

// Routes du portail désactivées - imports commentés
// import dashboardRoutes from './routes/dashboard.routes';
// import adminControlRoutes from './routes/admin-control.routes';
// import authPortalRoutes, { verifyPortalSession } from './routes/auth-portal.routes';
import { responseTimeMiddleware, slowRequestTimeoutMiddleware } from './middlewares/responseTime.middleware';
import { httpLoggingMiddleware } from './utils/applicationLogger';

import './database/models';
import { seedAdmin } from './database/seeders/admin.seeder';

const app: Application = express();
const server = http.createServer(app);

const startServer = async () => {
  try {
    console.log('\n🚀 Démarrage Sorikama Gateway...\n');

    // Préparation du port
    await PortManager.preparePort(7000);

    // Démarrage de Redis
    await RedisManager.startRedis();

    // Connexion à MongoDB
    await connectDB();

    // Initialisation du compte admin
    await seedAdmin();

    // Initialisation des permissions et rôles
    const { seedPermissions } = require('./database/seeders/permissions.seeder');
    await seedPermissions();

    // Initialisation des services externes
    const { seedServices } = require('./database/seeders/services.seeder');
    await seedServices();

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

    // Configuration CORS dynamique pour autoriser les services externes
    const corsOptions = {
      origin: async (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // Toujours autoriser les requêtes sans origin (Postman, curl, etc.)
        if (!origin) {
          return callback(null, true);
        }

        // Autoriser le frontend Sorikama
        if (origin === FRONTEND_URL) {
          return callback(null, true);
        }

        try {
          // Récupérer tous les services actifs depuis la DB
          const services = await ServiceModel.find({ enabled: true }).select('frontendUrl');
          
          // Vérifier si l'origin correspond à un service enregistré
          const allowedOrigins = services.map((s: any) => {
            try {
              return new URL(s.frontendUrl).origin;
            } catch {
              return null;
            }
          }).filter(Boolean);

          if (allowedOrigins.includes(origin)) {
            logger.debug(`✅ CORS autorisé pour le service: ${origin}`);
            return callback(null, true);
          }

          // Origin non autorisée
          logger.warn(`⚠️ CORS refusé pour: ${origin}`);
          callback(new Error('Not allowed by CORS'));
        } catch (error) {
          logger.error('Erreur vérification CORS:', error);
          callback(new Error('CORS verification failed'));
        }
      },
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'X-API-Key', 
        'X-Service-Api-Key',  // Pour les services externes
        'X-User-Id',          // Pour les services externes
        'Accept', 
        'X-CSRF-Token'
      ],
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

    // Sécurité avancée (CSP, Clickjacking, etc.)
    app.use(advancedSecurityMiddleware);

    app.use(express.json({ limit: '1mb' }));
    app.use(express.urlencoded({ extended: true, limit: '1mb' }));

    // Validation des entrées (global)
    app.use(validateInput());

    // Rate limiting côté client (global)
    app.use('/api', publicRateLimit);
    app.use('/api', rateLimiter);

    // Protection CSRF pour les routes API (POST, PUT, PATCH, DELETE)
    app.use('/api/v1', verifyCsrf);

    // Redis sera géré par RedisManager

    // Middleware de déchiffrement automatique des IDs
    const { autoDecryptIds } = require('./middlewares/decryptId.middleware');
    app.use(autoDecryptIds);

    // Middlewares de logging et métriques
    app.use(httpRequestLogger); // VRAI logging des requêtes
    app.use(httpLoggingMiddleware);
    app.use(responseTimeMiddleware);
    app.use(slowRequestTimeoutMiddleware(30000)); // 30 secondes timeout

    const { metricsMiddleware } = require('./middlewares/metrics.middleware');
    app.use(metricsMiddleware);

    app.use(express.static(path.join(__dirname, '../public')));

    // Initialisation des données
    const { runSeeders, createSeederRoutes } = require('./database/seeders/index');
    await runSeeders();

    // Route pour relancer les seeders manuellement
    createSeederRoutes(app);

    // Configuration Swagger
    // if (NODE_ENV === 'development') {

    try {
      // Supprimez ou commentez la ligne suivante car on utilise l'import d'en haut
      // const yaml = require('yaml');

      const swaggerPath = path.join(__dirname, '../openapi.yaml');

      let swaggerSpec;
      if (fs.existsSync(swaggerPath)) {
        const yamlContent = fs.readFileSync(swaggerPath, 'utf8');
        swaggerSpec = YAML.load(yamlContent) as any;

        // Améliorer la spec existante
        if (!swaggerSpec.components) swaggerSpec.components = {};
        if (!swaggerSpec.components.securitySchemes) swaggerSpec.components.securitySchemes = {};



        swaggerSpec.servers = [
          {
            url: BASE_URL,
            description: NODE_ENV === 'production' ? 'Serveur de production' : 'Serveur de développement local'
          }
        ];
        swaggerSpec.security = [{ bearerAuth: [] }];

        // Ajouter des tags si pas présents
        if (!swaggerSpec.tags) {
          swaggerSpec.tags = [
            { name: 'Authentication', description: '🔐 Authentification' },
            { name: 'System', description: '⚙️ Système' },
            { name: 'Services', description: '🔗 Services' }
          ];
        }

      } else {
        swaggerSpec = {
          openapi: '3.0.0',
          info: {
            title: 'Sorikama API Gateway',
            version: '1.0.0',
            description: 'API Gateway centralisée pour l\'écosystème Sorikama.'
          },
          servers: [{ url: BASE_URL }],
          components: {
            securitySchemes: {
              bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
              }
            }
          },
          security: [{ bearerAuth: [] }],
          paths: {}
        };
      }

      // Documentation API accessible sans authentification
      app.use('/api-docs', (req, res, next) => {
        res.removeHeader('Content-Security-Policy');
        next();
      });

      app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        explorer: false,
        swaggerOptions: {
          defaultModelsExpandDepth: 1,
          defaultModelExpandDepth: 1,
          docExpansion: 'none'
        }
      }));

      // Route protégée pour la documentation déjà définie ci-dessus

      logger.info('API Key Admin générée automatiquement');
    } catch (e) {
      logger.error('❌ Erreur de chargement de la documentation Swagger:', e);
    }
    // }

    // Route principale - Page d'accueil de l'API
    app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, '../public/index.html'));
    });

    // Routes de documentation uniquement
    app.use('/swagger', swaggerRoutes);
    app.use('/docs', docsRoutes);
    
    // Routes du portail désactivées - utiliser le frontend React à la place
    // app.use('/dashboard', verifyPortalSession, dashboardRoutes);
    // app.use('/portal', authPortalRoutes);

    // Routes de démonstration désactivées
    // app.get('/security-demo', (req, res) => {
    //   res.sendFile(path.join(__dirname, '../public/views/security-demo.html'));
    // });

    // Nouvelles routes
    const dependenciesRoutes = require('./routes/dependencies.routes').default;
    const systemHealthRoutes = require('./routes/system-health.routes').default;
    const logsViewerRoutes = require('./routes/logs-viewer.routes').default;

    // Routes du portail désactivées
    // app.use('/dependencies', verifyPortalSession, dependenciesRoutes);
    // app.use('/system', verifyPortalSession, systemHealthRoutes);
    // app.use('/logs', verifyPortalSession, logsViewerRoutes);

    const servicesManagerRoutes = require('./routes/services-manager.routes').default;
    const monitoringRoutes = require('./routes/monitoring.routes').default;
    // Routes du portail désactivées
    // app.use('/services', verifyPortalSession, servicesManagerRoutes);
    // app.use('/monitoring', verifyPortalSession, monitoringRoutes);

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

    // Routes API - Authentification JWT uniquement

    // IMPORTANT: Monter apiRouter EN PREMIER pour que les routes spécialisées
    // (comme /admin/users) soient prioritaires sur les routes génériques
    app.use('/api/v1', apiRouter);

    // Routes admin générales (stats, analytics)
    const adminRoutes = require('./routes/admin.routes').default;
    app.use('/api/v1/admin', adminRoutes);

    // Routes de performance (protégées)
    const performanceRoutes = require('./routes/performance.routes').default;
    const performanceDashboardRoutes = require('./routes/performance-dashboard.routes').default;
    // Routes du portail désactivées
    // app.use('/performance', performanceRoutes);
    // app.use('/performance', performanceDashboardRoutes);

    // Routes admin (protégées)
    const adminPublicRoutes = require('./routes/admin-public.routes').default;
    // Routes du portail admin désactivées
    // app.use('/admin', verifyPortalSession, adminPublicRoutes);
    // app.use('/admin', adminControlRoutes);

    // Routes de callbacks des services externes
    const serviceCallbackRoutes = require('./routes/serviceCallback.routes').default;
    app.use('/api/v1/service-callback', serviceCallbackRoutes);

    // Routes de gestion utilisateur pour les services externes
    const serviceUserRoutes = require('./routes/serviceUser.routes').default;
    app.use('/api/v1/service-user', serviceUserRoutes);

    // Proxy dynamique pour les services externes
    // Format: /{proxyPath}/* → redirige vers le backend du service
    const { dynamicProxyMiddleware } = require('./middlewares/dynamicProxy.middleware');
    app.use('/:proxyPath/*', dynamicProxyMiddleware);

    app.all('*', (req: Request, res: Response, next: NextFunction) => {
      const err = new AppError(`La route ${req.originalUrl} n'existe pas sur ce serveur.`, StatusCodes.NOT_FOUND);
      next(err);
    });

    app.use(handleUnauthorizedAttempts);
    app.use(errorHandler);

    // Initialisation des logs
    LogsGenerator.initialize();
    logSystemEvent('Système de logs initialisé', 'info');

    // Démarrage du serveur
    server.listen(7000, () => {
      console.log(`\n✅ Serveur démarré sur http://localhost:${PORT}`);
      console.log(`📖 Documentation API: ${BACKEND_URL}/api-docs`);
      console.log(`Page d'accueil: ${BACKEND_URL}/\n`);
      
      logSystemEvent(`Serveur HTTP démarré sur le port 7000`, 'info');
      logSystemEvent('Démarrage complet du système Sorikama Hub', 'info', { port: PORT });
    });

  } catch (error) {
    console.error('\n❌ Erreur lors du démarrage:', error);
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