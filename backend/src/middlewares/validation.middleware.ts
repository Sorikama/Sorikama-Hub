// src/middlewares/validation.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { StatusCodes } from 'http-status-codes';
import AppError from '../utils/AppError';

/**
 * Middleware pour valider les données du corps de la requête avec un schéma Joi.
 * @param schema Le schéma Joi à utiliser pour la validation.
 */
export const validateBody = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Rapporte toutes les erreurs, pas seulement la première
      stripUnknown: true, // Supprime les champs inconnus du corps
    });

    if (error) {
      // Formate le message d'erreur pour être plus lisible
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return next(new AppError(errorMessage, StatusCodes.BAD_REQUEST));
    }

    req.body = value; // Remplace le corps de la requête par les données validées et nettoyées
    next();
  };
};