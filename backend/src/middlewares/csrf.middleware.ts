/**
 * Middleware de protection CSRF (Cross-Site Request Forgery)
 * 
 * Génère et vérifie des tokens CSRF pour protéger contre les attaques CSRF
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { StatusCodes } from 'http-status-codes';
import AppError from '../utils/AppError';
import { logger } from '../utils/logger';

// Stockage en mémoire des tokens CSRF (en production, utiliser Redis)
const csrfTokens = new Map<string, { token: string; expires: number }>();

// Nettoyer les tokens expirés toutes les heures
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, data] of csrfTokens.entries()) {
    if (data.expires < now) {
      csrfTokens.delete(sessionId);
    }
  }
}, 60 * 60 * 1000);

/**
 * Générer un token CSRF unique
 */
function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Obtenir ou créer un ID de session
 */
function getSessionId(req: Request): string {
  // Utiliser l'ID utilisateur si authentifié
  if (req.user?.id) {
    return `user_${req.user.id}`;
  }
  
  // Sinon utiliser l'IP + User-Agent
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  return crypto.createHash('sha256').update(`${ip}_${userAgent}`).digest('hex');
}

/**
 * Middleware pour générer un token CSRF
 * À appliquer sur les routes qui affichent des formulaires
 */
export const generateCsrf = (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = getSessionId(req);
    
    // Vérifier si un token existe déjà
    let csrfData = csrfTokens.get(sessionId);
    
    // Si pas de token ou expiré, en créer un nouveau
    if (!csrfData || csrfData.expires < Date.now()) {
      const token = generateCsrfToken();
      csrfData = {
        token,
        expires: Date.now() + 60 * 60 * 1000 // 1 heure
      };
      csrfTokens.set(sessionId, csrfData);
      logger.debug('Token CSRF généré', { sessionId });
    }
    
    // Ajouter le token à la requête pour que les contrôleurs puissent l'utiliser
    req.csrfToken = () => csrfData!.token;
    
    next();
  } catch (error) {
    logger.error('Erreur génération token CSRF:', error);
    next(error);
  }
};

/**
 * Middleware pour vérifier le token CSRF
 * À appliquer sur les routes POST/PUT/PATCH/DELETE
 */
export const verifyCsrf = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Ignorer pour les routes GET et OPTIONS
    if (req.method === 'GET' || req.method === 'OPTIONS') {
      return next();
    }

    const sessionId = getSessionId(req);
    const csrfData = csrfTokens.get(sessionId);
    
    // Récupérer le token CSRF depuis le header
    const clientToken = req.headers['x-csrf-token'] as string;
    
    if (!clientToken) {
      logger.warn('Token CSRF manquant', {
        method: req.method,
        url: req.originalUrl,
        sessionId
      });
      return next(new AppError('Token CSRF manquant', StatusCodes.FORBIDDEN));
    }
    
    if (!csrfData) {
      logger.warn('Session CSRF introuvable', { sessionId });
      return next(new AppError('Session CSRF invalide', StatusCodes.FORBIDDEN));
    }
    
    if (csrfData.expires < Date.now()) {
      logger.warn('Token CSRF expiré', { sessionId });
      csrfTokens.delete(sessionId);
      return next(new AppError('Token CSRF expiré', StatusCodes.FORBIDDEN));
    }
    
    if (clientToken !== csrfData.token) {
      logger.warn('Token CSRF invalide', {
        method: req.method,
        url: req.originalUrl,
        sessionId
      });
      return next(new AppError('Token CSRF invalide', StatusCodes.FORBIDDEN));
    }
    
    logger.debug('Token CSRF vérifié avec succès', { sessionId });
    next();
  } catch (error) {
    logger.error('Erreur vérification token CSRF:', error);
    next(error);
  }
};

/**
 * Endpoint pour récupérer un token CSRF
 */
export const getCsrfToken = (req: Request, res: Response) => {
  const token = req.csrfToken ? req.csrfToken() : null;
  
  if (!token) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: 'Impossible de générer un token CSRF'
    });
  }
  
  res.status(StatusCodes.OK).json({
    status: 'success',
    data: {
      csrfToken: token
    }
  });
};

// Étendre l'interface Request pour ajouter csrfToken
declare global {
  namespace Express {
    interface Request {
      csrfToken?: () => string;
    }
  }
}
