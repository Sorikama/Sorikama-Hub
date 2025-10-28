/**
 * Controller pour la gestion des services externes
 */

import { Request, Response } from 'express';
import { ServiceModel } from '../../database/models/service.model';
import { logger } from '../../utils/logger';
import { 
  checkServiceUniqueness, 
  getServicesStats as getServicesStatsFromSeeder 
} from '../../database/seeders/services.seeder';

/**
 * Récupérer tous les services
 */
export const getAllServices = async (req: Request, res: Response) => {
  try {
    const services = await ServiceModel.find()
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      services
    });
  } catch (error: any) {
    logger.error('Erreur récupération services:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des services'
    });
  }
};

/**
 * Créer un nouveau service
 */
export const createService = async (req: Request, res: Response) => {
  try {
    const {
      name,
      slug,
      description,
      frontendUrl,
      backendUrl,
      proxyPath,
      enabled,
      requireAuth,
      allowedRoles
    } = req.body;

    // Vérifier l'unicité du slug et du proxyPath
    const uniquenessCheck = await checkServiceUniqueness(slug, proxyPath);
    
    if (!uniquenessCheck.isUnique) {
      return res.status(400).json({
        success: false,
        message: 'Erreur de validation',
        errors: uniquenessCheck.errors
      });
    }

    const service = await ServiceModel.create({
      name,
      slug,
      description,
      frontendUrl,
      backendUrl,
      proxyPath,
      enabled: enabled !== undefined ? enabled : true,
      requireAuth: requireAuth || false,
      allowedRoles: allowedRoles || [],
      createdBy: (req as any).user._id
    });

    logger.info('✅ Service créé', {
      serviceId: service._id,
      name: service.name,
      slug: service.slug,
      createdBy: (req as any).user.email
    });

    res.status(201).json({
      success: true,
      message: 'Service créé avec succès',
      service
    });
  } catch (error: any) {
    logger.error('Erreur création service:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du service'
    });
  }
};

/**
 * Mettre à jour un service
 */
export const updateService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      slug,
      description,
      frontendUrl,
      backendUrl,
      proxyPath,
      enabled,
      requireAuth,
      allowedRoles
    } = req.body;

    const service = await ServiceModel.findById(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service non trouvé'
      });
    }

    // Vérifier l'unicité si slug ou proxyPath modifiés
    if ((slug && slug !== service.slug) || (proxyPath && proxyPath !== service.proxyPath)) {
      const uniquenessCheck = await checkServiceUniqueness(
        slug || service.slug,
        proxyPath || service.proxyPath,
        id
      );
      
      if (!uniquenessCheck.isUnique) {
        return res.status(400).json({
          success: false,
          message: 'Erreur de validation',
          errors: uniquenessCheck.errors
        });
      }
    }

    // Mettre à jour
    service.name = name || service.name;
    service.slug = slug || service.slug;
    service.description = description !== undefined ? description : service.description;
    service.frontendUrl = frontendUrl || service.frontendUrl;
    service.backendUrl = backendUrl || service.backendUrl;
    service.proxyPath = proxyPath || service.proxyPath;
    service.enabled = enabled !== undefined ? enabled : service.enabled;
    service.requireAuth = requireAuth !== undefined ? requireAuth : service.requireAuth;
    service.allowedRoles = allowedRoles !== undefined ? allowedRoles : service.allowedRoles;

    await service.save();

    logger.info('✅ Service mis à jour', {
      serviceId: service._id,
      name: service.name,
      updatedBy: (req as any).user.email
    });

    res.json({
      success: true,
      message: 'Service mis à jour avec succès',
      service
    });
  } catch (error: any) {
    logger.error('Erreur mise à jour service:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du service'
    });
  }
};

/**
 * Supprimer un service
 */
export const deleteService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const service = await ServiceModel.findByIdAndDelete(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service non trouvé'
      });
    }

    logger.info('✅ Service supprimé', {
      serviceId: service._id,
      name: service.name,
      deletedBy: (req as any).user.email
    });

    res.json({
      success: true,
      message: 'Service supprimé avec succès'
    });
  } catch (error: any) {
    logger.error('Erreur suppression service:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du service'
    });
  }
};

/**
 * Activer/Désactiver un service
 */
