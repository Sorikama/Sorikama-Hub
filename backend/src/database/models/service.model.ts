/**
 * Modèle Service Externe
 * Gestion des services externes avec proxy et routage
 */

import mongoose, { Schema, Document } from 'mongoose';
import crypto from 'crypto';

export interface IService extends Document {
  name: string;
  slug: string;
  description?: string;
  frontendUrl: string;
  backendUrl: string;
  proxyPath: string;
  apiKey: string; // Clé API pour authentifier les callbacks du service
  apiKeyLastRotated?: Date; // Date de dernière rotation de la clé
  enabled: boolean;
  requireAuth: boolean;
  allowedRoles: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  generateApiKey(): string;
}

const ServiceSchema = new Schema<IService>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    frontendUrl: {
      type: String,
      required: true,
      trim: true
    },
    backendUrl: {
      type: String,
      required: true,
      trim: true
    },
    proxyPath: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    apiKey: {
      type: String,
      required: true,
      unique: true,
      select: false // Ne pas retourner la clé API par défaut
    },
    apiKeyLastRotated: {
      type: Date,
      default: Date.now
    },
    enabled: {
      type: Boolean,
      default: true
    },
    requireAuth: {
      type: Boolean,
      default: false
    },
    allowedRoles: {
      type: [String],
      default: []
    },
    createdBy: {
      type: String,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Index pour recherche rapide
ServiceSchema.index({ slug: 1 });
ServiceSchema.index({ proxyPath: 1 });
ServiceSchema.index({ enabled: 1 });
ServiceSchema.index({ apiKey: 1 });

/**
 * Générer une clé API unique et sécurisée
 */
ServiceSchema.methods.generateApiKey = function(): string {
  // Format: sk_live_<32 caractères aléatoires>
  const randomBytes = crypto.randomBytes(32).toString('hex');
  return `sk_live_${randomBytes}`;
};

/**
 * Hook avant sauvegarde : générer une clé API si elle n'existe pas
 */
ServiceSchema.pre<IService>('save', function(next) {
  if (this.isNew && !this.apiKey) {
    // Générer directement la clé API
    const randomBytes = crypto.randomBytes(32).toString('hex');
    this.apiKey = `sk_live_${randomBytes}`;
    this.apiKeyLastRotated = new Date();
  }
  next();
});

export const ServiceModel = mongoose.model<IService>('Service', ServiceSchema);
