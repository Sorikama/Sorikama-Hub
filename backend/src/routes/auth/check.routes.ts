/**
 * Route pour vérifier l'authentification et rediriger vers login ou authorize
 * Utilisé par les services externes (Masebuy) pour initier le flux SSO
 */

import { Router, Request, Response } from 'express';
import { logger } from '../../utils/logger';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, FRONTEND_URL } from '../../config';

const router = Router();

/**
 * GET /auth/check
 * Vérifie si l'utilisateur est connecté et redirige vers la bonne page
 * 
 * Query params:
 * - service: slug du service (ex: masebuy)
 * - redirect: URL de redirection après autorisation
 */
router.get('/check', (req: Request, res: Response) => {
  try {
    const { service, redirect } = req.query;

    if (!service) {
      return res.status(400).json({
        success: false,
        message: 'Paramètre "service" requis'
      });
    }

    // Vérifier si l'utilisateur a un access_token dans les cookies
    const accessToken = req.cookies?.access_token;

    if (!accessToken) {
      // Pas de token = pas connecté -> rediriger vers login
      const loginUrl = `${FRONTEND_URL}/login?service=${service}${redirect ? `&redirect=${encodeURIComponent(redirect as string)}` : ''}`;
      
      logger.info(`🔒 Utilisateur non connecté, redirection vers login`, {
        service,
        redirect,
        loginUrl
      });

      return res.redirect(loginUrl);
    }

    // Vérifier la validité du token
    try {
      jwt.verify(accessToken, JWT_SECRET);
      
      // Token valide = connecté -> rediriger vers page d'autorisation
      const authorizeUrl = `${FRONTEND_URL}/authorize?service=${service}${redirect ? `&redirect=${encodeURIComponent(redirect as string)}` : ''}`;
      
      logger.info(`✅ Utilisateur connecté, redirection vers authorize`, {
        service,
        redirect,
        authorizeUrl
      });

      return res.redirect(authorizeUrl);
      
    } catch (error) {
      // Token invalide ou expiré -> rediriger vers login
      const loginUrl = `${FRONTEND_URL}/login?service=${service}${redirect ? `&redirect=${encodeURIComponent(redirect as string)}` : ''}`;
      
      logger.info(`🔒 Token invalide/expiré, redirection vers login`, {
        service,
        redirect,
        error: (error as Error).message
      });

      return res.redirect(loginUrl);
    }

  } catch (error) {
    logger.error('Erreur lors de la vérification auth:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

export default router;
