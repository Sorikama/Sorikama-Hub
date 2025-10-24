/**
 * Modèle pour la gestion des webhooks
 */

import { Schema, model, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export interface IWebhook extends Document {
    _id: string;
    name: string;
    url: string;
    secret: string;
    events: string[];
    isActive: boolean;
    headers?: Record<string, string>;
    retryCount: number;
    timeout: number;
    createdBy: string;
    lastTriggered?: Date;
    successCount: number;
    failureCount: number;
}

const webhookSchema = new Schema<IWebhook>({
    _id: {
        type: String,
        default: () => uuidv4(),
    },
    // Nom du webhook
    name: {
        type: String,
        required: true,
        trim: true,
    },
    // URL de destination
    url: {
        type: String,
        required: true,
        trim: true,
    },
    // Secret pour signer les webhooks
    secret: {
        type: String,
        required: true,
        default: () => crypto.randomBytes(32).toString('hex'),
    },
    // Événements auxquels le webhook est abonné
    events: [{
        type: String,
        required: true,
    }],
    // Si le webhook est actif
    isActive: {
        type: Boolean,
        default: true,
    },
    // Headers HTTP personnalisés
    headers: {
        type: Map,
        of: String,
    },
    // Nombre de tentatives en cas d'échec
    retryCount: {
        type: Number,
        default: 3,
        min: 0,
        max: 5,
    },
    // Timeout en millisecondes
    timeout: {
        type: Number,
        default: 5000,
        min: 1000,
        max: 30000,
    },
    // Créé par (userId)
    createdBy: {
        type: String,
        required: true,
        ref: 'User',
    },
    // Dernière fois que le webhook a été déclenché
    lastTriggered: {
        type: Date,
    },
    // Compteurs de succès/échecs
    successCount: {
        type: Number,
        default: 0,
    },
    failureCount: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
    collection: 'webhooks',
    _id: false,
});

// Index
webhookSchema.index({ createdBy: 1 });
webhookSchema.index({ events: 1 });
webhookSchema.index({ isActive: 1 });

export const WebhookModel = model<IWebhook>('Webhook', webhookSchema);
