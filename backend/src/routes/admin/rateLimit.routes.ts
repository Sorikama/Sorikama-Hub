/**
 * Routes pour la gestion du rate limiting (Admin uniquement)
 */

import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import { requireAdmin } from '../../middlewares/adminAuth.middleware';
import * as rateLimitController from '../../controllers/admin/rateLimit.controller';

const router = Router();

// Appliquer l'authentification et la vérification admin
router.use(protect);
router.use(requireAdmin);

// Statistiques globales
router.get('/stats', rateLimitController.getRateLimitStats);

// Utilisateurs bloqués
router.get('/blocked', rateLimitController.getBlockedUsers);

// Débloquer un utilisateur
router.post('/unblock/:userId', rateLimitController.unblockUser);

// Historique d'un utilisateur
router.get('/history/:userId', rateLimitController.getUserRateLimitHistory);

// Nettoyage
router.post('/cleanup', rateLimitController.cleanupRateLimits);

export default router;
