/**
 * Contrôleur pour la gestion de la suppression de compte
 */

import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { UserModel } from '../database/models/user.model';
import { SSOSessionModel } from '../database/models/ssoSession.model';
import AppError from '../utils/AppError';
import { logger } from '../utils/logger';
import crypto from 'crypto';
import { sendEmail } from '../services/email.service';
import { createBlindIndex } from '../utils/crypto';

/**
 * Planifier la suppression du compte
 * Nécessite confirmation avec email et nom complet
 */
export const scheduleDeletion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { email, fullName, reason } = req.body;

    // Validation
    if (!email || !fullName) {
      throw new AppError('Email et nom complet requis', StatusCodes.BAD_REQUEST);
    }

    // Récupérer l'utilisateur
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError('Utilisateur non trouvé', StatusCodes.NOT_FOUND);
    }

    // Vérifier l'email
    if (user.email.toLowerCase() !== email.toLowerCase()) {
      throw new AppError('L\'adresse email saisie ne correspond pas à votre compte. Veuillez vérifier et réessayer.', StatusCodes.BAD_REQUEST);
    }

    // Vérifier le nom complet
    const userFullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    if (userFullName !== fullName.toLowerCase()) {
      throw new AppError('Le nom complet saisi ne correspond pas. Veuillez saisir exactement : ' + user.firstName + ' ' + user.lastName, StatusCodes.BAD_REQUEST);
    }

    // Vérifier si déjà en attente de suppression
    if (user.accountStatus === 'pending_deletion') {
      throw new AppError('Votre compte est déjà en attente de suppression', StatusCodes.BAD_REQUEST);
    }

    // Récupérer les services connectés
    const connectedServices = await SSOSessionModel.find({
      userId,
      expiresAt: { $gt: new Date() }
    }).populate('serviceId');

    // Planifier la suppression dans 15 jours
    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + 15);

    user.accountStatus = 'pending_deletion';
    user.deletionScheduledAt = deletionDate;
    user.deletionReason = reason || 'Non spécifiée';
    await user.save();

    // Envoyer un email de confirmation
    try {
      await sendEmail({
        to: user.email,
        subject: 'Suppression de votre compte Sorikama',
        html: `
          <h2>Suppression de compte planifiée</h2>
          <p>Bonjour ${user.firstName},</p>
          <p>Votre demande de suppression de compte a été prise en compte.</p>
          <p><strong>Date de suppression définitive :</strong> ${deletionDate.toLocaleDateString('fr-FR')}</p>
          <p>Si vous changez d'avis, vous pouvez annuler cette suppression en vous connectant à votre compte.</p>
          <p><strong>Services qui seront déconnectés :</strong></p>
          <ul>
            ${connectedServices.map((s: any) => `<li>${s.serviceId?.name || 'Service'}</li>`).join('')}
          </ul>
          <p>Cordialement,<br>L'équipe Sorikama</p>
        `
      });
    } catch (emailError) {
      logger.error('Erreur envoi email suppression:', emailError);
    }

    logger.info(`Suppression planifiée pour l'utilisateur ${userId}`);

    // Supprimer les cookies pour déconnecter l'utilisateur
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Votre compte sera supprimé dans 15 jours. Vous avez été déconnecté.',
      data: {
        deletionDate,
        connectedServices: connectedServices.length,
        logout: true // Indiquer au frontend qu'il faut nettoyer le state
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Demander un code pour annuler la suppression
 */
export const requestCancellationCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;

    const user = await UserModel.findById(userId).select('+deletionCancellationToken +deletionCancellationExpires');
    if (!user) {
      throw new AppError('Utilisateur non trouvé', StatusCodes.NOT_FOUND);
    }

    if (user.accountStatus !== 'pending_deletion') {
      throw new AppError('Votre compte n\'est pas en attente de suppression', StatusCodes.BAD_REQUEST);
    }

    // Générer un code à 6 chiffres
    const code = user.createDeletionCancellationToken();
    await user.save();

    // Envoyer le code par email
    try {
      await sendEmail({
        to: user.email,
        subject: 'Code d\'annulation de suppression',
        html: `
          <h2>Annulation de suppression de compte</h2>
          <p>Bonjour ${user.firstName},</p>
          <p>Voici votre code pour annuler la suppression de votre compte :</p>
          <h1 style="font-size: 32px; letter-spacing: 5px; text-align: center; color: #2563eb;">${code}</h1>
          <p>Ce code est valide pendant 15 minutes.</p>
          <p>Si vous n'avez pas demandé ce code, ignorez cet email.</p>
          <p>Cordialement,<br>L'équipe Sorikama</p>
        `
      });
    } catch (emailError) {
      logger.error('Erreur envoi code annulation:', emailError);
      throw new AppError('Erreur lors de l\'envoi du code', StatusCodes.INTERNAL_SERVER_ERROR);
    }

    logger.info(`Code d'annulation envoyé à ${userId}`);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Un code a été envoyé à votre adresse email'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Annuler la suppression avec le code
 */
export const cancelDeletion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { code } = req.body;

    if (!code) {
      throw new AppError('Code requis', StatusCodes.BAD_REQUEST);
    }

    const user = await UserModel.findById(userId).select('+deletionCancellationToken +deletionCancellationExpires');
    if (!user) {
      throw new AppError('Utilisateur non trouvé', StatusCodes.NOT_FOUND);
    }

    if (user.accountStatus !== 'pending_deletion') {
      throw new AppError('Votre compte n\'est pas en attente de suppression', StatusCodes.BAD_REQUEST);
    }

    // Vérifier le code
    const hashedCode = crypto.createHash('sha256').update(code).digest('hex');

    if (!user.deletionCancellationToken || user.deletionCancellationToken !== hashedCode) {
      throw new AppError('Code invalide', StatusCodes.BAD_REQUEST);
    }

    if (!user.deletionCancellationExpires || user.deletionCancellationExpires < new Date()) {
      throw new AppError('Code expiré', StatusCodes.BAD_REQUEST);
    }

    // Annuler la suppression
    user.accountStatus = 'active';
    user.deletionScheduledAt = undefined;
    user.deletionReason = undefined;
    user.deletionCancellationToken = undefined;
    user.deletionCancellationExpires = undefined;
    await user.save();

    // Envoyer un email de confirmation
    try {
      await sendEmail({
        to: user.email,
        subject: 'Suppression de compte annulée',
        html: `
          <h2>Suppression annulée</h2>
          <p>Bonjour ${user.firstName},</p>
          <p>La suppression de votre compte a été annulée avec succès.</p>
          <p>Votre compte est de nouveau actif.</p>
          <p>Cordialement,<br>L'équipe Sorikama</p>
        `
      });
    } catch (emailError) {
      logger.error('Erreur envoi email annulation:', emailError);
    }

    logger.info(`Suppression annulée pour ${userId}`);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'La suppression de votre compte a été annulée'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Obtenir le statut de suppression
 */
export const getDeletionStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;

    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError('Utilisateur non trouvé', StatusCodes.NOT_FOUND);
    }

    // Récupérer les services connectés
    const connectedServices = await SSOSessionModel.find({
      userId,
      expiresAt: { $gt: new Date() }
    }).populate('serviceId');

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        accountStatus: user.accountStatus,
        deletionScheduledAt: user.deletionScheduledAt,
        deletionReason: user.deletionReason,
        connectedServices: connectedServices.map((s: any) => ({
          name: s.serviceId?.name,
          slug: s.serviceId?.slug,
          sessionId: s.sessionId
        }))
      }
    });

  } catch (error) {
    next(error);
  }
};


