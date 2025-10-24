// src/routes/apiKey.routes.ts
import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/authorization.middleware';
import {
  createApiKey,
  listApiKeys,
  updateApiKey,
  revokeApiKey,
  deleteApiKey,
  getApiKeyStats
} from '../controllers/apiKey.controller';
import { validateApiKeyCreation, validateApiKeyUpdate } from '../middlewares/validation.middleware';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(protect);

/**
 * @swagger
 * /api/keys:
 *   post:
 *     summary: Créer une nouvelle API key
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nom de l'API key
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Liste des permissions
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *                 description: Date d'expiration
 *               rateLimit:
 *                 type: object
 *                 properties:
 *                   requests:
 *                     type: number
 *                   windowMs:
 *                     type: number
 *               allowedIPs:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: API key créée avec succès
 */
router.post('/', validateApiKeyCreation, createApiKey);

/**
 * @swagger
 * /api/keys:
 *   get:
 *     summary: Lister les API keys de l'utilisateur
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Nombre d'éléments par page
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filtrer par statut actif
 *     responses:
 *       200:
 *         description: Liste des API keys
 */
router.get('/', listApiKeys);

/**
 * @swagger
 * /api/keys/{id}:
 *   put:
 *     summary: Mettre à jour une API key
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: API key mise à jour
 */
router.put('/:id', validateApiKeyUpdate, updateApiKey);

/**
 * @swagger
 * /api/keys/{id}/revoke:
 *   post:
 *     summary: Révoquer une API key
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: API key révoquée
 */
router.post('/:id/revoke', revokeApiKey);

/**
 * @swagger
 * /api/keys/{id}:
 *   delete:
 *     summary: Supprimer une API key
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: API key supprimée
 */
router.delete('/:id', deleteApiKey);

/**
 * @swagger
 * /api/keys/{id}/stats:
 *   get:
 *     summary: Obtenir les statistiques d'une API key
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Statistiques de l'API key
 */
router.get('/:id/stats', getApiKeyStats);

export default router;