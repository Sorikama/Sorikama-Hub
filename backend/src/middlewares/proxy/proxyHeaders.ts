/**
 * Gestion des headers pour le proxy
 */

import { PROXY_CONFIG } from './proxyConfig';
import { encryptUserId } from '../../utils/encryption';
import { createSignedHeaders } from '../../utils/hmacSignature';
import { logger } from '../../utils/logger';

/**
 * Créer les headers sécurisés pour le service externe
 */
export function createSecureHeaders(
  user: any,
  ssoSession: any,
  service: any,
  req: any
): Record<string, string> {
  // Chiffrer l'ID utilisateur
  const encryptedUserId = encryptUserId(user._id.toString());
  
  // Créer une signature HMAC des headers
  const signedHeaders = createSignedHeaders(
    encryptedUserId,
    user.email,
    user.role,
    service.slug
  );
  
  // Headers additionnels
  const additionalHeaders: Record<string, string> = {
    'X-Session-Id': ssoSession.sessionId,
    'X-Service-Name': service.name,
    'X-Proxy-Timestamp': new Date().toISOString(),
    'X-Forwarded-For': req.ip,
    'X-Forwarded-Proto': req.protocol,
    'X-Forwarded-Host': req.hostname
  };
  
  return { ...signedHeaders, ...additionalHeaders };
}

/**
 * Nettoyer les headers sensibles de la requête
 */
export function cleanSensitiveHeaders(proxyReq: any, req: any): void {
  // Supprimer tous les headers non autorisés
  Object.keys(req.headers).forEach(header => {
    const headerLower = header.toLowerCase();
    if (!PROXY_CONFIG.ALLOWED_HEADERS.has(headerLower) && !headerLower.startsWith('x-')) {
      proxyReq.removeHeader(header);
    }
  });
  
  // Supprimer explicitement les headers critiques
  PROXY_CONFIG.BLOCKED_HEADERS.forEach(header => {
    proxyReq.removeHeader(header);
  });
}

/**
 * Ajouter les headers sécurisés à la requête proxy
 */
export function applySecureHeaders(proxyReq: any, headers: Record<string, string>): void {
  Object.entries(headers).forEach(([key, value]) => {
    proxyReq.setHeader(key, value);
  });
  
  logger.debug('Headers sécurisés appliqués', { 
    count: Object.keys(headers).length 
  });
}

/**
 * Gérer le body pour les requêtes POST/PUT/PATCH
 */
export function handleRequestBody(proxyReq: any, req: any): void {
  if (req.body && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH')) {
    const bodyData = JSON.stringify(req.body);
    
    // Mettre à jour les headers de contenu
    proxyReq.setHeader('Content-Type', 'application/json');
    proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
    
    // Écrire le body dans la requête proxy
    proxyReq.write(bodyData);
    
    logger.debug('Body ajouté à la requête proxy', { 
      method: req.method,
      size: bodyData.length 
    });
  }
}
