// sorikama-gateway/src/auth/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Imports des modèles et services
import { UserModel } from '../database/models/user.model';
import { RoleModel } from '../database/models/role.model';
import { SimpleApiKeyModel } from '../database/models/simpleApiKey.model';
import { generateTokens } from './auth.service';
import { sendEmail } from '../utils/email';
import { createBlindIndex, encrypt } from '../utils/crypto';
import { generateUserApiKey } from '../utils/apiKeyGenerator';

// Imports des utilitaires et de la configuration
import AppError from '../utils/AppError';
import { logger } from '../utils/logger';
import { JWT_SECRET, BASE_URL } from '../config';
import { RefreshTokenModel } from '../database/models/refreshToken.model';

// ===================================================================================
// --- 🖋️ Processus d'Inscription ---
// ===================================================================================

/**
 * Gère la première étape de l'inscription.
 * Vérifie si l'email n'est pas déjà utilisé, génère un code de vérification,
 * et envoie ce code par email à l'utilisateur. Les données de l'inscription
 * sont stockées temporairement dans un JWT renvoyé au client.
 * @param {Request} req - L'objet de la requête Express.
 * @param {Response} res - L'objet de la réponse Express.
 * @param {NextFunction} next - Le prochain middleware.
 */
export const requestAccountVerification = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        // CORRIGÉ : Recherche performante et sécurisée par index aveugle (Blind Indexing)
        const emailHash = createBlindIndex(email);
        const existingUser = await UserModel.findOne({ emailHash });

        if (existingUser) {
            return next(new AppError('Un compte vérifié avec cet email existe déjà.', StatusCodes.CONFLICT));
        }

        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const pendingUserData = { firstName, lastName, email, password, code: verificationCode };
        const verificationToken = jwt.sign(pendingUserData, JWT_SECRET, { expiresIn: '10m' });

        await sendEmail({
            to: email,
            subject: 'Votre code de vérification Sorikama',
            template: 'accountVerification',
            context: {
                firstName,
                code: verificationCode,
            },
        });

        res.status(StatusCodes.OK).json({
            status: 'success',
            message: 'Un code de vérification a été envoyé à votre adresse email.',
            data: {
                verificationToken,
            },
        });

    } catch (error) {
        logger.error('Erreur lors de la demande de vérification de compte:', error);
        next(error);
    }
};

/**
 * Gère la deuxième étape de l'inscription.
 * Valide le token temporaire et le code de vérification. Si tout est correct,
 * crée le nouvel utilisateur dans la base de données, le connecte
 * et lui renvoie ses tokens d'authentification.
 * @param {Request} req - L'objet de la requête Express.
 * @param {Response} res - L'objet de la réponse Express.
 * @param {NextFunction} next - Le prochain middleware.
 */
export const verifyAndCreateAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { verificationToken, code } = req.body;

        let pendingUserData: any;
        try {
            pendingUserData = jwt.verify(verificationToken, JWT_SECRET);
        } catch (error) {
            return next(new AppError('Le token de vérification est invalide ou a expiré.', StatusCodes.BAD_REQUEST));
        }

        if (pendingUserData.code !== code) {
            return next(new AppError('Le code de vérification est incorrect.', StatusCodes.BAD_REQUEST));
        }

        const { firstName, lastName, email, password } = pendingUserData;

        const userRole = await RoleModel.findOne({ name: 'user' });
        if (!userRole) {
            return next(new AppError('Configuration initiale du serveur incomplète (rôle "user" manquant).', StatusCodes.INTERNAL_SERVER_ERROR));
        }

        const emailHash = createBlindIndex(email);

        // Générer une API Key unique pour l'utilisateur
        const userApiKey = await generateUserApiKey('temp_id', `${firstName} ${lastName}`);
        
        const newUser = await UserModel.create({
            firstName,
            lastName,
            email,
            emailHash,
            password,
            roles: [userRole._id],
            isVerified: true,
            apiKey: userApiKey,
        });
        
        // Mettre à jour l'API Key avec le vrai ID utilisateur
        await SimpleApiKeyModel.findOneAndUpdate(
            { keyId: userApiKey },
            { 
                userId: newUser._id,
                name: `User API Key - ${firstName} ${lastName}`,
                description: `Clé API personnelle pour ${firstName} ${lastName} (ID: ${newUser._id})`
            }
        );

        await newUser.populate<{
            roles: { permissions: any[] }[]
        }>({
            path: 'roles',
            populate: { path: 'permissions' }
        });

        const permissions = new Set<string>();
        newUser.roles.forEach(role => {
            (role as any).permissions.forEach((perm: any) => permissions.add(`${perm.action}:${perm.subject}`));
        });

        const payload = { id: newUser._id, roles: (newUser.roles as any[]).map(r => r.name), permissions: Array.from(permissions) };
        const tokens = await generateTokens(payload);

        res.status(StatusCodes.CREATED).json({
            status: 'success',
            message: 'Compte créé et vérifié avec succès.',
            data: {
                user: newUser,
                tokens: tokens,
            },
        });

    } catch (error) {
        logger.error('Erreur lors de la vérification et création du compte:', error);
        next(error);
    }
};

