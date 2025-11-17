// src/utils/logger.ts
import winston from 'winston';
import { NODE_ENV } from '../config';

// Définit les niveaux de log standards
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

// En développement, on veut des logs colorés et lisibles
const devFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info) => `[${info.timestamp}] ${info.level}: ${info.message}`
    )
);

// En production, on veut des logs structurés en JSON pour une analyse facile
const prodFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
);

// On choisit le format en fonction de l'environnement
const format = NODE_ENV === 'production' ? prodFormat : devFormat;

// Format pour les fichiers (sans couleurs ANSI)
const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.uncolorize(), // Supprime les codes ANSI
    winston.format.printf(
        (info) => `[${info.timestamp}] ${info.level.toUpperCase()}: ${info.message}`
    )
);

// Définit les "transports" (où les logs sont envoyés)
const transportsConfig: winston.transport[] = [
    // Console avec couleurs
    new winston.transports.Console(),
    
    // Fichiers de logs spécialisés (toujours actifs)
    new winston.transports.File({
        filename: 'logs/application.log',
        format: fileFormat
    }),
    new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: fileFormat
    }),
    new winston.transports.File({
        filename: 'logs/debug.log',
        level: 'debug',
        format: fileFormat
    })
];

// Mode silencieux pour le démarrage (peut être contrôlé par variable d'environnement)
const SILENT_MODE = process.env.SILENT_LOGS === 'true' || NODE_ENV === 'development';

// Création de l'instance du logger
export const logger = winston.createLogger({
    level: SILENT_MODE ? 'error' : (NODE_ENV === 'production' ? 'info' : 'debug'),
    levels,
    format, // Pour la console
    transports: transportsConfig,
    exitOnError: false,
    silent: false,
});

// Loggers spécialisés pour différents types
export const securityLogger = winston.createLogger({
    level: 'info',
    format: fileFormat,
    transports: [
        new winston.transports.File({ filename: 'logs/security.log' })
    ]
});

export const performanceLogger = winston.createLogger({
    level: 'info',
    format: fileFormat,
    transports: [
        new winston.transports.File({ filename: 'logs/performance.log' })
    ]
});

export const requestLogger = winston.createLogger({
    level: 'info',
    format: fileFormat,
    transports: [
        new winston.transports.File({ filename: 'logs/requests.log' })
    ]
});

export const alertsLogger = winston.createLogger({
    level: 'warn',
    format: fileFormat,
    transports: [
        new winston.transports.File({ filename: 'logs/alerts.log' })
    ]
});

export const redisLogger = winston.createLogger({
    level: 'info',
    format: fileFormat,
    transports: [
        new winston.transports.File({ filename: 'logs/redis.log' })
    ]
});