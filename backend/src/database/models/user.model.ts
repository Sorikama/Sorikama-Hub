// src/database/models/user.model.ts
import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { IRole } from './role.model';
import { encrypt, decrypt, createBlindIndex } from '../../utils/crypto';
import crypto from 'crypto';

// Interface TypeScript pour un document User
export interface IUser extends Document {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    emailHash: string;
    password?: string;
    activationToken?: string;
    activationTokenExpires?: Date;
    isActivated: boolean; // Compte activé (mot de passe défini)
    isVerified: boolean;
    isActive: boolean;
    isBlocked: boolean; // Utilisateur bloqué par l'admin
    blockedAt?: Date; // Date du blocage
    blockedReason?: string; // Raison du blocage
    lastActivity?: Date; // Dernière activité de l'utilisateur
    loginCount: number; // Nombre de connexions
    lastLoginAt?: Date; // Date de dernière connexion
    lastLoginIP?: string; // IP de dernière connexion
    lastLoginDevice?: string; // Device de dernière connexion
    firstLoginAt?: Date; // Date de première connexion
    role: 'user' | 'admin' | 'super_admin'; // Rôle de l'utilisateur
    roles: string[] | IRole[]; // Rôles multiples (pour évolution future)
    comparePassword(password: string): Promise<boolean>;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    createPasswordResetToken(): string;
    createActivationToken(): string;
}

// Schéma Mongoose pour les Utilisateurs
const userSchema = new Schema<IUser>({
    _id: {
        type: String,
        default: () => uuidv4(),
    },
    // Prénom de l'utilisateur
    firstName: {
        type: String,
        required: true,
        trim: true,
        get: decrypt,
        set: encrypt,
    },
    // Nom de famille de l'utilisateur
    lastName: {
        type: String,
        required: true,
        trim: true,
        get: decrypt,
        set: encrypt,
    },
    // Email unique, utilisé pour la connexion
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        get: decrypt,
        set: encrypt,
    },
    emailHash: {
        type: String,
        unique: true, // Cet index garantit l'unicité des emails
        required: true,
        select: false, // Pas besoin de retourner ce champ par défaut
    },
    // Mot de passe haché (optionnel si créé par admin)
    password: {
        type: String,
        required: false,
        select: false,
    },
    // Token d'activation du compte (première connexion)
    activationToken: {
        type: String,
        select: false,
    },
    activationTokenExpires: {
        type: Date,
        select: false,
    },
    // Indique si le compte a été activé (mot de passe défini)
    isActivated: {
        type: Boolean,
        default: false,
    },
    // Si l'email a été vérifié
    isVerified: {
        type: Boolean,
        default: false,
    },
    // Pour désactiver un compte sans le supprimer
    isActive: {
        type: Boolean,
        default: true,
    },
    // Utilisateur bloqué par l'admin
    isBlocked: {
        type: Boolean,
        default: false,
    },
    // Date du blocage
    blockedAt: {
        type: Date,
    },
    // Raison du blocage
    blockedReason: {
        type: String,
    },
    // Dernière activité de l'utilisateur
    lastActivity: {
        type: Date,
        default: Date.now,
    },
    // Nombre de connexions
    loginCount: {
        type: Number,
        default: 0,
    },
    // Date de dernière connexion
    lastLoginAt: {
        type: Date,
    },
    // IP de dernière connexion
    lastLoginIP: {
        type: String,
    },
    // Device de dernière connexion
    lastLoginDevice: {
        type: String,
    },
    // Date de première connexion
    firstLoginAt: {
        type: Date,
    },
    // Rôle principal de l'utilisateur (user, admin ou super_admin)
    role: {
        type: String,
        enum: ['user', 'admin', 'super_admin'],
        default: 'user',
    },
    passwordResetToken: {
        type: String,
        select: false,
    },
    passwordResetExpires: {
        type: Date,
        select: false,
    },
    // Références vers les rôles de l'utilisateur (pour évolution future)
    roles: [{
        type: String,
        ref: 'Role',
    }],
}, {
    timestamps: true,
    collection: 'users',
    _id: false,
    // Activer les getters pour que le déchiffrement fonctionne lors de la conversion en JSON
    toJSON: { getters: true },
    toObject: { getters: true },
});

// Hook pour mettre à jour automatiquement le emailHash si l'email est modifié ou nouveau
userSchema.pre<IUser>('save', function (next) {
    if (this.isModified('email') || this.isNew) {
        this.emailHash = createBlindIndex(this.email);
    }
    next();
});

// Middleware (hook) qui s'exécute AVANT de sauvegarder un document
// pour hacher le mot de passe s'il a été modifié.
userSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('password') || !this.password) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error: any) {
        next(error);
    }
});

// Méthode pour comparer le mot de passe fourni avec celui haché en BDD
userSchema.methods.comparePassword = function (password: string): Promise<boolean> {
    // 'this.password' ne sera pas disponible si le document a été récupéré
    // sans le champ 'password' (à cause de 'select: false').
    // Il faut explicitement le demander dans la requête (ex: .select('+password'))
    return bcrypt.compare(password, this.password);
};

/**
 * Génère un token de réinitialisation de mot de passe.
 * Cette méthode ne sauvegarde pas le document, elle ne fait que le modifier.
 * Le token retourné est celui qui sera envoyé à l'utilisateur.
 * La version hachée est stockée en base de données pour la comparaison.
 */
userSchema.methods.createPasswordResetToken = function (): string {
    // 1. Générer un token simple et aléatoire
    const resetToken = crypto.randomBytes(32).toString('hex');

    // 2. Hacher le token avant de le sauvegarder en BDD pour la sécurité
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // 3. Définir une date d'expiration (ex: 10 minutes)
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    // 4. Retourner le token NON haché pour l'envoyer par email
    return resetToken;
};

/**
 * Créer un token d'activation de compte
 * Utilisé lors de la création d'un utilisateur par un admin (sans mot de passe)
 */
userSchema.methods.createActivationToken = function (): string {
    // 1. Générer un token aléatoire
    const activationToken = crypto.randomBytes(32).toString('hex');

    // 2. Hacher le token avant de le sauvegarder en BDD
    this.activationToken = crypto
        .createHash('sha256')
        .update(activationToken)
        .digest('hex');

    // 3. Définir une date d'expiration (7 jours)
    this.activationTokenExpires = Date.now() + 7 * 24 * 60 * 60 * 1000;

    // 4. Retourner le token NON haché pour l'envoyer par email
    return activationToken;
};

export const UserModel = model<IUser>('User', userSchema);