// src/auth/auth.service.ts
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  JWT_REFRESH_SECRET,
} from '../config';
import AppError from '../utils/AppError';
import { StatusCodes } from 'http-status-codes';
import { v4 as uuidv4 } from 'uuid';
import { RefreshTokenModel } from '../database/models/refreshtoken.model';

/**
 * Interface pour le payload utilisateur
 */
interface UserPayload {
  id: string;
  roles: string[];
  permissions: string[];
}

/**
 * Interface pour les tokens
 */
interface Tokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Génère une paire de tokens (accès et rafraîchissement) pour un utilisateur.
 *
 * @param {UserPayload} payload - Les informations à inclure dans le payload du JWT d'accès.
 * @param {boolean} rememberMe - Si true, le refresh token dure 30 jours, sinon 7 jours.
 * @returns {Promise<Tokens>} Une promesse qui se résout avec les tokens générés.
 * @throws {AppError} Si les secrets JWT ne sont pas configurés.
 */
export const generateTokens = async (payload: UserPayload, rememberMe: boolean = false): Promise<Tokens> => {
  if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
    throw new AppError(
      'Les secrets JWT ne sont pas définis dans les variables d\'environnement.',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  // 1. Crée l'access token avec le payload complet (id, rôles, permissions)
  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN || '1h',
  } as jwt.SignOptions);

  // 2. Crée un refresh token unique et sécurisé
  const refreshToken = uuidv4();
  
  // 3. Détermine la durée de validité du refresh token
  // Si "Se souvenir de moi" : 30 jours, sinon : 7 jours
  const expiresInDays = rememberMe ? 30 : 7;
  
  // 4. Stocke le refresh token en base de données avec sa date d'expiration
  await storeRefreshToken(refreshToken, payload.id, expiresInDays);

  return { accessToken, refreshToken };
};

/**
 * Vérifie la validité d'un token JWT.
 *
 * @param {string} token - Le token JWT à vérifier.
 * @param {string} [secret='access'] - Le type de secret à utiliser ('access' ou 'refresh').
 * @returns {string | JwtPayload} Le payload décodé du token.
 * @throws {AppError} Si le token est invalide, expiré, ou que le secret est manquant.
 */
export const verifyToken = (token: string, secret: 'access' | 'refresh' = 'access'): string | JwtPayload => {
  const secretKey = secret === 'access' ? JWT_SECRET : JWT_REFRESH_SECRET;

  if (!secretKey) {
    throw new AppError(
      `Le secret JWT pour le token de type '${secret}' n'est pas défini.`,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  try {
    // La fonction `verify` décode le payload et vérifie la signature et l'expiration
    return jwt.verify(token, secretKey as string);
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
 * @param {number} expiresInDays - Nombre de jours avant expiration (7 ou 30).
 * @returns {Promise<void>}
 */
const storeRefreshToken = async (token: string, userId: string, expiresInDays: number = 7): Promise<void> => {
  // Calcule la date d'expiration en jours
  const expiresInMs = expiresInDays * 24 * 60 * 60 * 1000; // Convertir jours en millisecondes
  const expiresAt = new Date(Date.now() + expiresInMs);
  
  // Crée un nouveau document pour le token de rafraîchissement
  await RefreshTokenModel.create({
    token: token, // Le token lui-même est chiffré par le setter du modèle Mongoose
    user: userId,
    expiresAt: expiresAt,
  });
};

