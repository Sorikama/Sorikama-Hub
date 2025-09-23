// src/auth/auth.service.ts
import jwt from 'jsonwebtoken';
import {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRES_IN,
} from '../config';
import AppError from '../utils/AppError';
import { StatusCodes } from 'http-status-codes';
import { v4 as uuidv4 } from 'uuid';
import { RefreshTokenModel } from '../database/models/refreshToken.model';

/**
 * @typedef {object} UserPayload
 * @property {string} id - L'UUID de l'utilisateur.
 * @property {string[]} roles - Les noms des rôles de l'utilisateur.
 * @property {string[]} permissions - La liste consolidée des permissions de l'utilisateur.
 */
interface UserPayload {
  id: string;
  roles: string[];
  permissions: string[];
}

/**
 * @typedef {object} Tokens
 * @property {string} accessToken - Le jeton d'accès à courte durée de vie.
 * @property {string} refreshToken - Le jeton de rafraîchissement à longue durée de vie.
 */
interface Tokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Génère une paire de tokens (accès et rafraîchissement) pour un utilisateur.
 *
 * @param {UserPayload} payload - Les informations à inclure dans le payload du JWT d'accès.
 * @returns {Promise<Tokens>} Une promesse qui se résout avec les tokens générés.
 * @throws {AppError} Si les secrets JWT ne sont pas configurés.
 */
export const generateTokens = async (payload: UserPayload): Promise<Tokens> => {
  if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
    throw new AppError(
      'Les secrets JWT ne sont pas définis dans les variables d\'environnement.',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  // 1. Crée l'access token avec le payload complet (id, rôles, permissions)
  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  // 2. Crée un refresh token unique et sécurisé
  const refreshToken = uuidv4();
  
  // 3. Stocke le refresh token en base de données avec sa date d'expiration
  await storeRefreshToken(refreshToken, payload.id);

  return { accessToken, refreshToken };
};

/**
 * Vérifie la validité d'un token JWT.
 *
 * @param {string} token - Le token JWT à vérifier.
 * @param {string} [secret='access'] - Le type de secret à utiliser ('access' ou 'refresh').
 * @returns {object} Le payload décodé du token.
 * @throws {AppError} Si le token est invalide, expiré, ou que le secret est manquant.
 */
export const verifyToken = (token: string, secret: 'access' | 'refresh' = 'access'): object => {
  const secretKey = secret === 'access' ? JWT_SECRET : JWT_REFRESH_SECRET;

  if (!secretKey) {
    throw new AppError(
      `Le secret JWT pour le token de type '${secret}' n'est pas défini.`,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  try {
    // La fonction `verify` décode le payload et vérifie la signature et l'expiration
    return jwt.verify(token, secretKey);
  } catch (error) {
    // Si jwt.verify échoue (ex: signature invalide, token expiré), une erreur est levée.
    // On la capture pour renvoyer une erreur standardisée de notre application.
    throw new AppError('Token invalide ou expiré.', StatusCodes.UNAUTHORIZED);
  }
};


/**
 * Stocke un refresh token dans la base de données.
 *
 * @param {string} token - Le token de rafraîchissement à stocker.
 * @param {string} userId - L'ID de l'utilisateur associé.
 * @returns {Promise<void>}
 */
const storeRefreshToken = async (token: string, userId: string): Promise<void> => {
  // Calcule la date d'expiration en se basant sur la configuration (ex: "7d", "1h")
  const expiresInMs = ms(JWT_REFRESH_EXPIRES_IN || '7d');
  const expiresAt = new Date(Date.now() + expiresInMs);
  
  // Crée un nouveau document pour le token de rafraîchissement
  await RefreshTokenModel.create({
    token: token, // Le token lui-même est chiffré par le setter du modèle Mongoose
    user: userId,
    expiresAt: expiresAt,
  });
};

/**
 * Une petite fonction utilitaire pour convertir les chaînes de temps (ex: "7d", "1h") en millisecondes.
 * La bibliothèque `ms` fait très bien cela, mais voici une implémentation simple pour éviter d'ajouter une dépendance.
 * @param {string} str - La chaîne de temps.
 * @returns {number} La durée en millisecondes.
 */
const ms = (str: string): number => {
    const match = /^(\d+)([smhd])$/.exec(str);
    if (!match) return 0;

    const amount = parseInt(match[1]);
    const unit = match[2];

    switch(unit) {
        case 's': return amount * 1000;
        case 'm': return amount * 60 * 1000;
        case 'h': return amount * 60 * 60 * 1000;
        case 'd': return amount * 24 * 60 * 60 * 1000;
        default: return 0;
    }
}