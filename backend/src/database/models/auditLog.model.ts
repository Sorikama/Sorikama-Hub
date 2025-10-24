/**
 * Modèle pour l'audit trail - Logger toutes les actions importantes
 */

import { Schema, model, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IAuditLog extends Document {
    _id: string;
    userId?: string;
    action: string;
    category: 'auth' | 'user' | 'admin' | 'service' | 'proxy' | 'system' | 'security';
    resource?: string;
    resourceId?: string;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
    status: 'success' | 'failure' | 'warning';
    errorMessage?: string;
    metadata?: any;
}

const auditLogSchema = new Schema<IAuditLog>({
    _id: {
        type: String,
        default: () => uuidv4(),
    },
    // ID de l'utilisateur qui a effectué l'action
    userId: {
        type: String,
        ref: 'User',
    },
    // Action effectuée (ex: 'login', 'create_user', 'delete_role')
    action: {
        type: String,
        required: true,
        index: true,
    },
    // Catégorie de l'action
    category: {
        type: String,
        enum: ['auth', 'user', 'admin', 'service', 'proxy', 'system', 'security'],
        required: true,
        index: true,
    },
    // Type de ressource concernée (ex: 'user', 'role', 'service')
    resource: {
        type: String,
    },
    // ID de la ressource concernée
    resourceId: {
        type: String,
    },
    // Détails de l'action (objet JSON)
    details: {
        type: Schema.Types.Mixed,
    },
    // Adresse IP de l'utilisateur
    ipAddress: {
        type: String,
    },
    // User agent du navigateur
    userAgent: {
        type: String,
    },
    // Statut de l'action
    status: {
        type: String,
        enum: ['success', 'failure', 'warning'],
        required: true,
        default: 'success',
    },
    // Message d'erreur si échec
    errorMessage: {
        type: String,
    },
    // Métadonnées supplémentaires
    metadata: {
        type: Schema.Types.Mixed,
    },
}, {
    timestamps: true,
    collection: 'audit_logs',
    _id: false,
});

// Index pour optimiser les requêtes
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ category: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });

// TTL index - Supprimer les logs après 90 jours
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export const AuditLogModel = model<IAuditLog>('AuditLog', auditLogSchema);
