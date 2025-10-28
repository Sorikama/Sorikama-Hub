/**
 * Routes pour la gestion des utilisateurs par les services externes
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  getUserProfile,
  updateUserProfile,
  changeUserPassword
} from '../controllers/serviceUser.controller';

const router = Router();

// Rate limiting
const userRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 50, // 50 requêtes par minute
  message: 'Trop de requêtes, veuillez réessayer plus tard',
  standardHeaders: 'draft-7',
  legacyHeaders: false
});

/**
 * GET /api/service-user/profile
 * Récupérer les informations de l'utilisateur connecté
 * 
 * Headers requis:
 * - X-Service-Api-Key: Clé API du service
 * - X-User-Id: ID utilisateur chiffré
 */
router.get('/profile', userRateLimiter, getUserProfile);

/**
 * PATCH /api/service-user/profile
 * Mettre à jour les informations de l'utilisateur
 * 
 * Headers requis:
 * - X-Service-Api-Key: Clé API du service
 * - X-User-Id: ID utilisateur chiffré
 * 
 * Body:
 * - firstName: Prénom (optionnel)
 * - lastName: Nom (optionnel)
 */
router.patch('/profile', userRateLimiter, updateUserProfile);

/**
 * PUT /api/service-user/password
 * Changer le mot de passe de l'utilisateur
 * 
 * Headers requis:
 * - X-Service-Api-Key: Clé API du service
 * - X-User-Id: ID utilisateur chiffré
 * 
 * Body:
 * - currentPassword: Mot de passe actuel
 * - newPassword: Nouveau mot de passe (min 8 caractères)
 */
router.put('/password', userRateLimiter, changeUserPassword);

export default router;
