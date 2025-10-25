import { Router } from 'express';
import * as authorizeController from '../../controllers/authorize.controller';
import { requireApiKeyAndJWT } from '../../middlewares/dualAuth.middleware';
import { protect } from '../../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /auth/services/:serviceId:
 *   get:
 *     summary: Récupérer les informations d'un service
 *     tags: [Authentification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID ou slug du service
 *     responses:
 *       200:
 *         description: Informations du service
 *       404:
 *         description: Service introuvable
 */
router.get('/services/:serviceId', protect, authorizeController.getServiceInfo);

/**
 * @swagger
 * /auth/authorize:
 *   post:
 *     summary: Autoriser l'accès d'un service externe (génère un code temporaire)
 *     tags: [Authentification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - service
 *               - redirectUrl
 *             properties:
 *               service:
 *                 type: string
 *                 description: Slug du service externe
 *                 example: masebuy
 *               redirectUrl:
 *                 type: string
 *                 description: URL de callback du service
 *                 example: http://localhost:3001/auth/callback
 *     responses:
 *       200:
 *         description: Code d'autorisation généré
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       description: Code temporaire à échanger (valide 5 min)
 *                     expiresIn:
 *                       type: number
 *                       description: Durée de validité en secondes
 *                       example: 300
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Service non autorisé
 *       404:
 *         description: Service introuvable
 */
router.post('/authorize', requireApiKeyAndJWT, authorizeController.authorizeService);

/**
 * @swagger
 * /auth/exchange:
 *   post:
 *     summary: Échanger un code d'autorisation contre un token JWT
 *     description: Route appelée par le backend du service externe pour obtenir le token
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *                 description: Code d'autorisation reçu
 *                 example: a1b2c3d4e5f6...
 *     responses:
 *       200:
 *         description: Token JWT généré
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: Token JWT pour le service
 *                     user:
 *                       type: object
 *                       description: Informations utilisateur
 *       401:
 *         description: Code invalide ou expiré
 */
router.post('/exchange', authorizeController.exchangeAuthorizationCode);

export default router;
