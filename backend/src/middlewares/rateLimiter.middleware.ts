// src/middlewares/rateLimiter.middleware.ts
import rateLimit from 'express-rate-limit';
import { StatusCodes } from 'http-status-codes';
import { RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS } from '../config';

const rateLimiter = rateLimit({
  // Fenêtre de temps en millisecondes
  windowMs: RATE_LIMIT_WINDOW_MS,
  // Nombre maximum de requêtes autorisées dans la fenêtre de temps
  max: RATE_LIMIT_MAX_REQUESTS,
  // Message à envoyer lorsque la limite est dépassée
  message: {
    status: 'fail',
    message: 'Trop de requêtes effectuées depuis cette IP, veuillez réessayer plus tard.',
  },
  // Code de statut HTTP à renvoyer
  statusCode: StatusCodes.TOO_MANY_REQUESTS,
  // Inclure les en-têtes standard 'RateLimit-*' dans la réponse
  standardHeaders: 'draft-7',
  // Ne pas inclure les anciens en-têtes 'X-RateLimit-*'
  legacyHeaders: false,
});

export default rateLimiter;