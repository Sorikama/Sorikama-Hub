// src/middlewares/swaggerAuth.middleware.ts
import { Request, Response, NextFunction } from 'express';

export const protectSwagger = (req: Request, res: Response, next: NextFunction) => {
  // Vérifier le token de session
  const token = req.headers['x-swagger-token'] || req.query.token;
  
  if (!token) {
    return res.redirect('/swagger/login');
  }
  
  // Vérifier la validité du token
  const sessions = global.swaggerSessions || new Map();
  const session = sessions.get(token);
  
  if (!session || session.expires < Date.now()) {
    return res.redirect('/swagger/login');
  }
  
  next();
};