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

// Définit les "transports" (où les logs sont envoyés)
// <-- CORRIGÉ : On type explicitement le tableau pour qu'il accepte n'importe quel transport Winston.
const transportsConfig: winston.transport[] = [
    // On logue toujours dans la console
    new winston.transports.Console(),
];

// En production, on ajoute également des logs dans des fichiers
if (NODE_ENV === 'production') {
    transportsConfig.push(
        // Un fichier pour tous les logs d'erreur
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
        }),
        // Un fichier pour tous les logs
        new winston.transports.File({ filename: 'logs/combined.log' })
    );
}

// Création de l'instance du logger
export const logger = winston.createLogger({
    level: NODE_ENV === 'production' ? 'info' : 'debug', // En dev, on logue plus de détails
    levels,
    format,
    transports: transportsConfig,
    // Ne pas quitter l'application en cas d'erreur non gérée
    exitOnError: false,
});