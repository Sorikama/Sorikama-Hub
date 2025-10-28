/**
 * Routes pour la gestion des services externes
 */

import { Router } from 'express';
import {
  getAllServices,
  createService,
  updateService,
  deleteService,
  toggleService,
  getServiceBySlug,
  getServicesStats,
  testServiceConnection,
  getServiceApiKey,
  rotateServiceApiKey
} from '../../controllers/admin/services.controller';
import { protect } from '../../middlewares/auth.middleware';
import { requireAdmin } from '../../middlewares/adminAuth.middleware';

const router = Router();

// Toutes les routes nécessitent authentification + admin
router.use(protect, requireAdmin);

// CRUD Services
router.get('/', getAllServices);
router.get('/stats', getServicesStats);
router.post('/', createService);
router.get('/:slug', getServiceBySlug);
router.put('/:id', updateService);
router.delete('/:id', deleteService);
router.patch('/:id/toggle', toggleService);
router.post('/:id/test', testServiceConnection);

// Gestion des clés API
router.get('/:id/api-key', getServiceApiKey); // Voir la clé API
router.post('/:id/api-key/rotate', rotateServiceApiKey); // Régénérer la clé API

export default router;


