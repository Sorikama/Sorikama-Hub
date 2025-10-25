/**
 * Seeder pour les services externes par défaut
 * Ajoute Masebuy et un service de démonstration
 */

import { ServiceModel } from '../models/service.model';
import { UserModel } from '../models/user.model';
import { logger } from '../../utils/logger';

/**
 * Services par défaut à créer
 */
const defaultServices = [
    {
        name: 'Masebuy',
        slug: 'masebuy',
        description: 'Plateforme e-commerce Masebuy - Gestion des produits et commandes',
        frontendUrl: 'http://localhost:3001',
        backendUrl: 'http://localhost:4001',
        proxyPath: 'masebuy',
        enabled: true,
        requireAuth: true,
        allowedRoles: ['admin', 'user']
    },
    {
        name: 'Service Demo',
        slug: 'service-demo',
        description: 'Service de démonstration pour tester le système de proxy',
        frontendUrl: 'http://localhost:3002',
        backendUrl: 'http://localhost:4002',
        proxyPath: 'demo',
        enabled: true,
        requireAuth: false,
        allowedRoles: []
    }
];

/**
 * Seed les services par défaut
 */
export const seedServices = async () => {
    try {
        // Vérifier si la collection existe et a des problèmes d'index
        try {
            const indexes = await ServiceModel.collection.indexes();
            const hasInvalidIndex = indexes.some((idx: any) => idx.name === 'id_1');

            if (hasInvalidIndex) {
                logger.warn('⚠️ Réinitialisation des index services...');
                await resetServicesCollection();
            }
        } catch (e) {
            // Erreur lors de la vérification, on continue
            try {
                await ServiceModel.collection.dropIndex('id_1');
            } catch (dropError) {
                // Index n'existe pas, c'est OK
            }
        }

        // Trouver un admin pour créer les services
        const admin = await UserModel.findOne({
            role: { $in: ['admin', 'super_admin'] },
            isActive: true
        }).select('_id email role');

        if (!admin) {
            logger.warn('⚠️ Aucun admin trouvé pour créer les services');
            return null;
        }

        let createdCount = 0;
        let skippedCount = 0;

        for (const serviceData of defaultServices) {
            // Vérifier l'unicité du slug
            const existingBySlug = await ServiceModel.findOne({ slug: serviceData.slug });
            if (existingBySlug) {
                skippedCount++;
                continue;
            }

            // Vérifier l'unicité du proxyPath
            const existingByProxy = await ServiceModel.findOne({ proxyPath: serviceData.proxyPath });
            if (existingByProxy) {
                skippedCount++;
                continue;
            }

            // Créer le service
            try {
                const service = await ServiceModel.create({
                    ...serviceData,
                    createdBy: admin._id
                });

                logger.info(`✅ Service créé: ${service.name}`);
                createdCount++;
            } catch (createError: any) {
                if (createError.code === 11000) {
                    skippedCount++;
                } else {
                    throw createError;
                }
            }
        }

        // Résumé
        const totalServices = await ServiceModel.countDocuments();
        const enabledServices = await ServiceModel.countDocuments({ enabled: true });

        if (createdCount > 0) {
            logger.info(`✅ ${createdCount} nouveau(x) service(s)`);
        }
        if (skippedCount > 0 && createdCount === 0) {
            logger.info(`✅ Services existants OK`);
        }

        return {
            created: createdCount,
            skipped: skippedCount,
            total: totalServices,
            enabled: enabledServices
        };

    } catch (error: any) {
        logger.error('❌ Erreur lors du seeding des services:', error);
        throw error;
    }
};

/**
 * Nettoyer tous les services (utile pour les tests)
 */
export const cleanServices = async () => {
    try {
        const result = await ServiceModel.deleteMany({});
        logger.info(`🗑️ ${result.deletedCount} services supprimés`);
    } catch (error: any) {
        logger.error('❌ Erreur lors du nettoyage des services:', error);
        throw error;
    }
};

/**
 * Réinitialiser complètement la collection services
 * Supprime tous les index et recrée les bons
 */
export const resetServicesCollection = async () => {
    try {
        logger.info('🔄 Réinitialisation de la collection services...');

        // Supprimer tous les documents
        await ServiceModel.deleteMany({});

        // Supprimer tous les index
        await ServiceModel.collection.dropIndexes();
        logger.info('🗑️ Tous les index supprimés');

        // Recréer les index corrects
        await ServiceModel.createIndexes();
        logger.info('✅ Index recréés correctement');

        logger.info('🎉 Collection services réinitialisée');
    } catch (error: any) {
        logger.error('❌ Erreur lors de la réinitialisation:', error);
        throw error;
    }
};

/**
 * Vérifier l'unicité d'un service avant création
 */
export const checkServiceUniqueness = async (slug: string, proxyPath: string, excludeId?: string) => {
    const errors: string[] = [];

    // Vérifier le slug
    const query: any = { slug };
    if (excludeId) {
        query._id = { $ne: excludeId };
    }

    const existingSlug = await ServiceModel.findOne(query);
    if (existingSlug) {
        errors.push(`Le slug "${slug}" est déjà utilisé par le service "${existingSlug.name}"`);
    }

    // Vérifier le proxyPath
    const proxyQuery: any = { proxyPath };
    if (excludeId) {
        proxyQuery._id = { $ne: excludeId };
    }

    const existingProxy = await ServiceModel.findOne(proxyQuery);
    if (existingProxy) {
        errors.push(`Le chemin proxy "${proxyPath}" est déjà utilisé par le service "${existingProxy.name}"`);
    }

    return {
        isUnique: errors.length === 0,
        errors
    };
};

/**
 * Obtenir les statistiques des services
 */
export const getServicesStats = async () => {
    const total = await ServiceModel.countDocuments();
    const enabled = await ServiceModel.countDocuments({ enabled: true });
    const disabled = await ServiceModel.countDocuments({ enabled: false });
    const withAuth = await ServiceModel.countDocuments({ requireAuth: true });
    const withoutAuth = await ServiceModel.countDocuments({ requireAuth: false });

    return {
        total,
        enabled,
        disabled,
        withAuth,
        withoutAuth
    };
};
