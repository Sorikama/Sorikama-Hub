// src/database/models/permission.model.ts
import { Schema, model, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

// Interface TypeScript pour un document Permission
export interface IPermission extends Document {
    _id: string;
    action: string;
    subject: string;
    description?: string;
}

// Schéma Mongoose pour les Permissions
const permissionSchema = new Schema<IPermission>({
    // ID unique de la permission
    _id: {
        type: String,
        default: () => uuidv4(),
    },
    // L'action effectuée (ex: 'create', 'read', 'update', 'delete')
    action: {
        type: String,
        required: true,
    },
    // L'entité concernée (ex: 'maison', 'user')
    subject: {
        type: String,
        required: true,
    },
    // Description optionnelle de ce que fait la permission
    description: {
        type: String,
    },
}, {
    // Ajoute les champs createdAt et updatedAt automatiquement
    timestamps: true,
    // Assure que la combinaison action + subject est unique
    collection: 'permissions',
    _id: false,
});

permissionSchema.index({ action: 1, subject: 1 }, { unique: true });

export const PermissionModel = model<IPermission>('Permission', permissionSchema);