// src/database/models/service.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IService extends Document {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: string;
  color: string;
  status: 'active' | 'inactive' | 'maintenance';
  version: string;
  endpoints: string[];
  apiKey?: string;
  lastCheck?: Date;
  responseTime?: number;
  uptime?: number;
  requestCount?: number;
  errorCount?: number;
  lastError?: string;
  healthCheckUrl?: string;
  redirectUrls?: string[];
  ssoEnabled: boolean;
  authEndpoint?: string;
  tokenEndpoint?: string;
  userInfoEndpoint?: string;
  clientId?: string;
  clientSecret?: string;
  scopes?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  url: { type: String, required: true },
  icon: { type: String, required: true },
  color: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'maintenance'], 
    default: 'active' 
  },
  version: { type: String, required: true },
  endpoints: [{ type: String }],
  apiKey: { type: String },
  lastCheck: { type: Date },
  responseTime: { type: Number, default: 0 },
  uptime: { type: Number, default: 100 },
  requestCount: { type: Number, default: 0 },
  errorCount: { type: Number, default: 0 },
  lastError: { type: String },
  healthCheckUrl: { type: String },
  redirectUrls: [{ type: String }],
  ssoEnabled: { type: Boolean, default: true },
  authEndpoint: { type: String },
  tokenEndpoint: { type: String },
  userInfoEndpoint: { type: String },
  clientId: { type: String },
  clientSecret: { type: String },
  scopes: [{ type: String }]
}, {
  timestamps: true
});

// Index pour optimiser les requêtes
ServiceSchema.index({ id: 1 });
ServiceSchema.index({ status: 1 });
ServiceSchema.index({ lastCheck: -1 });

export const ServiceModel = mongoose.model<IService>('Service', ServiceSchema);