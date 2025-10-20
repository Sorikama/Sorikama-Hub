// src/routes/monitoring.routes.ts
import { Router } from 'express';
import { MonitoringService } from '../services/monitoring.service';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /monitoring/stats - Statistiques globales
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await MonitoringService.getGlobalStats();
    res.json({ success: true, data: stats });
  } catch (error: any) {
    logger.error('Erreur stats monitoring:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des statistiques'
    });
  }
});

/**
 * GET /monitoring/health - Health check de tous les services
 */
router.get('/health', async (req, res) => {
  try {
    const healthCheck = await MonitoringService.performHealthCheck();
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
 * GET /monitoring/report - Rapport de santé complet
 */
router.get('/report', async (req, res) => {
  try {
    const report = await MonitoringService.generateHealthReport();
    res.json({ success: true, data: report });
  } catch (error: any) {
    logger.error('Erreur génération rapport:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la génération du rapport'
    });
  }
});

/**
 * GET /monitoring/service/:serviceId - Métriques détaillées d'un service
 */
router.get('/service/:serviceId', async (req, res) => {
  try {
    const { serviceId } = req.params;
    const hours = parseInt(req.query.hours as string) || 24;
    
    const metrics = await MonitoringService.getServiceDetailedMetrics(serviceId, hours);
    res.json({ success: true, data: metrics });
  } catch (error: any) {
    logger.error(`Erreur métriques service ${req.params.serviceId}:`, error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des métriques'
    });
  }
});

/**
 * POST /monitoring/cleanup - Nettoyer les anciennes données
 */
router.post('/cleanup', async (req, res) => {
  try {
    await MonitoringService.cleanupOldData();
    res.json({
      success: true,
      message: 'Nettoyage effectué avec succès'
    });
  } catch (error: any) {
    logger.error('Erreur nettoyage monitoring:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors du nettoyage'
    });
  }
});

export default router;