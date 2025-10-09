// src/services/proxy.service.ts
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import { Request } from 'express';
import { logger } from '../utils/logger';

/**
 * Crée une instance de middleware de proxy configurée pour une cible spécifique.
 * Cette fonction agit comme une usine : vous lui donnez l'URL d'un microservice
 * et elle vous retourne un proxy prêt à l'emploi pour cette destination.
 *
 * @param {string} target - L'URL de base du microservice cible (ex: 'http://localhost:3001').
 * @returns Le middleware de proxy configuré.
 */
export const createProxy = (target: string) => {
  const options: Options = {
    target,
    changeOrigin: true, // Essentiel pour que le microservice cible pense que la requête vient de la gateway

    /**
     * Cette fonction est le cœur de l'enrichissement de la requête.
     * Elle s'exécute juste avant que la requête ne soit envoyée au microservice.
     */
    onProxyReq: (proxyReq, req: Request, res) => {
      logger.info(`[PROXY] Redirection : ${req.method} ${req.originalUrl} -> ${target}${req.url}`);

      // Le middleware 'protect' a déjà validé le token et ajouté 'req.user'.
      if (req.user) {
        // On ajoute des en-têtes sécurisés pour que le microservice en aval
        // sache qui est l'utilisateur, sans avoir à re-valider le token JWT.
        // C'est un principe clé de l'API Gateway : elle est la seule porte d'entrée et garante de l'identité.
        proxyReq.setHeader('X-User-Id', req.user.id);

        if (Array.isArray(req.user.roles)) {
          const roleNames = req.user.roles.map((r: any) => r.name).join(',');
          proxyReq.setHeader('X-User-Roles', roleNames);
        }
      }
    },

    /**
     * Gère les erreurs de connectivité avec le microservice.
     * Si le service 'maisons' est éteint, par exemple, cette fonction répondra
     * avec une erreur 502 Bad Gateway claire.
     */
    onError: (err, req, res) => {
      logger.error(`[PROXY] Erreur de proxy vers ${target}:`, err);
      if (!res.headersSent) {
        res.status(502).json({
          message: 'Bad Gateway',
          error: `Impossible de contacter le service en amont.`,
        });
      }
    },
  };

  return createProxyMiddleware(options);
};