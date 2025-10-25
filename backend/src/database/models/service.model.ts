/**
 * Modèle Service Externe
 * Gestion des services externes avec proxy et routage
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IService extends Document {
  name: string;
  slug: string;
  description?: string;
  frontendUrl: string;
  backendUrl: string;
  proxyPath: string;
  enabled: boolean;
  requireAuth: boolean;
  allowedRoles: string[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
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
      type: Schema.Types.ObjectId,
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

export const ServiceModel = mongoose.model<IService>('Service', ServiceSchema);
