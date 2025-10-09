// src/utils/redisLogger.ts
import winston from 'winston';
import path from 'path';

// Configuration des logs Redis séparés - Optimisé
const redisLogger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
    })
  ),
  transports: [
    // Log Redis général
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'redis.log'),
      level: 'info',
      maxsize: 3 * 1024 * 1024, // 3MB
      maxFiles: 2
    }),
    // Log erreurs Redis
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'redis-errors.log'),
      level: 'error',
      maxsize: 2 * 1024 * 1024, // 2MB
      maxFiles: 2
    })
  ]
});

// Logger spécialisé pour les métriques Redis - Réduit
const metricsLogger = winston.createLogger({
  level: 'warn', // Seulement les problèmes
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      return `[${timestamp}] METRICS-${level.toUpperCase()}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
    })
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'redis-metrics.log'),
      level: 'warn',
      maxsize: 2 * 1024 * 1024, // 2MB
      maxFiles: 1
    })
  ]
});

export { redisLogger, metricsLogger };