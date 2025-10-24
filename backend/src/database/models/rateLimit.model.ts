/**
 * Modèle pour tracker le rate limiting par utilisateur/service
 */

import { Schema, model, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IRateLimit extends Document {
  _id: string;
  userId: string;
  service?: string;
  endpoint?: string;
  requestCount: number;
  windowStart: Date;
  windowEnd: Date;
  isBlocked: boolean;
  blockedUntil?: Date;
  lastRequest: Date;
}

const rateLimitSchema = new Schema<IRateLimit>({
  _id: {
    type: String,
    default: () => uuidv4(),
  },
  // ID de l'utilisateur
  userId: {
    type: String,
    required: true,
    ref: 'User',
  },
  // Service concerné (optionnel)
  service: {
    type: String,
  },
  // Endpoint spécifique (optionnel)
  endpoint: {
    type: String,
  },
  // Nombre de requêtes dans la fenêtre actuelle
  requestCount: {
    type: Number,
    default: 0,
  },
  // Début de la fenêtre de temps
  windowStart: {
    type: Date,
    required: true,
  },
  // Fin de la fenêtre de temps
  windowEnd: {
    type: Date,
    required: true,
  },
  // Si l'utilisateur est temporairement bloqué
  isBlocked: {
    type: Boolean,
    default: false,
  },
  // Date jusqu'à laquelle l'utilisateur est bloqué
  blockedUntil: {
    type: Date,
  },
  // Dernière requête effectuée
  lastRequest: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  collection: 'rate_limits',
  _id: false,
});

// Index pour optimiser les requêtes
rateLimitSchema.index({ userId: 1, service: 1, windowEnd: 1 });
rateLimitSchema.index({ windowEnd: 1 }, { expireAfterSeconds: 3600 }); // TTL de 1h

export const RateLimitModel = model<IRateLimit>('RateLimit', rateLimitSchema);
