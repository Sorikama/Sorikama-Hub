// sorikama-gateway/src/routes/auth.routes.ts

import { Router } from 'express';
// Importe toutes les fonctions du contrôleur d'authentification
import * as authController from '../auth/auth.controller';
// Importe le middleware pour valider le corps des requêtes
import { validateBody } from '../middlewares/validation.middleware';
// Importe tous les schémas de validation Joi
import * as schemas from '../auth/auth.validation';
// Importe le middleware pour protéger les routes
import { protect } from '../middlewares/auth.middleware';
import { requireApiKeyAndJWT } from '../middlewares/dualAuth.middleware';
// Importe les routes d'activation de compte
import activationRoutes from './auth/activation.routes';
// Importe les routes d'autorisation OAuth
import authorizeRoutes from './auth/authorize.routes';

const router = Router();

/**
 * @swagger
 * tags:
 * - name: Authentification
 * description: Endpoints pour l'inscription, la connexion et la récupération de compte.
 * - name: Gestion de Compte
 * description: Endpoints pour la gestion du profil utilisateur une fois connecté.
 */

// ===================================================================================
// --- 🔓 Routes Publiques (ne nécessitent pas d'authentification) ---
// ===================================================================================

/**
 * @swagger
 * /auth/register:
 * post:
 * summary: Étape 1 - Demander la création d'un compte
 * tags: [Authentification]
 * description: Démarre le processus d'inscription en envoyant un code de vérification par email.
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/SignupRequest'
 * responses:
 * '200':
 * description: Email de vérification envoyé avec succès.
 * '400':
 * description: Données d'entrée invalides.
 * '409':
 * description: Un compte vérifié avec cet email existe déjà.
 */
// Valide les données (prénom, nom, email, mot de passe) avant d'appeler le contrôleur
router.post('/register', validateBody(schemas.signupSchema), authController.requestAccountVerification);

/**
 * @swagger
 * /auth/verify:
 * post:
 * summary: Étape 2 - Vérifier le code et créer le compte
 * tags: [Authentification]
 * description: Finalise la création du compte en utilisant le code de vérification et le token temporaire.
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/VerifyAccountRequest'
 * responses:
 * '201':
 * description: Compte créé et utilisateur connecté.
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/AuthTokens'
 * '400':
 * description: Code ou token de vérification invalide ou expiré.
 */
// Valide le token temporaire et le code avant de créer le compte
router.post('/verify', validateBody(schemas.verifyAccountSchema), authController.verifyAndCreateAccount);

/**
 * @swagger
 * /auth/login:
 * post:
 * summary: Connexion d'un utilisateur
 * tags: [Authentification]
 * description: Authentifie un utilisateur avec son email et mot de passe, et retourne une paire de tokens.
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/LoginRequest'
 * responses:
 * '200':
 * description: Connexion réussie.
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/AuthTokens'
 * '401':
 * description: Email ou mot de passe incorrect.
 */
// Valide l'email et le mot de passe avant de tenter la connexion
router.post('/login', validateBody(schemas.loginSchema), authController.login);

/**
 * @swagger
 * /auth/forgot-password:
 * post:
 * summary: Demander une réinitialisation de mot de passe (Étape 1)
 * tags: [Authentification]
 * description: Envoie un email avec un lien de réinitialisation si l'email correspond à un compte.
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/ForgotPasswordRequest'
 * responses:
 * '200':
 * description: Réponse générique pour des raisons de sécurité.
 */
// Valide le format de l'email avant d'envoyer le lien de réinitialisation
router.post('/forgot-password', validateBody(schemas.forgotPasswordSchema), authController.forgotPassword);

/**
 * @swagger
 * /auth/reset-password/{token}:
 * post:
 * summary: Réinitialiser le mot de passe avec un token (Étape 2)
 * tags: [Authentification]
 * parameters:
 * - in: path
 * name: token
 * required: true
 * schema:
 * type: string
 * description: Le token reçu par email.
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/ResetPasswordRequest'
 * responses:
 * '200':
 * description: Mot de passe réinitialisé avec succès.
 * '400':
 * description: Token invalide ou expiré.
 */
// Valide le nouveau mot de passe avant de finaliser la réinitialisation
router.post('/reset-password/:token', validateBody(schemas.resetPasswordSchema), authController.resetPassword);

/**
 * @swagger
 * /auth/refresh-token:
 * post:
 * summary: Obtenir un nouvel access token
 * tags: [Authentification]
 * description: Utilise un refresh token valide pour générer une nouvelle paire de tokens.
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/RefreshTokenRequest'
 * responses:
 * '200':
 * description: Nouveaux tokens générés.
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/AuthTokens'
 * '401':
 * description: Refresh token invalide ou expiré.
 */
// Valide la présence du refresh token avant de générer de nouveaux tokens
router.post('/refresh-token', validateBody(schemas.refreshTokenSchema), authController.refreshToken);

