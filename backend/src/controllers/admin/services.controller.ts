/**
 * Controller pour la gestion des services externes
 */

import { Request, Response } from 'express';
import { ServiceModel } from '../../database/models/service.model';
import { logger } from '../../utils/logger';

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

    // Vérifier si le slug existe déjà
    const existingSlug = await ServiceModel.findOne({ slug });
    if (existingSlug) {
      return res.status(400).json({
        success: false,
        message: 'Ce slug est déjà utilisé'
      });
    }

    // Vérifier si le proxyPath existe déjà
    const existingProxy = await ServiceModel.findOne({ proxyPath });
    if (existingProxy) {
      return res.status(400).json({
        success: false,
        message: 'Ce chemin proxy est déjà utilisé'
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

    // Vérifier si le nouveau slug existe déjà (sauf pour ce service)
    if (slug && slug !== service.slug) {
      const existingSlug = await ServiceModel.findOne({ slug, _id: { $ne: id } });
      if (existingSlug) {
        return res.status(400).json({
          success: false,
          message: 'Ce slug est déjà utilisé'
        });
      }
    }

    // Vérifier si le nouveau proxyPath existe déjà (sauf pour ce service)
    if (proxyPath && proxyPath !== service.proxyPath) {
      const existingProxy = await ServiceModel.findOne({ proxyPath, _id: { $ne: id } });
      if (existingProxy) {
        return res.status(400).json({
          success: false,
          message: 'Ce chemin proxy est déjà utilisé'
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