export const toggleService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { enabled } = req.body;

    const service = await ServiceModel.findById(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service non trouvé'
      });
    }

    service.enabled = enabled;
    await service.save();

    logger.info(`✅ Service ${enabled ? 'activé' : 'désactivé'}`, {
      serviceId: service._id,
      name: service.name,
      toggledBy: (req as any).user.email
    });

    res.json({
      success: true,
      message: `Service ${enabled ? 'activé' : 'désactivé'} avec succès`,
      service
    });
  } catch (error: any) {
    logger.error('Erreur toggle service:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du changement d\'état du service'
    });
  }
};

/**
 * Récupérer un service par son slug
 */
export const getServiceBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const service = await ServiceModel.findOne({ slug, enabled: true });
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service non trouvé ou désactivé'
      });
    }

    res.json({
      success: true,
      service
    });
  } catch (error: any) {
    logger.error('Erreur récupération service:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du service'
    });
  }
};

/**
 * Obtenir les statistiques des services
 */
export const getServicesStats = async (req: Request, res: Response) => {
  try {
    const stats = await getServicesStatsFromSeeder();

    res.json({
      success: true,
      stats
    });
  } catch (error: any) {
    logger.error('Erreur récupération stats services:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
};

/**
 * Récupérer la clé API d'un service
 * Endpoint sécurisé - uniquement pour les admins
 */
export const getServiceApiKey = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Récupérer le service avec la clé API (select: false par défaut)
    const service = await ServiceModel.findById(id).select('+apiKey');
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service non trouvé'
      });
    }

    logger.info('🔑 Clé API consultée', {
      serviceId: service._id,
      serviceName: service.name,
      consultedBy: (req as any).user.email
    });

    res.json({
      success: true,
      data: {
        serviceId: service._id,
        serviceName: service.name,
        apiKey: service.apiKey,
        apiKeyLastRotated: service.apiKeyLastRotated,
        warning: 'Ne partagez jamais cette clé publiquement. Elle permet au service de communiquer avec Sorikama.'
      }
    });
  } catch (error: any) {
    logger.error('Erreur récupération clé API:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la clé API'
    });
  }
};

/**
 * Régénérer la clé API d'un service
 * ATTENTION : Cela invalidera l'ancienne clé !
 */
export const rotateServiceApiKey = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const service = await ServiceModel.findById(id).select('+apiKey');
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service non trouvé'
      });
    }

    // Sauvegarder l'ancienne clé pour les logs
    const oldApiKey = service.apiKey;

    // Générer une nouvelle clé
    service.apiKey = service.generateApiKey();
    service.apiKeyLastRotated = new Date();
    await service.save();

    logger.warn('🔄 Clé API régénérée', {
      serviceId: service._id,
      serviceName: service.name,
      oldKeyPrefix: oldApiKey.substring(0, 15) + '...',
      newKeyPrefix: service.apiKey.substring(0, 15) + '...',
      rotatedBy: (req as any).user.email
    });

    res.json({
      success: true,
      message: 'Clé API régénérée avec succès',
      data: {
        serviceId: service._id,
        serviceName: service.name,
        apiKey: service.apiKey,
        apiKeyLastRotated: service.apiKeyLastRotated,
        warning: 'L\'ancienne clé ne fonctionne plus. Mettez à jour la configuration du service externe.'
      }
    });
  } catch (error: any) {
    logger.error('Erreur rotation clé API:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la régénération de la clé API'
    });
  }
};

/**
 * Tester la connexion à un service
 */
export const testServiceConnection = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const service = await ServiceModel.findById(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service non trouvé'
      });
    }

    // Tester la connexion au backend
    const startTime = Date.now();
    let backendStatus = 'unknown';
    let backendError = null;

    try {
      const axios = require('axios');
      const response = await axios.get(service.backendUrl, {
        timeout: 5000,
        validateStatus: () => true // Accepter tous les status codes
      });
      
      backendStatus = response.status >= 200 && response.status < 500 ? 'online' : 'error';
    } catch (error: any) {
      backendStatus = 'offline';
      backendError = error.code === 'ECONNREFUSED' 
        ? 'Connexion refusée - Le serveur ne répond pas'
        : error.message;
    }

    const responseTime = Date.now() - startTime;

    logger.info('🔍 Test de connexion service', {
      serviceId: service._id,
      name: service.name,
      backendUrl: service.backendUrl,
      status: backendStatus,
      responseTime: `${responseTime}ms`
    });

    res.json({
      success: true,
      test: {
        serviceName: service.name,
        backendUrl: service.backendUrl,
        frontendUrl: service.frontendUrl,
        status: backendStatus,
        responseTime,
        error: backendError,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    logger.error('Erreur test connexion service:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du test de connexion'
    });
  }
};
