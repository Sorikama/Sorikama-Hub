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
 *     summary: Autoriser l'accès d'un service externe
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
 *                 example: mon-service
 *               redirectUrl:
 *                 type: string
 *                 description: URL de callback du service
 *                 example: http://localhost:3001/auth/callback
 *     responses:
 *       200:
 *         description: Autorisation accordée
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
 *         description: Non authentifié
 *       403:
 *         description: Service non autorisé
 *       404:
 *         description: Service introuvable
 */
router.post('/authorize', requireApiKeyAndJWT, authorizeController.authorizeService);

export default router;
