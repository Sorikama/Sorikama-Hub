/**
 * Routes pour la consultation de l'audit trail (Admin uniquement)
 */

import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import { requireAdmin } from '../../middlewares/adminAuth.middleware';
import * as auditController from '../../controllers/admin/audit.controller';

const router = Router();

// Appliquer l'authentification et la vérification admin
router.use(protect);
router.use(requireAdmin);

// Récupérer les logs avec filtres
router.get('/', auditController.getAuditLogs);

// Statistiques
router.get('/stats', auditController.getAuditStats);

// Export CSV
router.get('/export/csv', auditController.exportAuditLogs);

// Export JSON
router.get('/export/json', auditController.exportAuditLogsJSON);

export default router;
