// src/utils/crypto.ts
import crypto from 'crypto';
import { ENCRYPTION_KEY, BLIND_INDEX_PEPPER } from '../config';

const ALGORITHM = 'aes-256-cbc';
// Le vecteur d'initialisation (IV) doit faire 16 bytes
const IV_LENGTH = 16;

// La clé doit faire exactement 32 bytes pour aes-256
// Si la clé est trop courte, on la complète avec des zéros
// Si elle est trop longue, on la tronque
const createKey = (keyString: string): Buffer => {
  const keyBuffer = Buffer.from(keyString, 'utf-8');
  if (keyBuffer.length === 32) {
    return keyBuffer;
  } else if (keyBuffer.length < 32) {
    // Compléter avec des zéros
    return Buffer.concat([keyBuffer, Buffer.alloc(32 - keyBuffer.length)]);
  } else {
    // Tronquer à 32 bytes
    return keyBuffer.slice(0, 32);
  }
};

const key = createKey(ENCRYPTION_KEY!);

/**
 * Chiffre une chaîne de caractères.
 * @param text Le texte à chiffrer.
 * @returns Le texte chiffré, préfixé par son IV.
 */
export const encrypt = (text: string): string => {
  // Si le texte est vide ou undefined, retourner tel quel
  if (!text) return text;
  
  // Si le texte est déjà chiffré (contient ':' et format hex valide), ne pas re-chiffrer
  if (text.includes(':')) {
    const parts = text.split(':');
    if (parts.length === 2 && /^[0-9a-f]+$/i.test(parts[0]) && /^[0-9a-f]+$/i.test(parts[1])) {
      return text; // Déjà chiffré
    }
  }
  
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
  // Si le texte est vide ou undefined, retourner tel quel
  if (!text) return text;
  
  const parts = text.split(':');
  if (parts.length !== 2) {
    // Si le format n'est pas valide, retourner le texte tel quel (peut-être pas chiffré)
    return text;
  }
  
  try {
    const iv = Buffer.from(parts.shift()!, 'hex');
    const encryptedText = parts.join(':');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

    let decrypted = decipher.update(encryptedText, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');

    return decrypted;
  } catch (error) {
    // En cas d'erreur de déchiffrement, retourner le texte original
    // (peut arriver si la clé a changé ou si le texte n'était pas chiffré)
    return text;
  }
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