/**
 * Routes pour la gestion de la suppression de compte
 */

import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware';
import * as accountDeletionController from '../controllers/accountDeletion.controller';

const router = Router();

/**
 * Routes publiques (sans authentification)
 */

/**
 * POST /api/v1/account/request-cancellation-code-public
 * Demander un code pour annuler la suppression (public)
 */
router.post('/request-cancellation-code-public', accountDeletionController.requestCancellationCodePublic);

/**
 * POST /api/v1/account/cancel-deletion-public
 * Annuler la suppression avec le code reçu par email (public)
 */
router.post('/cancel-deletion-public', accountDeletionController.cancelDeletionPublic);

/**
 * Routes protégées (nécessitent une authentification)
 */
router.use(protect);

/**
 * POST /api/v1/account/schedule-deletion
 * Planifier la suppression du compte (15 jours)
 */
router.post('/schedule-deletion', accountDeletionController.scheduleDeletion);

/**
 * POST /api/v1/account/request-cancellation-code
 * Demander un code pour annuler la suppression (authentifié)
 */
router.post('/request-cancellation-code', accountDeletionController.requestCancellationCode);

/**
 * POST /api/v1/account/cancel-deletion
 * Annuler la suppression avec le code reçu par email (authentifié)
 */
router.post('/cancel-deletion', accountDeletionController.cancelDeletion);

/**
 * GET /api/v1/account/deletion-status
 * Obtenir le statut de suppression du compte
 */
router.get('/deletion-status', accountDeletionController.getDeletionStatus);

export default router;
