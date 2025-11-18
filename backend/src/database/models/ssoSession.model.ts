// src/database/models/ssoSession.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ISSOSession extends Document {
  sessionId: string;
  userId: string;
  serviceId: string;
  accessToken: string;
  refreshToken?: string;
  scopes?: string[];
  expiresAt: Date;
  redirectUrl?: string;
  state?: string;
  userInfo?: any;
  createdAt: Date;
  updatedAt: Date;
}

const SSOSessionSchema = new Schema<ISSOSession>({
  sessionId: { type: String, required: true, unique: true, index: true },
  userId: { type: String, required: true, index: true },
  serviceId: { type: String, required: true, index: true },
  accessToken: { type: String, required: true },
  refreshToken: { type: String },
  scopes: { type: [String], default: ['profile', 'email'] },
  expiresAt: { type: Date, required: true, index: true },
  redirectUrl: { type: String },
  state: { type: String },
  userInfo: { type: Schema.Types.Mixed }
}, {
  timestamps: true
});

// TTL index pour supprimer automatiquement les sessions expirées
SSOSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const SSOSessionModel = mongoose.model<ISSOSession>('SSOSession', SSOSessionSchema);