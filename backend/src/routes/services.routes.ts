import { Router } from 'express';
import { ServiceModel } from '../database/models/service.model';
import { requireApiKeyAndJWT } from '../middlewares/dualAuth.middleware';
import { StatusCodes } from 'http-status-codes';
import AppError from '../utils/AppError';

const router = Router();

/**
 * @swagger
 * /services/slug/{slug}:
 *   get:
 *     summary: Récupérer un service par son slug
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Slug du service
 *     responses:
 *       200:
 *         description: Service trouvé
 *       404:
 *         description: Service introuvable
 */
router.get('/slug/:slug', requireApiKeyAndJWT, async (req, res, next) => {
  try {
    const { slug } = req.params;

    const service = await ServiceModel.findOne({
      slug,
      enabled: true
    });

    if (!service) {
      return next(new AppError('Service introuvable', StatusCodes.NOT_FOUND));
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: service
    });
  } catch (error) {
    next(error);
  }
});

export default router;
