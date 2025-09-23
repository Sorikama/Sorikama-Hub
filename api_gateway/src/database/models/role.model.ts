// src/database/models/role.model.ts
import { Schema, model, Document } from 'mongoose';
import { IPermission } from './permission.model';
import { v4 as uuidv4 } from 'uuid';

// Interface TypeScript pour un document Role
export interface IRole extends Document {
    _id: string;
    name: string;
    description?: string;
    permissions: string[] | IPermission[]; // Peut contenir des ObjectId ou des documents peuplés
    isEditable: boolean;
}

// Schéma Mongoose pour les Rôles
const roleSchema = new Schema<IRole>({
    _id: {
        type: String,
        default: () => uuidv4(),
    },
    // Nom unique du rôle (ex: 'admin', 'user')
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    // Description optionnelle du rôle
    description: {
        type: String,
    },
    // Tableau de références vers les documents de la collection 'permissions'
    permissions: [{
        type: String,
        ref: 'Permission', // Fait référence au modèle Permission
    }],
    // Un flag de sécurité pour empêcher la modification de rôles critiques
    isEditable: {
        type: Boolean,
        default: true,
    }
}, {
    timestamps: true,
    collection: 'roles',
    _id: false,
});

export const RoleModel = model<IRole>('Role', roleSchema);