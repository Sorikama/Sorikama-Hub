/**
 * Contrôleur pour les callbacks des services externes
 * Permet aux services de notifier Sorikama des événements (déconnexion, etc.)
 */

import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ServiceModel } from '../database/models/service.model';
import {
    revokeAuthorization,
    updateLastUsed,
    hasActiveAuthorization
} from '../services/authorization.service';
import { decryptUserId } from '../utils/encryption';
import { logger } from '../utils/logger';
import AppError from '../utils/AppError';

/**
 * POST /api/service-callback/logout
 * Notifier Sorikama qu'un utilisateur s'est déconnecté du service externe
 * 
 * Headers requis:
 * - X-Service-Api-Key: Clé API du service
 * - X-User-Id: ID utilisateur chiffré
 * 
 * Body:
 * - reason: Raison de la déconnexion (optionnel)
 */
export const handleServiceLogout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const serviceApiKey = req.headers['x-service-api-key'] as string;
        const encryptedUserId = req.headers['x-user-id'] as string;
        const { reason = 'user_logout' } = req.body;

        // ============================================
        // 1. VÉRIFIER LA CLÉ API DU SERVICE
        // ============================================

        if (!serviceApiKey) {
            return next(new AppError('Clé API manquante', StatusCodes.UNAUTHORIZED));
        }

        const service = await ServiceModel.findOne({
            apiKey: serviceApiKey,
            enabled: true
        });

        if (!service) {
            logger.warn('🚫 Tentative de callback avec clé API invalide', {
                apiKey: serviceApiKey.substring(0, 10) + '...',
                ip: req.ip
            });
            return next(new AppError('Clé API invalide', StatusCodes.UNAUTHORIZED));
        }

        // ============================================
        // 2. DÉCHIFFRER L'ID UTILISATEUR
        // ============================================

        if (!encryptedUserId) {
            return next(new AppError('ID utilisateur manquant', StatusCodes.BAD_REQUEST));
        }

        let userId: string;
        try {
            userId = decryptUserId(encryptedUserId);
        } catch (error) {
            logger.error('❌ Erreur déchiffrement userId:', error);
            return next(new AppError('ID utilisateur invalide', StatusCodes.BAD_REQUEST));
        }

        // ============================================
        // 3. RÉVOQUER L'AUTORISATION
        // ============================================

        logger.info('📞 Callback de déconnexion reçu', {
            service: service.name,
            serviceSlug: service.slug,
            userId,
            reason
        });

        const revoked = await revokeAuthorization({
            userId,
            serviceId: service._id.toString(),
            reason,
            revokedBy: 'service'
        });

        if (!revoked) {
            logger.warn('⚠️ Aucune autorisation active trouvée pour la révocation', {
                userId,
                serviceId: service._id
            });
        }

        // ============================================
        // 4. RETOURNER LA CONFIRMATION
        // ============================================

        res.status(StatusCodes.OK).json({
            status: 'success',
            message: 'Déconnexion enregistrée',
            data: {
                userId: encryptedUserId, // Retourner l'ID chiffré
                service: service.slug,
                revoked
            }
        });

    } catch (error) {
        logger.error('❌ Erreur callback déconnexion:', error);
        next(error);
    }
};

/**
 * POST /api/service-callback/session-activity
 * Notifier Sorikama de l'activité d'une session
 * Permet de mettre à jour lastUsedAt
 */
export const handleSessionActivity = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const serviceApiKey = req.headers['x-service-api-key'] as string;
        const encryptedUserId = req.headers['x-user-id'] as string;

        // Vérifier la clé API
        if (!serviceApiKey) {
            return next(new AppError('Clé API manquante', StatusCodes.UNAUTHORIZED));
        }

        const service = await ServiceModel.findOne({
            apiKey: serviceApiKey,
            enabled: true
        });

        if (!service) {
            return next(new AppError('Clé API invalide', StatusCodes.UNAUTHORIZED));
        }

        // Déchiffrer l'ID utilisateur
        if (!encryptedUserId) {
            return next(new AppError('ID utilisateur manquant', StatusCodes.BAD_REQUEST));
        }

        let userId: string;
        try {
            userId = decryptUserId(encryptedUserId);
        } catch (error) {
            return next(new AppError('ID utilisateur invalide', StatusCodes.BAD_REQUEST));
        }

        // Mettre à jour lastUsedAt
        await updateLastUsed(userId, service._id.toString());

        res.status(StatusCodes.OK).json({
            status: 'success',
            message: 'Activité enregistrée'
        });

    } catch (error) {
        logger.error('❌ Erreur callback activité:', error);
        next(error);
    }
};

/**
 * GET /api/service-callback/verify-authorization
 * Vérifier si un utilisateur a une autorisation active
 */
export const verifyServiceAuthorization = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const serviceApiKey = req.headers['x-service-api-key'] as string;
        const encryptedUserId = req.headers['x-user-id'] as string;

        // Vérifier la clé API
        if (!serviceApiKey) {
            return next(new AppError('Clé API manquante', StatusCodes.UNAUTHORIZED));
        }

        const service = await ServiceModel.findOne({
            apiKey: serviceApiKey,
            enabled: true
        });

        if (!service) {
            return next(new AppError('Clé API invalide', StatusCodes.UNAUTHORIZED));
        }

        // Déchiffrer l'ID utilisateur
        if (!encryptedUserId) {
            return next(new AppError('ID utilisateur manquant', StatusCodes.BAD_REQUEST));
        }

        let userId: string;
        try {
            userId = decryptUserId(encryptedUserId);
        } catch (error) {
            return next(new AppError('ID utilisateur invalide', StatusCodes.BAD_REQUEST));
        }

        // Vérifier l'autorisation
        const hasAuth = await hasActiveAuthorization(userId, service._id.toString());

        res.status(StatusCodes.OK).json({
            status: 'success',
            data: {
                authorized: hasAuth,
                userId: encryptedUserId,
                service: service.slug
            }
        });

    } catch (error) {
        logger.error('❌ Erreur vérification autorisation:', error);
        next(error);
    }
};
