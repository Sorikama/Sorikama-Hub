// sorikama-gateway/src/auth/auth.validation.ts
import Joi from 'joi';

// Regex pour imposer : au moins une minuscule, une majuscule, un chiffre,
// un caractère spécial et une longueur de 8 caractères minimum.
const passwordComplexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Schéma de validation pour l'inscription
export const signupSchema = Joi.object({
    firstName: Joi.string().min(2).required().messages({
        'string.base': 'Le prénom doit être une chaîne de caractères.',
        'string.empty': 'Le prénom est requis.',
        'string.min': 'Le prénom doit avoir au moins 2 caractères.',
        'any.required': 'Le prénom est requis.',
    }),
    lastName: Joi.string().min(2).required().messages({
        'string.base': 'Le nom doit être une chaîne de caractères.',
        'string.empty': 'Le nom est requis.',
        'string.min': 'Le nom doit avoir au moins 2 caractères.',
        'any.required': 'Le nom est requis.',
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'L\'adresse email doit être valide.',
        'string.empty': 'L\'adresse email est requise.',
        'any.required': 'L\'adresse email est requise.',
    }),
    password: Joi.string()
        .pattern(passwordComplexityRegex)
        .required()
        .messages({
            'string.min': 'Le mot de passe doit avoir au moins 8 caractères.',
            'string.pattern.base': 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial.',
            'string.empty': 'Le mot de passe est requis.',
            'any.required': 'Le mot de passe est requis.',
        }),
});

// Schéma pour la deuxième étape : vérification du code
export const verifyAccountSchema = Joi.object({
    verificationToken: Joi.string().required().messages({
        'any.required': 'Le token de vérification est requis.',
    }),
    code: Joi.string().length(6).required().messages({
        'string.length': 'Le code de vérification doit contenir 6 chiffres.',
        'any.required': 'Le code de vérification est requis.',
    }),
});

// Schéma de validation pour la connexion
export const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'L\'adresse email doit être valide.',
        'string.empty': 'L\'adresse email est requise.',
        'any.required': 'L\'adresse email est requise.',
    }),
    password: Joi.string().required().messages({
        'string.empty': 'Le mot de passe est requis.',
        'any.required': 'Le mot de passe est requis.',
    }),
});

export const updateMeSchema = Joi.object({
    firstName: Joi.string().min(2).messages({
        'string.base': 'Le prénom doit être une chaîne de caractères.',
        'string.empty': 'Le prénom est requis.',
        'string.min': 'Le prénom doit avoir au moins 2 caractères.',
        'any.required': 'Le prénom est requis.',
    }),
    lastName: Joi.string().min(2).messages({
        'string.base': 'Le nom doit être une chaîne de caractères.',
        'string.empty': 'Le nom est requis.',
        'string.min': 'Le nom doit avoir au moins 2 caractères.',
        'any.required': 'Le nom est requis.',
    }),
}).min(1).messages({
    'object.min': 'Au moins un champ doit être fourni.',
});

export const updatePasswordSchema = Joi.object({
    currentPassword: Joi.string().required().messages({
        'string.empty': 'Le mot de passe actuel est requis.',
        'any.required': 'Le mot de passe actuel est requis.',
    }),
    newPassword: Joi.string().min(8).required().messages({
        'string.min': 'Le nouveau mot de passe doit avoir au moins 8 caractères.',
        'string.empty': 'Le nouveau mot de passe est requis.',
        'any.required': 'Le nouveau mot de passe est requis.',
    }),
});

export const forgotPasswordSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'L\'adresse email doit être valide.',
        'string.empty': 'L\'adresse email est requise.',
        'any.required': 'L\'adresse email est requise.',
    }),
});

export const resetPasswordSchema = Joi.object({
    password: Joi.string()
        .pattern(passwordComplexityRegex)
        .required()
        .messages({
            'string.min': 'Le nouveau mot de passe doit avoir au moins 8 caractères.',
            'string.pattern.base': 'Le nouveau mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial.',
            'string.empty': 'Le nouveau mot de passe est requis.',
            'any.required': 'Le nouveau mot de passe est requis.',
        }),
});

export const refreshTokenSchema = Joi.object({
    refreshToken: Joi.string().required().messages({
        'string.empty': 'Le jeton de rafraîchissement est requis.',
        'any.required': 'Le jeton de rafraîchissement est requis.',
    }),
});