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
  
  // Initialiser les services par défaut
  static async initializeDefaultServices() {
    const defaultServices = [
      {
        id: 'soristore',
        name: 'SoriStore',
        description: 'Plateforme e-commerce révolutionnaire',
        url: process.env.SORISTORE_SERVICE_URL || 'http://localhost:3001',
        icon: 'fas fa-store',
        color: 'blue',
        version: '2.1.0',
        endpoints: ['/products', '/orders', '/inventory'],
        healthCheckUrl: '/health',
        redirectUrls: ['http://localhost:3000/auth/callback'],
        ssoEnabled: true,
        authEndpoint: '/auth/sorikama',
        tokenEndpoint: '/auth/token',
        userInfoEndpoint: '/auth/user',
        scopes: ['read', 'write']
      },
      {
        id: 'soripay',
        name: 'SoriPay',
        description: 'Solution de paiement sécurisée',
        url: process.env.SORIPAY_SERVICE_URL || 'http://localhost:3002',
        icon: 'fas fa-credit-card',
        color: 'green',
        version: '1.8.3',
        endpoints: ['/payments', '/transactions', '/refunds'],
        healthCheckUrl: '/health',
        redirectUrls: ['http://localhost:3000/auth/callback'],
        ssoEnabled: true,
        authEndpoint: '/auth/sorikama',
        tokenEndpoint: '/auth/token',
        userInfoEndpoint: '/auth/user',
        scopes: ['payments', 'transactions']
      },
      {
        id: 'soriwallet',
        name: 'SoriWallet',
        description: 'Portefeuille numérique intelligent',
        url: process.env.SORIWALLET_SERVICE_URL || 'http://localhost:3003',
        icon: 'fas fa-wallet',
        color: 'yellow',
        version: '1.5.2',
        endpoints: ['/balance', '/transfers', '/history'],
        healthCheckUrl: '/health',
        redirectUrls: ['http://localhost:3000/auth/callback'],
        ssoEnabled: true,
        authEndpoint: '/auth/sorikama',
        tokenEndpoint: '/auth/token',
        userInfoEndpoint: '/auth/user',
        scopes: ['wallet', 'transfers']
      },
      {
        id: 'sorilearn',
        name: 'SoriLearn',
        description: 'Plateforme d\'apprentissage adaptative',
        url: process.env.SORILEARN_SERVICE_URL || 'http://localhost:3004',
        icon: 'fas fa-graduation-cap',
        color: 'purple',
        version: '3.0.1',
        endpoints: ['/courses', '/progress', '/certificates'],
        healthCheckUrl: '/health',
        redirectUrls: ['http://localhost:3000/auth/callback'],
        ssoEnabled: true,
        authEndpoint: '/auth/sorikama',
        tokenEndpoint: '/auth/token',
        userInfoEndpoint: '/auth/user',
        scopes: ['learn', 'progress']
      },
      {
        id: 'sorihealth',
        name: 'SoriHealth',
        description: 'Services de santé connectée',
        url: process.env.SORIHEALTH_SERVICE_URL || 'http://localhost:3005',
        icon: 'fas fa-heartbeat',
        color: 'red',
        version: '2.3.0',
        endpoints: ['/appointments', '/records', '/monitoring'],
        healthCheckUrl: '/health',
        redirectUrls: ['http://localhost:3000/auth/callback'],
        ssoEnabled: true,
        authEndpoint: '/auth/sorikama',
        tokenEndpoint: '/auth/token',
        userInfoEndpoint: '/auth/user',
        scopes: ['health', 'records']
      },
      {
        id: 'soriaccess',
        name: 'SoriAccess',
        description: 'Solutions d\'accessibilité universelle',
        url: process.env.SORIACCESS_SERVICE_URL || 'http://localhost:3006',
        icon: 'fas fa-universal-access',
        color: 'indigo',
        version: '1.2.4',
        endpoints: ['/accessibility', '/tools', '/support'],
        healthCheckUrl: '/health',
        redirectUrls: ['http://localhost:3000/auth/callback'],
        ssoEnabled: true,
        authEndpoint: '/auth/sorikama',
        tokenEndpoint: '/auth/token',
        userInfoEndpoint: '/auth/user',
        scopes: ['accessibility', 'support']
      }
    ];

    for (const serviceData of defaultServices) {
      const existingService = await ServiceModel.findOne({ id: serviceData.id });
      if (!existingService) {
        await ServiceModel.create(serviceData);
        logger.info(`Service ${serviceData.name} initialisé`);
      }
    }
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

    // Construire l'URL d'authentification
    const authUrl = new URL(service.url + (service.authEndpoint || '/auth/sorikama'));
    authUrl.searchParams.set('token', token);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('redirect_uri', redirectUrl || `http://localhost:${process.env.PORT || 7000}/sso/callback`);
    authUrl.searchParams.set('client_id', 'sorikama-hub');
    
    if (service.scopes && service.scopes.length > 0) {
      authUrl.searchParams.set('scope', service.scopes.join(' '));
    }

    logger.info(`🔐 URL SSO générée pour ${service.name}`, {
      serviceId,
      userId,
      sessionId,
      redirectUrl
    });

    // Logger l'événement SSO
    logSSOEvent('url_generated', serviceId, userId, true);

    return authUrl.toString();
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