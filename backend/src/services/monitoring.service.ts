// src/services/monitoring.service.ts
import { ServiceModel } from '../database/models/service.model';
import { ServiceRequestModel } from '../database/models/serviceRequest.model';
import { SSOSessionModel } from '../database/models/ssoSession.model';
import { logger } from '../utils/logger';
import { ServiceManager } from './serviceManager.service';

export class MonitoringService {
  private static monitoringInterval: NodeJS.Timeout | null = null;
  private static isMonitoring = false;

  /**
   * Démarrer le monitoring automatique
   */
  static startMonitoring(intervalMinutes: number = 5) {
    if (this.isMonitoring) {
      logger.warn('⚠️ Monitoring déjà en cours');
      return;
    }

    this.isMonitoring = true;
    logger.info(`🔍 Démarrage du monitoring (intervalle: ${intervalMinutes}min)`);

    // Monitoring initial
    this.performHealthCheck();

    // Monitoring périodique
    this.monitoringInterval = setInterval(async () => {
      await this.performHealthCheck();
      await this.cleanupOldData();
    }, intervalMinutes * 60 * 1000);
  }

  /**
   * Arrêter le monitoring
   */
  static stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    logger.info('🛑 Monitoring arrêté');
  }

  /**
   * Effectuer un health check de tous les services
   */
  static async performHealthCheck() {
    try {
      const services = await ServiceModel.find({ status: 'active' });
      const results = [];

      for (const service of services) {
        try {
          const result = await ServiceManager.testService(service.id);
          results.push({
            serviceId: service.id,
            name: service.name,
            success: result.success,
            responseTime: result.responseTime,
            uptime: result.uptime
          });

          // Alertes si service en panne
          if (!result.success) {
            logger.warn(`🚨 Service ${service.name} indisponible`, {
              serviceId: service.id,
              error: result.message,
              responseTime: result.responseTime
            });
          }
        } catch (error: any) {
          logger.error(`❌ Erreur health check ${service.name}:`, error);
          results.push({
            serviceId: service.id,
            name: service.name,
            success: false,
            error: error.message
          });
        }
      }

      const healthyCount = results.filter(r => r.success).length;
      const totalCount = results.length;

      logger.info(`📊 Health check terminé: ${healthyCount}/${totalCount} services opérationnels`);

      return {
        timestamp: new Date(),
        totalServices: totalCount,
        healthyServices: healthyCount,
        results
      };
    } catch (error: any) {
      logger.error('Erreur health check global:', error);
      throw error;
    }
  }

  /**
   * Nettoyer les anciennes données
   */
  static async cleanupOldData() {
    try {
      const cutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 jours

      // Nettoyer les anciennes requêtes de service
      const deletedRequests = await ServiceRequestModel.deleteMany({
        timestamp: { $lt: cutoffDate }
      });

      // Nettoyer les sessions SSO expirées
      const deletedSessions = await ServiceManager.cleanupExpiredSessions();

      if (deletedRequests.deletedCount > 0 || deletedSessions > 0) {
        logger.info(`🧹 Nettoyage effectué`, {
          deletedRequests: deletedRequests.deletedCount,
          deletedSessions
        });
      }
    } catch (error: any) {
      logger.error('Erreur nettoyage données:', error);
    }
  }

  /**
   * Obtenir les statistiques globales
   */
  static async getGlobalStats() {
    try {
      const [
        totalServices,
        activeServices,
        totalRequests24h,
        successfulRequests24h,
        activeSSOSessions
      ] = await Promise.all([
        ServiceModel.countDocuments(),
        ServiceModel.countDocuments({ status: 'active' }),
        ServiceRequestModel.countDocuments({
          timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }),
        ServiceRequestModel.countDocuments({
          timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          success: true
        }),
        SSOSessionModel.countDocuments({
          expiresAt: { $gt: new Date() }
        })
      ]);

      const successRate = totalRequests24h > 0 
        ? Math.round((successfulRequests24h / totalRequests24h) * 100) 
        : 100;

      return {
        services: {
          total: totalServices,
          active: activeServices,
          inactive: totalServices - activeServices
        },
        requests24h: {
          total: totalRequests24h,
          successful: successfulRequests24h,
          failed: totalRequests24h - successfulRequests24h,
          successRate
        },
        sso: {
          activeSessions: activeSSOSessions
        },
        timestamp: new Date()
      };
    } catch (error: any) {
      logger.error('Erreur statistiques globales:', error);
      throw error;
    }
  }

  /**
   * Obtenir les métriques détaillées d'un service
   */
  static async getServiceDetailedMetrics(serviceId: string, hours: number = 24) {
    try {
      const service = await ServiceModel.findOne({ id: serviceId });
      if (!service) {
        throw new Error('Service non trouvé');
      }

      const since = new Date(Date.now() - hours * 60 * 60 * 1000);
      
      const [
        requests,
        totalRequests,
        successfulRequests,
        avgResponseTime,
        activeSSOSessions
      ] = await Promise.all([
        ServiceRequestModel.find({
          serviceId,
          timestamp: { $gte: since }
        }).sort({ timestamp: -1 }).limit(100),
        
        ServiceRequestModel.countDocuments({
          serviceId,
          timestamp: { $gte: since }
        }),
        
        ServiceRequestModel.countDocuments({
          serviceId,
          timestamp: { $gte: since },
          success: true
        }),
        
        ServiceRequestModel.aggregate([
          {
            $match: {
              serviceId,
              timestamp: { $gte: since },
              success: true
            }
          },
          {
            $group: {
              _id: null,
              avgResponseTime: { $avg: '$responseTime' }
            }
          }
        ]),
        
        SSOSessionModel.countDocuments({
          serviceId,
          expiresAt: { $gt: new Date() }
        })
      ]);

      const uptime = totalRequests > 0 
        ? Math.round((successfulRequests / totalRequests) * 100) 
        : 100;

      return {
        service: {
          id: service.id,
          name: service.name,
          status: service.status,
          version: service.version,
          url: service.url
        },
        metrics: {
          uptime,
          totalRequests,
          successfulRequests,
          failedRequests: totalRequests - successfulRequests,
          avgResponseTime: avgResponseTime[0]?.avgResponseTime || 0,
          activeSSOSessions
        },
        recentRequests: requests.slice(0, 20),
        timestamp: new Date()
      };
    } catch (error: any) {
      logger.error(`Erreur métriques service ${serviceId}:`, error);
      throw error;
    }
  }

  /**
   * Générer un rapport de santé complet
   */
  static async generateHealthReport() {
    try {
      const [globalStats, healthCheck] = await Promise.all([
        this.getGlobalStats(),
        this.performHealthCheck()
      ]);

      const report = {
        timestamp: new Date(),
        summary: {
          totalServices: globalStats.services.total,
          activeServices: globalStats.services.active,
          healthyServices: healthCheck.healthyServices,
          overallHealth: Math.round((healthCheck.healthyServices / healthCheck.totalServices) * 100)
        },
        globalStats,
        healthCheck,
        recommendations: this.generateRecommendations(globalStats, healthCheck)
      };

      logger.info(`📋 Rapport de santé généré`, {
        totalServices: report.summary.totalServices,
        healthyServices: report.summary.healthyServices,
        overallHealth: report.summary.overallHealth
      });

      return report;
    } catch (error: any) {
      logger.error('Erreur génération rapport:', error);
      throw error;
    }
  }

  /**
   * Générer des recommandations basées sur les métriques
   */
  private static generateRecommendations(globalStats: any, healthCheck: any): string[] {
    const recommendations = [];

    // Vérifier la santé globale
    const overallHealth = Math.round((healthCheck.healthyServices / healthCheck.totalServices) * 100);
    if (overallHealth < 90) {
      recommendations.push(`⚠️ Santé globale faible (${overallHealth}%) - Vérifier les services en panne`);
    }

    // Vérifier le taux de succès
    if (globalStats.requests24h.successRate < 95) {
      recommendations.push(`📉 Taux de succès faible (${globalStats.requests24h.successRate}%) - Investiguer les erreurs`);
    }

    // Vérifier les services inactifs
    if (globalStats.services.inactive > 0) {
      recommendations.push(`🔌 ${globalStats.services.inactive} service(s) inactif(s) - Considérer la réactivation`);
    }

    // Recommandations générales
    if (recommendations.length === 0) {
      recommendations.push('✅ Tous les services fonctionnent correctement');
    }

    return recommendations;
  }
}