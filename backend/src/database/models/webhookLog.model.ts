/**
 * Modèle pour les logs des webhooks envoyés
 */

import { Schema, model, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IWebhookLog extends Document {
  _id: string;
  webhookId: string;
  event: string;
  payload: any;
  url: string;
  statusCode?: number;
  responseBody?: string;
  responseTime?: number;
  success: boolean;
  error?: string;
  attempt: number;
}

const webhookLogSchema = new Schema<IWebhookLog>({
  _id: {
    type: String,
    default: () => uuidv4(),
  },
  // ID du webhook
  webhookId: {
    type: String,
    required: true,
    ref: 'Webhook',
  },
  // Événement déclenché
  event: {
    type: String,
    required: true,
  },
  // Payload envoyé
  payload: {
    type: Schema.Types.Mixed,
    required: true,
  },
  // URL appelée
  url: {
    type: String,
    required: true,
  },
  // Code de statut HTTP
  statusCode: {
    type: Number,
  },
  // Corps de la réponse
  responseBody: {
    type: String,
  },
  // Temps de réponse en ms
  responseTime: {
    type: Number,
  },
  // Si l'envoi a réussi
  success: {
    type: Boolean,
    required: true,
  },
  // Message d'erreur si échec
  error: {
    type: String,
  },
  // Numéro de tentative
  attempt: {
    type: Number,
    default: 1,
  },
}, {
  timestamps: true,
  collection: 'webhook_logs',
  _id: false,
});

// Index
webhookLogSchema.index({ webhookId: 1, createdAt: -1 });
webhookLogSchema.index({ event: 1, createdAt: -1 });
webhookLogSchema.index({ success: 1 });

// TTL index - Supprimer les logs après 30 jours
webhookLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export const WebhookLogModel = model<IWebhookLog>('WebhookLog', webhookLogSchema);