/**
 * Demander un code d'annulation (PUBLIC - sans authentification)
 */
export const requestCancellationCodePublic = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info('🔍 Début requestCancellationCodePublic');
    const { email } = req.body;

    if (!email) {
      logger.warn('⚠️ Email manquant dans la requête');
      throw new AppError('Email requis', StatusCodes.BAD_REQUEST);
    }

    logger.info(`📧 Recherche utilisateur pour: ${email}`);

    // Créer le hash de l'email pour la recherche (blind index)
    const emailHash = createBlindIndex(email);
    logger.info(`🔐 Hash créé: ${emailHash.substring(0, 10)}...`);

    // Trouver l'utilisateur par emailHash
    const user = await UserModel.findOne({ emailHash }).select('+deletionCancellationToken +deletionCancellationExpires +deletionCodeRequestCount +deletionCodeRequestResetAt');
    
    if (!user) {
      logger.info('ℹ️ Utilisateur non trouvé');
      throw new AppError('Une erreur est survenue lors de l\'envoi du code. Veuillez vérifier que l\'adresse email est conforme à celle de votre compte et réessayer.', StatusCodes.BAD_REQUEST);
    }

    logger.info(`👤 Utilisateur trouvé: ${user._id}, statut: ${user.accountStatus}`);

    if (user.accountStatus !== 'pending_deletion') {
      logger.info('ℹ️ Compte pas en pending_deletion');
      throw new AppError('Une erreur est survenue lors de l\'envoi du code. Veuillez vérifier que l\'adresse email est conforme à celle de votre compte et réessayer.', StatusCodes.BAD_REQUEST);
    }

    logger.info('✅ Compte en pending_deletion - vérification limitation de taux');

    // Vérifier la limitation de taux (max 3 demandes par heure)
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Réinitialiser le compteur si plus d'une heure s'est écoulée
    if (!user.deletionCodeRequestResetAt || user.deletionCodeRequestResetAt < oneHourAgo) {
      user.deletionCodeRequestCount = 0;
      user.deletionCodeRequestResetAt = now;
      logger.info('🔄 Compteur de demandes réinitialisé');
    }

    // Vérifier si la limite est atteinte
    if (user.deletionCodeRequestCount && user.deletionCodeRequestCount >= 3) {
      const resetTime = new Date(user.deletionCodeRequestResetAt!.getTime() + 60 * 60 * 1000);
      const minutesLeft = Math.ceil((resetTime.getTime() - now.getTime()) / (60 * 1000));
      logger.warn(`⚠️ Limite de demandes atteinte pour ${user._id}`);
      throw new AppError(
        `Trop de demandes de code. Veuillez réessayer dans ${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}.`,
        StatusCodes.TOO_MANY_REQUESTS
      );
    }

    logger.info('✅ Limitation OK - génération du code');

    // Incrémenter le compteur
    user.deletionCodeRequestCount = (user.deletionCodeRequestCount || 0) + 1;

    // Générer un code à 6 chiffres
    const code = user.createDeletionCancellationToken();
    await user.save();
    logger.info(`📊 Demande ${user.deletionCodeRequestCount}/3 pour cette heure`);
    logger.info(`🔢 Code généré et sauvegardé: ${code}`);

    // L'email est automatiquement déchiffré par Mongoose grâce au getter
    const userEmail = user.email;
    logger.info(`📬 Email déchiffré disponible: ${userEmail ? 'OUI' : 'NON'}`);

    // Envoyer le code par email
    try {
      logger.info(`📤 Tentative d'envoi email à: ${userEmail}`);
      await sendEmail({
        to: userEmail,
        subject: 'Code d\'annulation de suppression',
        html: `
          <h2>Annulation de suppression de compte</h2>
          <p>Bonjour ${user.firstName},</p>
          <p>Voici votre code pour annuler la suppression de votre compte :</p>
          <h1 style="font-size: 32px; letter-spacing: 5px; text-align: center; color: #111827;">${code}</h1>
          <p>Ce code est valide pendant 15 minutes.</p>
          <p>Si vous n'avez pas demandé ce code, ignorez cet email.</p>
          <p>Cordialement,<br>L'équipe Sorikama</p>
        `
      });
      
      logger.info(`✅ Code d'annulation envoyé avec succès`);
    } catch (emailError) {
      logger.error('❌ Erreur envoi code annulation:', emailError);
      // Ne pas bloquer le processus, le code est déjà sauvegardé en base
      // L'utilisateur peut redemander un code si besoin
      logger.warn('⚠️ Le code a été généré mais l\'email n\'a pas pu être envoyé');
    }

    logger.info('📨 Préparation de la réponse HTTP 200');
    // Toujours retourner un succès (le code est sauvegardé en base)
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Un code a été envoyé à votre adresse email'
    });
    logger.info('✅ Réponse envoyée avec succès');

  } catch (error) {
    logger.error('❌ Erreur dans requestCancellationCodePublic:', error);
    next(error);
  }
};

