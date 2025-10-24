// src/database/models/simpleApiKey.model.ts
import { Schema, model, Document, Model } from 'mongoose';

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
  userId?: string; // Référence à l'utilisateur propriétaire
  createdAt: Date;
  updatedAt: Date;
  hasPermission(requiredPermission: string): boolean;
  hasPermissions(requiredPermissions: string[]): boolean;
}

export interface ISimpleApiKeyModel extends Model<ISimpleApiKey> {
  verifyApiKey(apiKey: string): Promise<ISimpleApiKey | null>;
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
  },
  userId: {
    type: String,
    ref: 'User'
  }
}, {
  timestamps: true,
  collection: 'simple_api_keys'
});

// Index pour optimiser les requêtes (keyId déjà indexé par unique: true)
simpleApiKeySchema.index({ isActive: 1 });
simpleApiKeySchema.index({ hashedKey: 1 });

// Méthode statique pour vérifier une API key avec permissions
simpleApiKeySchema.statics.verifyApiKey = async function(apiKey: string, requiredPermissions?: string[]) {
  const crypto = require('crypto');
  const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');
  
  const keyDoc = await this.findOne({
    keyId: apiKey,
    hashedKey: hashedKey,
    isActive: true,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ]
  });
  
  if (!keyDoc) {
    return null;
  }
  
  // Vérifier les permissions si requises
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasRequiredPermissions = keyDoc.hasPermissions(requiredPermissions);
    if (!hasRequiredPermissions) {
      return null; // Permissions insuffisantes
    }
  }
  
  // Mettre à jour les statistiques d'usage
  keyDoc.lastUsedAt = new Date();
  keyDoc.usageCount += 1;
  await keyDoc.save();
  
  return keyDoc;
};

// Méthode d'instance pour vérifier les permissions avec logique avancée
simpleApiKeySchema.methods.hasPermission = function(requiredPermission: string): boolean {
  // Si la clé a la permission 'admin', elle a accès à tout
  if (this.permissions.includes('admin')) {
    return true;
  }
  
  // Vérifier si la permission spécifique est accordée
  if (this.permissions.includes(requiredPermission)) {
    return true;
  }
  
  // Logique hiérarchique: 'write' inclut 'read'
  if (requiredPermission === 'read' && this.permissions.includes('write')) {
    return true;
  }
  
  return false;
};

// Méthode d'instance pour vérifier plusieurs permissions
simpleApiKeySchema.methods.hasPermissions = function(requiredPermissions: string[]): boolean {
  // Si la clé a la permission 'admin', elle a accès à tout
  if (this.permissions.includes('admin')) {
    return true;
  }
  
  // Vérifier que toutes les permissions requises sont accordées
  return requiredPermissions.every(permission => this.hasPermission(permission));
};

// Méthode pour vérifier si la clé est expirée
simpleApiKeySchema.methods.isExpired = function(): boolean {
  if (!this.expiresAt) {
    return false; // Pas d'expiration = jamais expirée
  }
  return new Date() > this.expiresAt;
};

// Méthode pour obtenir le statut de la clé
simpleApiKeySchema.methods.getStatus = function(): string {
  if (!this.isActive) return 'revoked';
  if (this.isExpired()) return 'expired';
  return 'active';
};

export const SimpleApiKeyModel = model<ISimpleApiKey>('SimpleApiKey', simpleApiKeySchema);