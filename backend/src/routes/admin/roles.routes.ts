/**
 * Routes pour la gestion des rôles et permissions (Admin uniquement)
 */

import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import { requireAdmin } from '../../middlewares/adminAuth.middleware';
import * as rolesController from '../../controllers/admin/roles.controller';

const router = Router();

// Appliquer l'authentification et la vérification admin
router.use(protect);
router.use(requireAdmin);

// Routes pour les rôles
router.get('/', rolesController.getAllRoles);
router.get('/:roleId', rolesController.getRoleById);
router.post('/', rolesController.createRole);
router.put('/:roleId', rolesController.updateRole);
router.delete('/:roleId', rolesController.deleteRole);

// Routes pour les permissions
router.get('/permissions/all', rolesController.getAllPermissions);
router.post('/permissions/seed', rolesController.seedPermissions);

// Routes pour l'import/export
router.get('/export', rolesController.exportRoles);
router.post('/import', rolesController.importRoles);

// Routes pour assigner des rôles aux utilisateurs
router.get('/users/:userId/roles', rolesController.getUserRoles);
router.put('/users/:userId/roles', rolesController.assignRolesToUser);

export default router;
