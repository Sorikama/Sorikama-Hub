// src/routes/services-manager.routes.ts
import { Router } from 'express';
import { logger } from '../utils/logger';
import { ServiceManager } from '../services/serviceManager.service';
import { ServiceModel } from '../database/models/service.model';

const router = Router();

/**
 * GET /services/manager - Gestionnaire des services externes
 */
router.get('/manager', async (req, res) => {
  try {
    // Initialiser les services par défaut si nécessaire
    await ServiceManager.initializeDefaultServices();
    
    // Récupérer les services depuis la base de données
    const services = await ServiceManager.getAllServices();
    
    // Convertir en format compatible avec le frontend
    const servicesData = services.map(service => ({
      id: service.id,
      name: service.name,
      description: service.description,
      url: service.url,
      icon: service.icon,
      color: service.color,
      status: service.status,
      version: service.version,
      endpoints: service.endpoints,
      responseTime: service.responseTime || 0,
      uptime: service.uptime || 100,
      requests: service.requestCount || 0,
      lastCheck: service.lastCheck
    }));
    
    // Lire le fichier HTML et injecter les données
    const fs = require('fs');
    const path = require('path');
    let managerHTML = fs.readFileSync(path.join(__dirname, '../../public/views/services-manager.html'), 'utf8');
    
    // Injecter les données JavaScript
    const scriptInjection = `
      <script>
        window.servicesData = ${JSON.stringify(servicesData)};
      </script>
    `;
    
    // Injecter le script avant la fermeture du body
    managerHTML = managerHTML.replace('</body>', scriptInjection + '</body>');
    
    res.send(managerHTML);
  } catch (error) {
    logger.error('Erreur lors du chargement des services:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }

});

/**
 * POST /services/test/:serviceId - Tester un service
 */
router.post('/test/:serviceId', async (req, res) => {
  try {
    const serviceId = req.params.serviceId;
    const result = await ServiceManager.testService(serviceId);
    
    logger.info(`🧪 Test du service ${serviceId}`, {
      serviceId,
      success: result.success,
      responseTime: result.responseTime,
      timestamp: new Date().toISOString()
    });
    
    res.json(result);
    
  } catch (error: any) {
    logger.error('Erreur test service:', error);
    res.json({
      success: false,
      message: error.message || 'Erreur lors du test du service'
    });
  }
});

/**
 * POST /services/disconnect/:serviceId - Déconnecter un service
 */
router.post('/disconnect/:serviceId', async (req, res) => {
  try {
    const serviceId = req.params.serviceId;
    const service = await ServiceManager.toggleServiceStatus(serviceId, 'inactive');
    
    if (!service) {
      return res.json({
        success: false,
        message: 'Service non trouvé'
      });
    }
    
    logger.warn(`🔌 Service ${service.name} déconnecté`, {
      serviceId,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      message: `Service ${service.name} déconnecté avec succès`
    });
    
  } catch (error: any) {
    logger.error('Erreur déconnexion service:', error);
    res.json({
      success: false,
      message: error.message || 'Erreur lors de la déconnexion du service'
    });
  }
});

/**
 * POST /services/connect/:serviceId - Connecter un service
 */
router.post('/connect/:serviceId', async (req, res) => {
  try {
    const serviceId = req.params.serviceId;
    const service = await ServiceManager.toggleServiceStatus(serviceId, 'active');
    
    if (!service) {
      return res.json({
        success: false,
        message: 'Service non trouvé'
      });
    }
    
    logger.info(`🔗 Service ${service.name} connecté`, {
      serviceId,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      message: `Service ${service.name} connecté avec succès`
    });
    
  } catch (error: any) {
    logger.error('Erreur connexion service:', error);
    res.json({
      success: false,
      message: error.message || 'Erreur lors de la connexion du service'
    });
  }
});

// Route pour proxy vers les services avec authentification
router.all('/proxy/:serviceId/*', async (req: any, res) => {
  try {
    const serviceId = req.params.serviceId;
    const endpoint = '/' + req.params[0];
    const method = req.method;
    const userId = req.user?.id;
    
    const result = await ServiceManager.proxyRequest(
      serviceId,
      endpoint,
      method,
      req.body,
      req.headers,
      userId
    );
    
    res.status(result.statusCode).json(result.data);
    
  } catch (error: any) {
    logger.error('Erreur proxy service:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Service indisponible'
    });
  }
});

// Route pour obtenir les métriques d'un service
router.get('/metrics/:serviceId', async (req, res) => {
  try {
    const serviceId = req.params.serviceId;
    const hours = parseInt(req.query.hours as string) || 24;
    
    const metrics = await ServiceManager.getServiceMetrics(serviceId, hours);
    res.json({ success: true, data: metrics });
    
  } catch (error: any) {
    logger.error('Erreur métriques service:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des métriques'
    });
  }
});

/**
 * GET /services/health - Vérifier la santé de tous les services
 */
router.get('/health', async (req, res) => {
  try {
    const healthCheck = await ServiceManager.checkAllServicesHealth();
    res.json({ success: true, data: healthCheck });
  } catch (error: any) {
    logger.error('Erreur health check:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors du health check'
    });
  }
});

/**
 * POST /services/sso/:serviceId - Générer une URL SSO pour un service
 */
router.post('/sso/:serviceId', async (req: any, res) => {
  try {
    const { serviceId } = req.params;
    const { redirectUrl } = req.body;
    const userId = req.user?.id || req.portalUser?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié'
      });
    }

    const ssoUrl = await ServiceManager.generateSSOUrl(serviceId, userId, redirectUrl);
    
    res.json({
      success: true,
      ssoUrl,
      message: 'URL SSO générée avec succès'
    });

  } catch (error: any) {
    logger.error('Erreur génération SSO:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de la génération SSO'
    });
  }
});

/**
 * PUT /services/:serviceId/status - Mettre à jour le statut d'un service
 */
router.put('/:serviceId/status', async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive', 'maintenance'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide'
      });
    }

    const service = await ServiceManager.toggleServiceStatus(serviceId, status);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service non trouvé'
      });
    }

    res.json({
      success: true,
      message: `Service ${service.name} ${status === 'active' ? 'activé' : status === 'inactive' ? 'désactivé' : 'en maintenance'}`,
      service: {
        id: service.id,
        name: service.name,
        status: service.status
      }
    });

  } catch (error: any) {
    logger.error('Erreur mise à jour statut:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la mise à jour'
    });
  }
});

export default router;