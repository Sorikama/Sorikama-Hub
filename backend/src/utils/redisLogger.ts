// src/utils/redisLogger.ts
import winston from 'winston';
import path from 'path';

// Configuration des logs Redis séparés
const redisLogger = winston.createLogger({
  level: 'debug',
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
      level: 'info'
    }),
    // Log erreurs Redis
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'redis-errors.log'),
      level: 'error'
    }),
    // Log connexions Redis
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'redis-connections.log'),
      level: 'debug'
    }),
    // Console pour développement
    new winston.transports.Console({
      level: 'info',
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Logger spécialisé pour les métriques Redis
const metricsLogger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      return `[${timestamp}] METRICS-${level.toUpperCase()}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
    })
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'redis-metrics.log'),
      level: 'debug'
    })
  ]
});

export { redisLogger, metricsLogger };