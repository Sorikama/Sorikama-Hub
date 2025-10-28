/**
 * Routes pour les callbacks des services externes
 * Ces routes permettent aux services de notifier Sorikama des événements
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  handleServiceLogout,
  handleSessionActivity,
  verifyServiceAuthorization
} from '../controllers/serviceCallback.controller';

const router = Router();

// Rate limiting pour éviter les abus
const callbackRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requêtes par minute
  message: 'Trop de requêtes de callback, veuillez réessayer plus tard',
  standardHeaders: 'draft-7',
  legacyHeaders: false
});

/**
 * POST /api/service-callback/logout
 * Notifier Sorikama qu'un utilisateur s'est déconnecté
 * 
 * Headers:
 * - X-Service-Api-Key: Clé API du service
 * - X-User-Id: ID utilisateur chiffré
 * 
 * Body:
 * - reason: Raison de la déconnexion (optionnel)
 */
router.post('/logout', callbackRateLimiter, handleServiceLogout);

/**
 * POST /api/service-callback/session-activity
 * Notifier Sorikama de l'activité d'une session
 * 
 * Headers:
 * - X-Service-Api-Key: Clé API du service
 * - X-User-Id: ID utilisateur chiffré
 */
router.post('/session-activity', callbackRateLimiter, handleSessionActivity);

/**
 * GET /api/service-callback/verify-authorization
 * Vérifier si un utilisateur a une autorisation active
 * 
 * Headers:
 * - X-Service-Api-Key: Clé API du service
 * - X-User-Id: ID utilisateur chiffré
 */
router.get('/verify-authorization', callbackRateLimiter, verifyServiceAuthorization);

export default router;
