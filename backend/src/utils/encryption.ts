/**
 * Service de chiffrement/déchiffrement pour les données sensibles
 * Utilisé pour chiffrer les IDs utilisateurs dans les tokens OAuth
 */

import crypto from 'crypto';
import { logger } from './logger';

// Clé de chiffrement (doit être en variable d'environnement en production)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'sorikama-encryption-key-32-chars!!'; // 32 caractères
const ENCRYPTION_ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // Pour AES, c'est toujours 16

/**
 * Générer une clé de chiffrement sécurisée
 * À utiliser une seule fois pour générer la clé à mettre dans .env
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Chiffrer une chaîne de caractères
 * 
 * @param text - Texte à chiffrer (ex: ID MongoDB)
 * @returns Texte chiffré en base64
 */
export function encrypt(text: string): string {
  try {
    // Créer un vecteur d'initialisation aléatoire
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Créer la clé de 32 bytes à partir de la clé d'environnement
    const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
    
    // Créer le cipher
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
    
    // Chiffrer le texte
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Retourner IV + texte chiffré (séparés par :)
    const result = iv.toString('hex') + ':' + encrypted;
    
    logger.debug('Texte chiffré avec succès');
    return result;
    
  } catch (error) {
    logger.error('Erreur lors du chiffrement:', error);
    throw new Error('Erreur de chiffrement');
  }
}

/**
 * Déchiffrer une chaîne de caractères
 * 
 * @param encryptedText - Texte chiffré (format: iv:encrypted)
 * @returns Texte déchiffré
 */
export function decrypt(encryptedText: string): string {
  try {
    // Séparer IV et texte chiffré
    const parts = encryptedText.split(':');
    
    if (parts.length !== 2) {
      throw new Error('Format de texte chiffré invalide');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    // Créer la clé de 32 bytes
    const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
    
    // Créer le decipher
    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
    
    // Déchiffrer
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    logger.debug('Texte déchiffré avec succès');
    return decrypted;
    
  } catch (error) {
    logger.error('Erreur lors du déchiffrement:', error);
    throw new Error('Erreur de déchiffrement');
  }
}

/**
 * Chiffrer un ID utilisateur
 * 
 * @param userId - ID MongoDB de l'utilisateur
 * @returns ID chiffré
 */
export function encryptUserId(userId: string): string {
  return encrypt(userId.toString());
}

/**
 * Déchiffrer un ID utilisateur
 * 
 * @param encryptedUserId - ID chiffré
 * @returns ID MongoDB original
 */
export function decryptUserId(encryptedUserId: string): string {
  return decrypt(encryptedUserId);
}

/**
 * Vérifier si un ID est chiffré (contient le séparateur :)
 * 
 * @param id - ID à vérifier
 * @returns true si l'ID est chiffré
 */
export function isEncryptedId(id: string): boolean {
  return id.includes(':') && id.split(':').length === 2;
}

/**
 * Chiffrer un objet utilisateur (chiffre uniquement l'ID)
 * 
 * @param user - Objet utilisateur
 * @returns Objet utilisateur avec ID chiffré
 */
export function encryptUserObject(user: any): any {
  return {
    ...user,
    id: encryptUserId(user.id || user._id)
  };
}

/**
 * Déchiffrer un objet utilisateur (déchiffre uniquement l'ID)
 * 
 * @param user - Objet utilisateur avec ID chiffré
 * @returns Objet utilisateur avec ID déchiffré
 */
export function decryptUserObject(user: any): any {
  if (!user.id) return user;
  
  return {
    ...user,
    id: isEncryptedId(user.id) ? decryptUserId(user.id) : user.id
  };
}
