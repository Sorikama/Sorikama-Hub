// src/middlewares/security.middleware.ts
import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger';

// Rate limiting strict pour les tentatives sans API key
export const unauthorizedRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Maximum 5 tentatives par IP
  message: {
    error: 'Trop de tentatives d\'accès non autorisées',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => req.ip,
  handler: (req, res) => {
    logger.warn(`[SECURITY] Tentatives d'accès non autorisées répétées - IP: ${req.ip} - URL: ${req.originalUrl}`);
    res.status(429).json({
      error: 'Trop de tentatives d\'accès non autorisées',
      message: 'Votre IP a été temporairement bloquée pour tentatives répétées sans authentification',
      retryAfter: '15 minutes'
    });
  }
});

// Inspection des données sensibles
export const dataInspection = (req: Request, res: Response, next: NextFunction) => {
  const suspiciousPatterns = [
    // Injection SQL
    /(union\s+select|drop\s+table|insert\s+into|delete\s+from|update\s+set)/gi,
    // XSS
    /(<script|javascript:|data:text\/html|vbscript:|onload=|onerror=)/gi,
    // Command injection
    /(;|\||&|`|\$\(|\${|exec\(|system\(|eval\()/g,
    // Path traversal
    /(\.\.\/|\.\.\\|%2e%2e%2f|%2e%2e%5c)/gi,
    // LDAP injection
    /(\*\)|\(\||\)\(|\(\&)/g
  ];

  const checkData = (data: any, path: string = ''): boolean => {
    if (typeof data === 'string') {
      return suspiciousPatterns.some(pattern => pattern.test(data));
    }
    
    if (typeof data === 'object' && data !== null) {
      for (const [key, value] of Object.entries(data)) {
        if (checkData(value, `${path}.${key}`)) {
          return true;
        }
      }
    }
    
    return false;
  };

  // Vérifier query params
  if (checkData(req.query, 'query')) {
    logger.error(`[SECURITY] Injection détectée dans query - IP: ${req.ip} - URL: ${req.originalUrl}`);
    return res.status(400).json({
      error: 'Données suspectes détectées',
      message: 'Votre requête contient des données potentiellement malveillantes'
    });
  }

  // Vérifier body
  if (req.body && checkData(req.body, 'body')) {
    logger.error(`[SECURITY] Injection détectée dans body - IP: ${req.ip} - URL: ${req.originalUrl}`);
    return res.status(400).json({
      error: 'Données suspectes détectées',
      message: 'Votre requête contient des données potentiellement malveillantes'
    });
  }

  // Vérifier headers sensibles
  const sensitiveHeaders = ['user-agent', 'referer', 'x-forwarded-for'];
  for (const header of sensitiveHeaders) {
    const value = req.headers[header];
    if (value && typeof value === 'string' && checkData(value, `header.${header}`)) {
      logger.error(`[SECURITY] Injection détectée dans header ${header} - IP: ${req.ip}`);
      return res.status(400).json({
        error: 'En-têtes suspects détectés',
        message: 'Vos en-têtes contiennent des données potentiellement malveillantes'
      });
    }
  }

  next();
};