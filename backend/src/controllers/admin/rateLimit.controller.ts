/**
 * Contrôleur pour la gestion du rate limiting (Admin uniquement)
 */

import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { RateLimitModel } from '../../database/models/rateLimit.model';
import { UserModel } from '../../database/models/user.model';
import AppError from '../../utils/AppError';
import { logger } from '../../utils/logger';

/**
 * Récupérer les statistiques globales de rate limiting
 */
export const getRateLimitStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const now = new Date();

    // Utilisateurs actuellement bloqués
    const blockedUsers = await RateLimitModel.countDocuments({
      isBlocked: true,
      blockedUntil: { $gt: now },
    });

    // Total de requêtes dans la dernière heure
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const recentRequests = await RateLimitModel.aggregate([
      {
        $match: {
          lastRequest: { $gte: oneHourAgo },
        },
      },
      {
        $group: {
          _id: null,
          totalRequests: { $sum: '$requestCount' },
        },
      },
    ]);

    // Top utilisateurs par nombre de requêtes
    const topUsers = await RateLimitModel.aggregate([
      {
        $match: {
          lastRequest: { $gte: oneHourAgo },
        },
      },
      {
        $group: {
          _id: '$userId',
          totalRequests: { $sum: '$requestCount' },
          services: { $addToSet: '$service' },
        },
      },
      {
        $sort: { totalRequests: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    // Enrichir avec les infos utilisateur
    const enrichedTopUsers = await Promise.all(
      topUsers.map(async (item) => {
        const user = await UserModel.findById(item._id).select('firstName lastName email');
        return {
          userId: item._id,
          user: user ? {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
          } : null,
          totalRequests: item.totalRequests,
          services: item.services.filter(Boolean),
        };
      })
    );

    // Requêtes par service
    const requestsByService = await RateLimitModel.aggregate([
      {
        $match: {
          lastRequest: { $gte: oneHourAgo },
          service: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: '$service',
          totalRequests: { $sum: '$requestCount' },
          uniqueUsers: { $addToSet: '$userId' },
        },
      },
      {
        $project: {
          service: '$_id',
          totalRequests: 1,
          uniqueUsers: { $size: '$uniqueUsers' },
        },
      },
      {
        $sort: { totalRequests: -1 },
      },
    ]);

    logger.info('📊 Statistiques rate limiting récupérées', {
      adminId: (req as any).user.id,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        overview: {
          blockedUsers,
          totalRequests: recentRequests[0]?.totalRequests || 0,
          period: 'Dernière heure',
        },
        topUsers: enrichedTopUsers,
        requestsByService,
      },
    });
  } catch (error) {
    logger.error('❌ Erreur lors de la récupération des stats rate limiting:', error);
    next(error);
  }
};

/**
 * Récupérer les utilisateurs bloqués
 */
export const getBlockedUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const blockedEntries = await RateLimitModel.find({
      isBlocked: true,
      blockedUntil: { $gt: now },
    })
      .sort({ blockedUntil: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await RateLimitModel.countDocuments({
      isBlocked: true,
      blockedUntil: { $gt: now },
    });

    // Enrichir avec les infos utilisateur
    const enrichedEntries = await Promise.all(
      blockedEntries.map(async (entry) => {
        const user = await UserModel.findById(entry.userId).select('firstName lastName email');
        return {
          ...entry,
          user: user ? {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
          } : null,
          remainingTime: entry.blockedUntil ? Math.ceil((entry.blockedUntil.getTime() - now.getTime()) / 1000) : 0,
        };
      })
    );

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        blockedUsers: enrichedEntries,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    logger.error('❌ Erreur lors de la récupération des utilisateurs bloqués:', error);
    next(error);
  }
};

/**
 * Débloquer un utilisateur
 */
export const unblockUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    const result = await RateLimitModel.updateMany(
      { userId, isBlocked: true },
      {
        $set: {
          isBlocked: false,
          blockedUntil: undefined,
        },
      }
    );

    logger.info('✅ Utilisateur débloqué (rate limit)', {
      adminId: (req as any).user.id,
      userId,
      entriesUpdated: result.modifiedCount,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Utilisateur débloqué avec succès',
      data: {
        userId,
        entriesUpdated: result.modifiedCount,
      },
    });
  } catch (error) {
    logger.error('❌ Erreur lors du déblocage:', error);
    next(error);
  }
};

/**
 * Récupérer l'historique de rate limiting d'un utilisateur
 */
export const getUserRateLimitHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const days = parseInt(req.query.days as string) || 7;

    const since = new Date();
    since.setDate(since.getDate() - days);

    const history = await RateLimitModel.find({
      userId,
      createdAt: { $gte: since },
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    // Statistiques
    const stats = {
      totalRequests: history.reduce((sum, entry) => sum + entry.requestCount, 0),
      blockedCount: history.filter(entry => entry.isBlocked).length,
      services: [...new Set(history.map(entry => entry.service).filter(Boolean))],
    };

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        userId,
        period: `${days} derniers jours`,
        history,
        stats,
      },
    });
  } catch (error) {
    logger.error('❌ Erreur lors de la récupération de l\'historique:', error);
    next(error);
  }
};

/**
 * Nettoyer les anciennes entrées de rate limiting
 */
export const cleanupRateLimits = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const result = await RateLimitModel.deleteMany({
      windowEnd: { $lt: oneDayAgo },
      isBlocked: false,
    });

    logger.info('🧹 Nettoyage des rate limits', {
      adminId: (req as any).user.id,
      deletedCount: result.deletedCount,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Nettoyage effectué avec succès',
      data: {
        deletedCount: result.deletedCount,
      },
    });
  } catch (error) {
    logger.error('❌ Erreur lors du nettoyage:', error);
    next(error);
  }
};
