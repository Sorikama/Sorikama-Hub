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
  refreshAccessToken
} from '../controllers/authorize.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

// Routes protégées (nécessitent authentification)
router.get('/service/:serviceId', protect, getServiceInfo);
router.post('/service/:serviceId/authorize', protect, authorizeService);
router.delete('/service/:serviceId/revoke', protect, revokeAuthorization);
router.get('/my-authorizations', protect, getUserAuthorizations);

// Routes publiques pour les services
router.post('/verify-token', verifyAccessToken);
router.post('/refresh-token', refreshAccessToken);

export default router;
