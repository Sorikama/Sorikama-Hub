// src/services/serviceManager.service.ts
import { ServiceModel, IService } from '../database/models/service.model';
import { ServiceRequestModel } from '../database/models/serviceRequest.model';
import { SSOSessionModel } from '../database/models/ssoSession.model';
import { UserModel } from '../database/models/user.model';
import { logger } from '../utils/logger';
import { logServiceEvent, logSSOEvent } from '../middlewares/realLogging.middleware';
import axios from 'axios';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

export class ServiceManager {
  
  // Initialiser les services par défaut (vide maintenant - tout se fait via l'interface)
  static async initializeDefaultServices() {
    logger.info('✅ Système de services initialisé - Utilisez l\'interface d\'administration pour ajouter des services');
  }

  // Créer un nouveau service externe
  static async createService(serviceData: any): Promise<IService> {
    // Vérifier que l'ID est unique
    const existingService = await ServiceModel.findOne({ id: serviceData.id });
    if (existingService) {
      throw new Error('Un service avec cet ID existe déjà');
    }

    // Créer le service
    const service = await ServiceModel.create({
      ...serviceData,
      status: serviceData.status || 'active',
      ssoEnabled: serviceData.ssoEnabled !== false,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    logger.info(`✅ Service ${service.name} créé`, { serviceId: service.id });
    return service;
  }

  // Mettre à jour un service existant
  static async updateService(serviceId: string, updateData: any): Promise<IService | null> {
    const service = await ServiceModel.findOneAndUpdate(
      { id: serviceId },
      { ...updateData, updatedAt: new Date() },
      { new: true }
    );

    if (service) {
      logger.info(`✅ Service ${service.name} mis à jour`, { serviceId });
    }

    return service;
  }

  // Supprimer un service
  static async deleteService(serviceId: string): Promise<boolean> {
    const result = await ServiceModel.deleteOne({ id: serviceId });
    
    if (result.deletedCount > 0) {
      // Supprimer aussi les sessions SSO associées
      await SSOSessionModel.deleteMany({ serviceId });
      logger.info(`✅ Service supprimé`, { serviceId });
      return true;
    }

    return false;
  }

  // Obtenir tous les services
  static async getAllServices(): Promise<IService[]> {
    return await ServiceModel.find().sort({ name: 1 });
  }

  // Obtenir un service par ID
  static async getServiceById(id: string): Promise<IService | null> {
    return await ServiceModel.findOne({ id });
  }

  // Tester la connectivité d'un service
  static async testService(serviceId: string): Promise<any> {
    const service = await ServiceModel.findOne({ id: serviceId });
    if (!service) {
      throw new Error('Service non trouvé');
    }

    const startTime = Date.now();
    let success = false;
    let statusCode = 0;
    let errorMessage = '';

    try {
      const healthUrl = service.url + (service.healthCheckUrl || '/health');
      const response = await axios.get(healthUrl, { 
        timeout: 5000,
        headers: {
          'User-Agent': 'Sorikama-Gateway/1.0'
        }
      });
      
      success = response.status >= 200 && response.status < 300;
      statusCode = response.status;
    } catch (error: any) {
      success = false;
      statusCode = error.response?.status || 0;
      errorMessage = error.message;
    }

    const responseTime = Date.now() - startTime;

    // Mettre à jour les métriques du service
    await ServiceModel.updateOne(
      { id: serviceId },
      {
        $set: {
          lastCheck: new Date(),
          responseTime,
          lastError: success ? undefined : errorMessage
        },
        $inc: {
          requestCount: 1,
          errorCount: success ? 0 : 1
        }
      }
    );

    // Enregistrer la requête
    await ServiceRequestModel.create({
      serviceId,
      method: 'GET',
      endpoint: service.healthCheckUrl || '/health',
      statusCode,
      responseTime,
      success,
      errorMessage: success ? undefined : errorMessage
    });

    // Calculer l'uptime
    const totalRequests = await ServiceRequestModel.countDocuments({ serviceId });
    const successfulRequests = await ServiceRequestModel.countDocuments({ serviceId, success: true });
    const uptime = totalRequests > 0 ? Math.round((successfulRequests / totalRequests) * 100) : 100;

    await ServiceModel.updateOne({ id: serviceId }, { uptime });

    // Logger l'événement de service
    logServiceEvent(serviceId, 'health_check', success, responseTime);

    return {
      success,
      service: service.name,
      url: service.url,
      responseTime,
      statusCode,
      uptime,
      timestamp: new Date().toISOString(),
      message: success ? 'Service opérationnel' : `Service indisponible: ${errorMessage}`
    };
  }

  // Activer/Désactiver un service
  static async toggleServiceStatus(serviceId: string, status: 'active' | 'inactive' | 'maintenance'): Promise<IService | null> {
    const service = await ServiceModel.findOneAndUpdate(
      { id: serviceId },
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (service) {
      logger.info(`Service ${service.name} ${status === 'active' ? 'activé' : 'désactivé'}`);
    }

    return service;
  }

  // Obtenir les métriques d'un service
  static async getServiceMetrics(serviceId: string, hours: number = 24) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    const requests = await ServiceRequestModel.find({
      serviceId,
      timestamp: { $gte: since }
    }).sort({ timestamp: -1 });

    const totalRequests = requests.length;
    const successfulRequests = requests.filter(r => r.success).length;
    const avgResponseTime = requests.length > 0 
      ? Math.round(requests.reduce((sum, r) => sum + r.responseTime, 0) / requests.length)
      : 0;

    return {
      totalRequests,
      successfulRequests,
      errorCount: totalRequests - successfulRequests,
      uptime: totalRequests > 0 ? Math.round((successfulRequests / totalRequests) * 100) : 100,
      avgResponseTime,
      requests: requests.slice(0, 50) // Dernières 50 requêtes
    };
  }

  // Proxy vers un service avec authentification
  static async proxyRequest(serviceId: string, endpoint: string, method: string, data?: any, headers?: any, userId?: string) {
    const service = await ServiceModel.findOne({ id: serviceId, status: 'active' });
    if (!service) {
      throw new Error('Service non disponible');
    }

    const startTime = Date.now();
    let success = false;
    let statusCode = 0;
    let responseData = null;
    let errorMessage = '';

    try {
      const url = service.url + endpoint;
      const response = await axios({
        method,
        url,
        data,
        headers: {
          ...headers,
          'X-Forwarded-By': 'Sorikama-Gateway',
          'X-Service-ID': serviceId
        },
        timeout: 30000
      });

      success = true;
      statusCode = response.status;
      responseData = response.data;
    } catch (error: any) {
      success = false;
      statusCode = error.response?.status || 500;
      errorMessage = error.message;
      responseData = error.response?.data || { error: errorMessage };
    }

    const responseTime = Date.now() - startTime;

    // Enregistrer la requête
    await ServiceRequestModel.create({
      serviceId,
      method,
      endpoint,
      statusCode,
      responseTime,
      success,
      errorMessage: success ? undefined : errorMessage
    });

    // Mettre à jour les métriques
    await ServiceModel.updateOne(
      { id: serviceId },
      {
        $set: { lastCheck: new Date() },
        $inc: { 
          requestCount: 1,
          errorCount: success ? 0 : 1
        }
      }
    );

    return {
      success,
      statusCode,
      data: responseData,
      responseTime
    };
  }

  // Générer une URL d'authentification SSO pour un service
  static async generateSSOUrl(serviceId: string, userId: string, redirectUrl?: string): Promise<string> {
    const service = await ServiceModel.findOne({ id: serviceId, status: 'active' });
    if (!service || !service.ssoEnabled) {
      throw new Error('Service non disponible ou SSO non activé');
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Générer un state unique pour la sécurité
    const state = crypto.randomBytes(32).toString('hex');
    const sessionId = crypto.randomBytes(16).toString('hex');

    // Créer le token JWT avec les infos utilisateur
    const payload = {
      userId: user._id,
      username: (user as any).username,
      email: (user as any).email,
      serviceId,
      sessionId,
      state,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 heure
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'sorikama-secret');

    // Sauvegarder la session SSO
    await SSOSessionModel.create({
      sessionId,
      userId: user._id.toString(),
      serviceId,
      accessToken: token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 heure
      redirectUrl,
      state,
      userInfo: {
        id: user._id,
        username: (user as any).username,
        email: (user as any).email
      }
    });

    // Vérifier si le service externe est accessible
    let serviceAvailable = false;
    try {
      const axios = require('axios');
      const healthUrl = service.healthCheckUrl || service.url;
      await axios.get(healthUrl, { timeout: 2000 });
      serviceAvailable = true;
      logger.info(`✅ Service ${service.name} accessible`, { url: healthUrl });
    } catch (error) {
      logger.warn(`⚠️ Service ${service.name} non accessible, redirection vers callback Hub`, { 
        url: service.url,
        error: (error as any).message 
      });
    }

    let finalUrl: string;

    if (serviceAvailable) {
      // Service externe accessible - redirection normale
      const authUrl = new URL(service.url + (service.authEndpoint || '/auth/sorikama'));
      authUrl.searchParams.set('token', token);
      authUrl.searchParams.set('state', state);
      authUrl.searchParams.set('redirect_uri', redirectUrl || `http://localhost:${process.env.PORT || 7000}/api/v1/sso/callback`);
      authUrl.searchParams.set('client_id', 'sorikama-hub');
      
      if (service.scopes && service.scopes.length > 0) {
        authUrl.searchParams.set('scope', service.scopes.join(' '));
      }

      finalUrl = authUrl.toString();
      logger.info(`🔐 Redirection vers service externe: ${service.name}`, {
        serviceId,
        userId,
        sessionId
      });
    } else {
      // Service non accessible - redirection directe vers callback Hub
      const callbackUrl = new URL(`http://localhost:${process.env.PORT || 7000}/api/v1/sso/callback`);
      callbackUrl.searchParams.set('token', token);
      callbackUrl.searchParams.set('state', state);
      callbackUrl.searchParams.set('service_id', serviceId);
      callbackUrl.searchParams.set('redirect_url', redirectUrl || '');

      finalUrl = callbackUrl.toString();
      logger.info(`🔐 Redirection directe vers callback Hub (service non disponible)`, {
        serviceId,
        userId,
        sessionId
      });
    }

    // Logger l'événement SSO
    logSSOEvent('url_generated', serviceId, userId, true);

    return finalUrl;
  }

  // Valider un token SSO de retour
  static async validateSSOCallback(token: string, state: string, serviceId: string): Promise<any> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sorikama-secret') as any;
      
      const session = await SSOSessionModel.findOne({
        sessionId: decoded.sessionId,
        state,
        serviceId,
        expiresAt: { $gt: new Date() }
      });

      if (!session) {
        throw new Error('Session SSO invalide ou expirée');
      }

      logger.info(`✅ Callback SSO validé pour ${serviceId}`, {
        userId: session.userId,
        sessionId: session.sessionId
      });

      // Logger l'événement SSO
      logSSOEvent('callback_validated', serviceId, session.userId, true);

      return {
        success: true,
        userId: session.userId,
        userInfo: session.userInfo,
        redirectUrl: session.redirectUrl,
        sessionId: session.sessionId
      };
    } catch (error: any) {
      logger.error('❌ Erreur validation SSO:', error);
      throw new Error('Token SSO invalide');
    }
  }

  // Révoquer une session SSO
  static async revokeSSOSession(sessionId: string): Promise<boolean> {
    const result = await SSOSessionModel.deleteOne({ sessionId });
    return result.deletedCount > 0;
  }

  // Rafraîchir un token SSO expiré ou proche de l'expiration
  static async refreshSSOToken(sessionId: string, serviceId: string): Promise<any> {
    // Récupérer la session (même si expirée, on garde une fenêtre de 24h)
    const session = await SSOSessionModel.findOne({
      sessionId,
      serviceId,
      // Permettre le refresh jusqu'à 24h après expiration
      expiresAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    if (!session) {
      throw new Error('Session SSO introuvable ou trop ancienne');
    }

    // Vérifier que le service existe toujours
    const service = await ServiceModel.findOne({ id: serviceId, status: 'active' });
    if (!service || !service.ssoEnabled) {
      throw new Error('Service non disponible ou SSO désactivé');
    }

    // Récupérer l'utilisateur
    const user = await UserModel.findById(session.userId);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Générer un nouveau token avec une nouvelle expiration
    const newPayload = {
      userId: user._id,
      username: (user as any).username,
      email: (user as any).email,
      serviceId,
      sessionId, // Garder le même sessionId
      state: session.state,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 heure
    };

    const newToken = jwt.sign(newPayload, process.env.JWT_SECRET || 'sorikama-secret');
    const newExpiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Mettre à jour la session en BDD
    await SSOSessionModel.updateOne(
      { sessionId },
      {
        $set: {
          accessToken: newToken,
          expiresAt: newExpiresAt,
          updatedAt: new Date()
        }
      }
    );

    logger.info(`🔄 Token SSO rafraîchi`, {
      sessionId,
      serviceId,
      userId: user._id,
      newExpiresAt
    });

    // Logger l'événement
    logSSOEvent('token_refreshed', serviceId, user._id.toString(), true);

    return {
      accessToken: newToken,
      expiresAt: newExpiresAt,
      sessionId
    };
  }

  // Obtenir les sessions actives d'un utilisateur
  static async getUserSSOSessions(userId: string): Promise<any[]> {
    const sessions = await SSOSessionModel.find({
      userId,
      expiresAt: { $gt: new Date() }
    }).populate('serviceId');

    return sessions.map(session => ({
      sessionId: session.sessionId,
      serviceId: session.serviceId,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt
    }));
  }

  // Nettoyer les sessions expirées
  static async cleanupExpiredSessions(): Promise<number> {
    const result = await SSOSessionModel.deleteMany({
      expiresAt: { $lt: new Date() }
    });
    
    if (result.deletedCount > 0) {
      logger.info(`🧹 ${result.deletedCount} sessions SSO expirées supprimées`);
    }
    
    return result.deletedCount;
  }

  // Vérifier la santé de tous les services
  static async checkAllServicesHealth(): Promise<any> {
    const services = await ServiceModel.find({ status: 'active' });
    const results = [];

    for (const service of services) {
      try {
        const result = await this.testService(service.id);
        results.push({
          serviceId: service.id,
          name: service.name,
          ...result
        });
      } catch (error: any) {
        results.push({
          serviceId: service.id,
          name: service.name,
          success: false,
          message: error.message
        });
      }
    }

    return {
      timestamp: new Date().toISOString(),
      totalServices: services.length,
      healthyServices: results.filter(r => r.success).length,
      results
    };
  }
}