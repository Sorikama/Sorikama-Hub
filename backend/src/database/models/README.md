# Modèles de données - Sorikama Hub

## 📋 Vue d'ensemble

Ce dossier contient tous les modèles Mongoose pour la base de données MongoDB.

## 🗂️ Modèles essentiels

### Authentification et utilisateurs

#### `user.model.ts`
- **Utilité** : Gestion des comptes utilisateurs
- **Champs clés** : 
  - `firstName`, `lastName`, `email` (chiffrés)
  - `emailHash` (index aveugle pour recherche)
  - `password` (haché avec bcrypt)
  - `role` : 'user' | 'admin' | 'super_admin'
  - `isVerified`, `isActive`, `isBlocked`
  - Statistiques de connexion

#### `refreshToken.model.ts`
- **Utilité** : Stockage sécurisé des refresh tokens JWT
- **Champs clés** :
  - `token` (chiffré)
  - `user` (référence)
  - `expiresAt`

### Permissions et rôles

#### `permission.model.ts`
- **Utilité** : Définition des permissions granulaires
- **Format** : `action:subject` (ex: `read:users`, `create:services`)

#### `role.model.ts`
- **Utilité** : Rôles système et personnalisés
- **Rôles système** (non modifiables) :
  - `super_admin` : Accès complet
  - `admin` : Gestion utilisateurs et services
  - `user` : Accès aux services uniquement

### Services externes

#### `service.model.ts`
- **Utilité** : Configuration des services externes (Masebuy, etc.)
- **Champs clés** :
  - `name`, `slug`, `description`
  - `frontendUrl`, `backendUrl`
  - `proxyPath` : Chemin de routage
  - `apiKey` : Clé d'authentification du service
  - `enabled`, `requireAuth`
  - `allowedRoles`

#### `serviceAuthorization.model.ts`
- **Utilité** : Autorisations d'accès utilisateur → service
- **Champs clés** :
  - `userId`, `serviceId`
  - `accessToken`, `refreshToken`
  - `scopes`, `expiresAt`
  - `isRevoked`

#### `ssoSession.model.ts`
- **Utilité** : Sessions SSO (Single Sign-On) temporaires
- **Champs clés** :
  - `sessionId`, `userId`, `serviceId`
  - `accessToken`, `refreshToken`
  - `expiresAt` (TTL automatique)

### Logs et monitoring

#### `serviceRequest.model.ts`
- **Utilité** : Logs des requêtes vers les services externes
- **Champs clés** :
  - `serviceId`, `method`, `endpoint`
  - `statusCode`, `responseTime`
  - `success`, `errorMessage`
  - `timestamp`

#### `proxyRequest.model.ts`
- **Utilité** : Logs détaillés des requêtes proxy
- **Champs clés** :
  - `userId`, `serviceId`
  - `method`, `endpoint`
  - `statusCode`, `responseTime`
  - `requestHeaders`, `responseHeaders`
  - `requestBody`, `responseBody`
  - TTL : 30 jours

## 🔄 Flux de données

### Inscription utilisateur
1. `user.model.ts` : Création du compte
2. `role.model.ts` : Attribution du rôle 'user'
3. `refreshToken.model.ts` : Génération des tokens

### Accès à un service externe
1. `user.model.ts` : Vérification de l'utilisateur
2. `service.model.ts` : Récupération de la config du service
3. `serviceAuthorization.model.ts` : Vérification/création de l'autorisation
4. `ssoSession.model.ts` : Création de la session SSO
5. `proxyRequest.model.ts` : Log de la requête

## 🗑️ Modèles supprimés

Les modèles suivants ont été supprimés car non essentiels :

- ❌ `webhook.model.ts` : Webhooks non utilisés actuellement
- ❌ `webhookLog.model.ts` : Logs de webhooks non utilisés
- ❌ `auditLog.model.ts` : Remplacé par Winston logger
- ❌ `rateLimit.model.ts` : Remplacé par express-rate-limit (en mémoire)

## 🔐 Sécurité

### Chiffrement
- Les champs sensibles (`firstName`, `lastName`, `email`) sont chiffrés avec AES-256-CBC
- Les tokens sont chiffrés avant stockage
- Les mots de passe sont hachés avec bcrypt (salt rounds: 10)

### Index aveugles (Blind Indexing)
- `emailHash` : Permet la recherche d'emails sans les déchiffrer
- Utilise HMAC-SHA256 avec un pepper secret

### TTL (Time To Live)
- `ssoSession` : Expiration automatique
- `proxyRequest` : Suppression après 30 jours
- `refreshToken` : Expiration selon la durée configurée

## 📊 Statistiques

Pour obtenir des statistiques sur les modèles :

```typescript
// Nombre d'utilisateurs actifs
const activeUsers = await UserModel.countDocuments({ isActive: true });

// Services activés
const enabledServices = await ServiceModel.countDocuments({ enabled: true });

// Requêtes réussies aujourd'hui
const today = new Date();
today.setHours(0, 0, 0, 0);
const successfulRequests = await ServiceRequestModel.countDocuments({
  success: true,
  timestamp: { $gte: today }
});
```
