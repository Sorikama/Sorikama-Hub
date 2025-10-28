/**
 * Routes pour l'autorisation des services
 */

import { Router } from 'express';
import {
  getServiceInfo,
  authorizeService,
  revokeAuthorization,
  getUserAuthorizations,
  verifyAccessToken,
  refreshAccessToken,
  exchangeAuthorizationCode
} from '../controllers/authorize.controller';
import { protect } from '../middlewares/auth.middleware';
import {
  authorizationRateLimiter,
  validateRedirectUrl,
  validateScopes,
  detectSuspiciousIp,
  logAuthorizationAttempt
} from '../middlewares/oauth.security.middleware';

const router = Router();

// Routes protégées (nécessitent authentification)
router.get('/service/:serviceId', protect, getServiceInfo);

// Route d'autorisation avec sécurité renforcée
router.post(
  '/service/:serviceId/authorize',
  authorizationRateLimiter,        // Rate limiting
  protect,                          // Authentification
  logAuthorizationAttempt,          // Logging
  validateRedirectUrl,              // Vérifier redirect URL
  validateScopes,                   // Vérifier scopes
  detectSuspiciousIp,               // Détecter IP suspecte
  authorizeService                  // Autoriser
);

router.delete('/service/:serviceId/revoke', protect, revokeAuthorization);
router.get('/my-authorizations', protect, getUserAuthorizations);

// Routes publiques pour les services
router.post('/exchange-code', exchangeAuthorizationCode); // Échanger le code contre un token
router.post('/verify-token', verifyAccessToken);
router.post('/refresh-token', refreshAccessToken);

export default router;
