import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import AppError from '../utils/AppError';
import { logger } from '../utils/logger';

const rateLimitConfigs = {
  admin: { windowMs: 15 * 60 * 1000, max: 1000 },
  premium: { windowMs: 15 * 60 * 1000, max: 500 },
  user: { windowMs: 15 * 60 * 1000, max: 100 },
  guest: { windowMs: 15 * 60 * 1000, max: 20 }
};

export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  },
  hsts: { maxAge: 31536000, includeSubDomains: true }
});

export const validateHeaders = (req: Request, res: Response, next: NextFunction) => {
  const requiredHeaders = ['user-agent', 'accept'];
  const missingHeaders = requiredHeaders.filter(header => !req.headers[header]);
  
  if (missingHeaders.length > 0) {
    logger.warn(`[SECURITY] En-têtes manquants: ${missingHeaders.join(', ')} - IP: ${req.ip}`);
    return next(new AppError('En-têtes requis manquants', StatusCodes.BAD_REQUEST));
  }
  next();
};

export const allowedMethods = (methods: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!methods.includes(req.method)) {
      logger.warn(`[SECURITY] Méthode non autorisée: ${req.method} - IP: ${req.ip}`);
      return next(new AppError('Méthode non autorisée', StatusCodes.METHOD_NOT_ALLOWED));
    }
    next();
  };
};

export const validatePayloadSize = (maxSize: number = 10 * 1024 * 1024) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    
    if (contentLength > maxSize) {
      logger.warn(`[SECURITY] Payload trop volumineux: ${contentLength} bytes - IP: ${req.ip}`);
      return next(new AppError('Payload trop volumineux', StatusCodes.PAYLOAD_TOO_LARGE));
    }
    next();
  };
};

export const dynamicRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (req: Request) => {
    const userRole = req.user?.roles?.[0]?.name || 'guest';
    const config = rateLimitConfigs[userRole as keyof typeof rateLimitConfigs] || rateLimitConfigs.guest;
    return config.max;
  },
  message: {
    error: 'Trop de requêtes, veuillez réessayer plus tard',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    return req.user?.id || req.ip;
  },
  handler: (req, res) => {
    logger.warn(`[SECURITY] Rate limit atteint - User: ${req.user?.id || 'anonymous'} - IP: ${req.ip}`);
    res.status(429).json({
      error: 'Trop de requêtes, veuillez réessayer plus tard',
      retryAfter: '15 minutes'
    });
  }
});

export const sanitizeQuery = (req: Request, res: Response, next: NextFunction) => {
  const dangerousPatterns = [
    /(<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>)/gi,
    /(javascript:|data:|vbscript:)/gi,
    /(\$\{.*\})/g,
    /(union\s+select|drop\s+table|insert\s+into)/gi
  ];
  
  const checkValue = (value: any): boolean => {
    if (typeof value === 'string') {
      return dangerousPatterns.some(pattern => pattern.test(value));
    }
    return false;
  };
  
  for (const [key, value] of Object.entries(req.query)) {
    if (checkValue(value)) {
      logger.warn(`[SECURITY] Contenu suspect détecté dans query param '${key}' - IP: ${req.ip}`);
      return next(new AppError('Paramètres de requête invalides', StatusCodes.BAD_REQUEST));
    }
  }
  
  if (req.body && typeof req.body === 'object') {
    const checkObject = (obj: any): boolean => {
      for (const [key, value] of Object.entries(obj)) {
        if (checkValue(value) || (typeof value === 'object' && value !== null && checkObject(value))) {
          return true;
        }
      }
      return false;
    };
    
    if (checkObject(req.body)) {
      logger.warn(`[SECURITY] Contenu suspect détecté dans le body - IP: ${req.ip}`);
      return next(new AppError('Données de requête invalides', StatusCodes.BAD_REQUEST));
    }
  }
  
  next();
};

export const logSuspiciousActivity = (req: Request, res: Response, next: NextFunction) => {
  const suspiciousIndicators = [
    req.headers['x-forwarded-for']?.toString().includes('tor'),
    req.headers['user-agent']?.includes('bot'),
    req.url.includes('..'),
    req.url.includes('%2e%2e'),
    Object.keys(req.query).length > 20
  ];
  
  if (suspiciousIndicators.some(Boolean)) {
    logger.warn(`[SECURITY] Activité suspecte détectée - IP: ${req.ip} - URL: ${req.url} - UA: ${req.headers['user-agent']}`);
  }
  
  next();
};