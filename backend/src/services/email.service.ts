/**
 * Service d'envoi d'emails
 * Utilise Nodemailer pour envoyer des emails
 */

import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';
import path from 'path';
import fs from 'fs';

// Configuration du transporteur
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true pour 465, false pour les autres ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Vérifier la connexion au démarrage
transporter.verify((error, success) => {
  if (error) {
    logger.error('❌ Erreur de configuration email:', error);
  } else {
    logger.info('✅ Service email prêt');
  }
});

/**
 * Charger un template HTML
 */
const loadTemplate = (templateName: string): string => {
  const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.html`);
  try {
    return fs.readFileSync(templatePath, 'utf-8');
  } catch (error) {
    logger.error(`❌ Erreur chargement template ${templateName}:`, error);
    return '';
  }
};

/**
 * Remplacer les variables dans un template
 */
const replaceVariables = (template: string, variables: Record<string, string>): string => {
  let result = template;
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, variables[key]);
  });
  return result;
};

/**
 * Envoyer un email d'activation de compte
 */
export const sendActivationEmail = async (
  email: string,
  firstName: string,
  lastName: string,
  activationToken: string
): Promise<void> => {
  try {
    const activationUrl = `${process.env.FRONTEND_URL}/activate-account/${activationToken}`;
    
    // Charger le template
    let htmlTemplate = loadTemplate('activation');
    
    // Si le template n'existe pas, utiliser un template par défaut
    if (!htmlTemplate) {
      htmlTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Bienvenue sur Sorikama Hub !</h1>
            </div>
            <div class="content">
              <p>Bonjour <strong>{{firstName}} {{lastName}}</strong>,</p>
              <p>Votre compte a été créé avec succès ! Pour commencer à utiliser la plateforme, vous devez activer votre compte en définissant votre mot de passe.</p>
              <p style="text-align: center;">
                <a href="{{activationUrl}}" class="button">Activer mon compte</a>
              </p>
              <p><strong>Ce lien est valide pendant 7 jours.</strong></p>
              <p>Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
              <p style="word-break: break-all; color: #667eea;">{{activationUrl}}</p>
              <p>Si vous n'avez pas demandé la création de ce compte, vous pouvez ignorer cet email.</p>
            </div>
            <div class="footer">
              <p>© 2024 Sorikama Hub - Tous droits réservés</p>
            </div>
          </div>
        </body>
        </html>
      `;
    }
    
    // Remplacer les variables
    const html = replaceVariables(htmlTemplate, {
      firstName,
      lastName,
      activationUrl,
      year: new Date().getFullYear().toString()
    });

    // Envoyer l'email
    await transporter.sendMail({
      from: `"Sorikama Hub" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: '🎉 Activez votre compte Sorikama Hub',
      html,
    });

    logger.info('✅ Email d\'activation envoyé', { email });
  } catch (error) {
    logger.error('❌ Erreur envoi email d\'activation:', error);
    throw new Error('Erreur lors de l\'envoi de l\'email d\'activation');
  }
};

/**
 * Envoyer un email de bienvenue (après activation)
 */
export const sendWelcomeEmail = async (
  email: string,
  firstName: string,
  lastName: string
): Promise<void> => {
  try {
    let htmlTemplate = loadTemplate('welcome');
    
    if (!htmlTemplate) {
      htmlTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
            .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #10b981; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Compte activé avec succès !</h1>
            </div>
            <div class="content">
              <p>Bonjour <strong>{{firstName}} {{lastName}}</strong>,</p>
              <p>Félicitations ! Votre compte Sorikama Hub est maintenant actif. 🎉</p>
              
              <h3>🚀 Que pouvez-vous faire maintenant ?</h3>
              
              <div class="feature">
                <strong>🔐 Connexion unique (SSO)</strong><br>
                Accédez à tous vos services avec un seul compte
              </div>
              
              <div class="feature">
                <strong>👤 Profil personnalisé</strong><br>
                Gérez vos informations et préférences
              </div>
              
              <div class="feature">
                <strong>🔒 Sécurité renforcée</strong><br>
                Vos données sont protégées et chiffrées
              </div>
              
              <p style="text-align: center;">
                <a href="{{loginUrl}}" class="button">Se connecter maintenant</a>
              </p>
              
              <p>Besoin d'aide ? N'hésitez pas à contacter notre équipe de support.</p>
            </div>
            <div class="footer">
              <p>© {{year}} Sorikama Hub - Tous droits réservés</p>
            </div>
          </div>
        </body>
        </html>
      `;
    }
    
    const html = replaceVariables(htmlTemplate, {
      firstName,
      lastName,
      loginUrl: `${process.env.FRONTEND_URL}/login`,
      year: new Date().getFullYear().toString()
    });

    await transporter.sendMail({
      from: `"Sorikama Hub" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: '✅ Bienvenue sur Sorikama Hub !',
      html,
    });

    logger.info('✅ Email de bienvenue envoyé', { email });
  } catch (error) {
    logger.error('❌ Erreur envoi email de bienvenue:', error);
    // Ne pas throw ici car ce n'est pas critique
  }
};

/**
 * Envoyer un email de réinitialisation de mot de passe
 */
export const sendPasswordResetEmail = async (
  email: string,
  firstName: string,
  resetToken: string
): Promise<void> => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    let htmlTemplate = loadTemplate('password-reset');
    
    if (!htmlTemplate) {
      htmlTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Réinitialisation de mot de passe</h1>
            </div>
            <div class="content">
              <p>Bonjour <strong>{{firstName}}</strong>,</p>
              <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
              <p style="text-align: center;">
                <a href="{{resetUrl}}" class="button">Réinitialiser mon mot de passe</a>
              </p>
              <div class="warning">
                <strong>⚠️ Important :</strong> Ce lien est valide pendant 10 minutes seulement.
              </div>
              <p>Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
              <p style="word-break: break-all; color: #f59e0b;">{{resetUrl}}</p>
              <p><strong>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</strong> Votre mot de passe actuel reste inchangé.</p>
            </div>
            <div class="footer">
              <p>© {{year}} Sorikama Hub - Tous droits réservés</p>
            </div>
          </div>
        </body>
        </html>
      `;
    }
    
    const html = replaceVariables(htmlTemplate, {
      firstName,
      resetUrl,
      year: new Date().getFullYear().toString()
    });

    await transporter.sendMail({
      from: `"Sorikama Hub" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: '🔐 Réinitialisation de votre mot de passe',
      html,
    });

    logger.info('✅ Email de réinitialisation envoyé', { email });
  } catch (error) {
    logger.error('❌ Erreur envoi email de réinitialisation:', error);
    throw new Error('Erreur lors de l\'envoi de l\'email');
  }
};

/**
 * Fonction générique pour envoyer un email
 */
export const sendEmail = async (options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<void> => {
  try {
    const mailOptions = {
      from: `"Sorikama Hub" <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''), // Fallback texte sans HTML
    };

    await transporter.sendMail(mailOptions);
    logger.info(`✅ Email envoyé à ${options.to}`);
  } catch (error) {
    logger.error('❌ Erreur envoi email:', error);
    throw new Error('Erreur lors de l\'envoi de l\'email');
  }
};

export default {
  sendActivationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendEmail,
};
