// src/utils/crypto.ts
import crypto from 'crypto';
import { ENCRYPTION_KEY, BLIND_INDEX_PEPPER } from '../config';

const ALGORITHM = 'aes-256-cbc';
// La clé doit faire 32 bytes pour aes-256
const key = Buffer.from(ENCRYPTION_KEY!, 'utf-8');
// Le vecteur d'initialisation (IV) doit faire 16 bytes
const IV_LENGTH = 16;

/**
 * Chiffre une chaîne de caractères.
 * @param text Le texte à chiffrer.
 * @returns Le texte chiffré, préfixé par son IV.
 */
export const encrypt = (text: string): string => {
  // Génère un IV aléatoire pour chaque chiffrement pour plus de sécurité
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf-8', 'hex');
  encrypted += cipher.final('hex');

  // On stocke l'IV avec le texte chiffré pour pouvoir le déchiffrer
  return iv.toString('hex') + ':' + encrypted;
};

/**
 * Déchiffre une chaîne de caractères.
 * @param text Le texte chiffré (format: 'iv:encryptedText').
 * @returns Le texte original.
 */
export const decrypt = (text: string): string => {
  const parts = text.split(':');
  if (parts.length !== 2) {
    throw new Error('Format de texte chiffré invalide.');
  }
  const iv = Buffer.from(parts.shift()!, 'hex');
  const encryptedText = parts.join(':');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

  let decrypted = decipher.update(encryptedText, 'hex', 'utf-8');
  decrypted += decipher.final('utf-8');

  return decrypted;
};

/**
 * Crée un hash HMAC-SHA256 pour un champ donné.
 * Utilisé pour le "Blind Indexing" afin de pouvoir rechercher des valeurs chiffrées
 * de manière performante et sécurisée.
 * @param value La valeur à hacher (ex: l'email).
 * @returns Le hash en format hexadécimal.
 */
export const createBlindIndex = (value: string): string => {
  const hmac = crypto.createHmac('sha256', BLIND_INDEX_PEPPER);
  hmac.update(value);
  return hmac.digest('hex');
};