// ===================================================================================
// --- 🚪 Connexion / Déconnexion et Session ---
// ===================================================================================

/**
 * Gère la connexion d'un utilisateur.
 * @param {Request} req - L'objet de la requête Express.
 * @param {Response} res - L'objet de la réponse Express.
 * @param {NextFunction} next - Le prochain middleware.
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        const emailHash = createBlindIndex(email);
        const user = await UserModel.findOne({ emailHash }).select('+password').populate({
            path: 'roles',
            populate: { path: 'permissions' }
        });

        if (!user) {
            return next(new AppError('Email non trouvé.', StatusCodes.UNAUTHORIZED));
        }
        if (!(await user.comparePassword(password))) {
            return next(new AppError('Mot de passe incorrect.', StatusCodes.UNAUTHORIZED));
        }

        if (!user.isActive) {
            return next(new AppError('Ce compte a été désactivé.', StatusCodes.FORBIDDEN));
        }

        const permissions = new Set<string>();
        (user.roles as any[]).forEach(role => {
            role.permissions.forEach((perm: any) => permissions.add(`${perm.action}:${perm.subject}`));
        });

        const payload = {
            id: user._id,
            roles: (user.roles as any[]).map(r => r.name),
            permissions: Array.from(permissions),
        };

        const tokens = await generateTokens(payload);

        res.status(StatusCodes.OK).json({
            status: 'success',
            data: {
                user: user,
                tokens: tokens,
            },
        });

    } catch (error) {
        logger.error('Erreur lors de la connexion:', error);
        next(error);
    }
};

/**
 * Gère la déconnexion d'un utilisateur en invalidant son refresh token.
 * @param {Request} req - L'objet de la requête Express.
 * @param {Response} res - L'objet de la réponse Express.
 * @param {NextFunction} next - Le prochain middleware.
 */
export const logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return next(new AppError('Le refresh token est requis.', StatusCodes.BAD_REQUEST));
        }

        // Le token est chiffré en base de données, nous devons donc chiffrer celui
        // fourni par le client AVANT de faire la recherche.
        // C'est la correction clé qui permet une recherche directe et efficace.
        const encryptedToken = encrypt(refreshToken);

        // On cherche et supprime le token en une seule opération atomique.
        const result = await RefreshTokenModel.deleteOne({ token: encryptedToken });

        // Si result.deletedCount est 0, le token n'a pas été trouvé.
        // Ce n'est pas nécessairement une erreur (ex: l'utilisateur s'est déjà déconnecté),
        // mais on peut le logger pour information.
        if (result.deletedCount === 0) {
            logger.warn(`Tentative de déconnexion avec un refresh token inconnu ou déjà invalidé.`);
        }

        res.status(StatusCodes.OK).json({ status: 'success', message: 'Déconnexion réussie.' });
    } catch (error) {
        logger.error('Erreur lors de la déconnexion:', error);
        next(error);
    }
};

/**
 * Gère le rafraîchissement des tokens d'authentification.
 * @param {Request} req - L'objet de la requête Express.
 * @param {Response} res - L'objet de la réponse Express.
 * @param {NextFunction} next - Le prochain middleware.
 */
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { refreshToken } = req.body;
        const allTokens = await RefreshTokenModel.find({});
        const storedToken = allTokens.find(t => t.token === refreshToken);

        if (!storedToken || new Date() > storedToken.expiresAt) {
            return next(new AppError('Refresh token invalide ou expiré.', StatusCodes.UNAUTHORIZED));
        }

        const user = await UserModel.findById(storedToken.user).populate({
            path: 'roles',
            populate: { path: 'permissions' }
        });

        if (!user || !user.isActive) {
            return next(new AppError('Utilisateur non trouvé ou inactif.', StatusCodes.UNAUTHORIZED));
        }

        const permissions = new Set<string>();
        (user.roles as any[]).forEach(role => {
            role.permissions.forEach((perm: any) => permissions.add(`${perm.action}:${perm.subject}`));
        });

        const payload = { id: user._id, roles: (user.roles as any[]).map(r => r.name), permissions: Array.from(permissions) };
        const newTokens = await generateTokens(payload);

        await storedToken.deleteOne();

        res.status(StatusCodes.OK).json({ status: 'success', data: { user, tokens: newTokens } });
    } catch (error) {
        logger.error('Erreur lors du rafraîchissement du token:', error);
        next(error);
    }
};

// ===================================================================================
// --- 🔑 Gestion du Mot de Passe ---
// ===================================================================================