// ===================================================================================
// --- 🔓 Routes d'activation de compte (publiques) ---
// ===================================================================================
router.use('/activation', activationRoutes);

// ===================================================================================
// --- 🔒 Routes Protégées (nécessitent un token JWT valide) ---
// ===================================================================================

// Routes d'autorisation OAuth (protégées)
router.use('/', authorizeRoutes);

// Le middleware 'requireApiKeyAndJWT' est appliqué à toutes les routes définies après cette ligne.
// Il vérifie l'API Key ET le token JWT.
router.use(requireApiKeyAndJWT);

/**
 * @swagger
 * /auth/logout:
 * post:
 * summary: Déconnexion de l'utilisateur
 * tags: [Gestion de Compte]
 * security:
 * - bearerAuth: []
 * description: Invalide le refresh token pour empêcher la génération de nouveaux access tokens.
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/RefreshTokenRequest'
 * responses:
 * '200':
 * description: Déconnexion réussie.
 * '401':
 * description: Non autorisé.
 */
router.post('/logout', authController.logout);

/**
 * @swagger
 * /auth/me:
 * get:
 * summary: Récupérer le profil de l'utilisateur connecté
 * tags: [Gestion de Compte]
 * security:
 * - bearerAuth: []
 * responses:
 * '200':
 * description: Profil de l'utilisateur.
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/User'
 * '401':
 * description: Non autorisé.
 */
router.get('/me', authController.getMe);

/**
 * @swagger
 * /auth/update-me:
 * patch:
 * summary: Mettre à jour le profil de l'utilisateur (prénom, nom)
 * tags: [Gestion de Compte]
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/UpdateMeRequest'
 * responses:
 * '200':
 * description: Profil mis à jour avec succès.
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/User'
 * '400':
 * description: Données invalides.
 * '401':
 * description: Non autorisé.
 */
// Valide les données (prénom, nom) avant de les mettre à jour
router.patch('/update-me', validateBody(schemas.updateMeSchema), authController.updateMe);

/**
 * @swagger
 * /auth/update-password:
 * patch:
 * summary: Mettre à jour le mot de passe de l'utilisateur connecté
 * tags: [Gestion de Compte]
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/UpdatePasswordRequest'
 * responses:
 * '200':
 * description: Mot de passe mis à jour avec succès.
 * '401':
 * description: Mot de passe actuel incorrect ou token invalide.
 */
// Valide l'ancien et le nouveau mot de passe avant la mise à jour
router.patch('/update-password', validateBody(schemas.updatePasswordSchema), authController.updatePassword);

export default router;

// ===================================================================================
// --- 📚 Définitions des Schémas pour Swagger ---
// ===================================================================================
/**
 * @swagger
 * components:
 * schemas:
 * SignupRequest:
 * type: object
 * required:
 * - firstName
 * - lastName
 * - email
 * - password
 * properties:
 * firstName:
 * type: string
 * example: "Marie"
 * lastName:
 * type: string
 * example: "Curie"
 * email:
 * type: string
 * format: email
 * example: "marie.curie@example.com"
 * password:
 * type: string
 * format: password
 * example: "Password@123"
 * VerifyAccountRequest:
 * type: object
 * required:
 * - verificationToken
 * - code
 * properties:
 * verificationToken:
 * type: string
 * code:
 * type: string
 * description: Le code à 6 chiffres reçu par email.
 * example: "123456"
 * LoginRequest:
 * type: object
 * required:
 * - email
 * - password
 * properties:
 * email:
 * type: string
 * format: email
 * password:
 * type: string
 * format: password
 * AuthTokens:
 * type: object
 * properties:
 * accessToken:
 * type: string
 * refreshToken:
 * type: string
 * ForgotPasswordRequest:
 * type: object
 * required:
 * - email
 * properties:
 * email:
 * type: string
 * format: email
 * ResetPasswordRequest:
 * type: object
 * required:
 * - password
 * properties:
 * password:
 * type: string
 * format: password
 * example: "NewPassword@123"
 * RefreshTokenRequest:
 * type: object
 * required:
 * - refreshToken
 * properties:
 * refreshToken:
 * type: string
 * UpdateMeRequest:
 * type: object
 * properties:
 * firstName:
 * type: string
 * example: "Maria"
 * lastName:
 * type: string
 * example: "Skłodowska"
 * UpdatePasswordRequest:
 * type: object
 * required:
 * - currentPassword
 * - newPassword
 * properties:
 * currentPassword:
 * type: string
 * format: password
 * example: "Password@123"
 * newPassword:
 * type: string
 * format: password
 * example: "NewStrongerPassword@123"
 * User:
 * type: object
 * properties:
 * _id:
 * type: string
 * firstName:
 * type: string
 * lastName:
 * type: string
 * email:
 * type: string
 * roles:
 * type: array
 * items:
 * type: string
 */