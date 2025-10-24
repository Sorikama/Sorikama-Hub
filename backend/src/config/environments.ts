// src/config/environments.ts
import dotenv from 'dotenv';

// Charge les variables du fichier .env dans process.env
dotenv.config();

/**
 * Valide que toutes les variables d'environnement nécessaires sont présentes.
 * Si une variable est manquante, le processus s'arrête avec une erreur claire.
 */
const validateEnvVars = () => {
  const requiredEnvVars = [
    'NODE_ENV',
    'PORT',
    'MONGO_URI',
    'JWT_SECRET',
    'JWT_EXPIRES_IN',
    'ENCRYPTION_KEY',
    'DEFAULT_ADMIN_EMAIL',
    'DEFAULT_ADMIN_PASSWORD',
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS',
    'EMAIL_FROM',
    'BASE_URL',
    'BLIND_INDEX_PEPPER',
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Erreur de configuration : Les variables d'environnement suivantes sont manquantes : ${missingVars.join(', ')}`
    );
  }
};

// Exécute la validation au démarrage
validateEnvVars();

// Exporte les variables de manière typée et sécurisée
export const {
  NODE_ENV,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRES_IN,
  MONGO_URI,
  DEFAULT_ADMIN_EMAIL,
  DEFAULT_ADMIN_PASSWORD,
  ENCRYPTION_KEY,
  SORISTORE_SERVICE_URL,
  SORIPAY_SERVICE_URL,
  SORIWALLET_SERVICE_URL,
  SORILEARN_SERVICE_URL,
  SORIHEALTH_SERVICE_URL,
  SORIACCESS_SERVICE_URL,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  EMAIL_FROM,
  BASE_URL,
  BLIND_INDEX_PEPPER,
} = process.env as { [key: string]: string }; // Assert que les variables existent après validation

// Exporte les variables numériques en les parsant
export const PORT = parseInt(process.env.PORT || '3000', 10);
export const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10); // 15 minutes par défaut
export const RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10);