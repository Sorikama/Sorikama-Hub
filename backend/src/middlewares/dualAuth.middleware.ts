// src/middlewares/dualAuth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { protect } from './auth.middleware';

/**
 * Middleware : JWT Token obligatoire
 * (Anciennement requireApiKeyAndJWT, maintenant simplifié pour JWT uniquement)
 */
export const requireApiKeyAndJWT = async (req: Request, res: Response, next: NextFunction) => {
  // Vérifier uniquement le JWT
  return protect(req, res, next);
};