/**
 * Routes pour la gestion des sessions SSO utilisateur
 */

import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware';
import * as ssoSessionsController from '../controllers/ssoSessions.controller';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(protect);

/**
 * GET /api/v1/sso/my-sessions
 * Liste des sessions SSO actives de l'utilisateur
 */
router.get('/my-sessions', ssoSessionsController.getMySessions);

/**
 * DELETE /api/v1/sso/revoke/:sessionId
 * Révoquer une session SSO spécifique
 */
router.delete('/revoke/:sessionId', ssoSessionsController.revokeSession);

/**
 * DELETE /api/v1/sso/revoke-all
 * Révoquer toutes les sessions SSO
 */
router.delete('/revoke-all', ssoSessionsController.revokeAllSessions);

export default router;
