// src/controllers/apiKey.controller.ts
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ApiKeyModel } from '../database/models/apiKey.model';
import { PermissionModel } from '../database/models/permission.model';
import AppError from '../utils/AppError';
import { logger } from '../utils/logger';
import { clearApiKeyCache } from '../middlewares/apiKey.middleware';

export const createApiKey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, permissions, expiresAt, rateLimit, allowedIPs, allowedDomains } = req.body;
    const userId = req.user._id;
    
    // Vérifier que les permissions existent
    if (permissions && permissions.length > 0) {
      for (const perm of permissions) {
        if (perm !== '*') {
          const [action, subject] = perm.split(':');
          const permExists = await PermissionModel.findOne({ action, subject });
          if (!permExists) {
            return next(new AppError(`Permission ${perm} n'existe pas`, StatusCodes.BAD_REQUEST));
          }
        }
      }
    }
    
    // Générer l'API key
    const { key, hash, prefix } = ApiKeyModel.generateApiKey();
    
    // Créer l'enregistrement
    const apiKey = new ApiKeyModel({
      userId,
      name,
      keyHash: hash,
      prefix,
      permissions: permissions || [],
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      rateLimit: rateLimit || { requests: 1000, windowMs: 3600000 },
      allowedIPs: allowedIPs || [],
      allowedDomains: allowedDomains || []
    });
    
    await apiKey.save();
    
    logger.info(`[API_KEY] Nouvelle API key créée - User: ${userId} - Name: ${name}`);
    
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'API key créée avec succès',
      data: {
        id: apiKey._id,
        name: apiKey.name,
        key, // Retourné une seule fois
        prefix: apiKey.prefix,
        permissions: apiKey.permissions,
        expiresAt: apiKey.expiresAt,
        rateLimit: apiKey.rateLimit,
        createdAt: apiKey.createdAt
      }
    });
  } catch (error) {
    logger.error('[API_KEY] Erreur lors de la création:', error);
    next(new AppError('Erreur lors de la création de l\'API key', StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

export const listApiKeys = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, active } = req.query;
    
    const filter: any = { userId };
    if (active !== undefined) {
      filter.isActive = active === 'true';
    }
    
    const apiKeys = await ApiKeyModel.find(filter)
      .select('-keyHash')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));
    
    const total = await ApiKeyModel.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        apiKeys: apiKeys.map(key => ({
          id: key._id,
          name: key.name,
          prefix: key.prefix,
          permissions: key.permissions,
          isActive: key.isActive,
          lastUsed: key.lastUsed,
          usageCount: key.usageCount,
          expiresAt: key.expiresAt,
          rateLimit: key.rateLimit,
          createdAt: key.createdAt,
          updatedAt: key.updatedAt
        })),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    logger.error('[API_KEY] Erreur lors de la récupération:', error);
    next(new AppError('Erreur lors de la récupération des API keys', StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

export const updateApiKey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, permissions, isActive, rateLimit, allowedIPs, allowedDomains } = req.body;
    const userId = req.user._id;
    
    const apiKey = await ApiKeyModel.findOne({ _id: id, userId });
    if (!apiKey) {
      return next(new AppError('API key non trouvée', StatusCodes.NOT_FOUND));
    }
    
    // Vérifier les permissions si fournies
    if (permissions && permissions.length > 0) {
      for (const perm of permissions) {
        if (perm !== '*') {
          const [action, subject] = perm.split(':');
          const permExists = await PermissionModel.findOne({ action, subject });
          if (!permExists) {
            return next(new AppError(`Permission ${perm} n'existe pas`, StatusCodes.BAD_REQUEST));
          }
        }
      }
    }
    
    // Mettre à jour les champs
    if (name) apiKey.name = name;
    if (permissions) apiKey.permissions = permissions;
    if (isActive !== undefined) apiKey.isActive = isActive;
    if (rateLimit) apiKey.rateLimit = rateLimit;
    if (allowedIPs) apiKey.allowedIPs = allowedIPs;
    if (allowedDomains) apiKey.allowedDomains = allowedDomains;
    
    await apiKey.save();
    
    // Nettoyer le cache
    clearApiKeyCache();
    
    logger.info(`[API_KEY] API key mise à jour - ID: ${id} - User: ${userId}`);
    
    res.json({
      success: true,
      message: 'API key mise à jour avec succès',
      data: {
        id: apiKey._id,
        name: apiKey.name,
        prefix: apiKey.prefix,
        permissions: apiKey.permissions,
        isActive: apiKey.isActive,
        rateLimit: apiKey.rateLimit,
        allowedIPs: apiKey.allowedIPs,
        allowedDomains: apiKey.allowedDomains,
        updatedAt: apiKey.updatedAt
      }
    });
  } catch (error) {
    logger.error('[API_KEY] Erreur lors de la mise à jour:', error);
    next(new AppError('Erreur lors de la mise à jour de l\'API key', StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

export const revokeApiKey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    const apiKey = await ApiKeyModel.findOne({ _id: id, userId });
    if (!apiKey) {
      return next(new AppError('API key non trouvée', StatusCodes.NOT_FOUND));
    }
    
    apiKey.isActive = false;
    await apiKey.save();
    
    // Nettoyer le cache
    clearApiKeyCache();
    
    logger.info(`[API_KEY] API key révoquée - ID: ${id} - User: ${userId}`);
    
    res.json({
      success: true,
      message: 'API key révoquée avec succès'
    });
  } catch (error) {
    logger.error('[API_KEY] Erreur lors de la révocation:', error);
    next(new AppError('Erreur lors de la révocation de l\'API key', StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

export const deleteApiKey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    const result = await ApiKeyModel.deleteOne({ _id: id, userId });
    if (result.deletedCount === 0) {
      return next(new AppError('API key non trouvée', StatusCodes.NOT_FOUND));
    }
    
    // Nettoyer le cache
    clearApiKeyCache();
    
    logger.info(`[API_KEY] API key supprimée - ID: ${id} - User: ${userId}`);
    
    res.json({
      success: true,
      message: 'API key supprimée avec succès'
    });
  } catch (error) {
    logger.error('[API_KEY] Erreur lors de la suppression:', error);
    next(new AppError('Erreur lors de la suppression de l\'API key', StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

export const getApiKeyStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    const apiKey = await ApiKeyModel.findOne({ _id: id, userId });
    if (!apiKey) {
      return next(new AppError('API key non trouvée', StatusCodes.NOT_FOUND));
    }
    
    res.json({
      success: true,
      data: {
        id: apiKey._id,
        name: apiKey.name,
        usageCount: apiKey.usageCount,
        lastUsed: apiKey.lastUsed,
        createdAt: apiKey.createdAt,
        isActive: apiKey.isActive,
        rateLimit: apiKey.rateLimit
      }
    });
  } catch (error) {
    logger.error('[API_KEY] Erreur lors de la récupération des stats:', error);
    next(new AppError('Erreur lors de la récupération des statistiques', StatusCodes.INTERNAL_SERVER_ERROR));
  }
};