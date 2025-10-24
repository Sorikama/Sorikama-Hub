/**
 * Modèle pour logger toutes les requêtes proxy
 * 
 * Permet de tracker :
 * - Qui a fait la requête
 * - Vers quel service
 * - Quel endpoint
 * - Temps de réponse
 * - Succès/Erreur
 */

import { Schema, model, Document } from 'mongoose';

export interface IProxyRequest extends Document {
  userId: string;
  serviceId: string;
  method: string;
  endpoint: string;
  statusCode: number;
  responseTime: number;
  success: boolean;
  errorMessage?: string;
  requestHeaders?: any;
  responseHeaders?: any;
  requestBody?: any;
  responseBody?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

const ProxyRequestSchema = new Schema<IProxyRequest>({
  // ID de l'utilisateur qui fait la requête
  userId: {
    type: String,
    required: true,
    index: true
  },
  
  // ID du service externe ciblé
  serviceId: {
    type: String,
    required: true,
    index: true
  },
  
  // Méthode HTTP (GET, POST, PUT, DELETE, etc.)
  method: {
    type: String,
    required: true
  },
  
  // Endpoint appelé (ex: /api/products)
  endpoint: {
    type: String,
    required: true
  },
  
  // Code de statut HTTP de la réponse
  statusCode: {
    type: Number,
    required: true
  },
  
  // Temps de réponse en millisecondes
  responseTime: {
    type: Number,
    required: true
  },
  
  // Succès ou échec
  success: {
    type: Boolean,
    required: true,
    index: true
  },
  
  // Message d'erreur si échec
  errorMessage: {
    type: String
  },
  
  // Headers de la requête (optionnel, pour debug)
  requestHeaders: {
    type: Schema.Types.Mixed
  },
  
  // Headers de la réponse (optionnel, pour debug)
  responseHeaders: {
    type: Schema.Types.Mixed
  },
  
  // Corps de la requête (optionnel, pour debug)
  requestBody: {
    type: Schema.Types.Mixed
  },
  
  // Corps de la réponse (optionnel, pour debug)
  responseBody: {
    type: Schema.Types.Mixed
  },
  
  // Adresse IP du client
  ipAddress: {
    type: String
  },
  
  // User Agent du client
  userAgent: {
    type: String
  },
  
  // Date et heure de la requête
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true,
  collection: 'proxy_requests'
});

// Index composés pour les requêtes fréquentes
ProxyRequestSchema.index({ userId: 1, timestamp: -1 });
ProxyRequestSchema.index({ serviceId: 1, timestamp: -1 });
ProxyRequestSchema.index({ success: 1, timestamp: -1 });

// TTL Index : Supprimer automatiquement les logs après 30 jours
ProxyRequestSchema.index({ timestamp: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export const ProxyRequestModel = model<IProxyRequest>('ProxyRequest', ProxyRequestSchema);
