// src/routes/sso.routes.ts
import { Router, Request, Response } from 'express';
import { ServiceManager } from '../services/serviceManager.service';
import { logger } from '../utils/logger';
import { requireApiKeyAndJWT } from '../middlewares/dualAuth.middleware';

const router = Router();

/**
 * GET /sso/auth/:serviceId - Initier l'authentification SSO vers un service
 * Nécessite : API Key + JWT Token (double authentification)
 */
router.get('/auth/:serviceId', requireApiKeyAndJWT, async (req: any, res: Response) => {
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

    // Si redirect_url est fourni, rediriger vers cette URL
    if (redirect_url && redirect_url !== '') {
      const finalRedirectUrl = redirect_url as string;
      const separator = finalRedirectUrl.includes('?') ? '&' : '?';
      res.redirect(finalRedirectUrl + `${separator}sso_success=true&service=${service_id}&token=${token}`);
      return;
    }

    // Sinon, afficher une page de succès avec les détails
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>SSO Callback - Sorikama Hub</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
          }
          .container {
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          }
          h1 { color: #667eea; margin-top: 0; }
          .success { color: #10b981; font-size: 48px; }
          .info { background: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0; }
          .token { 
            background: #1f2937; 
            color: #10b981; 
            padding: 15px; 
            border-radius: 8px; 
            font-family: monospace; 
            word-break: break-all;
            font-size: 12px;
            max-height: 200px;
            overflow-y: auto;
          }
          .label { font-weight: bold; color: #6b7280; margin-top: 15px; }
          .value { color: #1f2937; margin-bottom: 10px; }
          .button {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            text-decoration: none;
            margin-top: 20px;
            transition: background 0.3s;
          }
          .button:hover { background: #5568d3; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success">✅</div>
          <h1>Authentification SSO Réussie !</h1>
          
          <div class="info">
            <div class="label">Service ID:</div>
            <div class="value">${service_id}</div>
            
            <div class="label">User ID:</div>
            <div class="value">${result.userId}</div>
            
            <div class="label">Session ID:</div>
            <div class="value">${result.sessionId}</div>
            
            <div class="label">User Info:</div>
            <div class="value">${JSON.stringify(result.userInfo, null, 2)}</div>
          </div>

          <div class="label">Token SSO:</div>
          <div class="token">${token}</div>

          <p style="color: #6b7280; margin-top: 20px;">
            Ce token peut être utilisé pour faire des requêtes à l'API Gateway au nom de l'utilisateur.
            Il expire dans 1 heure.
          </p>

          <a href="http://localhost:5173/dashboard" class="button">Retour au Dashboard</a>
        </div>
      </body>
      </html>
    `);

  } catch (error: any) {
    logger.error('Erreur SSO callback:', error);
    
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Erreur SSO - Sorikama Hub</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            min-height: 100vh;
          }
          .container {
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            text-align: center;
          }
          .error { color: #ef4444; font-size: 48px; }
          h1 { color: #ef4444; }
          .button {
            display: inline-block;
            background: #ef4444;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            text-decoration: none;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="error">❌</div>
          <h1>Erreur SSO</h1>
          <p>${error.message}</p>
          <a href="http://localhost:5173/dashboard" class="button">Retour au Dashboard</a>
        </div>
      </body>
      </html>
    `);
  }
});

/**
 * POST /sso/revoke/:sessionId - Révoquer une session SSO
 * Nécessite : API Key + JWT Token (double authentification)
 */
router.post('/revoke/:sessionId', requireApiKeyAndJWT, async (req: any, res: Response) => {
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
 * Nécessite : API Key + JWT Token (double authentification)
 */
router.get('/sessions', requireApiKeyAndJWT, async (req: any, res: Response) => {
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
 * POST /sso/refresh - Rafraîchir un token SSO expiré
 * Route publique - Le service externe envoie son token SSO expiré
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { sessionId, serviceId } = req.body;

    if (!sessionId || !serviceId) {
      return res.status(400).json({
        success: false,
        message: 'sessionId et serviceId requis'
      });
    }

    const newToken = await ServiceManager.refreshSSOToken(sessionId, serviceId);

    logger.info(`🔄 Token SSO rafraîchi`, { sessionId, serviceId });

    res.json({
      success: true,
      data: {
        accessToken: newToken.accessToken,
        expiresAt: newToken.expiresAt,
        sessionId: newToken.sessionId
      }
    });

  } catch (error: any) {
    logger.error('Erreur refresh SSO:', error);
    res.status(401).json({
      success: false,
      message: error.message || 'Impossible de rafraîchir le token'
    });
  }
});

/**
 * POST /sso/cleanup - Nettoyer les sessions expirées (admin)
 * Nécessite : API Key + JWT Token (double authentification)
 */
router.post('/cleanup', requireApiKeyAndJWT, async (req: any, res: Response) => {
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