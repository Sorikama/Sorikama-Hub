/**
 * Contrôleur pour la consultation de l'audit trail (Admin uniquement)
 */

import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AuditLogModel } from '../../database/models/auditLog.model';
import { UserModel } from '../../database/models/user.model';
import AppError from '../../utils/AppError';
import { logger } from '../../utils/logger';

/**
 * Récupérer les logs d'audit avec filtres
 */
export const getAuditLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    // Filtres
    const filter: any = {};

    if (req.query.userId) {
      filter.userId = req.query.userId;
    }

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.action) {
      filter.action = req.query.action;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.resource) {
      filter.resource = req.query.resource;
    }

    // Filtre de date
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) {
        filter.createdAt.$gte = new Date(req.query.startDate as string);
      }
      if (req.query.endDate) {
        filter.createdAt.$lte = new Date(req.query.endDate as string);
      }
    }

    // Recherche textuelle
    if (req.query.search) {
      filter.$or = [
        { action: { $regex: req.query.search, $options: 'i' } },
        { resource: { $regex: req.query.search, $options: 'i' } },
        { errorMessage: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const logs = await AuditLogModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await AuditLogModel.countDocuments(filter);

    // Enrichir avec les infos utilisateur
    const enrichedLogs = await Promise.all(
      logs.map(async (log) => {
        if (log.userId) {
          const user = await UserModel.findById(log.userId).select('firstName lastName email');
          return {
            ...log,
            user: user ? {
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
            } : null,
          };
        }
        return log;
      })
    );

    logger.info('📋 Logs d\'audit récupérés', {
      adminId: (req as any).user.id,
      count: logs.length,
      filters: filter,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        logs: enrichedLogs,
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
 * Récupérer les statistiques d'audit
 */
export const getAuditStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const since = new Date();
    since.setDate(since.getDate() - days);

    // Total de logs
    const totalLogs = await AuditLogModel.countDocuments({
      createdAt: { $gte: since },
    });

    // Logs par catégorie
    const logsByCategory = await AuditLogModel.aggregate([
      {
        $match: {
          createdAt: { $gte: since },
        },
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // Logs par statut
    const logsByStatus = await AuditLogModel.aggregate([
      {
        $match: {
          createdAt: { $gte: since },
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Actions les plus fréquentes
    const topActions = await AuditLogModel.aggregate([
      {
        $match: {
          createdAt: { $gte: since },
        },
      },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    // Utilisateurs les plus actifs
    const topUsers = await AuditLogModel.aggregate([
      {
        $match: {
          createdAt: { $gte: since },
          userId: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: '$userId',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
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
          count: item.count,
        };
      })
    );

    // Activité par jour
    const activityByDay = await AuditLogModel.aggregate([
      {
        $match: {
          createdAt: { $gte: since },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        overview: {
          totalLogs,
          period: `${days} derniers jours`,
        },
        logsByCategory,
        logsByStatus,
        topActions,
        topUsers: enrichedTopUsers,
        activityByDay,
      },
    });
  } catch (error) {
    logger.error('❌ Erreur lors de la récupération des stats:', error);
    next(error);
  }
};

/**
 * Exporter les logs en CSV
 */
export const exportAuditLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter: any = {};

    // Appliquer les mêmes filtres que getAuditLogs
    if (req.query.userId) filter.userId = req.query.userId;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.action) filter.action = req.query.action;
    if (req.query.status) filter.status = req.query.status;

    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) {
        filter.createdAt.$gte = new Date(req.query.startDate as string);
      }
      if (req.query.endDate) {
        filter.createdAt.$lte = new Date(req.query.endDate as string);
      }
    }

    const logs = await AuditLogModel.find(filter)
      .sort({ createdAt: -1 })
      .limit(10000) // Limite de sécurité
      .lean();

    // Enrichir avec les infos utilisateur
    const enrichedLogs = await Promise.all(
      logs.map(async (log) => {
        if (log.userId) {
          const user = await UserModel.findById(log.userId).select('firstName lastName email');
          return {
            ...log,
            userEmail: user?.email || '',
            userName: user ? `${user.firstName} ${user.lastName}` : '',
          };
        }
        return { ...log, userEmail: '', userName: '' };
      })
    );

    // Générer le CSV
    const csvHeader = 'Date,Utilisateur,Email,Action,Catégorie,Ressource,Statut,IP,Message\n';
    const csvRows = enrichedLogs.map(log => {
      return [
        new Date(log.createdAt).toISOString(),
        log.userName || '',
        log.userEmail || '',
        log.action,
        log.category,
        log.resource || '',
        log.status,
        log.ipAddress || '',
        log.errorMessage || '',
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
    }).join('\n');

    const csv = csvHeader + csvRows;

    logger.info('📥 Export des logs d\'audit', {
      adminId: (req as any).user.id,
      count: logs.length,
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${Date.now()}.csv"`);
    res.send(csv);
  } catch (error) {
    logger.error('❌ Erreur lors de l\'export:', error);
    next(error);
  }
};

/**
 * Exporter les logs en JSON
 */
export const exportAuditLogsJSON = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter: any = {};

    if (req.query.userId) filter.userId = req.query.userId;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.action) filter.action = req.query.action;
    if (req.query.status) filter.status = req.query.status;

    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) {
        filter.createdAt.$gte = new Date(req.query.startDate as string);
      }
      if (req.query.endDate) {
        filter.createdAt.$lte = new Date(req.query.endDate as string);
      }
    }

    const logs = await AuditLogModel.find(filter)
      .sort({ createdAt: -1 })
      .limit(10000)
      .lean();

    logger.info('📥 Export JSON des logs d\'audit', {
      adminId: (req as any).user.id,
      count: logs.length,
    });

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${Date.now()}.json"`);
    res.json({
      exportDate: new Date().toISOString(),
      count: logs.length,
      logs,
    });
  } catch (error) {
    logger.error('❌ Erreur lors de l\'export JSON:', error);
    next(error);
  }
};
