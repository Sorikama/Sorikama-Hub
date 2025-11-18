#!/usr/bin/env ts-node
/**
 * Script de génération de secrets sécurisés
 * 
 * Usage:
 *   npm run generate-secrets
 * 
 * Génère tous les secrets nécessaires pour l'application
 * À utiliser UNIQUEMENT lors de l'initialisation initiale
 */

import { generateAllSecrets, createGenerateSecretsScript } from '../src/utils/secretsManager';
import * as fs from 'fs';
import * as path from 'path';

console.log('');
console.log('🔐 GÉNÉRATION DE SECRETS SÉCURISÉS');
console.log('═══════════════════════════════════════════════════════════');
console.log('');

// Générer les secrets
const secrets = generateAllSecrets();

console.log('✅ Secrets générés avec succès !');
console.log('');
console.log('📋 SECRETS À AJOUTER DANS .env :');
console.log('═══════════════════════════════════════════════════════════');
console.log('');

for (const [key, value] of Object.entries(secrets)) {
  console.log(`${key}=${value}`);
}

console.log('');
console.log('⚠️  IMPORTANT - LISEZ ATTENTIVEMENT :');
console.log('═══════════════════════════════════════════════════════════');
console.log('');
console.log('1. 🔒 Copiez ces secrets dans votre fichier .env');
console.log('2. 🚫 Ne commitez JAMAIS ces secrets dans Git');
console.log('3. 🔑 Gardez-les en sécurité (gestionnaire de secrets)');
console.log('4. 🔄 Rotation recommandée tous les 90 jours');
console.log('5. 📤 SERVICE_HMAC_SECRET doit être partagé avec MaseBuy');
console.log('');

// Créer un fichier .env.example avec des placeholders
const envExample = `# Secrets générés le ${new Date().toISOString()}
# ⚠️  NE PAS UTILISER CES VALEURS EN PRODUCTION

# JWT Secrets (64 caractères minimum)
JWT_SECRET=REMPLACER_PAR_SECRET_GENERE
JWT_REFRESH_SECRET=REMPLACER_PAR_SECRET_GENERE

# Encryption Key (64 caractères pour AES-256)
ENCRYPTION_KEY=REMPLACER_PAR_SECRET_GENERE

# HMAC Secret pour communication inter-services (128 caractères)
SERVICE_HMAC_SECRET=REMPLACER_PAR_SECRET_GENERE

# Blind Index Pepper (64 caractères)
BLIND_INDEX_PEPPER=REMPLACER_PAR_SECRET_GENERE
`;

// Sauvegarder dans un fichier temporaire
const tempFile = path.join(__dirname, '..', '.env.secrets.tmp');
fs.writeFileSync(tempFile, envExample);

console.log(`📄 Fichier template créé : ${tempFile}`);
console.log('');
console.log('🚀 PROCHAINES ÉTAPES :');
console.log('═══════════════════════════════════════════════════════════');
console.log('');
console.log('1. Copiez les secrets ci-dessus dans .env');
console.log('2. Partagez SERVICE_HMAC_SECRET avec MaseBuy');
console.log('3. Redémarrez l\'application');
console.log('4. Supprimez ce fichier temporaire');
console.log('');
console.log('💡 Pour MaseBuy, ajoutez dans son .env :');
console.log(`   SERVICE_HMAC_SECRET=${secrets.SERVICE_HMAC_SECRET}`);
console.log('');
