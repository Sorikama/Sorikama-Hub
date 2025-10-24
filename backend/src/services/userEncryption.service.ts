/**
 * Service de cryptage des identifiants utilisateurs
 * 
 * Génère un identifiant crypté unique par utilisateur et par service.
 * Cela permet aux services externes d'identifier les utilisateurs sans
 * connaître leur vrai ID Sorikama.
 * 
 * Exemple :
 * - User ID: "abc123"
 * - Service: "soristore"
 * - Encrypted ID: "enc_soristore_xyz789..."
 */

import crypto from 'crypto';
import { logger } from '../utils/logger';

// Clé secrète pour le cryptage (à mettre dans .env en production)
const ENCRYPTION_SECRET = process.env.USER_ENCRYPTION_SECRET || 'sorikama-user-encryption-secret-key-2024';

// Algorithme de cryptage
const ALGORITHM = 'aes-256-gcm';

export class UserEncryptionService {
  
  /**
   * Génère un identifiant crypté unique pour un utilisateur sur un service spécifique
   * 
   * @param userId - ID de l'utilisateur Sorikama
   * @param serviceId - ID du service externe
   * @returns Identifiant crypté (ex: "enc_soristore_abc123xyz...")
   */
  static encryptUserId(userId: string, serviceId: string): string {
    try {
      // Créer une clé dérivée unique pour ce service
      const serviceKey = crypto
        .createHash('sha256')
        .update(`${ENCRYPTION_SECRET}:${serviceId}`)
        .digest();

      // Générer un IV (Initialization Vector) aléatoire
      const iv = crypto.randomBytes(16);

      // Créer le cipher
      const cipher = crypto.createCipheriv(ALGORITHM, serviceKey, iv);

      // Crypter l'ID utilisateur
      let encrypted = cipher.update(userId, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      // Récupérer le tag d'authentification
      const authTag = cipher.getAuthTag();

      // Combiner IV + authTag + encrypted dans un seul string
      const combined = iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;

      // Encoder en base64 pour un format plus compact
      const encoded = Buffer.from(combined).toString('base64');

      // Préfixer avec le service pour faciliter le debug
      const encryptedId = `enc_${serviceId}_${encoded}`;

      logger.debug('🔐 ID utilisateur crypté', {
        userId: userId.substring(0, 8) + '...',
        serviceId,
        encryptedId: encryptedId.substring(0, 30) + '...'
      });

      return encryptedId;

    } catch (error) {
      logger.error('❌ Erreur lors du cryptage de l\'ID utilisateur:', error);
      throw new Error('Erreur de cryptage');
    }
  }

  /**
   * Décrypte un identifiant crypté pour retrouver l'ID utilisateur original
   * 
   * @param encryptedId - Identifiant crypté (ex: "enc_soristore_abc123...")
   * @param serviceId - ID du service externe
   * @returns ID utilisateur original
   */
  static decryptUserId(encryptedId: string, serviceId: string): string {
    try {
      // Vérifier le format
      if (!encryptedId.startsWith(`enc_${serviceId}_`)) {
        throw new Error('Format d\'ID crypté invalide');
      }

      // Extraire la partie encodée
      const encoded = encryptedId.replace(`enc_${serviceId}_`, '');

      // Décoder depuis base64
      const combined = Buffer.from(encoded, 'base64').toString('utf8');

      // Séparer IV, authTag et encrypted
      const parts = combined.split(':');
      if (parts.length !== 3) {
        throw new Error('Format d\'ID crypté invalide');
      }

      const iv = Buffer.from(parts[0], 'hex');
      const authTag = Buffer.from(parts[1], 'hex');
      const encrypted = parts[2];

      // Créer la clé dérivée pour ce service
      const serviceKey = crypto
        .createHash('sha256')
        .update(`${ENCRYPTION_SECRET}:${serviceId}`)
        .digest();

      // Créer le decipher
      const decipher = crypto.createDecipheriv(ALGORITHM, serviceKey, iv);
      decipher.setAuthTag(authTag);

      // Décrypter
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      logger.debug('🔓 ID utilisateur décrypté', {
        encryptedId: encryptedId.substring(0, 30) + '...',
        serviceId,
        userId: decrypted.substring(0, 8) + '...'
      });

      return decrypted;

    } catch (error) {
      logger.error('❌ Erreur lors du décryptage de l\'ID utilisateur:', error);
      throw new Error('Erreur de décryptage');
    }
  }

  /**
   * Génère un hash stable de l'ID utilisateur pour un service
   * Utile pour les services qui ont besoin d'un ID cohérent mais pas réversible
   * 
   * @param userId - ID de l'utilisateur
   * @param serviceId - ID du service
   * @returns Hash stable (ex: "hash_soristore_abc123...")
   */
  static hashUserId(userId: string, serviceId: string): string {
    const hash = crypto
      .createHmac('sha256', ENCRYPTION_SECRET)
      .update(`${userId}:${serviceId}`)
      .digest('hex');

    return `hash_${serviceId}_${hash}`;
  }

  /**
   * Vérifie si un ID crypté est valide pour un service donné
   * 
   * @param encryptedId - ID crypté à vérifier
   * @param serviceId - ID du service
   * @returns true si valide, false sinon
   */
  static isValidEncryptedId(encryptedId: string, serviceId: string): boolean {
    try {
      // Vérifier le format
      if (!encryptedId.startsWith(`enc_${serviceId}_`)) {
        return false;
      }

      // Tenter de décrypter
      this.decryptUserId(encryptedId, serviceId);
      return true;

    } catch (error) {
      return false;
    }
  }

  /**
   * Génère un token de session temporaire pour un utilisateur sur un service
   * Ce token expire après un certain temps
   * 
   * @param userId - ID de l'utilisateur
   * @param serviceId - ID du service
   * @param expiresIn - Durée de validité en secondes (défaut: 1 heure)
   * @returns Token de session
   */
  static generateSessionToken(userId: string, serviceId: string, expiresIn: number = 3600): string {
    const expiresAt = Date.now() + (expiresIn * 1000);
    const payload = `${userId}:${serviceId}:${expiresAt}`;
    
    const signature = crypto
      .createHmac('sha256', ENCRYPTION_SECRET)
      .update(payload)
      .digest('hex');

    const token = Buffer.from(`${payload}:${signature}`).toString('base64');
    
    return `session_${serviceId}_${token}`;
  }

  /**
   * Vérifie et décode un token de session
   * 
   * @param sessionToken - Token de session à vérifier
   * @param serviceId - ID du service
   * @returns Objet avec userId et serviceId si valide, null sinon
   */
  static verifySessionToken(sessionToken: string, serviceId: string): { userId: string; serviceId: string } | null {
    try {
      if (!sessionToken.startsWith(`session_${serviceId}_`)) {
        return null;
      }

      const encoded = sessionToken.replace(`session_${serviceId}_`, '');
      const decoded = Buffer.from(encoded, 'base64').toString('utf8');
      const parts = decoded.split(':');

      if (parts.length !== 4) {
        return null;
      }

      const [userId, tokenServiceId, expiresAt, signature] = parts;

      // Vérifier l'expiration
      if (Date.now() > parseInt(expiresAt)) {
        logger.warn('⏰ Token de session expiré', { userId, serviceId });
        return null;
      }

      // Vérifier la signature
      const payload = `${userId}:${tokenServiceId}:${expiresAt}`;
      const expectedSignature = crypto
        .createHmac('sha256', ENCRYPTION_SECRET)
        .update(payload)
        .digest('hex');

      if (signature !== expectedSignature) {
        logger.warn('⚠️ Signature de token invalide', { userId, serviceId });
        return null;
      }

      return { userId, serviceId: tokenServiceId };

    } catch (error) {
      logger.error('❌ Erreur lors de la vérification du token:', error);
      return null;
    }
  }
}
