/**
 * Gestionnaire de secrets sécurisé
 * 
 * Gère le chargement et la validation des secrets critiques
 * Empêche le démarrage si les secrets ne sont pas configurés correctement
 * 
 * Sécurité :
 * - Validation stricte des secrets au démarrage
 * - Pas de valeurs par défaut pour les secrets critiques
 * - Génération de secrets sécurisés
 * - Rotation facilitée
 */

import crypto from 'crypto';
import { logger } from './logger';

/**
 * Interface pour les secrets de l'application
 */
export interface AppSecrets {
  jwtSecret: string;
  jwtRefreshSecret: string;
  encryptionKey: string;
  hmacSecret: string;
  blindIndexPepper: string;
}

/**
 * Configuration minimale requise pour les secrets
 */
const SECRET_REQUIREMENTS = {
  jwtSecret: { minLength: 64, name: 'JWT_SECRET' },
  jwtRefreshSecret: { minLength: 64, name: 'JWT_REFRESH_SECRET' },
  encryptionKey: { minLength: 64, name: 'ENCRYPTION_KEY' },
  hmacSecret: { minLength: 128, name: 'SERVICE_HMAC_SECRET' },
  blindIndexPepper: { minLength: 64, name: 'BLIND_INDEX_PEPPER' }
};

/**
 * Génère un secret aléatoire sécurisé
 * 
 * @param bytes - Nombre de bytes (sera converti en hex, donc 2x caractères)
 * @returns Secret en hexadécimal
 */
export function generateSecret(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Génère tous les secrets nécessaires pour l'application
 * À utiliser UNIQUEMENT pour l'initialisation initiale
 * 
 * @returns Objet avec tous les secrets générés
 */
export function generateAllSecrets(): Record<string, string> {
  logger.warn('⚠️  Génération de nouveaux secrets - À utiliser UNIQUEMENT pour l\'initialisation');
  
  return {
    JWT_SECRET: generateSecret(32),           // 64 caractères hex
    JWT_REFRESH_SECRET: generateSecret(32),   // 64 caractères hex
    ENCRYPTION_KEY: generateSecret(32),       // 64 caractères hex (32 bytes pour AES-256)
    SERVICE_HMAC_SECRET: generateSecret(64),  // 128 caractères hex
    BLIND_INDEX_PEPPER: generateSecret(32)    // 64 caractères hex
  };
}

/**
 * Valide un secret individuel
 * 
 * @param secret - Secret à valider
 * @param name - Nom du secret (pour les logs)
 * @param minLength - Longueur minimale requise
 * @returns true si le secret est valide
 */
function validateSecret(secret: string | undefined, name: string, minLength: number): boolean {
  if (!secret) {
    logger.error(`❌ ${name} non défini dans les variables d'environnement`);
    return false;
  }
  
  if (secret.length < minLength) {
    logger.error(`❌ ${name} trop court (${secret.length} caractères, minimum ${minLength})`);
    return false;
  }
  
  // Vérifier que ce n'est pas une valeur par défaut connue
  const dangerousDefaults = [
    'your-secret-key',
    'change-me',
    'secret',
    'password',
    'default',
    '123456',
    'sorikama'
  ];
  
  const lowerSecret = secret.toLowerCase();
  for (const dangerous of dangerousDefaults) {
    if (lowerSecret.includes(dangerous)) {
      logger.error(`❌ ${name} contient une valeur par défaut dangereuse: "${dangerous}"`);
      return false;
    }
  }
  
  // Vérifier l'entropie (complexité)
  const uniqueChars = new Set(secret).size;
  if (uniqueChars < 16) {
    logger.error(`❌ ${name} manque de complexité (seulement ${uniqueChars} caractères uniques)`);
    return false;
  }
  
  return true;
}

/**
 * Charge et valide tous les secrets de l'application
 * Lance une erreur si un secret est invalide
 * 
 * @returns Objet avec tous les secrets validés
 * @throws Error si un secret est invalide
 */
export function loadSecrets(): AppSecrets {
  logger.info('🔐 Chargement et validation des secrets...');
  
  const secrets: Partial<AppSecrets> = {
    jwtSecret: process.env.JWT_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    encryptionKey: process.env.ENCRYPTION_KEY,
    hmacSecret: process.env.SERVICE_HMAC_SECRET,
    blindIndexPepper: process.env.BLIND_INDEX_PEPPER
  };
  
  // Valider chaque secret
  let allValid = true;
  
  for (const [key, requirement] of Object.entries(SECRET_REQUIREMENTS)) {
    const secret = secrets[key as keyof AppSecrets];
    const isValid = validateSecret(secret, requirement.name, requirement.minLength);
    
    if (!isValid) {
      allValid = false;
    } else {
      logger.info(`✅ ${requirement.name} validé (${secret!.length} caractères)`);
    }
  }
  
  if (!allValid) {
    logger.error('');
    logger.error('❌ ERREUR CRITIQUE : Secrets invalides ou manquants');
    logger.error('');
    logger.error('Pour générer de nouveaux secrets, exécutez :');
    logger.error('  npm run generate-secrets');
    logger.error('');
    logger.error('Ou utilisez ce code Node.js :');
    logger.error('  node -e "const c=require(\'crypto\');console.log(\'JWT_SECRET=\'+c.randomBytes(32).toString(\'hex\'))"');
    logger.error('');
    
    throw new Error('Secrets invalides ou manquants. Impossible de démarrer l\'application.');
  }
  
  logger.info('✅ Tous les secrets sont valides');
  
  return secrets as AppSecrets;
}

/**
 * Vérifie si les secrets doivent être rotés
 * (À implémenter avec un système de versioning)
 * 
 * @returns true si les secrets doivent être rotés
 */
export function shouldRotateSecrets(): boolean {
  // TODO: Implémenter la vérification de l'âge des secrets
  // Par exemple, vérifier un fichier .secrets-version avec la date de création
  
  const secretsAge = getSecretsAge();
  const maxAge = 90 * 24 * 60 * 60 * 1000; // 90 jours
  
  if (secretsAge > maxAge) {
    logger.warn('⚠️  Les secrets ont plus de 90 jours, rotation recommandée');
    return true;
  }
  
  return false;
}

/**
 * Obtient l'âge des secrets (en millisecondes)
 * 
 * @returns Âge en millisecondes
 */
function getSecretsAge(): number {
  // TODO: Implémenter la lecture de .secrets-version
  // Pour l'instant, retourner 0 (secrets récents)
  return 0;
}

/**
 * Crée un script de génération de secrets
 * À exécuter avec: npm run generate-secrets
 */
export function createGenerateSecretsScript(): string {
  const secrets = generateAllSecrets();
  
  let script = '#!/bin/bash\n';
  script += '# Secrets générés le ' + new Date().toISOString() + '\n';
  script += '# ATTENTION : Gardez ces secrets en sécurité !\n';
  script += '# Ne les commitez JAMAIS dans Git\n\n';
  
  for (const [key, value] of Object.entries(secrets)) {
    script += `export ${key}="${value}"\n`;
  }
  
  script += '\n# Ajoutez ces lignes à votre fichier .env\n';
  script += '# Ou utilisez un gestionnaire de secrets (AWS Secrets Manager, etc.)\n';
  
  return script;
}

/**
 * Masque un secret pour l'affichage dans les logs
 * 
 * @param secret - Secret à masquer
 * @returns Secret masqué (ex: "abc...xyz")
 */
export function maskSecret(secret: string): string {
  if (!secret || secret.length < 8) {
    return '***';
  }
  
  return `${secret.substring(0, 3)}...${secret.substring(secret.length - 3)}`;
}
