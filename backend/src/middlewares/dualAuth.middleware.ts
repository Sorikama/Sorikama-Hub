// src/middlewares/dualAuth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { authenticateApiKey } from './apiKey.middleware';
import { protect } from './auth.middleware';

/**
 * Middleware principal : API Key OBLIGATOIRE pour toutes les routes
 */
export const requireApiKey = async (req: Request, res: Response, next: NextFunction) => {
  return authenticateApiKey(req, res, next);
};

/**
 * Middleware : API Key + JWT Token obligatoires
 */
export const requireApiKeyAndJWT = async (req: Request, res: Response, next: NextFunction) => {
  // 1. Vérifier l'API Key d'abord
  authenticateApiKey(req, res, (err) => {
    if (err) return next(err);
    
    // 2. Si API Key OK, vérifier le JWT
    protect(req, res, next);
  });
};