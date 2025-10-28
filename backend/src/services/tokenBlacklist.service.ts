/**
 * Service de gestion de la blacklist des tokens JWT
 * Utilise Redis pour stocker les tokens révoqués
 */

import { createClient, RedisClientType } from 'redis';
import { logger } from '../utils/logger';
import jwt from 'jsonwebtoken';

class TokenBlacklistService {
  private client: RedisClientType | null = null;
  private isConnected = false;

  /**
   * Initialiser la connexion Redis
   */
  async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    try {
      this.client = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              logger.error('❌ Redis: Trop de tentatives de reconnexion');
              return new Error('Trop de tentatives');
            }
            return Math.min(retries * 100, 3000);
          }
        }
      });

      this.client.on('error', (err) => {
        logger.error('❌ Erreur Redis:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        logger.info('✅ Redis connecté pour la blacklist des tokens');
        this.isConnected = true;
      });

      await this.client.connect();
    } catch (error) {
      logger.error('❌ Impossible de se connecter à Redis:', error);
      throw error;
    }
  }

  /**
   * Ajouter un token à la blacklist
   * @param token - Le token JWT à blacklister
   * @param reason - Raison de la révocation
   */
  async addToBlacklist(token: string, reason: string = 'revoked'): Promise<void> {
    if (!this.client || !this.isConnected) {
      throw new Error('Redis non connecté');
    }

    try {
      // Décoder le token pour obtenir l'expiration
      const decoded: any = jwt.decode(token);
      
      if (!decoded || !decoded.exp) {
        throw new Error('Token invalide ou sans expiration');
      }

      // Calculer le TTL (temps restant avant expiration)
      const now = Math.floor(Date.now() / 1000);
      const ttl = decoded.exp - now;

      if (ttl <= 0) {
        logger.debug('Token déjà expiré, pas besoin de le blacklister');
        return;
      }

      // Créer une clé unique pour le token
      const key = `blacklist:token:${token}`;

      // Stocker dans Redis avec TTL
      await this.client.setEx(key, ttl, JSON.stringify({
        reason,
        revokedAt: new Date().toISOString(),
        userId: decoded.id,
        service: decoded.service
      }));

      logger.info('🔒 Token ajouté à la blacklist', {
        userId: decoded.id,
        service: decoded.service,
        reason,
        ttl
      });
    } catch (error) {
      logger.error('❌ Erreur lors de l\'ajout à la blacklist:', error);
      throw error;
    }
  }

  /**
   * Vérifier si un token est blacklisté
   * @param token - Le token JWT à vérifier
   * @returns true si le token est blacklisté
   */
  async isBlacklisted(token: string): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      // Si Redis n'est pas disponible, on laisse passer (fail-open)
      logger.warn('⚠️ Redis non disponible, impossible de vérifier la blacklist');
      return false;
    }

    try {
      const key = `blacklist:token:${token}`;
      const result = await this.client.get(key);
      return result !== null;
    } catch (error) {
      logger.error('❌ Erreur lors de la vérification de la blacklist:', error);
      return false;
    }
  }

  /**
   * Révoquer tous les tokens d'un utilisateur pour un service
   * @param userId - ID de l'utilisateur
   * @param serviceSlug - Slug du service
   */
  async revokeUserServiceTokens(userId: string, serviceSlug: string): Promise<void> {
    if (!this.client || !this.isConnected) {
      throw new Error('Redis non connecté');
    }

    try {
      // Créer une clé pour marquer tous les tokens de cet utilisateur/service comme révoqués
      const key = `blacklist:user:${userId}:service:${serviceSlug}`;
      
      // Stocker pendant 24h (durée max d'un token)
      await this.client.setEx(key, 24 * 60 * 60, JSON.stringify({
        revokedAt: new Date().toISOString(),
        reason: 'all_tokens_revoked'
      }));

      logger.info('🔒 Tous les tokens révoqués', {
        userId,
        service: serviceSlug
      });
    } catch (error) {
      logger.error('❌ Erreur lors de la révocation des tokens:', error);
      throw error;
    }
  }

  /**
   * Vérifier si tous les tokens d'un utilisateur pour un service sont révoqués
   */
  async areUserServiceTokensRevoked(userId: string, serviceSlug: string): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      return false;
    }

    try {
      const key = `blacklist:user:${userId}:service:${serviceSlug}`;
      const result = await this.client.get(key);
      return result !== null;
    } catch (error) {
      logger.error('❌ Erreur lors de la vérification:', error);
      return false;
    }
  }

  /**
   * Obtenir les statistiques de la blacklist
   */
  async getStats(): Promise<{ totalBlacklisted: number }> {
    if (!this.client || !this.isConnected) {
      return { totalBlacklisted: 0 };
    }

    try {
      const keys = await this.client.keys('blacklist:token:*');
      return { totalBlacklisted: keys.length };
    } catch (error) {
      logger.error('❌ Erreur lors de la récupération des stats:', error);
      return { totalBlacklisted: 0 };
    }
  }

  /**
   * Fermer la connexion Redis
   */
  async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
      logger.info('🔌 Redis déconnecté (blacklist)');
    }
  }
}

// Export singleton
export const tokenBlacklistService = new TokenBlacklistService();
