// src/database/models/apiKey.model.ts
import { Schema, model, Document, Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export interface IApiKey extends Document {
  _id: string;
  userId: string;
  name: string;
  keyHash: string;
  prefix: string;
  permissions: string[];
  isActive: boolean;
  lastUsed?: Date;
  expiresAt?: Date;
  rateLimit: {
    requests: number;
    windowMs: number;
  };
  allowedIPs?: string[];
  allowedDomains?: string[];
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IApiKeyModel extends Model<IApiKey> {
  generateApiKey(): { key: string; hash: string; prefix: string };
  verifyApiKey(apiKey: string): Promise<IApiKey | null>;
}

const apiKeySchema = new Schema<IApiKey>({
  _id: {
    type: String,
    default: () => uuidv4(),
  },
  userId: {
    type: String,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  keyHash: {
    type: String,
    required: true,
    unique: true,
    select: false
  },
  prefix: {
    type: String,
    required: true,
    length: 8
  },
  permissions: [{
    type: String,
    required: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastUsed: {
    type: Date
  },
  expiresAt: {
    type: Date
  },
  rateLimit: {
    requests: {
      type: Number,
      default: 1000
    },
    windowMs: {
      type: Number,
      default: 3600000 // 1 heure
    }
  },
  allowedIPs: [{
    type: String
  }],
  allowedDomains: [{
    type: String
  }],
  usageCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  collection: 'apikeys',
  _id: false
});

// Index composé pour optimiser les requêtes
apiKeySchema.index({ userId: 1, isActive: 1 });
apiKeySchema.index({ prefix: 1, keyHash: 1 });

// Méthode statique pour générer une API key
apiKeySchema.statics.generateApiKey = function(): { key: string; hash: string; prefix: string } {
  const key = `sk_${crypto.randomBytes(32).toString('hex')}`;
  const prefix = key.substring(0, 8);
  const hash = crypto.createHash('sha256').update(key).digest('hex');
  
  return { key, hash, prefix };
};

// Méthode pour vérifier une API key
apiKeySchema.statics.verifyApiKey = async function(apiKey: string): Promise<IApiKey | null> {
  const prefix = apiKey.substring(0, 8);
  const hash = crypto.createHash('sha256').update(apiKey).digest('hex');
  
  const keyDoc = await this.findOne({
    prefix,
    keyHash: hash,
    isActive: true,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ]
  }).populate('userId', 'firstName lastName email roles isActive');
  
  if (keyDoc) {
    // Mettre à jour les statistiques d'usage
    keyDoc.lastUsed = new Date();
    keyDoc.usageCount += 1;
    await keyDoc.save();
  }
  
  return keyDoc;
};

export const ApiKeyModel = model<IApiKey, IApiKeyModel>('ApiKey', apiKeySchema) as IApiKeyModel;