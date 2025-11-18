/**
 * Contrôleur pour la gestion des sessions SSO utilisateur
 */

import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { SSOSessionModel } from '../database/models/ssoSession.model';
import { ServiceModel } from '../database/models/service.model';
import AppError from '../utils/AppError';
import { logger } from '../utils/logger';

/**
 * Récupérer toutes les sessions SSO actives de l'utilisateur
 */
export const getMySessions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;

    // Récupérer toutes les sessions actives
    const sessions = await SSOSessionModel.find({
      userId,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    // Enrichir avec les informations des services
    const enrichedSessions = await Promise.all(
      sessions.map(async (session) => {
        const service = await ServiceModel.findOne({ slug: session.serviceId });
        return {
          sessionId: session.sessionId,
          serviceId: session.serviceId,
          serviceName: service?.name || 'Service inconnu',
          serviceDescription: service?.description,
          serviceFrontendUrl: service?.frontendUrl,
          scopes: session.scopes,
          createdAt: session.createdAt,
          expiresAt: session.expiresAt
        };
      })
    );

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        sessions: enrichedSessions,
        total: enrichedSessions.length
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Révoquer une session SSO spécifique
 */
export const revokeSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { sessionId } = req.params;

    // Vérifier que la session appartient à l'utilisateur
    const session = await SSOSessionModel.findOne({
      sessionId,
      userId
    });

    if (!session) {
      throw new AppError('Session non trouvée', StatusCodes.NOT_FOUND);
    }

    // Supprimer la session
    await SSOSessionModel.deleteOne({ sessionId });

    logger.info(`Session SSO révoquée: ${sessionId} pour user ${userId}`);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Service déconnecté avec succès'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Révoquer toutes les sessions SSO de l'utilisateur
 */
export const revokeAllSessions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;

    const result = await SSOSessionModel.deleteMany({ userId });

    logger.info(`Toutes les sessions SSO révoquées pour user ${userId} (${result.deletedCount} sessions)`);

    res.status(StatusCodes.OK).json({
      success: true,
      message: `${result.deletedCount} service(s) déconnecté(s)`,
      data: {
        revokedCount: result.deletedCount
      }
    });

  } catch (error) {
    next(error);
  }
};
