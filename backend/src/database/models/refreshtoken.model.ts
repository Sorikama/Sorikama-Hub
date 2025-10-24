// src/database/models/refreshToken.model.ts
import { Schema, model, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { encrypt, decrypt } from '../../utils/crypto';
// Interface TypeScript pour un document RefreshToken
export interface IRefreshToken extends Document {
    _id: string;
    token: string;
    user: string;
    expiresAt: Date;
}

// Schéma Mongoose pour les Refresh Tokens
const refreshTokenSchema = new Schema<IRefreshToken>({
    _id: {
        type: String,
        default: () => uuidv4(),
    },
    // Le token de rafraîchissement lui-même
    token: {
        type: String,
        required: true,
        unique: true,
        get: decrypt,
        set: encrypt,
    },
    // Référence à l'utilisateur
    user: {
        type: String,
        ref: 'User',
        required: true,
    },
    // Date d'expiration du token
    expiresAt: {
        type: Date,
        required: true,
    },
}, {
    timestamps: true,
    collection: 'refresh_tokens',
    _id: false,
    toJSON: { getters: true },
    toObject: { getters: true },
});

export const RefreshTokenModel = model<IRefreshToken>('RefreshToken', refreshTokenSchema);