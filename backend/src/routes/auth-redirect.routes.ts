// src/routes/auth-redirect.routes.ts
import { Router } from 'express';
import { ServiceModel } from '../database/models/service.model';
import { logger } from '../utils/logger';
import jwt from 'jsonwebtoken';

const router = Router();

/**
 * GET /auth/login/:serviceId - Redirection vers service avec authentification
 */
router.get('/login/:serviceId', async (req, res) => {
  try {
    const serviceId = req.params.serviceId;
    const redirectUrl = req.query.redirect_url as string;
    
    const service = await ServiceModel.findOne({ id: serviceId, status: 'active' });
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service non trouvé ou inactif'
      });
    }

    // Vérifier si l'utilisateur est connecté au hub
    const sessionToken = req.cookies.sorikama_session;
    if (!sessionToken) {
      // Rediriger vers la page de login avec retour
      const returnUrl = encodeURIComponent(`/auth/login/${serviceId}?redirect_url=${redirectUrl}`);
      return res.redirect(`/portal/login?return_url=${returnUrl}`);
    }

    // Vérifier la session
    const { portalSessions } = require('./auth-portal.routes');
    const session = portalSessions.get(sessionToken);
    
    if (!session || session.expires < Date.now()) {
      const returnUrl = encodeURIComponent(`/auth/login/${serviceId}?redirect_url=${redirectUrl}`);
      return res.redirect(`/portal/login?return_url=${returnUrl}`);
    }

    // Générer un token JWT pour le service
    const authToken = jwt.sign(
      {
        userId: session.username,
        serviceId: serviceId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 heure
      },
      process.env.JWT_SECRET || 'default-secret'
    );

    // Construire l'URL de redirection
    const targetUrl = redirectUrl || service.redirectUrls?.[0] || service.url;
    const separator = targetUrl.includes('?') ? '&' : '?';
    const finalUrl = `${targetUrl}${separator}auth_token=${authToken}&user=${encodeURIComponent(session.username)}`;

    logger.info(`🔗 Redirection authentifiée vers ${service.name}`, {
      serviceId,
      username: session.username,
      targetUrl: finalUrl,
      timestamp: new Date().toISOString()
    });

    res.redirect(finalUrl);

  } catch (error: any) {
    logger.error('Erreur redirection auth:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la redirection'
    });
  }
});

/**
 * POST /auth/callback/:serviceId - Callback après authentification service
 */
router.post('/callback/:serviceId', async (req, res) => {
  try {
    const serviceId = req.params.serviceId;
    const { success, user_data, error } = req.body;

    const service = await ServiceModel.findOne({ id: serviceId });
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service non trouvé'
      });
    }

    if (success) {
      logger.info(`✅ Authentification réussie sur ${service.name}`, {
        serviceId,
        userData: user_data,
        timestamp: new Date().toISOString()
      });

      res.json({
        success: true,
        message: 'Authentification réussie',
        service: service.name,
        user_data
      });
    } else {
      logger.warn(`❌ Échec authentification sur ${service.name}`, {
        serviceId,
        error,
        timestamp: new Date().toISOString()
      });

      res.status(401).json({
        success: false,
        message: error || 'Échec de l\'authentification'
      });
    }

  } catch (error: any) {
    logger.error('Erreur callback auth:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du callback'
    });
  }
});

export default router;