// src/routes/system.routes.ts
import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/authorization.middleware';
import {
  getRoles,
  getPermissions,
  getServices,
  getSystemHealth,
  getSystemMetrics
} from '../controllers/system.controller';

const router = Router();

// Toutes les routes nécessitent une authentification JWT
router.use(protect);

/**
 * @swagger
 * /system/roles:
 *   get:
 *     summary: Obtenir la liste des rôles disponibles
 *     tags: [System]
 *     security:
 *       - apiKey: []
 *     responses:
 *       200:
 *         description: Liste des rôles avec leurs permissions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     roles:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           description:
 *                             type: string
 *                           permissions:
 *                             type: array
 *                             items:
 *                               type: object
 *                           isEditable:
 *                             type: boolean
 */
router.get('/roles', authorize(['read:role']), getRoles);

/**
 * @swagger
 * /system/permissions:
 *   get:
 *     summary: Obtenir la liste des permissions disponibles
 *     tags: [System]
 *     security:
 *       - apiKey: []
 *     responses:
 *       200:
 *         description: Liste des permissions groupées par sujet
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     permissions:
 *                       type: object
 *                       additionalProperties:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             action:
 *                               type: string
 *                             subject:
 *                               type: string
 *                             description:
 *                               type: string
 *                             fullPermission:
 *                               type: string
 */
router.get('/permissions', authorize(['read:permission']), getPermissions);

/**
 * @swagger
 * /system/services:
 *   get:
 *     summary: Obtenir la liste des services disponibles
 *     tags: [System]
 *     security:
 *       - apiKey: []
 *     responses:
 *       200:
 *         description: Liste des services avec leurs configurations et métriques
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     services:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           path:
 *                             type: string
 *                           target:
 *                             type: string
 *                           methods:
 *                             type: array
 *                             items:
 *                               type: string
 *                           permissions:
 *                             type: array
 *                             items:
 *                               type: string
 *                           healthy:
 *                             type: boolean
 *                           metrics:
 *                             type: object
 *                     summary:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         healthy:
 *                           type: number
 *                         unhealthy:
 *                           type: number
 */
router.get('/services', authorize(['read:gateway']), getServices);

/**
 * @swagger
 * /system/health:
 *   get:
 *     summary: Obtenir l'état de santé du système
 *     tags: [System]
 *     security:
 *       - apiKey: []
 *     responses:
 *       200:
 *         description: État de santé du système et des services
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       enum: [healthy, degraded, unhealthy]
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     gateway:
 *                       type: object
 *                       properties:
 *                         version:
 *                           type: string
 *                         uptime:
 *                           type: number
 *                         memory:
 *                           type: object
 *                         nodeVersion:
 *                           type: string
 *                     services:
 *                       type: array
 *                       items:
 *                         type: object
 *                     summary:
 *                       type: object
 */
router.get('/health', getSystemHealth);

/**
 * @swagger
 * /system/metrics:
 *   get:
 *     summary: Obtenir les métriques de performance du système
 *     tags: [System]
 *     security:
 *       - apiKey: []
 *     responses:
 *       200:
 *         description: Métriques de performance détaillées
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     overview:
 *                       type: object
 *                       properties:
 *                         totalRequests:
 *                           type: number
 *                         totalErrors:
 *                           type: number
 *                         errorRate:
 *                           type: number
 *                         avgResponseTime:
 *                           type: number
 *                     services:
 *                       type: array
 *                       items:
 *                         type: object
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 */
router.get('/metrics', authorize(['read:analytics']), getSystemMetrics);

export default router;