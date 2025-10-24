// src/middlewares/unauthorizedHandler.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { unauthorizedRateLimit } from './security.middleware';

// Middleware pour appliquer le rate limiting aux tentatives non autorisées
export const handleUnauthorizedAttempts = (req: Request, res: Response, next: NextFunction) => {
  if (req.isUnauthorizedAttempt) {
    // Appliquer le rate limiting strict
    return unauthorizedRateLimit(req, res, next);
  }
  next();
};