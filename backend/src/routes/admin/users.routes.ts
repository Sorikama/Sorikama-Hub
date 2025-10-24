/**
 * Routes pour la gestion des utilisateurs par l'administrateur
 * 
 * Toutes ces routes nécessitent :
 * - Authentification (JWT valide)
 * - Rôle admin
 */

import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import { requireAdmin } from '../../middlewares/adminAuth.middleware';
import * as usersController from '../../controllers/admin/users.controller';

const router = Router();

// Appliquer l'authentification et la vérification admin sur toutes les routes
router.use(protect);
router.use(requireAdmin);

/**
 * GET /api/v1/admin/users
 * Récupérer la liste de tous les utilisateurs avec filtres et pagination
 */
router.get('/', usersController.getAllUsers);

/**
 * GET /api/v1/admin/users/:userId
 * Récupérer les détails d'un utilisateur spécifique
 */
router.get('/:userId', usersController.getUserById);

/**
 * PUT /api/v1/admin/users/:userId/block
 * Bloquer un utilisateur
 */
router.put('/:userId/block', usersController.blockUser);

/**
 * PUT /api/v1/admin/users/:userId/unblock
 * Débloquer un utilisateur
 */
router.put('/:userId/unblock', usersController.unblockUser);

/**
 * GET /api/v1/admin/users/:userId/activity
 * Récupérer l'activité d'un utilisateur
 */
router.get('/:userId/activity', usersController.getUserActivity);

/**
 * DELETE /api/v1/admin/users/:userId/sessions
 * Révoquer toutes les sessions d'un utilisateur
 */
router.delete('/:userId/sessions', usersController.revokeUserSessions);

/**
 * GET /api/v1/admin/users/:userId/stats
 * Récupérer les statistiques d'un utilisateur
 */
router.get('/:userId/stats', usersController.getUserStats);

/**
 * GET /api/v1/admin/users/stats/overview
 * Récupérer les statistiques globales des utilisateurs
 */
router.get('/stats/overview', usersController.getUsersOverview);

export default router;
