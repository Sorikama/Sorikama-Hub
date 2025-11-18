// src/index.ts
import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import mongoose from 'mongoose';
import http from 'http';

// Import de nos modules internes
import { PORT, NODE_ENV } from './config/environments';
import { logger } from './utils/logger';
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

import './database/models';

const app: Application = express();
const server = http.createServer(app);

const startServer = async () => {
  try {
    console.log('🚀 Démarrage du serveur...');
    await connectDB();
    console.log('✅ Connexion DB établie, configuration des middlewares...');
    
    // Vérifier si la base de données a besoin d'être initialisée
    const { needsSeeding, seedDatabase } = require('./database/seeders/index');
    const needsInit = await needsSeeding();
    
    if (needsInit) {
      console.log('\n⚠️  Base de données non initialisée, lancement du seeding...\n');
      await seedDatabase();
    }

    app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "https://cdn.tailwindcss.com", "'unsafe-inline'"],
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
      origin: [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:3001',
        'http://127.0.0.1:3001',
        'http://localhost:7000',
        'http://127.0.0.1:7000'
      ],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'Accept', 'X-CSRF-Token', 'X-User-Id', 'X-Service-Api-Key'],
      credentials: true,
      exposedHeaders: ['X-CSRF-Token']
    };
    app.use(cors(corsOptions));
    app.use(express.json({ limit: '10kb' }));
    app.use(express.urlencoded({ extended: true, limit: '10kb' }));
    app.use('/api', rateLimiter);

    app.use(express.static(path.join(__dirname, '../public')));

    console.log('✅ Middlewares configurés, chargement de Swagger...');
    
    // Configuration Swagger
    if (NODE_ENV === 'development') {
      try {
        const yaml = require('yaml');
        const swaggerPath = path.join(__dirname, '../openapi.yaml');
        
        let swaggerSpec;
        if (fs.existsSync(swaggerPath)) {
          const yamlContent = fs.readFileSync(swaggerPath, 'utf8');
          swaggerSpec = yaml.parse(yamlContent);
          
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
        
        const protectSwagger = (req: Request, res: Response, next: NextFunction) => {
          if (req.url.includes('.js') || req.url.includes('.css') || req.url.includes('.map')) {
            return next();
          }
          
          const token = req.query.token as string;
          const apiKey = req.query.x_api_key as string;
          
          if (!token || token.length < 10) {
            return res.redirect('/swagger/login');
          }
          
          if (!apiKey) {
            return res.redirect('/swagger/login');
          }
          
          req.headers['x-api-key'] = apiKey;
          next();
        };
        
        app.use('/api-docs', (req, res, next) => {
          res.removeHeader('Content-Security-Policy');
          next();
        });
        
        app.use('/api-docs', express.static(require('swagger-ui-dist').absolutePath()));
        
        app.use('/api-docs', protectSwagger, swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
          customCss: '.swagger-ui .topbar { display: none }',
          customSiteTitle: 'Sorikama API Gateway Documentation',
          swaggerOptions: {
            requestInterceptor: (req: any) => {
              const urlParams = new URLSearchParams(window.location.search);
              const apiKey = urlParams.get('x_api_key');
              
              if (apiKey) {
                req.headers['X-API-Key'] = apiKey;
              }
              
              const bearerToken = localStorage.getItem('sorikama_access_token');
              if (bearerToken) {
                req.headers['Authorization'] = `Bearer ${bearerToken}`;
              }
              
              return req;
            },
            onComplete: () => {
              const infoDiv = document.createElement('div');
              const apiKey = new URLSearchParams(window.location.search).get('x_api_key');
              const bearerToken = localStorage.getItem('sorikama_access_token');
              
              infoDiv.innerHTML = `
                <div style="background: #e3f2fd; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #2196f3;">
                  <div style="margin-bottom: 10px;">
                    <strong>🔑 API Key active:</strong> ${apiKey?.substring(0, 20)}...
                  </div>
                  <div style="margin-bottom: 10px;">
                    <strong>🎩 Bearer Token:</strong> ${bearerToken ? bearerToken.substring(0, 20) + '...' : 'Non défini'}
                  </div>
                  <div>
                    <input type="text" id="bearerTokenInput" placeholder="Collez votre Bearer Token ici" style="width: 300px; padding: 5px; margin-right: 10px;" />
                    <button onclick="setBearerToken()" style="padding: 5px 10px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">Définir Token</button>
                    <button onclick="clearBearerToken()" style="padding: 5px 10px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 5px;">Effacer</button>
                  </div>
                </div>
              `;
              
              const container = document.querySelector('.swagger-ui .information-container');
              if (container) {
                container.appendChild(infoDiv);
              }
              
              (window as any).setBearerToken = function() {
                const input = document.getElementById('bearerTokenInput') as HTMLInputElement;
                const token = input?.value?.trim();
                if (token) {
                  localStorage.setItem('sorikama_access_token', token);
                  location.reload();
                }
              };
              
              (window as any).clearBearerToken = function() {
                localStorage.removeItem('sorikama_access_token');
                location.reload();
              };
            }
          }
        }));
        
        logger.info(`📚 Documentation API disponible sur http://localhost:${PORT}/swagger/login`);
        logger.info(`🔑 API Key par défaut: sk_dev_default_key_12345678901234567890123456789012345678901234567890`);
        logger.info(`📖 Documentation HTML disponible sur http://localhost:${PORT}/documentation`);
      } catch (e) {
        logger.error('❌ Erreur de chargement de la documentation Swagger:', e);
      }
    }

    console.log('✅ Swagger configuré, configuration des routes...');

    app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, '../public/index.html'));
    });

    app.use('/swagger', swaggerRoutes);
    app.use('/docs', docsRoutes);
    
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
    
    app.use('/api/v1', apiRouter);

    app.all('*', (req: Request, res: Response, next: NextFunction) => {
      const err = new AppError(`La route ${req.originalUrl} n'existe pas sur ce serveur.`, StatusCodes.NOT_FOUND);
      next(err);
    });

    app.use(handleUnauthorizedAttempts);
    app.use(errorHandler);

    console.log('✅ Routes configurées, démarrage du serveur HTTP...');

    server.listen(PORT, () => {
      console.log(`✅ Serveur HTTP démarré sur le port ${PORT}`);
      logger.info(`✅ Serveur démarré avec succès sur le port ${PORT} en mode [${NODE_ENV}]`);
    });

  } catch (error) {
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
      await mongoose.disconnect();
      logger.info('🔌 Déconnexion de MongoDB réussie.');
      process.exit(0);
    });
  });
};

gracefulShutdown('SIGINT');
gracefulShutdown('SIGTERM');