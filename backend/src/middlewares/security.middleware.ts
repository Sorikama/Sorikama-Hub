// src/middlewares/security.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Middleware de sécurité global
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Headers de sécurité
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // CSP pour les pages HTML
  if (req.path.includes('.html') || req.path === '/' || req.path.startsWith('/portal/')) {
    res.setHeader('Content-Security-Policy', 
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://cdnjs.cloudflare.com; " +
      "style-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://cdnjs.cloudflare.com https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; " +
      "img-src 'self' data: https:; " +
      "connect-src 'self'; " +
      "frame-ancestors 'none';"
    );
  }
  
  next();
};

/**
 * Détection d'attaques par injection
 */
export const detectInjection = (req: Request, res: Response, next: NextFunction) => {
  const suspiciousPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /\b(eval|setTimeout|setInterval)\s*\(/gi,
    /\.\.\//g,
    /\/etc\/passwd/gi,
    /cmd\.exe/gi
  ];
  
  const checkValue = (value: any, path: string): boolean => {
    if (typeof value === 'string') {
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(value)) {
          logger.error('🚨 TENTATIVE D\'INJECTION DÉTECTÉE', {
            pattern: pattern.toString(),
            value: value.substring(0, 100),
            path,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            timestamp: new Date().toISOString()
          });
          return true;
        }
      }
    } else if (typeof value === 'object' && value !== null) {
      for (const [key, val] of Object.entries(value)) {
        if (checkValue(val, `${path}.${key}`)) {
          return true;
        }
      }
    }
    return false;
  };
  
  // Vérifier les paramètres de requête
  if (checkValue(req.query, 'query')) {
    return res.status(400).json({
      success: false,
      message: 'Malicious input detected in query parameters'
    });
  }
  
  // Vérifier le body
  if (checkValue(req.body, 'body')) {
    return res.status(400).json({
      success: false,
      message: 'Malicious input detected in request body'
    });
  }
  
  // Vérifier les headers
  if (checkValue(req.headers, 'headers')) {
    return res.status(400).json({
      success: false,
      message: 'Malicious input detected in headers'
    });
  }
  
  next();
};

/**
 * Limitation de taille des requêtes
 */
export const requestSizeLimit = (req: Request, res: Response, next: NextFunction) => {
  const maxSize = 1024 * 1024; // 1MB
  
  if (req.headers['content-length']) {
    const contentLength = parseInt(req.headers['content-length']);
    if (contentLength > maxSize) {
      logger.warn('🚨 Requête trop volumineuse rejetée', {
        size: contentLength,
        maxSize,
        ip: req.ip,
        path: req.path
      });
      
      return res.status(413).json({
        success: false,
        message: 'Request too large'
      });
    }
  }
  
  next();
};

/**
 * Validation des User-Agents suspects
 */
export const validateUserAgent = (req: Request, res: Response, next: NextFunction) => {
  const userAgent = req.get('User-Agent');
  
  if (!userAgent) {
    logger.warn('🚨 Requête sans User-Agent', {
      ip: req.ip,
      path: req.path
    });
  }
  
  // Patterns de bots malveillants
  const maliciousPatterns = [
    /sqlmap/i,
    /nikto/i,
    /nessus/i,
    /burp/i,
    /nmap/i,
    /masscan/i,
    /zap/i
  ];
  
  if (userAgent) {
    for (const pattern of maliciousPatterns) {
      if (pattern.test(userAgent)) {
        logger.error('🚨 User-Agent malveillant détecté', {
          userAgent,
          ip: req.ip,
          path: req.path
        });
        
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }
  }
  
  next();
};

/**
 * Protection contre les attaques de timing
 */
export const timingAttackProtection = async (req: Request, res: Response, next: NextFunction) => {
  // Ajouter un délai aléatoire pour masquer les temps de réponse
  if (req.path.includes('/authenticate') || req.path.includes('/login')) {
    const delay = Math.random() * 100 + 50; // 50-150ms
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  next();
};