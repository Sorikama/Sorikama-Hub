// src/routes/sso.routes.ts
import { Router, Request, Response } from 'express';
import { ServiceManager } from '../services/serviceManager.service';
import { logger } from '../utils/logger';
import { authenticateApiKey } from '../middlewares/apiKey.middleware';

const router = Router();

/**
 * GET /sso/auth/:serviceId - Initier l'authentification SSO vers un service
 */
router.get('/auth/:serviceId', authenticateApiKey, async (req: any, res: Response) => {
  try {
    const { serviceId } = req.params;
    const { redirect_url } = req.query;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié'
      });
    }

    const ssoUrl = await ServiceManager.generateSSOUrl(
      serviceId,
      userId,
      redirect_url as string
    );

    logger.info(`🔐 Redirection SSO vers ${serviceId}`, {
      userId,
      serviceId,
      redirectUrl: redirect_url
    });

    // Redirection vers le service
    res.redirect(ssoUrl);

  } catch (error: any) {
    logger.error('Erreur SSO auth:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de l\'authentification SSO'
    });
  }
});

/**
 * GET /sso/callback - Callback de retour des services
 */
router.get('/callback', async (req: Request, res: Response) => {
  try {
    const { token, state, service_id, redirect_url } = req.query;

    if (!token || !state || !service_id) {
      return res.status(400).json({
        success: false,
        message: 'Paramètres manquants'
      });
    }

    const result = await ServiceManager.validateSSOCallback(
      token as string,
      state as string,
      service_id as string
    );

    logger.info(`✅ Callback SSO validé pour ${service_id}`, {
      userId: result.userId,
      sessionId: result.sessionId
    });

    // Redirection vers l'URL finale ou dashboard
    const finalRedirectUrl = redirect_url as string || result.redirectUrl || '/dashboard';
    
    res.redirect(finalRedirectUrl + `?sso_success=true&service=${service_id}`);

  } catch (error: any) {
    logger.error('Erreur SSO callback:', error);
    res.redirect('/dashboard?sso_error=' + encodeURIComponent(error.message));
  }
});

/**
 * POST /sso/revoke/:sessionId - Révoquer une session SSO
 */
router.post('/revoke/:sessionId', authenticateApiKey, async (req: any, res: Response) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.id;

    const revoked = await ServiceManager.revokeSSOSession(sessionId);

    if (revoked) {
      logger.info(`🔒 Session SSO révoquée`, { sessionId, userId });
      res.json({
        success: true,
        message: 'Session révoquée avec succès'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Session non trouvée'
      });
    }

  } catch (error: any) {
    logger.error('Erreur révocation SSO:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la révocation'
    });
  }
});

/**
 * GET /sso/sessions - Obtenir les sessions SSO actives de l'utilisateur
 */
router.get('/sessions', authenticateApiKey, async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié'
      });
    }

    const sessions = await ServiceManager.getUserSSOSessions(userId);

    res.json({
      success: true,
      data: sessions
    });

  } catch (error: any) {
    logger.error('Erreur récupération sessions SSO:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des sessions'
    });
  }
});

/**
 * POST /sso/cleanup - Nettoyer les sessions expirées (admin)
 */
router.post('/cleanup', authenticateApiKey, async (req: any, res: Response) => {
  try {
    const cleanedCount = await ServiceManager.cleanupExpiredSessions();

    res.json({
      success: true,
      message: `${cleanedCount} sessions expirées supprimées`,
      cleanedCount
    });

  } catch (error: any) {
    logger.error('Erreur nettoyage SSO:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors du nettoyage'
    });
  }
});

export default router;