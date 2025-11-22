// src/utils/email.ts
import nodemailer from 'nodemailer';
import path from 'path';
// @ts-ignore - pas de types disponibles pour ce module
import hbs from 'nodemailer-express-handlebars';
import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM } from '../config';
import { logger } from './logger';

/**
 * Interface pour les options d'envoi d'email
 */
interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  context: Record<string, any>;
}

/**
 * Crée et configure le transporteur nodemailer
 */
const createTransporter = () => {
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT, 10),
    secure: parseInt(SMTP_PORT, 10) === 465, // true pour le port 465, false pour les autres
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  // Configuration de Handlebars pour les templates d'emails
  const handlebarOptions = {
    viewEngine: {
      extName: '.hbs',
      partialsDir: path.resolve(__dirname, '../../public/email-templates'),
      defaultLayout: false,
    },
    viewPath: path.resolve(__dirname, '../../public/email-templates'),
    extName: '.hbs',
  };

  transporter.use('compile', hbs(handlebarOptions));

  return transporter;
};

/**
 * Envoie un email en utilisant un template Handlebars
 * @param options - Options d'envoi (destinataire, sujet, template, contexte)
 */
export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `Sorikama <${EMAIL_FROM}>`,
      to: options.to,
      subject: options.subject,
      template: options.template,
      context: options.context,
    };

    await transporter.sendMail(mailOptions);
    
    logger.info(`Email envoyé avec succès à ${options.to}`, {
      template: options.template,
      subject: options.subject,
    });
  } catch (error) {
    logger.error('Erreur lors de l\'envoi de l\'email:', error);
    throw new Error('Impossible d\'envoyer l\'email');
  }
};

/**
 * Envoie un email simple sans template
 * @param to - Destinataire
 * @param subject - Sujet
 * @param text - Contenu texte
 * @param html - Contenu HTML (optionnel)
 */
export const sendSimpleEmail = async (
  to: string,
  subject: string,
  text: string,
  html?: string
): Promise<void> => {
  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT, 10),
      secure: parseInt(SMTP_PORT, 10) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `Sorikama <${EMAIL_FROM}>`,
      to,
      subject,
      text,
      html: html || text,
    };

    await transporter.sendMail(mailOptions);
    
    logger.info(`Email simple envoyé avec succès à ${to}`, { subject });
  } catch (error) {
    logger.error('Erreur lors de l\'envoi de l\'email simple:', error);
    throw new Error('Impossible d\'envoyer l\'email');
  }
};
