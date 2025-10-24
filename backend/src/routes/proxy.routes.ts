/**
 * Routes pour le proxy vers les services externes
 * 
 * Format : /api/v1/proxy/:serviceId/*
 * 
 * Exemple :
 * GET /api/v1/proxy/soristore/products
 * POST /api/v1/proxy/soripay/payments
 */

import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware';
import { verifyServiceAuthorization } from '../middlewares/proxyAuth.middleware';
import * as proxyController from '../controllers/proxy.controller';

const router = Router();

/**
 * Route universelle pour proxy toutes les requêtes
 * 
 * Middlewares appliqués :
 * 1. protect - Vérifie l'authentification JWT
 * 2. verifyServiceAuthorization - Vérifie la session SSO
 * 3. proxyController.proxyRequest - Proxy la requête
 */
router.all(
  '/proxy/:serviceId/*',
  protect,
  verifyServiceAuthorization,
  proxyController.proxyRequest
);

/**
 * Route pour les requêtes sans path supplémentaire
 * Exemple : /api/v1/proxy/soristore
 */
router.all(
  '/proxy/:serviceId',
  protect,
  verifyServiceAuthorization,
  proxyController.proxyRequest
);

export default router;
