/**
 * Routes pour les services externes
 * Permet aux services d'accéder aux données utilisateur
 */

import { Router } from 'express';
import * as serviceUserController from '../controllers/service-user.controller';

const router = Router();

/**
 * GET /api/v1/service-user/profile
 * Récupérer le profil utilisateur
 * 
 * Headers requis:
 * - X-User-Id: ID utilisateur chiffré
 * - X-Service-Api-Key: Clé API du service (optionnel pour validation)
 */
router.get('/profile', serviceUserController.getUserProfile);

export default router;
