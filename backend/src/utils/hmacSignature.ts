/**
 * Service de signature HMAC pour sécuriser les communications entre services
 * 
 * Utilisation :
 * - Sorikama Hub signe les headers avant de les envoyer à MaseBuy
 * - MaseBuy vérifie la signature pour s'assurer que les headers n'ont pas été forgés
 * 
 * Sécurité :
 * - HMAC-SHA256 pour la signature
 * - Timestamp pour éviter les replay attacks (validité 5 minutes)
 * - Secret partagé entre Hub et services
 */

import crypto from 'crypto';
import { logger } from './logger';

// Secret partagé - DOIT être le même entre Hub et tous les services
const HMAC_SECRET = process.env.SERVICE_HMAC_SECRET;

// Durée de validité d'une signature (5 minutes)
const SIGNATURE_VALIDITY_MS = 5 * 60 * 1000;

/**
 * Interface pour les données à signer
 */
export interface SignaturePayload {
  userId: string;
  userEmail: string;
  userRole: string;
  timestamp: number;
  serviceId: string;
}

/**
 * Vérifie que le secret HMAC est configuré
 */
function ensureSecretConfigured(): void {
  if (!HMAC_SECRET) {
    throw new Error(
      'SERVICE_HMAC_SECRET non configuré. ' +
      'Générez un secret avec: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"'
    );
  }
  
  if (HMAC_SECRET.length < 64) {
    throw new Error('SERVICE_HMAC_SECRET doit faire au moins 64 caractères (32 bytes en hex)');
  }
}

/**
 * Génère une signature HMAC pour les headers de service
 * 
 * @param payload - Données à signer
 * @returns Signature HMAC en hexadécimal
 */
export function generateSignature(payload: SignaturePayload): string {
  ensureSecretConfigured();
  
  // Créer une chaîne canonique des données
  const canonicalString = [
    payload.userId,
    payload.userEmail,
    payload.userRole,
    payload.timestamp.toString(),
    payload.serviceId
  ].join('|');
  
  // Générer la signature HMAC-SHA256
  const signature = crypto
    .createHmac('sha256', HMAC_SECRET!)
    .update(canonicalString)
    .digest('hex');
  
  logger.debug('Signature HMAC générée', {
    serviceId: payload.serviceId,
    timestamp: payload.timestamp
  });
  
  return signature;
}

/**
 * Vérifie une signature HMAC
 * 
 * @param signature - Signature à vérifier
 * @param payload - Données qui ont été signées
 * @returns true si la signature est valide
 */
export function verifySignature(signature: string, payload: SignaturePayload): boolean {
  ensureSecretConfigured();
  
  try {
    // Vérifier que le timestamp n'est pas trop ancien (protection replay attack)
    const now = Date.now();
    const age = now - payload.timestamp;
    
    if (age > SIGNATURE_VALIDITY_MS) {
      logger.warn('Signature expirée', {
        age: `${Math.floor(age / 1000)}s`,
        maxAge: `${SIGNATURE_VALIDITY_MS / 1000}s`
      });
      return false;
    }
    
    if (age < -60000) { // Timestamp dans le futur (tolérance 1 minute)
      logger.warn('Timestamp dans le futur', {
        timestamp: payload.timestamp,
        now
      });
      return false;
    }
    
    // Générer la signature attendue
    const expectedSignature = generateSignature(payload);
    
    // Comparaison sécurisée (protection timing attack)
    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
    
    if (!isValid) {
      logger.warn('Signature invalide', {
        serviceId: payload.serviceId,
        userEmail: payload.userEmail
      });
    }
    
    return isValid;
    
  } catch (error) {
    logger.error('Erreur lors de la vérification de signature:', error);
    return false;
  }
}

/**
 * Génère un secret HMAC aléatoire sécurisé
 * À utiliser pour générer SERVICE_HMAC_SECRET
 * 
 * @returns Secret en hexadécimal (128 caractères = 64 bytes)
 */
export function generateHmacSecret(): string {
  return crypto.randomBytes(64).toString('hex');
}

/**
 * Crée les headers signés pour une requête de service
 * 
 * @param userId - ID de l'utilisateur
 * @param userEmail - Email de l'utilisateur
 * @param userRole - Rôle de l'utilisateur
 * @param serviceId - ID du service destinataire
 * @returns Headers avec signature
 */
export function createSignedHeaders(
  userId: string,
  userEmail: string,
  userRole: string,
  serviceId: string
): Record<string, string> {
  const timestamp = Date.now();
  
  const payload: SignaturePayload = {
    userId,
    userEmail,
    userRole,
    timestamp,
    serviceId
  };
  
  const signature = generateSignature(payload);
  
  return {
    'X-User-Id': userId,
    'X-User-Email': userEmail,
    'X-User-Role': userRole,
    'X-Timestamp': timestamp.toString(),
    'X-Service-Id': serviceId,
    'X-Signature': signature,
    'X-Proxied-By': 'Sorikama-Hub'
  };
}

/**
 * Vérifie les headers signés d'une requête
 * 
 * @param headers - Headers de la requête
 * @returns true si les headers sont valides
 */
export function verifySignedHeaders(headers: Record<string, string | undefined>): boolean {
  const signature = headers['x-signature'];
  const userId = headers['x-user-id'];
  const userEmail = headers['x-user-email'];
  const userRole = headers['x-user-role'];
  const timestamp = headers['x-timestamp'];
  const serviceId = headers['x-service-id'];
  const proxiedBy = headers['x-proxied-by'];
  
  // Vérifier que tous les headers requis sont présents
  if (!signature || !userId || !userEmail || !userRole || !timestamp || !serviceId || !proxiedBy) {
    logger.warn('Headers manquants pour vérification signature', {
      hasSignature: !!signature,
      hasUserId: !!userId,
      hasUserEmail: !!userEmail,
      hasUserRole: !!userRole,
      hasTimestamp: !!timestamp,
      hasServiceId: !!serviceId,
      hasProxiedBy: !!proxiedBy
    });
    return false;
  }
  
  // Vérifier que la requête vient bien de Sorikama Hub
  if (proxiedBy !== 'Sorikama-Hub') {
    logger.warn('Requête non proxifiée par Sorikama Hub', { proxiedBy });
    return false;
  }
  
  // Créer le payload pour vérification
  const payload: SignaturePayload = {
    userId,
    userEmail,
    userRole,
    timestamp: parseInt(timestamp, 10),
    serviceId
  };
  
  // Vérifier la signature
  return verifySignature(signature, payload);
}
