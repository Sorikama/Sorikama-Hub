/**
 * Service pour l'envoi de webhooks
 */

import axios from 'axios';
import crypto from 'crypto';
import { WebhookModel } from '../database/models/webhook.model';
import { WebhookLogModel } from '../database/models/webhookLog.model';
import { logger } from '../utils/logger';

// Événements disponibles
export const WEBHOOK_EVENTS = {
  USER_CONNECTED: 'user.connected',
  USER_DISCONNECTED: 'user.disconnected',
  SESSION_REVOKED: 'session.revoked',
  PROFILE_UPDATED: 'profile.updated',
  SERVICE_AUTHORIZED: 'service.authorized',
  ADMIN_ACTION: 'admin.action',
  SECURITY_ALERT: 'security.alert',
} as const;

export type WebhookEvent = typeof WEBHOOK_EVENTS[keyof typeof WEBHOOK_EVENTS];

interface WebhookPayload {
  event: string;
  timestamp: string;
  data: any;
}

/**
 * Générer la signature du webhook
 */
const generateSignature = (payload: string, secret: string): string => {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
};

/**
 * Envoyer un webhook avec retry
 */
const sendWebhookRequest = async (
  webhookId: string,
  url: string,
  payload: WebhookPayload,
  secret: string,
  headers: Record<string, string> = {},
  timeout: number = 5000,
  attempt: number = 1
): Promise<{ success: boolean; statusCode?: number; responseBody?: string; responseTime?: number; error?: string }> => {
  const startTime = Date.now();
  
  try {
    const payloadString = JSON.stringify(payload);
    const signature = generateSignature(payloadString, secret);

    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Event': payload.event,
        'X-Webhook-Timestamp': payload.timestamp,
        'X-Webhook-Attempt': attempt.toString(),
        ...headers,
      },
      timeout,
      validateStatus: () => true, // Ne pas throw sur les erreurs HTTP
    });

    const responseTime = Date.now() - startTime;
    const success = response.status >= 200 && response.status < 300;

    // Logger le résultat
    await WebhookLogModel.create({
      webhookId,
      event: payload.event,
      payload: payload.data,
      url,
      statusCode: response.status,
      responseBody: JSON.stringify(response.data).substring(0, 1000), // Limiter la taille
      responseTime,
      success,
      error: success ? undefined : `HTTP ${response.status}`,
      attempt,
    });

    if (success) {
      logger.info('✅ Webhook envoyé avec succès', {
        webhookId,
        event: payload.event,
        url,
        statusCode: response.status,
        responseTime,
        attempt,
      });
    } else {
      logger.warn('⚠️ Webhook échec HTTP', {
        webhookId,
        event: payload.event,
        url,
        statusCode: response.status,
        attempt,
      });
    }

    return {
      success,
      statusCode: response.status,
      responseBody: JSON.stringify(response.data),
      responseTime,
    };
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    const errorMessage = error.message || 'Erreur inconnue';

    // Logger l'erreur
    await WebhookLogModel.create({
      webhookId,
      event: payload.event,
      payload: payload.data,
      url,
      success: false,
      error: errorMessage,
      responseTime,
      attempt,
    });

    logger.error('❌ Erreur envoi webhook', {
      webhookId,
      event: payload.event,
      url,
      error: errorMessage,
      attempt,
    });

    return {
      success: false,
      error: errorMessage,
      responseTime,
    };
  }
};

/**
 * Déclencher un webhook avec retry automatique
 */
export const triggerWebhook = async (event: string, data: any): Promise<void> => {
  try {
    // Récupérer tous les webhooks actifs pour cet événement
    const webhooks = await WebhookModel.find({
      isActive: true,
      events: event,
    });

    if (webhooks.length === 0) {
      logger.debug('Aucun webhook actif pour l\'événement', { event });
      return;
    }

    logger.info(`🔔 Déclenchement de ${webhooks.length} webhook(s)`, { event });

    // Envoyer les webhooks en parallèle
    await Promise.all(
      webhooks.map(async (webhook) => {
        const payload: WebhookPayload = {
          event,
          timestamp: new Date().toISOString(),
          data,
        };

        let success = false;
        let lastError: string | undefined;

        // Tentatives avec retry
        for (let attempt = 1; attempt <= webhook.retryCount + 1; attempt++) {
          const result = await sendWebhookRequest(
            webhook._id,
            webhook.url,
            payload,
            webhook.secret,
            webhook.headers ? Object.fromEntries(webhook.headers) : {},
            webhook.timeout,
            attempt
          );

          if (result.success) {
            success = true;
            break;
          }

          lastError = result.error;

          // Attendre avant de réessayer (backoff exponentiel)
          if (attempt <= webhook.retryCount) {
            const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }

        // Mettre à jour les statistiques du webhook
        webhook.lastTriggered = new Date();
        if (success) {
          webhook.successCount += 1;
        } else {
          webhook.failureCount += 1;
        }
        await webhook.save();
      })
    );
  } catch (error) {
    logger.error('❌ Erreur lors du déclenchement des webhooks:', error);
  }
};

/**
 * Tester un webhook
 */
export const testWebhook = async (webhookId: string): Promise<{
  success: boolean;
  statusCode?: number;
  responseTime?: number;
  error?: string;
}> => {
  const webhook = await WebhookModel.findById(webhookId);

  if (!webhook) {
    throw new Error('Webhook non trouvé');
  }

  const payload: WebhookPayload = {
    event: 'webhook.test',
    timestamp: new Date().toISOString(),
    data: {
      message: 'Ceci est un test de webhook',
      webhookId: webhook._id,
      webhookName: webhook.name,
    },
  };

  const result = await sendWebhookRequest(
    webhook._id,
    webhook.url,
    payload,
    webhook.secret,
    webhook.headers ? Object.fromEntries(webhook.headers) : {},
    webhook.timeout,
    1
  );

  return result;
};