/**
 * Annuler la suppression avec le code (PUBLIC - sans authentification)
 */
export const cancelDeletionPublic = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      throw new AppError('Email et code requis', StatusCodes.BAD_REQUEST);
    }

    // Créer le hash de l'email pour la recherche (blind index)
    const emailHash = createBlindIndex(email);

    const user = await UserModel.findOne({ emailHash }).select('+deletionCancellationToken +deletionCancellationExpires');
    if (!user) {
      throw new AppError('Email ou code invalide', StatusCodes.BAD_REQUEST);
    }

    if (user.accountStatus !== 'pending_deletion') {
      throw new AppError('Ce compte n\'est pas en attente de suppression', StatusCodes.BAD_REQUEST);
    }

    // Vérifier le code
    const hashedCode = crypto.createHash('sha256').update(code).digest('hex');

    if (!user.deletionCancellationToken || user.deletionCancellationToken !== hashedCode) {
      throw new AppError('Code invalide', StatusCodes.BAD_REQUEST);
    }

    if (!user.deletionCancellationExpires || user.deletionCancellationExpires < new Date()) {
      throw new AppError('Code expiré. Veuillez demander un nouveau code.', StatusCodes.BAD_REQUEST);
    }

    // Annuler la suppression
    user.accountStatus = 'active';
    user.deletionScheduledAt = undefined;
    user.deletionReason = undefined;
    user.deletionCancellationToken = undefined;
    user.deletionCancellationExpires = undefined;
    await user.save();

    // Envoyer un email de confirmation
    try {
      await sendEmail({
        to: user.email,
        subject: 'Suppression de compte annulée',
        html: `
          <h2>Suppression annulée</h2>
          <p>Bonjour ${user.firstName},</p>
          <p>La suppression de votre compte a été annulée avec succès.</p>
          <p>Votre compte est de nouveau actif. Vous pouvez vous connecter dès maintenant.</p>
          <p>Cordialement,<br>L'équipe Sorikama</p>
        `
      });
    } catch (emailError) {
      logger.error('Erreur envoi email annulation:', emailError);
    }

    logger.info(`Suppression annulée pour ${email}`);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'La suppression de votre compte a été annulée. Vous pouvez maintenant vous connecter.'
    });

  } catch (error) {
    next(error);
  }
};
