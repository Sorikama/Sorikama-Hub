/**
 * Contrôleur pour la gestion des utilisateurs par l'administrateur
 * 
 * Toutes les fonctions de ce contrôleur sont réservées aux administrateurs
 */

import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { UserModel } from '../../database/models/user.model';
import { SSOSessionModel } from '../../database/models/ssoSession.model';
import AppError from '../../utils/AppError';
import { logger } from '../../utils/logger';

/**
 * Récupérer la liste de tous les utilisateurs avec filtres et pagination
 * 
 * Query params:
 * - page: numéro de page (défaut: 1)
 * - limit: nombre d'éléments par page (défaut: 20)
 * - search: recherche par email ou nom
 * - role: filtrer par rôle (user, admin)
 * - isBlocked: filtrer par statut bloqué (true, false)
 * - isActive: filtrer par statut actif (true, false)
 * - sortBy: champ de tri (createdAt, lastActivity, loginCount)
 * - sortOrder: ordre de tri (asc, desc)
 */
export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Récupération des paramètres de requête
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const role = req.query.role as string;
    const isBlocked = req.query.isBlocked as string;
    const isActive = req.query.isActive as string;
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as string) || 'desc';

    // Construction du filtre
    const filter: any = {};

    // Filtre de recherche (email ou nom)
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }

    // Filtre par rôle
    if (role) {
      filter.role = role;
    }

    // Filtre par statut bloqué
    if (isBlocked !== undefined) {
      filter.isBlocked = isBlocked === 'true';
    }

    // Filtre par statut actif
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    // Calcul de la pagination
    const skip = (page - 1) * limit;

    // Construction du tri
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Récupération des utilisateurs
    const users = await UserModel.find(filter)
      .select('-password -passwordResetToken -passwordResetExpires')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    // Comptage total pour la pagination
    const total = await UserModel.countDocuments(filter);

    logger.info('📋 Liste des utilisateurs récupérée', {
      adminId: (req as any).user.id,
      page,
      limit,
      total,
      filters: filter
    });

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    logger.error('❌ Erreur lors de la récupération des utilisateurs:', error);
    next(error);
  }
};

/**
 * Récupérer les détails d'un utilisateur spécifique
 */
export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    const user = await UserModel.findById(userId)
      .select('-password -passwordResetToken -passwordResetExpires')
      .lean();

    if (!user) {
      throw new AppError('Utilisateur non trouvé', StatusCodes.NOT_FOUND);
    }

    // Récupérer les sessions SSO actives
    const ssoSessions = await SSOSessionModel.find({
      userId,
      expiresAt: { $gt: new Date() }
    }).lean();

    logger.info('👤 Détails utilisateur récupérés', {
      adminId: (req as any).user.id,
      userId
    });

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        user,
        ssoSessions
      }
    });

  } catch (error) {
    logger.error('❌ Erreur lors de la récupération de l\'utilisateur:', error);
    next(error);
  }
};

/**
 * Bloquer un utilisateur
 */
export const blockUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    // Vérifier que l'utilisateur existe
    const user = await UserModel.findById(userId);

    if (!user) {
      throw new AppError('Utilisateur non trouvé', StatusCodes.NOT_FOUND);
    }

    // Empêcher de bloquer un admin
    if (user.role === 'admin') {
      throw new AppError('Impossible de bloquer un administrateur', StatusCodes.FORBIDDEN);
    }

    // Bloquer l'utilisateur
    user.isBlocked = true;
    user.blockedAt = new Date();
    user.blockedReason = reason || 'Bloqué par l\'administrateur';
    await user.save();

    // Révoquer toutes les sessions SSO actives
    await SSOSessionModel.deleteMany({ userId });

    logger.warn('🚫 Utilisateur bloqué', {
      adminId: (req as any).user.id,
      userId,
      reason
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Utilisateur bloqué avec succès',
      data: {
        userId,
        isBlocked: true,
        blockedAt: user.blockedAt,
        blockedReason: user.blockedReason
      }
    });

  } catch (error) {
    logger.error('❌ Erreur lors du blocage de l\'utilisateur:', error);
    next(error);
  }
};

/**
 * Débloquer un utilisateur
 */
export const unblockUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    const user = await UserModel.findById(userId);

    if (!user) {
      throw new AppError('Utilisateur non trouvé', StatusCodes.NOT_FOUND);
    }

    // Débloquer l'utilisateur
    user.isBlocked = false;
    user.blockedAt = undefined;
    user.blockedReason = undefined;
    await user.save();

    logger.info('✅ Utilisateur débloqué', {
      adminId: (req as any).user.id,
      userId
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Utilisateur débloqué avec succès',
      data: {
        userId,
        isBlocked: false
      }
    });

  } catch (error) {
    logger.error('❌ Erreur lors du déblocage de l\'utilisateur:', error);
    next(error);
  }
};

