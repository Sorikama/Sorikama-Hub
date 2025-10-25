/**
 * Middleware de validation des entrées
 * 
 * Valide et nettoie toutes les entrées utilisateur pour prévenir :
 * - Injections SQL
 * - XSS (Cross-Site Scripting)
 * - Injections de commandes
 * - Path traversal
 * - Injections NoSQL
 */

import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import AppError from '../utils/AppError';
import { logger } from '../utils/logger';

/**
 * Patterns dangereux à détecter
 */
const DANGEROUS_PATTERNS = {
  // Injection SQL
  sql: /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE)\b)|(-{2})|(\*\/)|(\bOR\b.*=.*)|(\bAND\b.*=.*)/gi,
  
  // XSS
  xss: /<script[^>]*>.*?<\/script>|<iframe[^>]*>.*?<\/iframe>|javascript:|onerror=|onload=|onclick=|<img[^>]*onerror/gi,
  
  // Injection de commandes
  command: /[;&|`$(){}[\]<>]/g,
  
  // Path traversal
  pathTraversal: /\.\.[\/\\]/g,
  
  // Injection NoSQL
  nosql: /\$where|\$ne|\$gt|\$lt|\$gte|\$lte|\$in|\$nin|\$regex/gi,
  
  // HTML dangereux
  dangerousHtml: /<(script|iframe|object|embed|applet|meta|link|style|base|form)/gi
};

/**
 * Caractères spéciaux à échapper
 */
const SPECIAL_CHARS: { [key: string]: string } = {
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '&': '&amp;'
};

/**
 * Échapper les caractères HTML
 */
function escapeHtml(text: string): string {
  return text.replace(/[<>"'\/&]/g, (char) => SPECIAL_CHARS[char] || char);
}

/**
 * Nettoyer une chaîne de caractères
 */
function sanitizeString(value: string, options: SanitizeOptions = {}): string {
  if (typeof value !== 'string') return value;
  
  let sanitized = value;
  
  // Trim
  if (options.trim !== false) {
    sanitized = sanitized.trim();
  }
  
  // Échapper HTML
  if (options.escapeHtml) {
    sanitized = escapeHtml(sanitized);
  }
  
  // Supprimer les caractères de contrôle
  if (options.removeControlChars !== false) {
    sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
  }
  
  // Limiter la longueur
  if (options.maxLength && sanitized.length > options.maxLength) {
    sanitized = sanitized.substring(0, options.maxLength);
  }
  
  return sanitized;
}

/**
 * Détecter les patterns dangereux
 */
function detectDangerousPatterns(value: string): string[] {
  const detected: string[] = [];
  
  if (DANGEROUS_PATTERNS.sql.test(value)) {
    detected.push('SQL Injection');
  }
  
  if (DANGEROUS_PATTERNS.xss.test(value)) {
    detected.push('XSS');
  }
  
  if (DANGEROUS_PATTERNS.command.test(value)) {
    detected.push('Command Injection');
  }
  
  if (DANGEROUS_PATTERNS.pathTraversal.test(value)) {
    detected.push('Path Traversal');
  }
  
  if (DANGEROUS_PATTERNS.nosql.test(value)) {
    detected.push('NoSQL Injection');
  }
  
  if (DANGEROUS_PATTERNS.dangerousHtml.test(value)) {
    detected.push('Dangerous HTML');
  }
  
  return detected;
}

/**
 * Valider et nettoyer un objet récursivement
 */
function sanitizeObject(obj: any, options: SanitizeOptions = {}): any {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'string') {
    return sanitizeString(obj, options);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, options));
  }
  
  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        // Nettoyer la clé aussi
        const sanitizedKey = sanitizeString(key, { maxLength: 100 });
        sanitized[sanitizedKey] = sanitizeObject(obj[key], options);
      }
    }
    return sanitized;
  }
  
  return obj;
}

/**
 * Options de nettoyage
 */
interface SanitizeOptions {
  trim?: boolean;
  escapeHtml?: boolean;
  removeControlChars?: boolean;
  maxLength?: number;
  strict?: boolean;
}

/**
 * Middleware de validation des entrées
 */
export const validateInput = (options: SanitizeOptions = {}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const defaultOptions: SanitizeOptions = {
        trim: true,
        escapeHtml: false, // Ne pas échapper par défaut (peut casser les JSON)
        removeControlChars: true,
        maxLength: 10000,
        strict: false,
        ...options
      };
      
      // Valider et nettoyer le body
      if (req.body && Object.keys(req.body).length > 0) {
        // Détecter les patterns dangereux
        const bodyStr = JSON.stringify(req.body);
        const threats = detectDangerousPatterns(bodyStr);
        
        if (threats.length > 0 && defaultOptions.strict) {
          logger.warn('Tentative d\'injection détectée', {
            threats,
            ip: req.ip,
            url: req.originalUrl,
            method: req.method
          });
          
          return next(new AppError(
            'Entrée invalide détectée',
            StatusCodes.BAD_REQUEST
          ));
        }
        
        // Nettoyer le body
        req.body = sanitizeObject(req.body, defaultOptions);
      }
      
      // Valider et nettoyer les query params
      if (req.query && Object.keys(req.query).length > 0) {
        const queryStr = JSON.stringify(req.query);
        const threats = detectDangerousPatterns(queryStr);
        
        if (threats.length > 0 && defaultOptions.strict) {
          logger.warn('Tentative d\'injection dans query params', {
            threats,
            ip: req.ip,
            url: req.originalUrl
          });
          
          return next(new AppError(
            'Paramètres invalides détectés',
            StatusCodes.BAD_REQUEST
          ));
        }
        
        req.query = sanitizeObject(req.query, defaultOptions);
      }
      
      // Valider les params d'URL
      if (req.params && Object.keys(req.params).length > 0) {
        req.params = sanitizeObject(req.params, { ...defaultOptions, maxLength: 100 });
      }
      
      next();
    } catch (error) {
      logger.error('Erreur validation des entrées:', error);
      next(error);
    }
  };
};

/**
 * Middleware strict pour les routes sensibles
 */
export const strictValidation = validateInput({
  trim: true,
  escapeHtml: true,
  removeControlChars: true,
  maxLength: 5000,
  strict: true
});

/**
 * Middleware pour valider les emails
 */
export const validateEmail = (req: Request, res: Response, next: NextFunction) => {
  const email = req.body.email;
  
  if (!email) {
    return next();
  }
  
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!emailRegex.test(email)) {
    return next(new AppError('Format d\'email invalide', StatusCodes.BAD_REQUEST));
  }
  
  // Vérifier la longueur
  if (email.length > 254) {
    return next(new AppError('Email trop long', StatusCodes.BAD_REQUEST));
  }
  
  next();
};

/**
 * Middleware pour valider les mots de passe
 */
export const validatePassword = (req: Request, res: Response, next: NextFunction) => {
  const password = req.body.password;
  
  if (!password) {
    return next();
  }
  
  // Longueur minimale
  if (password.length < 8) {
    return next(new AppError(
      'Le mot de passe doit contenir au moins 8 caractères',
      StatusCodes.BAD_REQUEST
    ));
  }
  
  // Longueur maximale
  if (password.length > 128) {
    return next(new AppError(
      'Le mot de passe est trop long',
      StatusCodes.BAD_REQUEST
    ));
  }
  
  // Vérifier la complexité (au moins une majuscule, une minuscule, un chiffre)
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  
  if (!hasUpperCase || !hasLowerCase || !hasNumber) {
    return next(new AppError(
      'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre',
      StatusCodes.BAD_REQUEST
    ));
  }
  
  next();
};

/**
 * Middleware pour valider les URLs
 */
export const validateUrl = (fieldName: string = 'url') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const url = req.body[fieldName];
    
    if (!url) {
      return next();
    }
    
    try {
      const parsedUrl = new URL(url);
      
      // Vérifier le protocole
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return next(new AppError(
          'Protocole d\'URL non autorisé',
          StatusCodes.BAD_REQUEST
        ));
      }
      
      // Vérifier qu'il n'y a pas de caractères dangereux
      const threats = detectDangerousPatterns(url);
      if (threats.length > 0) {
        return next(new AppError(
          'URL invalide détectée',
          StatusCodes.BAD_REQUEST
        ));
      }
      
      next();
    } catch (error) {
      return next(new AppError('Format d\'URL invalide', StatusCodes.BAD_REQUEST));
    }
  };
};

/**
 * Middleware pour limiter la taille des fichiers uploadés
 */
export const validateFileUpload = (maxSize: number = 5 * 1024 * 1024) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = req.headers['content-length'];
    
    if (contentLength && parseInt(contentLength) > maxSize) {
      return next(new AppError(
        `Fichier trop volumineux. Taille maximale: ${maxSize / 1024 / 1024}MB`,
        StatusCodes.REQUEST_TOO_LONG
      ));
    }
    
    next();
  };
};

/**
 * Exporter les fonctions utilitaires
 */
export {
  sanitizeString,
  sanitizeObject,
  detectDangerousPatterns,
  escapeHtml
};
