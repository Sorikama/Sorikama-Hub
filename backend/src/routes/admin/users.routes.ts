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
import * as usersCreateController from '../../controllers/admin/users.create.controller';

const router = Router();

// Appliquer l'authentification et la vérification admin sur toutes les routes
router.use(protect);
router.use(requireAdmin);

/**
 * POST /api/v1/admin/users/create
 * Créer un utilisateur SANS mot de passe (activation par email)
 * IMPORTANT: Cette route doit être AVANT /:userId pour éviter les conflits
 */
router.post('/create', usersCreateController.createUserWithoutPassword);

/**
 * POST /api/v1/admin/users/create-with-password
 * Créer un utilisateur AVEC mot de passe (compte immédiatement actif)
 * IMPORTANT: Cette route doit être AVANT /:userId pour éviter les conflits
 */
router.post('/create-with-password', usersCreateController.createUserWithPassword);

/**
 * GET /api/v1/admin/users/stats/overview
 * Récupérer les statistiques globales des utilisateurs
 * IMPORTANT: Cette route doit être AVANT /:userId pour éviter les conflits
 */
router.get('/stats/overview', usersController.getUsersOverview);

/**
 * GET /api/v1/admin/users/debug/count
 * Debug - Compter tous les utilisateurs
 * IMPORTANT: Cette route doit être AVANT /:userId pour éviter les conflits
 */
router.get('/debug/count', async (_req, res) => {
  try {
    const total = await require('../../database/models/user.model').UserModel.countDocuments();
    const admins = await require('../../database/models/user.model').UserModel.countDocuments({ role: 'admin' });
    const users = await require('../../database/models/user.model').UserModel.countDocuments({ role: 'user' });

    res.json({
      success: true,
      data: {
        total,
        admins,
        users,
        message: 'Debug info'
      }
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: errorMessage });
  }
});

/**
 * GET /api/v1/admin/users/all
 * Récupérer TOUS les utilisateurs sans pagination
 * IMPORTANT: Cette route doit être AVANT / pour éviter les conflits
 */
router.get('/all', usersController.getAllUsersNoPagination);

/**
 * GET /api/v1/admin/users/template
 * Télécharger un fichier template pour l'import
 * IMPORTANT: Cette route doit être AVANT /:userId pour éviter les conflits
 */
router.get('/template', usersController.downloadTemplate);

/**
 * POST /api/v1/admin/users/import
 * Importer des utilisateurs depuis un fichier (JSON, CSV, Excel)
 * IMPORTANT: Cette route doit être AVANT /:userId pour éviter les conflits
 */
router.post('/import', usersController.importUsers);

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

export default router;
