// src/utils/applicationLogger.ts
import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Créer le dossier logs s'il n'existe pas
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Format personnalisé pour les logs
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message} ${metaStr}`;
  })
);

// Logger principal de l'application - Optimisé pour les performances
export const appLogger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
  format: customFormat,
  transports: [
    // Logs généraux de l'application
    new winston.transports.File({
      filename: path.join(logsDir, 'application.log'),
      level: 'info',
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 3,
      tailable: true
    }),
    
    // Logs d'erreurs uniquement
    new winston.transports.File({
      filename: path.join(logsDir, 'errors.log'),
      level: 'error',
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 3,
      tailable: true
    }),
    
    // Console pour développement
    new winston.transports.Console({
      level: process.env.NODE_ENV === 'production' ? 'error' : 'info',
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Logger spécialisé pour les requêtes HTTP - Réduit en production
export const requestLogger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      return `[${timestamp}] REQUEST: ${message} ${JSON.stringify(meta)}`;
    })
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, 'requests.log'),
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 2,
      tailable: true
    })
  ]
});

// Logger pour les alertes et événements critiques
export const alertLogger = winston.createLogger({
  level: 'warn',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      return `[${timestamp}] ALERT-${level.toUpperCase()}: ${message} ${JSON.stringify(meta)}`;
    })
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, 'alerts.log'),
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
      tailable: true
    }),
    
    // Console pour les alertes critiques
    new winston.transports.Console({
      level: 'error',
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Logger pour les métriques de performance - Optimisé
export const performanceLogger = winston.createLogger({
  level: 'warn', // Seulement les requêtes lentes
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, message, ...meta }) => {
      return `[${timestamp}] PERF: ${message} ${JSON.stringify(meta)}`;
    })
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, 'performance.log'),
      maxsize: 3 * 1024 * 1024, // 3MB
      maxFiles: 2,
      tailable: true
    })
  ]
});

// Logger pour la sécurité
export const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      return `[${timestamp}] SECURITY-${level.toUpperCase()}: ${message} ${JSON.stringify(meta)}`;
    })
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, 'security.log'),
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 10,
      tailable: true
    }),
    
    // Console pour les événements de sécurité critiques
    new winston.transports.Console({
      level: 'warn',
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Middleware de logging des requêtes HTTP - Optimisé
export const httpLoggingMiddleware = (req: any, res: any, next: any) => {
  const startTime = Date.now();
  
  // Intercepter la fin de la réponse
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any) {
    const responseTime = Date.now() - startTime;
    
    // Log seulement les erreurs et requêtes lentes
    if (res.statusCode >= 400 || responseTime > 1000) {
      requestLogger.warn('Request issue', {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        responseTime: `${responseTime}ms`,
        ip: req.ip
      });
    }
    
    // Log des performances si la requête est très lente
    if (responseTime > 2000) {
      performanceLogger.warn('Very slow request', {
        method: req.method,
        url: req.originalUrl,
        responseTime: `${responseTime}ms`,
        statusCode: res.statusCode
      });
    }
    
    // Appeler la méthode originale
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

// Fonction utilitaire pour logger les événements de sécurité
export const logSecurityEvent = (event: string, details: any, level: 'info' | 'warn' | 'error' = 'warn') => {
  securityLogger[level](event, {
    ...details,
    timestamp: new Date().toISOString(),
    severity: level.toUpperCase()
  });
};

// Fonction utilitaire pour logger les alertes
export const logAlert = (message: string, details: any, level: 'warn' | 'error' = 'warn') => {
  alertLogger[level](message, {
    ...details,
    timestamp: new Date().toISOString(),
    alertLevel: level.toUpperCase()
  });
};