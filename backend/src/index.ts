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
import AppError from './utils/AppError';
import { StatusCodes } from 'http-status-codes';

import swaggerUi from 'swagger-ui-express';
import YAML from 'js-yaml'; // <--- Importer js-yaml
import fs from 'fs'; // <--- Importer le module 'fs' de Node
import { connectDB } from './database/connexion';
import path from 'path';
import authRoutes from './routes/auth.routes';
import proxyRoutes from './routes/proxy.routes';

import './database/models'; // Charge et enregistre tous les modèles Mongoose

const app: Application = express();
const server = http.createServer(app);

// Fonction principale pour démarrer le serveur
const startServer = async () => {
  try {
    // 1. Connexion à la base de données
    await connectDB();

    // 2. Middlewares essentiels
    // Helmet pour les en-têtes de sécurité de base
    app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"], // N'autorise que les ressources de notre propre domaine par défaut
            scriptSrc: ["'self'", "https://cdn.tailwindcss.com"], // Autorise les scripts de notre domaine et de tailwind
            styleSrc: ["'self'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com", "'unsafe-inline'"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:"],
            objectSrc: ["'none'"], // Interdit les plugins comme Flash
            scriptSrcAttr: ["'unsafe-inline'"],
            upgradeInsecureRequests: [],
          },
        },
        xPoweredBy: false, // Ne pas montrer la technologie utilisée (Express)
        frameguard: { action: 'deny' }, // Empêche le clickjacking
        xssFilter: true, // Active le filtre XSS des navigateurs
        noSniff: true, // Empêche le "MIME type sniffing"
      })
    );
    // CORS pour autoriser les requêtes cross-domain
    const corsOptions = {
      // En développement, on peut être plus permissif
      origin: NODE_ENV === 'development' ? '*' : 'https://www.votre-site-de-production.com',
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    };
    app.use(cors(corsOptions));
    // Parseur pour les requêtes JSON
    app.use(express.json({ limit: '10kb' }));
    // Parseur pour les données de formulaire
    app.use(express.urlencoded({ extended: true, limit: '10kb' }));
    // Limiteur de requêtes pour prévenir les abus
    app.use('/api', rateLimiter); // Appliqué seulement aux routes de l'API

    app.use(express.static(path.join(__dirname, '../public')));

    if (NODE_ENV === 'development') {
      try {
        const openApiDocument = YAML.load(fs.readFileSync(path.join(__dirname, '../openapi.yaml'), 'utf8')) as object;

        // Rendre le port dynamique dans la spec
        if (openApiDocument && (openApiDocument as any).servers) {
          (openApiDocument as any).servers[0].url = `http://localhost:${PORT}/api/v1`;
        }

        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));
        logger.info(`📚 Documentation API disponible sur http://localhost:${PORT}/api-docs`);
      } catch (e) {
        logger.error('❌ Erreur de lecture du fichier openapi.yaml:', e);
      }
    }

    // Nouvelle route pour la page d'accueil
    app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, '../public/index.html'));
    });

    // Les routes d'authentification sont gérées directement par la gateway.
    // Elles ne sont PAS protégées par le token JWT (puisqu'on vient ici pour en obtenir un).
    app.use('/api/v1/auth', authRoutes);

    // Toutes les autres routes commençant par /api/v1/ seront dirigées vers le service backend.
    // Notre `proxy.routes.ts` contient le middleware `protect`, donc toutes ces routes
    // nécessiteront un token valide.
    app.use('/api/v1', proxyRoutes); // Attention, le préfixe est important

    // 4. Gestion des routes non trouvées (404)
    app.all('*', (req: Request, res: Response, next: NextFunction) => {
      const err = new AppError(`La route ${req.originalUrl} n'existe pas sur ce serveur.`, StatusCodes.NOT_FOUND);
      next(err);
    });

    // 5. Gestionnaire d'erreurs global
    app.use(errorHandler);

    // 6. Démarrage du serveur
    server.listen(PORT, () => {
      logger.info(`✅ Serveur démarré avec succès sur le port ${PORT} en mode [${NODE_ENV}]`);
    });

  } catch (error) {
    logger.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

// Lancement de l'application
startServer();

// --- Gestion du Graceful Shutdown ---

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

gracefulShutdown('SIGINT'); // Signal pour Ctrl+C
gracefulShutdown('SIGTERM'); // Signal d'arrêt standard