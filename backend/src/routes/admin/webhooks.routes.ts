/**
 * Routes pour la gestion des webhooks (Admin uniquement)
 */

import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import { requireAdmin } from '../../middlewares/adminAuth.middleware';
import * as webhooksController from '../../controllers/admin/webhooks.controller';

const router = Router();

// Appliquer l'authentification et la vérification admin
router.use(protect);
router.use(requireAdmin);

// CRUD webhooks
router.get('/', webhooksController.getAllWebhooks);
router.get('/:webhookId', webhooksController.getWebhookById);
router.post('/', webhooksController.createWebhook);
router.put('/:webhookId', webhooksController.updateWebhook);
router.delete('/:webhookId', webhooksController.deleteWebhook);

// Test
router.post('/:webhookId/test', webhooksController.testWebhookEndpoint);

// Logs
router.get('/:webhookId/logs', webhooksController.getWebhookLogs);

// Statistiques
router.get('/stats/overview', webhooksController.getWebhookStats);

export default router;
