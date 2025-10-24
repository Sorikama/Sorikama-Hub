// src/middlewares/errorHandler.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { logger } from '../utils/logger';
import { NODE_ENV } from '../config';
import AppError from '../utils/AppError'; // Importez AppError

// Interface pour la réponse d'erreur
interface ErrorResponse {
  status: 'fail' | 'error';
  message: string;
  stack?: string;
}

const sendErrorDev = (err: AppError, res: Response) => {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        stack: err.stack,
        error: err
    });
};

const sendErrorProd = (err: AppError, res: Response) => {
    // Erreurs opérationnelles, prévues : on envoie le message au client
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    }

    // Erreurs de programmation ou inconnues : on ne fuite pas les détails
    // 1. On log l'erreur pour les développeurs
    logger.error('ERREUR 💥', err);
    
    // 2. On envoie un message générique
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: 'Quelque chose s\'est très mal passé !',
    });
};

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  err.status = err.status || 'error';

  if (NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (NODE_ENV === 'production') {
    // On s'assure que `err` est une instance de AppError pour avoir `isOperational`
    let error = Object.assign(err, {});
    
    // Vous pouvez ajouter ici des gestions d'erreurs spécifiques à Mongoose ou JWT
    // if (error.name === 'CastError') error = handleCastErrorDB(error);
    // if (error.name === 'JsonWebTokenError') error = handleJWTError();

    sendErrorProd(error, res);
  }
};