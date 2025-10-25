/**
 * Routes pour la gestion des tokens CSRF
 */

import { Router } from 'express';
import { generateCsrf, getCsrfToken } from '../middlewares/csrf.middleware';

const router = Router();

/**
 * @swagger
 * /csrf-token:
 *   get:
 *     summary: Récupérer un token CSRF
 *     tags: [Sécurité]
 *     responses:
 *       200:
 *         description: Token CSRF généré
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
 *                     csrfToken:
 *                       type: string
 *                       example: a1b2c3d4e5f6...
 */
router.get('/csrf-token', generateCsrf, getCsrfToken);

export default router;