/**
 * Gère la demande de réinitialisation de mot de passe.
 * @param {Request} req - L'objet de la requête Express.
 * @param {Response} res - L'objet de la réponse Express.
 * @param {NextFunction} next - Le prochain middleware.
 */
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body;
        const emailHash = createBlindIndex(email);
        const user = await UserModel.findOne({ emailHash });

        if (user) {
            const resetToken = user.createPasswordResetToken();
            await user.save({ validateBeforeSave: false });
            const resetURL = `${BASE_URL}/api/v1/auth/reset-password/${resetToken}`;

            await sendEmail({
                to: user.email,
                subject: 'Réinitialisation de votre mot de passe (valide 10 min)',
                template: 'passwordReset',
                context: {
                    firstName: user.firstName,
                    url: resetURL,
                },
            });
        }

        res.status(StatusCodes.OK).json({
            status: 'success',
            message: 'Si un compte avec cet email existe, un lien de réinitialisation a été envoyé.',
        });
    } catch (error) {
        logger.error('Erreur lors de la demande de réinitialisation de mot de passe:', error);
        next(new AppError('Une erreur est survenue lors de l\'envoi de l\'email.', StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

/**
 * Gère la réinitialisation effective du mot de passe via un token.
 * @param {Request} req - L'objet de la requête Express.
 * @param {Response} res - L'objet de la réponse Express.
 * @param {NextFunction} next - Le prochain middleware.
 */
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        const user = await UserModel.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() },
        });

        if (!user) {
            return next(new AppError('Le token est invalide ou a expiré.', StatusCodes.BAD_REQUEST));
        }

        user.password = req.body.password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        res.status(StatusCodes.OK).json({
            status: 'success',
            message: 'Mot de passe réinitialisé avec succès.',
        });
    } catch (error) {
        logger.error('Erreur lors de la réinitialisation du mot de passe:', error);
        next(error);
    }
};

/**
 * Gère la mise à jour du mot de passe pour un utilisateur connecté.
 * @param {Request} req - L'objet de la requête Express authentifiée.
 * @param {Response} res - L'objet de la réponse Express.
 * @param {NextFunction} next - Le prochain middleware.
 */
export const updatePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await UserModel.findById(req.user._id).select('+password');

        if (!user || !(await user.comparePassword(currentPassword))) {
            return next(new AppError('Votre mot de passe actuel est incorrect.', StatusCodes.UNAUTHORIZED));
        }

        user.password = newPassword;
        await user.save();

        res.status(StatusCodes.OK).json({
            status: 'success',
            message: 'Mot de passe mis à jour avec succès.',
        });
    } catch (error) {
        logger.error('Erreur lors de la mise à jour du mot de passe:', error);
        next(error);
    }
};

// ===================================================================================
// --- 👤 Gestion du Profil Utilisateur ---
// ===================================================================================

/**
 * Récupère le profil de l'utilisateur actuellement connecté.
 * @param {Request} req - L'objet de la requête Express authentifiée.
 * @param {Response} res - L'objet de la réponse Express.
 */
export const getMe = (req: Request, res: Response) => {
    res.status(StatusCodes.OK).json({
        status: 'success',
        data: {
            user: req.user,
        },
    });
};

/**
 * Met à jour le profil (prénom, nom) de l'utilisateur connecté.
 * @param {Request} req - L'objet de la requête Express authentifiée.
 * @param {Response} res - L'objet de la réponse Express.
 * @param {NextFunction} next - Le prochain middleware.
 */
export const updateMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { firstName, lastName } = req.body;

        const user = await UserModel.findByIdAndUpdate(
            req.user._id,
            { firstName, lastName },
            { new: true, runValidators: true }
        );

        res.status(StatusCodes.OK).json({
            status: 'success',
            data: { user },
        });
    } catch (error) {
        logger.error('Erreur lors de la mise à jour du profil:', error);
        next(error);
    }
};

/**
 * Régénère l'API Key de l'utilisateur connecté.
 * @param {Request} req - L'objet de la requête Express authentifiée.
 * @param {Response} res - L'objet de la réponse Express.
 * @param {NextFunction} next - Le prochain middleware.
 */
export const regenerateApiKey = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        const { regenerateUserApiKey } = require('../utils/apiKeyGenerator');
        
        // Générer une nouvelle API Key
        const newApiKey = await regenerateUserApiKey(user._id, `${user.firstName} ${user.lastName}`);
        
        // Mettre à jour l'utilisateur avec la nouvelle clé
        await UserModel.findByIdAndUpdate(user._id, { apiKey: newApiKey });
        
        res.status(StatusCodes.OK).json({
            status: 'success',
            message: 'API Key régénérée avec succès.',
            data: { apiKey: newApiKey },
        });
    } catch (error) {
        logger.error('Erreur lors de la régénération de l\'API Key:', error);
        next(error);
    }
};