/**
 * Récupérer l'activité d'un utilisateur
 */
export const getUserActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const days = parseInt(req.query.days as string) || 30;

    const user = await UserModel.findById(userId);

    if (!user) {
      throw new AppError('Utilisateur non trouvé', StatusCodes.NOT_FOUND);
    }

    // Récupérer les sessions SSO (actives et expirées)
    const since = new Date();
    since.setDate(since.getDate() - days);

    const ssoSessions = await SSOSessionModel.find({
      userId,
      createdAt: { $gte: since }
    })
      .sort({ createdAt: -1 })
      .lean();

    // TODO: Ajouter d'autres types d'activité (logs, requêtes proxy, etc.)

    logger.info('📊 Activité utilisateur récupérée', {
      adminId: (req as any).user.id,
      userId,
      days
    });

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        userId,
        period: `${days} derniers jours`,
        activity: {
          ssoSessions,
          lastActivity: user.lastActivity,
          loginCount: user.loginCount
        }
      }
    });

  } catch (error) {
    logger.error('❌ Erreur lors de la récupération de l\'activité:', error);
    next(error);
  }
};

/**
 * Révoquer toutes les sessions d'un utilisateur
 */
export const revokeUserSessions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    const user = await UserModel.findById(userId);

    if (!user) {
      throw new AppError('Utilisateur non trouvé', StatusCodes.NOT_FOUND);
    }

    // Supprimer toutes les sessions SSO
    const result = await SSOSessionModel.deleteMany({ userId });

    logger.warn('🔒 Sessions utilisateur révoquées', {
      adminId: (req as any).user.id,
      userId,
      sessionsRevoked: result.deletedCount
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Toutes les sessions ont été révoquées',
      data: {
        userId,
        sessionsRevoked: result.deletedCount
      }
    });

  } catch (error) {
    logger.error('❌ Erreur lors de la révocation des sessions:', error);
    next(error);
  }
};

/**
 * Récupérer les statistiques d'un utilisateur
 */
export const getUserStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    const user = await UserModel.findById(userId);

    if (!user) {
      throw new AppError('Utilisateur non trouvé', StatusCodes.NOT_FOUND);
    }

    // Compter les sessions SSO actives
    const activeSessions = await SSOSessionModel.countDocuments({
      userId,
      expiresAt: { $gt: new Date() }
    });

    // Compter le total de sessions SSO créées
    const totalSessions = await SSOSessionModel.countDocuments({ userId });

    // TODO: Ajouter d'autres statistiques (requêtes proxy, services utilisés, etc.)

    const stats = {
      userId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      isBlocked: user.isBlocked,
      isVerified: user.isVerified,
      loginCount: user.loginCount,
      lastActivity: user.lastActivity,
      createdAt: user.createdAt,
      sso: {
        activeSessions,
        totalSessions
      }
    };

    logger.info('📈 Statistiques utilisateur récupérées', {
      adminId: (req as any).user.id,
      userId
    });

    res.status(StatusCodes.OK).json({
      success: true,
      data: stats
    });

  } catch (error) {
    logger.error('❌ Erreur lors de la récupération des statistiques:', error);
    next(error);
  }
};

/**
 * Récupérer les statistiques globales des utilisateurs
 */
export const getUsersOverview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Compter les utilisateurs par statut
    const totalUsers = await UserModel.countDocuments();
    const activeUsers = await UserModel.countDocuments({ isActive: true, isBlocked: false });
    const blockedUsers = await UserModel.countDocuments({ isBlocked: true });
    const verifiedUsers = await UserModel.countDocuments({ isVerified: true });
    const adminUsers = await UserModel.countDocuments({ role: 'admin' });

    // Utilisateurs créés dans les dernières 24h
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const newUsersToday = await UserModel.countDocuments({
      createdAt: { $gte: yesterday }
    });

    // Utilisateurs actifs dans les dernières 24h
    const activeToday = await UserModel.countDocuments({
      lastActivity: { $gte: yesterday }
    });

    const overview = {
      total: totalUsers,
      active: activeUsers,
      blocked: blockedUsers,
      verified: verifiedUsers,
      admins: adminUsers,
      newToday: newUsersToday,
      activeToday
    };

    logger.info('📊 Vue d\'ensemble des utilisateurs récupérée', {
      adminId: (req as any).user.id
    });

    res.status(StatusCodes.OK).json({
      success: true,
      data: overview
    });

  } catch (error) {
    logger.error('❌ Erreur lors de la récupération de la vue d\'ensemble:', error);
    next(error);
  }
};
