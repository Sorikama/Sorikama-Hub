/**
 * Middleware de sécurité avancée
 * 
 * Content Security Policy (CSP)
 * Protection Clickjacking
 * Headers de sécurité supplémentaires
 */

import { Request, Response, NextFunction } from 'express';
import { NODE_ENV } from '../config/environments';
import { logger } from '../utils/logger';

/**
 * Configuration CSP par environnement
 */
const getCspDirectives = () => {
  const isDev = NODE_ENV === 'development';
  
  return {
    defaultSrc: ["'self'"],
    
    scriptSrc: [
      "'self'",
      "https://cdn.tailwindcss.com",
      "https://cdn.jsdelivr.net",
      ...(isDev ? ["'unsafe-inline'", "'unsafe-eval'"] : [])
    ],
    
    styleSrc: [
      "'self'",
      "https://fonts.googleapis.com",
      "https://cdnjs.cloudflare.com",
      "'unsafe-inline'" // Nécessaire pour Tailwind
    ],
    
    fontSrc: [
      "'self'",
      "https://fonts.gstatic.com",
      "https://cdnjs.cloudflare.com"
    ],
    
    imgSrc: ["'self'", "data:", "https:"],
    
    connectSrc: ["'self'"],
    
    frameSrc: ["'none'"],
    
    objectSrc: ["'none'"],
    
    mediaSrc: ["'self'"],
    
    manifestSrc: ["'self'"],
    
    workerSrc: ["'self'"],
    
    formAction: ["'self'"],
    
    frameAncestors: ["'none'"], // Protection clickjacking
    
    baseUri: ["'self'"],
    
    ...(NODE_ENV === 'production' ? { upgradeInsecureRequests: [] } : {})
  };
};

/**
 * Middleware Content Security Policy
 */
export const contentSecurityPolicy = (req: Request, res: Response, next: NextFunction) => {
  const directives = getCspDirectives();
  
  // Construire la chaîne CSP
  const cspString = Object.entries(directives)
    .map(([key, values]) => {
      const directive = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      if (Array.isArray(values) && values.length > 0) {
        return `${directive} ${values.join(' ')}`;
      }
      return directive;
    })
    .join('; ');
  
  res.setHeader('Content-Security-Policy', cspString);
  
  // CSP en mode report-only pour le développement
  if (NODE_ENV === 'development') {
    res.setHeader('Content-Security-Policy-Report-Only', cspString);
  }
  
  next();
};

/**
 * Protection Clickjacking (X-Frame-Options)
 */
export const clickjackingProtection = (req: Request, res: Response, next: NextFunction) => {
  // Empêcher l'affichage dans une iframe
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Alternative moderne (déjà dans CSP mais on le met aussi ici)
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  next();
};

/**
 * Headers de sécurité supplémentaires
 */
export const securityHeadersAdvanced = (req: Request, res: Response, next: NextFunction) => {
  // Désactiver le cache pour les pages sensibles
  if (req.path.includes('/admin') || req.path.includes('/auth')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
  }
  
  // Protection XSS
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Permissions Policy (anciennement Feature Policy)
  res.setHeader('Permissions-Policy', [
    'geolocation=()',
    'microphone=()',
    'camera=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()'
  ].join(', '));
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Cross-Origin Policies
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  
  next();
};

/**
 * Middleware HSTS (HTTP Strict Transport Security)
 */
export const hstsProtection = (req: Request, res: Response, next: NextFunction) => {
  if (NODE_ENV === 'production') {
    // Forcer HTTPS pendant 1 an
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  next();
};

/**
 * Middleware pour logger les violations CSP
 */
export const cspReportHandler = (req: Request, res: Response, next: NextFunction) => {
  if (req.path === '/csp-report' && req.method === 'POST') {
    logger.warn('Violation CSP détectée', {
      report: req.body,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    return res.status(204).end();
  }
  
  next();
};

/**
 * Middleware combiné de sécurité avancée
 */
export const advancedSecurityMiddleware = [
  contentSecurityPolicy,
  clickjackingProtection,
  securityHeadersAdvanced,
  hstsProtection,
  cspReportHandler
];
