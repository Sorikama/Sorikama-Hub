/**
 * Controller pour la création d'utilisateurs par un admin
 * L'utilisateur reçoit un email d'activation pour définir son mot de passe
 */

import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { UserModel } from '../../database/models/user.model';
import AppError from '../../utils/AppError';
import { logger } from '../../utils/logger';
import { createBlindIndex } from '../../utils/crypto';
import { sendActivationEmail } from '../../services/email.service';

/**
 * Créer un nouvel utilisateur SANS mot de passe
 * L'utilisateur recevra un email pour activer son compte
 */
export const createUserWithoutPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, firstName, lastName, role = 'user' } = req.body;

        // Validation
        if (!email || !firstName || !lastName) {
            throw new AppError(
                'Email, prénom et nom sont requis',
                StatusCodes.BAD_REQUEST
            );
        }

        // Vérifier si l'email existe déjà
        const emailHash = createBlindIndex(email);
        const existingUser = await UserModel.findOne({ emailHash });

        if (existingUser) {
            throw new AppError(
                'Un utilisateur avec cet email existe déjà',
                StatusCodes.CONFLICT
            );
        }

        // Créer l'utilisateur SANS mot de passe
        const user = new UserModel({
            email,
            emailHash,
            firstName,
            lastName,
            role,
            isActivated: false, // Pas encore activé
            isVerified: false,
            isActive: true,
            isBlocked: false
        });

        // Générer le token d'activation
        const activationToken = user.createActivationToken();
        await user.save();

        // Envoyer l'email d'activation
        try {
            await sendActivationEmail(user.email, user.firstName, user.lastName, activationToken);
        } catch (emailError) {
            logger.error('⚠️ Erreur envoi email (utilisateur créé quand même):', emailError);
        }

        logger.info('✅ Utilisateur créé sans mot de passe', {
            userId: user._id,
            email: user.email,
            role: user.role,
            createdBy: (req as any).user?.email
        });

        res.status(StatusCodes.CREATED).json({
            success: true,
            message: 'Utilisateur créé avec succès. Un email d\'activation a été envoyé.',
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    isActivated: user.isActivated,
                    activationToken // À retirer en production, juste pour les tests
                }
            }
        });
    } catch (error) {
        logger.error('❌ Erreur lors de la création de l\'utilisateur:', error);
        next(error);
    }
};

/**
 * Créer un utilisateur AVEC mot de passe (méthode classique)
 */
export const createUserWithPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, firstName, lastName, password, role = 'user' } = req.body;

        // Validation
        if (!email || !firstName || !lastName || !password) {
            throw new AppError(
                'Tous les champs sont requis',
                StatusCodes.BAD_REQUEST
            );
        }

        if (password.length < 8) {
            throw new AppError(
                'Le mot de passe doit contenir au moins 8 caractères',
                StatusCodes.BAD_REQUEST
            );
        }

        // Vérifier si l'email existe déjà
        const emailHash = createBlindIndex(email);
        const existingUser = await UserModel.findOne({ emailHash });

        if (existingUser) {
            throw new AppError(
                'Un utilisateur avec cet email existe déjà',
                StatusCodes.CONFLICT
            );
        }

        // Créer l'utilisateur avec mot de passe
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await UserModel.create({
            email,
            emailHash,
            firstName,
            lastName,
            password: hashedPassword,
            role,
            isActivated: true, // Déjà activé
            isVerified: true,
            isActive: true,
            isBlocked: false
        });

        logger.info('✅ Utilisateur créé avec mot de passe', {
            userId: user._id,
            email: user.email,
            role: user.role,
            createdBy: (req as any).user?.email
        });

        res.status(StatusCodes.CREATED).json({
            success: true,
            message: 'Utilisateur créé avec succès',
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    isActivated: user.isActivated
                }
            }
        });
    } catch (error) {
        logger.error('❌ Erreur lors de la création de l\'utilisateur:', error);
        next(error);
    }
};
