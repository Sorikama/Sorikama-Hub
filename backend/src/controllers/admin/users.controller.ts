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
 * Récupérer TOUS les utilisateurs sans pagination
 * 
 * Query params:
 * - search: recherche par email ou nom
 * - role: filtrer par rôle (user, admin)
 * - isBlocked: filtrer par statut bloqué (true, false)
 * - isActive: filtrer par statut actif (true, false)
 * - sortBy: champ de tri (createdAt, lastActivity, loginCount)
 * - sortOrder: ordre de tri (asc, desc)
 */
export const getAllUsersNoPagination = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Récupération des paramètres de requête
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

    // Construction du tri
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Récupération de TOUS les utilisateurs (sans pagination)
    const usersRaw = await UserModel.find(filter)
      .select('-password -passwordResetToken -passwordResetExpires')
      .sort(sort);

    // Convertir en objets simples avec décryptage
    const users = usersRaw.map(user => user.toObject());

    logger.info('📋 TOUS les utilisateurs récupérés (sans pagination)', {
      adminId: (req as any).user.id,
      total: users.length,
      filters: filter
    });

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        users,
        total: users.length
      }
    });

  } catch (error) {
    logger.error('❌ Erreur lors de la récupération de tous les utilisateurs:', error);
    next(error);
  }
};

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

    // Récupération des utilisateurs (sans .lean() pour garder les getters de décryptage)
    const usersRaw = await UserModel.find(filter)
      .select('-password -passwordResetToken -passwordResetExpires')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Convertir en objets simples avec décryptage
    const users = usersRaw.map(user => user.toObject());

    // Comptage total pour la pagination
    const total = await UserModel.countDocuments(filter);

    logger.info('📋 Liste des utilisateurs récupérée', {
      adminId: (req as any).user.id,
      page,
      limit,
      total,
      usersCount: users.length,
      filters: filter
    });

    // Log pour debug
    console.log('🔍 DEBUG - Utilisateurs trouvés:', users.length);
    console.log('🔍 DEBUG - Total en base:', total);
    if (users.length > 0) {
      console.log('🔍 DEBUG - Premier utilisateur:', {
        id: users[0]._id,
        email: users[0].email,
        role: users[0].role
      });
    }

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
 * Télécharger un fichier template pour l'import
 */
export const downloadTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const format = (req.query.format as string) || 'csv';

    if (format === 'csv') {
      const csvContent = `email,firstName,lastName,role
john.doe@example.com,John,Doe,user
jane.smith@example.com,Jane,Smith,user
admin.test@example.com,Admin,Test,admin
alice.martin@example.com,Alice,Martin,user
bob.wilson@example.com,Bob,Wilson,user`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="template-import-users.csv"');
      res.send('\uFEFF' + csvContent); // BOM pour Excel
    } else if (format === 'json') {
      const jsonContent = [
        {
          email: 'john.doe@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'user'
        },
        {
          email: 'jane.smith@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
          role: 'user'
        },
        {
          email: 'admin.test@example.com',
          firstName: 'Admin',
          lastName: 'Test',
          role: 'admin'
        }
      ];

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="template-import-users.json"');
      res.json(jsonContent);
    } else {
      throw new AppError('Format non supporté', StatusCodes.BAD_REQUEST);
    }

    logger.info('📥 Template téléchargé', {
      adminId: (req as any).user.id,
      format
    });

  } catch (error) {
    logger.error('❌ Erreur lors du téléchargement du template:', error);
    next(error);
  }
};

/**
 * Importer des utilisateurs depuis un fichier
 */
export const importUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const mode = req.body.mode || 'create'; // create, update, merge
    
    // Vérifier si un fichier a été uploadé
    if (!req.body.file && !req.file) {
      throw new AppError('Aucun fichier fourni', StatusCodes.BAD_REQUEST);
    }

    // Pour l'instant, on attend les données en JSON dans le body
    // Dans une vraie implémentation, il faudrait utiliser multer pour gérer l'upload
    const usersData = req.body.users || [];

    if (!Array.isArray(usersData) || usersData.length === 0) {
      throw new AppError('Format de données invalide', StatusCodes.BAD_REQUEST);
    }

    let created = 0;
    let updated = 0;
    let errors = 0;
    const errorDetails: any[] = [];

    for (const userData of usersData) {
      try {
        const { email, firstName, lastName, role = 'user' } = userData;

        if (!email || !firstName || !lastName) {
          errors++;
          errorDetails.push({ email, error: 'Champs requis manquants' });
          continue;
        }

        // Vérifier si l'utilisateur existe
        const existingUser = await UserModel.findOne({ email });

        if (mode === 'create' && !existingUser) {
          // Créer un nouvel utilisateur
          await UserModel.create({
            email,
            firstName,
            lastName,
            role,
            isVerified: true,
            isActive: true,
            password: 'temp_password_' + Math.random().toString(36).slice(-8) // Mot de passe temporaire
          });
          created++;
        } else if (mode === 'update' && existingUser) {
          // Mettre à jour l'utilisateur existant
          existingUser.firstName = firstName;
          existingUser.lastName = lastName;
          if (role) existingUser.role = role;
          await existingUser.save();
          updated++;
        } else if (mode === 'merge') {
          if (existingUser) {
            // Mettre à jour
            existingUser.firstName = firstName;
            existingUser.lastName = lastName;
            if (role) existingUser.role = role;
            await existingUser.save();
            updated++;
          } else {
            // Créer
            await UserModel.create({
              email,
              firstName,
              lastName,
              role,
              isVerified: true,
              isActive: true,
              password: 'temp_password_' + Math.random().toString(36).slice(-8)
            });
            created++;
          }
        }
      } catch (error) {
        errors++;
        errorDetails.push({ 
          email: userData.email, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    logger.info('📥 Import utilisateurs terminé', {
      adminId: (req as any).user.id,
      mode,
      created,
      updated,
      errors
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: `Import terminé: ${created} créés, ${updated} mis à jour, ${errors} erreurs`,
      data: {
        created,
        updated,
        errors,
        errorDetails: errors > 0 ? errorDetails : undefined
      }
    });

  } catch (error) {
    logger.error('❌ Erreur lors de l\'import des utilisateurs:', error);
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
