/**
 * Controller pour l'activation de compte
 * Gère la première connexion des utilisateurs créés par un admin
 */

import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { UserModel } from '../../database/models/user.model';
import AppError from '../../utils/AppError';
import { logger } from '../../utils/logger';
import { sendActivationEmail, sendWelcomeEmail } from '../../services/email.service';

/**
 * Vérifier si un token d'activation est valide
 */
export const checkActivationToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.params;

    // Hacher le token reçu pour le comparer avec celui en BDD
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Trouver l'utilisateur avec ce token et vérifier qu'il n'a pas expiré
    const user = await UserModel.findOne({
      activationToken: hashedToken,
      activationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new AppError(
        'Token d\'activation invalide ou expiré',
        StatusCodes.BAD_REQUEST
      );
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Token valide',
      data: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Activer le compte et définir le mot de passe
 */
export const activateAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    // Validation
    if (!password || !confirmPassword) {
      throw new AppError(
        'Le mot de passe et sa confirmation sont requis',
        StatusCodes.BAD_REQUEST
      );
    }

    if (password !== confirmPassword) {
      throw new AppError(
        'Les mots de passe ne correspondent pas',
        StatusCodes.BAD_REQUEST
      );
    }

    if (password.length < 8) {
      throw new AppError(
        'Le mot de passe doit contenir au moins 8 caractères',
        StatusCodes.BAD_REQUEST
      );
    }

    // Hacher le token reçu
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Trouver l'utilisateur
    const user = await UserModel.findOne({
      activationToken: hashedToken,
      activationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new AppError(
        'Token d\'activation invalide ou expiré',
        StatusCodes.BAD_REQUEST
      );
    }

    // Hacher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Mettre à jour l'utilisateur
    user.password = hashedPassword;
    user.isActivated = true;
    user.isVerified = true; // Activer aussi la vérification email
    user.activationToken = undefined;
    user.activationTokenExpires = undefined;
    await user.save();

    logger.info('✅ Compte activé avec succès', {
      userId: user._id,
      email: user.email
    });

    // Envoyer l'email de bienvenue
    try {
      await sendWelcomeEmail(user.email, user.firstName, user.lastName);
    } catch (emailError) {
      logger.error('⚠️ Erreur envoi email de bienvenue:', emailError);
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Compte activé avec succès ! Vous pouvez maintenant vous connecter.',
      data: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    logger.error('❌ Erreur lors de l\'activation du compte:', error);
    next(error);
  }
};

/**
 * Renvoyer un email d'activation
 */
export const resendActivationEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new AppError('Email requis', StatusCodes.BAD_REQUEST);
    }

    // Trouver l'utilisateur
    const user = await UserModel.findOne({ email });

    if (!user) {
      throw new AppError('Utilisateur non trouvé', StatusCodes.NOT_FOUND);
    }

    if (user.isActivated) {
      throw new AppError(
        'Ce compte est déjà activé',
        StatusCodes.BAD_REQUEST
      );
    }

    // Créer un nouveau token
    const activationToken = user.createActivationToken();
    await user.save();

    // Envoyer l'email d'activation
    try {
      await sendActivationEmail(user.email, user.firstName, user.lastName, activationToken);
    } catch (emailError) {
      logger.error('⚠️ Erreur envoi email:', emailError);
      throw new Error('Erreur lors de l\'envoi de l\'email');
    }

    logger.info('📧 Email d\'activation renvoyé', {
      userId: user._id,
      email: user.email
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Email d\'activation renvoyé avec succès'
    });
  } catch (error) {
    logger.error('❌ Erreur lors du renvoi de l\'email:', error);
    next(error);
  }
};
