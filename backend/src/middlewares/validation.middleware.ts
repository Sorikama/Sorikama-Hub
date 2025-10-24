// src/middlewares/validation.middleware.ts
import { Request, Response, NextFunction } from 'express';
import Joi, { Schema } from 'joi';
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

// Schémas de validation pour les API Keys
export const apiKeyCreationSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  permissions: Joi.array().items(Joi.string()).optional(),
  expiresAt: Joi.date().greater('now').optional(),
  rateLimit: Joi.object({
    requests: Joi.number().integer().min(1).max(10000).required(),
    windowMs: Joi.number().integer().min(60000).max(86400000).required()
  }).optional(),
  allowedIPs: Joi.array().items(Joi.string().ip()).optional(),
  allowedDomains: Joi.array().items(Joi.string().domain()).optional()
});

export const apiKeyUpdateSchema = Joi.object({
  name: Joi.string().min(3).max(100).optional(),
  permissions: Joi.array().items(Joi.string()).optional(),
  isActive: Joi.boolean().optional(),
  rateLimit: Joi.object({
    requests: Joi.number().integer().min(1).max(10000).required(),
    windowMs: Joi.number().integer().min(60000).max(86400000).required()
  }).optional(),
  allowedIPs: Joi.array().items(Joi.string().ip()).optional(),
  allowedDomains: Joi.array().items(Joi.string().domain()).optional()
});

// Middlewares de validation spécifiques
export const validateApiKeyCreation = validateBody(apiKeyCreationSchema);
export const validateApiKeyUpdate = validateBody(apiKeyUpdateSchema);