// src/services/proxy.service.ts

/*
================================================================================================
NOUVEAU CONTENU - Utilisation de http-proxy-middleware
================================================================================================
Ce middleware est spécifiquement conçu pour le proxying. Il est plus performant et fiable
que la redirection manuelle avec axios. Il transfère les requêtes et les réponses de manière transparente.
*/
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import { Request } from 'express';
import { logger } from '../utils/logger';
import { BACKEND_SERVICE_URL } from '../config/environments'; // Assurez-vous d'avoir cette variable dans votre config

// Configuration du proxy
const proxyOptions: Options = {
  // Cible : l'URL de base de votre service backend.
  target: BACKEND_SERVICE_URL || 'http://localhost:8000', // L'URL du service backend (le projet en Python)
  changeOrigin: true, // Nécessaire pour les hôtes virtuels
  // Vous pouvez réécrire le chemin si nécessaire. Par exemple, pour retirer un préfixe.
  // pathRewrite: { '^/api': '' }, // Si le frontend appelle /api/products et le backend attend /products

  // C'est ici que la magie opère avant d'envoyer la requête au backend
  onProxyReq: (proxyReq, req: Request, res) => {
    logger.info(`[PROXY] Redirection de la requête : ${req.method} ${req.originalUrl} -> ${proxyOptions.target}${req.url}`);

    // On s'assure que la propriété 'user' a bien été ajoutée par le middleware 'protect'
    if (req.user) {
      // On enrichit la requête qui part vers le backend avec l'identité de l'utilisateur.
      // Le backend n'a plus besoin de valider le token, il fait confiance à la gateway.
      proxyReq.setHeader('X-User-Id', req.user.id);

      // On peut aussi passer les rôles si le backend en a besoin.
      if (Array.isArray(req.user.roles)) {
        const roleNames = req.user.roles.map((r: any) => r.name).join(',');
        proxyReq.setHeader('X-User-Roles', roleNames);
      }
    }
  },

  // Gestion des erreurs du proxy (ex: le service backend est inaccessible)
  onError: (err, req, res) => {
    logger.error('[PROXY] Erreur de proxy:', err);
    res.status(502).json({ message: 'Bad Gateway', error: 'Impossible de contacter le service backend.' });
  }
};

// Exporter le middleware proxy configuré pour être utilisé dans les routes
export const proxyToBackend = createProxyMiddleware(proxyOptions);


/*
================================================================================================
ANCIEN CONTENU - Mis en commentaire pour référence
================================================================================================
// src/services/proxy.service.ts
import axios, { Method } from 'axios';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const proxyRequest = (baseUrl: string) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const targetUrl = `${baseUrl}${req.originalUrl.replace('/api/v1', '')}`;
    logger.info(`Redirection de la requête : ${req.method} ${req.originalUrl} -> ${targetUrl}`);
    try {
      const response = await axios({
        method: req.method as Method,
        url: targetUrl,
        data: req.body,
        headers: {
          'Content-Type': req.headers['content-type'] || 'application/json',
          'Authorization': req.headers.authorization,
          'X-User-Id': req.headers['x-user-id'],
          'X-User-Roles': req.headers['x-user-roles'],
        },
      });
      res.status(response.status).json(response.data);
    } catch (error: any) {
      if (error.response) {
        logger.error(`Erreur du microservice [${targetUrl}] : ${error.response.status}`, error.response.data);
        res.status(error.response.status).json(error.response.data);
      } else {
        logger.error(`Erreur de connexion au microservice [${targetUrl}]`, error.message);
        next(error);
      }
    }
  };
*/