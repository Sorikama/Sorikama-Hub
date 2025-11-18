/**
 * Service de blacklist de tokens JWT
 * 
 * Utilise Redis pour stocker les tokens révoqués
 * Les tokens sont automatiquement supprimés après expiration
 * 
 * Cas d'usage :
 * - Déconnexion utilisateur
 * - Changement de mot de passe
 * - Révocation manuelle par admin
 * - Détection d'activité suspecte
 */

import { logger } from '../utils/logger';
import jwt from 'jsonwebtoken';

// Interface pour Redis (sera injecté)
interface RedisClient {
  set(key: string, value: string, mode?: string, duration?: number): Promise<string | null>;
  get(key: string): Promise<string | null>;
  del(key: string): Promise<number>;
  ttl(key: string): Promise<number>;
}

// Instance Redis (sera initialisée au démarrage)
let redisClient: RedisClient | null = null;

/**
 * Initialise le service de blacklist avec un client Redis
 * 
 * @param client - Client Redis configuré
 */
export function initializeBlacklist(client: RedisClient): void {
  redisClient = client;
  logger.info('✅ Service de blacklist de tokens initialisé');
}

/**
 * Vérifie que Redis est configuré
 */
function ensureRedisConfigured(): void {
  if (!redisClient) {
    // Ne pas lancer d'erreur, juste retourner false
    return;
  }
}

/**
 * Génère la clé Redis pour un token
 * 
 * @param token - Token JWT
 * @returns Clé Redis
 */
function getBlacklistKey(token: string): string {
  // Utiliser un hash du token pour économiser l'espace
  const crypto = require('crypto');
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  return `blacklist:token:${hash}`;
}

/**
 * Ajoute un token à la blacklist
 * 
 * @param token - Token JWT à révoquer
 * @param reason - Raison de la révocation
 * @returns true si le token a été ajouté
 */
export async function blacklistToken(token: string, reason: string = 'logout'): Promise<boolean> {
  if (!redisClient) {
    logger.debug('Redis non disponible, blacklist ignorée');
    return false;
  }
  
  try {
    // Décoder le token pour obtenir l'expiration
    const decoded = jwt.decode(token) as any;
    
    if (!decoded || !decoded.exp) {
      logger.warn('Token invalide, impossible de le blacklister', { reason });
      return false;
    }
    
    // Calculer le TTL (temps restant avant expiration)
    const now = Math.floor(Date.now() / 1000);
    const ttl = decoded.exp - now;
    
    if (ttl <= 0) {
      logger.debug('Token déjà expiré, pas besoin de le blacklister', { reason });
      return true; // Considéré comme succès car le token est déjà invalide
    }
    
    // Ajouter à la blacklist avec expiration automatique
    const key = getBlacklistKey(token);
    const value = JSON.stringify({
      reason,
      revokedAt: new Date().toISOString(),
      userId: decoded.id || decoded.sub,
      expiresAt: new Date(decoded.exp * 1000).toISOString()
    });
    
    await redisClient!.set(key, value, 'EX', ttl);
    
    logger.info('Token ajouté à la blacklist', {
      userId: decoded.id || decoded.sub,
      reason,
      ttl: `${ttl}s`
    });
    
    return true;
    
  } catch (error) {
    logger.error('Erreur lors de l\'ajout du token à la blacklist:', error);
    return false;
  }
}

/**
 * Vérifie si un token est blacklisté
 * 
 * @param token - Token JWT à vérifier
 * @returns true si le token est blacklisté
 */
export async function isTokenBlacklisted(token: string): Promise<boolean> {
  if (!redisClient) {
    return false; // Si Redis n'est pas disponible, considérer le token comme valide
  }
  
  try {
    const key = getBlacklistKey(token);
    const value = await redisClient!.get(key);
    
    if (value) {
      const data = JSON.parse(value);
      logger.warn('Token blacklisté utilisé', {
        reason: data.reason,
        revokedAt: data.revokedAt,
        userId: data.userId
      });
      return true;
    }
    
    return false;
    
  } catch (error) {
    logger.error('Erreur lors de la vérification de blacklist:', error);
    // En cas d'erreur, on considère le token comme valide pour ne pas bloquer le service
    // Mais on log l'erreur pour investigation
    return false;
  }
}

/**
 * Révoque tous les tokens d'un utilisateur
 * Utile lors d'un changement de mot de passe ou d'une activité suspecte
 * 
 * @param userId - ID de l'utilisateur
 * @param reason - Raison de la révocation
 * @returns Nombre de tokens révoqués
 */
export async function blacklistAllUserTokens(userId: string, reason: string = 'security'): Promise<number> {
  if (!redisClient) {
    logger.debug('Redis non disponible, blacklist ignorée');
    return 0;
  }
  
  try {
    // Stocker une entrée pour bloquer tous les tokens de cet utilisateur
    const key = `blacklist:user:${userId}`;
    const value = JSON.stringify({
      reason,
      revokedAt: new Date().toISOString()
    });
    
    // Expiration de 24h (durée max d'un access token)
    await redisClient!.set(key, value, 'EX', 24 * 60 * 60);
    
    logger.warn('Tous les tokens de l\'utilisateur révoqués', {
      userId,
      reason
    });
    
    return 1; // On ne peut pas compter le nombre exact de tokens
    
  } catch (error) {
    logger.error('Erreur lors de la révocation des tokens utilisateur:', error);
    return 0;
  }
}

/**
 * Vérifie si tous les tokens d'un utilisateur sont révoqués
 * 
 * @param userId - ID de l'utilisateur
 * @returns true si tous les tokens sont révoqués
 */
export async function areAllUserTokensBlacklisted(userId: string): Promise<boolean> {
  if (!redisClient) {
    return false; // Si Redis n'est pas disponible, considérer comme non révoqué
  }
  
  try {
    const key = `blacklist:user:${userId}`;
    const value = await redisClient!.get(key);
    
    if (value) {
      const data = JSON.parse(value);
      logger.warn('Utilisateur avec tous les tokens révoqués', {
        userId,
        reason: data.reason,
        revokedAt: data.revokedAt
      });
      return true;
    }
    
    return false;
    
  } catch (error) {
    logger.error('Erreur lors de la vérification de blacklist utilisateur:', error);
    return false;
  }
}

/**
 * Supprime un token de la blacklist (rare, seulement pour tests)
 * 
 * @param token - Token à retirer de la blacklist
 * @returns true si le token a été supprimé
 */
export async function removeFromBlacklist(token: string): Promise<boolean> {
  if (!redisClient) {
    return false;
  }
  
  try {
    const key = getBlacklistKey(token);
    const result = await redisClient!.del(key);
    
    logger.info('Token retiré de la blacklist', { removed: result > 0 });
    
    return result > 0;
    
  } catch (error) {
    logger.error('Erreur lors de la suppression de la blacklist:', error);
    return false;
  }
}

/**
 * Obtient les statistiques de la blacklist
 * 
 * @returns Statistiques
 */
export async function getBlacklistStats(): Promise<{
  totalTokens: number;
  totalUsers: number;
}> {
  if (!redisClient) {
    return { totalTokens: 0, totalUsers: 0 };
  }
  
  try {
    // Note: Cette implémentation est simplifiée
    // En production, utiliser Redis SCAN pour compter les clés
    
    return {
      totalTokens: 0, // À implémenter avec SCAN
      totalUsers: 0   // À implémenter avec SCAN
    };
    
  } catch (error) {
    logger.error('Erreur lors de la récupération des stats:', error);
    return { totalTokens: 0, totalUsers: 0 };
  }
}
