/**
 * Contrôleur Proxy - Route toutes les requêtes vers les services externes
 * 
 * Fonctionnalités :
 * - Cryptage de l'ID utilisateur
 * - Ajout des headers spéciaux
 * - Proxy de la requête
 * - Logging complet
 * - Gestion des erreurs
 */

import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import axios, { AxiosRequestConfig } from 'axios';
import { UserEncryptionService } from '../services/userEncryption.service';
import { ProxyRequestModel } from '../database/models/proxyRequest.model';
import { logger } from '../utils/logger';
import AppError from '../utils/AppError';

/**
 * Proxy une requête vers un service externe
 */
export const proxyRequest = async (req: any, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  try {
    const { serviceId } = req.params;
    const endpoint = '/' + (req.params[0] || '');
    const userId = req.user.id;
    const service = req.service;
    const ssoSession = req.ssoSession;

    logger.info('🔄 Proxy de requête', {
      userId,
      serviceId,
      method: req.method,
      endpoint,
      sessionId: ssoSession.sessionId
    });

    // Crypter l'ID utilisateur pour ce service
    const encryptedUserId = UserEncryptionService.encryptUserId(userId, serviceId);

    // Construire l'URL complète du service externe
    const targetUrl = `${service.url}${endpoint}`;

    // Préparer les headers à envoyer au service externe
    const proxyHeaders: any = {
      // Headers spéciaux Sorikama
      'X-Sorikama-User-ID': encryptedUserId,
      'X-Sorikama-Session-ID': ssoSession.sessionId,
      'X-Sorikama-Service-ID': serviceId,
      'X-Sorikama-Timestamp': new Date().toISOString(),
      
      // Forwarded headers
      'X-Forwarded-For': req.ip,
      'X-Forwarded-Proto': req.protocol,
      'X-Forwarded-Host': req.hostname,
      
      // Headers originaux (sauf Authorization et X-API-Key)
      ...req.headers
    };

    // Supprimer les headers sensibles
    delete proxyHeaders['authorization'];
    delete proxyHeaders['x-api-key'];
    delete proxyHeaders['cookie'];
    delete proxyHeaders['host'];

    // Configuration de la requête axios
    const axiosConfig: AxiosRequestConfig = {
      method: req.method as any,
      url: targetUrl,
      headers: proxyHeaders,
      params: req.query,
      timeout: 30000, // 30 secondes
      validateStatus: () => true // Accepter tous les status codes
    };

    // Ajouter le body si présent (pour POST, PUT, PATCH)
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      axiosConfig.data = req.body;
    }

    // Faire la requête vers le service externe
    const response = await axios(axiosConfig);
    
    const responseTime = Date.now() - startTime;
    const success = response.status >= 200 && response.status < 400;

    // Logger la requête dans la base de données
    await ProxyRequestModel.create({
      userId,
      serviceId,
      method: req.method,
      endpoint,
      statusCode: response.status,
      responseTime,
      success,
      errorMessage: success ? undefined : response.statusText,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      timestamp: new Date()
    });

    logger.info(`${success ? '✅' : '❌'} Proxy terminé`, {
      userId,
      serviceId,
      endpoint,
      statusCode: response.status,
      responseTime: `${responseTime}ms`
    });

    // Retourner la réponse du service externe
    res.status(response.status).json(response.data);

  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    logger.error('❌ Erreur lors du proxy:', error);

    // Logger l'erreur
    await ProxyRequestModel.create({
      userId: req.user?.id,
      serviceId: req.params.serviceId,
      method: req.method,
      endpoint: '/' + (req.params[0] || ''),
      statusCode: error.response?.status || 500,
      responseTime,
      success: false,
      errorMessage: error.message,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      timestamp: new Date()
    });

    next(error);
  }
};
