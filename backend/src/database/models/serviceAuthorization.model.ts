/**
 * Modèle ServiceAuthorization
 * Stocke les autorisations d'accès d'un utilisateur à un service
 */

import mongoose, { Schema, Document } from 'mongoose';
import crypto from 'crypto';

export interface IServiceAuthorization extends Document {
  userId: string;
  serviceId: mongoose.Types.ObjectId;
  accessToken: string;
  refreshToken: string;
  scopes: string[];
  expiresAt: Date;
  refreshExpiresAt: Date;
  isActive: boolean;
  lastUsedAt?: Date;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceAuthorizationSchema = new Schema<IServiceAuthorization>(
  {
    userId: {
      type: String,
      ref: 'User',
      required: true
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: true
    },
    accessToken: {
      type: String,
      required: true,
      unique: true
    },
    refreshToken: {
      type: String,
      required: true,
      unique: true
    },
    scopes: {
      type: [String],
      default: ['profile', 'email']
    },
    expiresAt: {
      type: Date,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    refreshExpiresAt: {
      type: Date,
      required: true
    },
    lastUsedAt: {
      type: Date
    },
    ipAddress: {
      type: String
    },
    userAgent: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Index pour recherche rapide
ServiceAuthorizationSchema.index({ userId: 1, serviceId: 1 });
ServiceAuthorizationSchema.index({ accessToken: 1 });
ServiceAuthorizationSchema.index({ refreshToken: 1 });
ServiceAuthorizationSchema.index({ isActive: 1 });
ServiceAuthorizationSchema.index({ expiresAt: 1 });

// Méthode pour générer un access token
ServiceAuthorizationSchema.statics.generateAccessToken = function() {
  return crypto.randomBytes(32).toString('hex');
};

// Méthode pour générer un refresh token
ServiceAuthorizationSchema.statics.generateRefreshToken = function() {
  return crypto.randomBytes(32).toString('hex');
};

// Méthode pour vérifier si le token est expiré
ServiceAuthorizationSchema.methods.isExpired = function() {
  return this.expiresAt < new Date();
};

// Méthode pour vérifier si le refresh token est expiré
ServiceAuthorizationSchema.methods.isRefreshExpired = function() {
  return this.refreshExpiresAt < new Date();
};

// Méthode pour renouveler le token
ServiceAuthorizationSchema.methods.renewToken = function() {
  this.accessToken = crypto.randomBytes(32).toString('hex');
  this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 jours
  return this.save();
};

export const ServiceAuthorizationModel = mongoose.model<IServiceAuthorization>(
  'ServiceAuthorization',
  ServiceAuthorizationSchema
);
