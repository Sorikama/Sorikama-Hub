// src/utils/email.ts
import nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';
import path from 'path';
import { logger } from './logger';
import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM, NODE_ENV } from '../config';

interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  context: object;
}

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: parseInt(SMTP_PORT, 10),
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

// --- DÉBUT DE LA CORRECTION ---

// Configure le moteur de templates pour qu'il intègre automatiquement les styles
transporter.use('compile', hbs({
  viewEngine: {
    extname: '.hbs',
    layoutsDir: path.resolve('./src/templates/layouts/'),
    defaultLayout: 'main',
  },
  viewPath: path.resolve('./src/templates/'),
  extName: '.hbs',
  // Ajoute l'intégration automatique des styles avec Juice
  juice: true 
}));

/**
 * Envoie un email en utilisant un template HTML.
 * Le rendu et l'intégration des styles sont gérés automatiquement par le plugin.
 * @param options - Les options de l'email.
 */
export const sendEmail = async (options: EmailOptions) => {
  const mailOptions = {
    from: EMAIL_FROM,
    to: options.to,
    subject: options.subject,
    template: options.template, // Le plugin utilisera ce template
    context: {
      ...options.context,
      currentYear: new Date().getFullYear(),
    },
  };

  try {
    // Le plugin intercepte .sendMail(), rend le template, intègre les styles,
    // puis envoie l'email finalisé.
    const info = await transporter.sendMail(mailOptions);

    logger.info(`Email envoyé avec succès à ${options.to}. Message ID: ${info.messageId}`);
    if (NODE_ENV === 'development' && info) {
      const testUrl = nodemailer.getTestMessageUrl(info);
      if (testUrl) {
        logger.info(`Lien de prévisualisation: ${testUrl}`);
      }
    }
  } catch (error) {
    logger.error(`Erreur lors de l'envoi de l'email à ${options.to}`, error);
    // On propage l'erreur pour que le contrôleur la gère
    throw new Error("Impossible d'envoyer l'email.");
  }
};