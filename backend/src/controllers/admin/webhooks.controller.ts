/**
 * Contrôleur pour la gestion des webhooks (Admin uniquement)
 */

import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { WebhookModel } from '../../database/models/webhook.model';
import { WebhookLogModel } from '../../database/models/webhookLog.model';
import { testWebhook, WEBHOOK_EVENTS } from '../../services/webhook.service';
import AppError from '../../utils/AppError';
import { logger } from '../../utils/logger';

/**
 * Récupérer tous les webhooks
 */
export const getAllWebhooks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const webhooks = await WebhookModel.find()
      .sort({ createdAt: -1 })
      .lean();

    logger.info('📋 Liste des webhooks récupérée', {
      adminId: (req as any).user.id,
      count: webhooks.length,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        webhooks,
        availableEvents: Object.values(WEBHOOK_EVENTS),
      },
    });
  } catch (error) {
    logger.error('❌ Erreur lors de la récupération des webhooks:', error);
    next(error);
  }
};

/**
 * Récupérer un webhook par ID
 */
export const getWebhookById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { webhookId } = req.params;

    const webhook = await WebhookModel.findById(webhookId).lean();

    if (!webhook) {
      throw new AppError('Webhook non trouvé', StatusCodes.NOT_FOUND);
    }

    // Récupérer les derniers logs
    const recentLogs = await WebhookLogModel.find({ webhookId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        webhook,
        recentLogs,
      },
    });
  } catch (error) {
    logger.error('❌ Erreur lors de la récupération du webhook:', error);
    next(error);
  }
};

/**
 * Créer un webhook
 */
export const createWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, url, events, headers, retryCount, timeout } = req.body;

    // Validation
    if (!name || !name.trim()) {
      throw new AppError('Le nom est requis', StatusCodes.BAD_REQUEST);
    }

    if (!url || !url.trim()) {
      throw new AppError('L\'URL est requise', StatusCodes.BAD_REQUEST);
    }

    if (!events || !Array.isArray(events) || events.length === 0) {
      throw new AppError('Au moins un événement est requis', StatusCodes.BAD_REQUEST);
    }

    // Valider l'URL
    try {
      new URL(url);
    } catch {
      throw new AppError('URL invalide', StatusCodes.BAD_REQUEST);
    }

    // Valider les événements
    const validEvents = Object.values(WEBHOOK_EVENTS);
    const invalidEvents = events.filter(e => !validEvents.includes(e));
    if (invalidEvents.length > 0) {
      throw new AppError(`Événements invalides: ${invalidEvents.join(', ')}`, StatusCodes.BAD_REQUEST);
    }

    const webhook = await WebhookModel.create({
      name: name.trim(),
      url: url.trim(),
      events,
      headers: headers || {},
      retryCount: retryCount !== undefined ? retryCount : 3,
      timeout: timeout || 5000,
      createdBy: (req as any).user.id,
    });

    logger.info('✅ Webhook créé', {
      adminId: (req as any).user.id,
      webhookId: webhook._id,
      name: webhook.name,
      events: webhook.events,
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Webhook créé avec succès',
      data: { webhook },
    });
  } catch (error) {
    logger.error('❌ Erreur lors de la création du webhook:', error);
    next(error);
  }
};

/**
 * Mettre à jour un webhook
 */
