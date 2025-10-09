// src/database/models/simpleApiKey.model.ts
import { Schema, model, Document } from 'mongoose';

export interface ISimpleApiKey extends Document {
  name: string;
  description?: string;
  keyId: string;
  hashedKey: string;
  permissions: string[];
  isActive: boolean;
  usageCount: number;
  lastUsedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const simpleApiKeySchema = new Schema<ISimpleApiKey>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  keyId: {
    type: String,
    required: true,
    unique: true
  },
  hashedKey: {
    type: String,
    required: true
  },
  permissions: [{
    type: String,
    required: true,
    enum: ['read', 'write', 'admin']
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  usageCount: {
    type: Number,
    default: 0
  },
  lastUsedAt: {
    type: Date
  },
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true,
  collection: 'simple_api_keys'
});

// Index pour optimiser les requêtes
simpleApiKeySchema.index({ keyId: 1 });
simpleApiKeySchema.index({ isActive: 1 });

export const SimpleApiKeyModel = model<ISimpleApiKey>('SimpleApiKey', simpleApiKeySchema);