export const updateWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { webhookId } = req.params;
    const { name, url, events, isActive, headers, retryCount, timeout } = req.body;

    const webhook = await WebhookModel.findById(webhookId);

    if (!webhook) {
      throw new AppError('Webhook non trouvé', StatusCodes.NOT_FOUND);
    }

    // Mettre à jour les champs
    if (name !== undefined) webhook.name = name.trim();
    if (url !== undefined) {
      try {
        new URL(url);
        webhook.url = url.trim();
      } catch {
        throw new AppError('URL invalide', StatusCodes.BAD_REQUEST);
      }
    }
    if (events !== undefined) {
      if (!Array.isArray(events) || events.length === 0) {
        throw new AppError('Au moins un événement est requis', StatusCodes.BAD_REQUEST);
      }
      const validEvents = Object.values(WEBHOOK_EVENTS);
      const invalidEvents = events.filter(e => !validEvents.includes(e));
      if (invalidEvents.length > 0) {
        throw new AppError(`Événements invalides: ${invalidEvents.join(', ')}`, StatusCodes.BAD_REQUEST);
      }
      webhook.events = events;
    }
    if (isActive !== undefined) webhook.isActive = isActive;
    if (headers !== undefined) webhook.headers = headers;
    if (retryCount !== undefined) webhook.retryCount = retryCount;
    if (timeout !== undefined) webhook.timeout = timeout;

    await webhook.save();

    logger.info('✅ Webhook mis à jour', {
      adminId: (req as any).user.id,
      webhookId: webhook._id,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Webhook mis à jour avec succès',
      data: { webhook },
    });
  } catch (error) {
    logger.error('❌ Erreur lors de la mise à jour du webhook:', error);
    next(error);
  }
};

/**
 * Supprimer un webhook
 */
export const deleteWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { webhookId } = req.params;

    const webhook = await WebhookModel.findByIdAndDelete(webhookId);

    if (!webhook) {
      throw new AppError('Webhook non trouvé', StatusCodes.NOT_FOUND);
    }

    logger.warn('🗑️ Webhook supprimé', {
      adminId: (req as any).user.id,
      webhookId,
      name: webhook.name,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Webhook supprimé avec succès',
    });
  } catch (error) {
    logger.error('❌ Erreur lors de la suppression du webhook:', error);
    next(error);
  }
};

/**
 * Tester un webhook
 */
export const testWebhookEndpoint = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { webhookId } = req.params;

    const result = await testWebhook(webhookId);

    logger.info('🧪 Test webhook', {
      adminId: (req as any).user.id,
      webhookId,
      success: result.success,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: result.success ? 'Test réussi' : 'Test échoué',
      data: result,
    });
  } catch (error) {
    logger.error('❌ Erreur lors du test du webhook:', error);
    next(error);
  }
};

/**
 * Récupérer les logs d'un webhook
 */
export const getWebhookLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { webhookId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const logs = await WebhookLogModel.find({ webhookId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await WebhookLogModel.countDocuments({ webhookId });

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        logs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    logger.error('❌ Erreur lors de la récupération des logs:', error);
    next(error);
  }
};

/**
 * Récupérer les statistiques des webhooks
 */
export const getWebhookStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const totalWebhooks = await WebhookModel.countDocuments();
    const activeWebhooks = await WebhookModel.countDocuments({ isActive: true });

    // Statistiques des logs (dernières 24h)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const recentLogs = await WebhookLogModel.countDocuments({
      createdAt: { $gte: yesterday },
    });

    const successfulLogs = await WebhookLogModel.countDocuments({
      createdAt: { $gte: yesterday },
      success: true,
    });

    const failedLogs = await WebhookLogModel.countDocuments({
      createdAt: { $gte: yesterday },
      success: false,
    });

    // Webhooks les plus utilisés
    const topWebhooks = await WebhookLogModel.aggregate([
      {
        $match: {
          createdAt: { $gte: yesterday },
        },
      },
      {
        $group: {
          _id: '$webhookId',
          count: { $sum: 1 },
          successCount: {
            $sum: { $cond: ['$success', 1, 0] },
          },
          failureCount: {
            $sum: { $cond: ['$success', 0, 1] },
          },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 5,
      },
    ]);

    // Enrichir avec les infos webhook
    const enrichedTopWebhooks = await Promise.all(
      topWebhooks.map(async (item) => {
        const webhook = await WebhookModel.findById(item._id).select('name url').lean();
        return {
          ...item,
          webhook,
        };
      })
    );

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        overview: {
          totalWebhooks,
          activeWebhooks,
          recentLogs,
          successfulLogs,
          failedLogs,
          successRate: recentLogs > 0 ? Math.round((successfulLogs / recentLogs) * 100) : 0,
        },
        topWebhooks: enrichedTopWebhooks,
      },
    });
  } catch (error) {
    logger.error('❌ Erreur lors de la récupération des stats:', error);
    next(error);
  }
};
