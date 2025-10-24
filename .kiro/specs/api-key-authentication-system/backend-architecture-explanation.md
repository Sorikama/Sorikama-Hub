# Architecture du Backend Sorikama Hub - Explication Complète

## 📋 Vue d'ensemble

Le backend Sorikama Hub est une **API Gateway** construite avec **Node.js**, **Express** et **TypeScript**. Il sert de point d'entrée unique pour tous les services de l'écosystème Sorikama.

## 🏗️ Structure des Dossiers

```
backend/src/
├── auth/                    # Gestion de l'authentification
├── config/                  # Configuration de l'application
├── controllers/             # Contrôleurs (logique métier)
├── database/               # Base de données et modèles
│   ├── models/            # Modèles Mongoose
│   └── seeders/           # Données initiales
├── middlewares/            # Middlewares Express
├── routes/                 # Définition des routes
├── services/               # Services métier
├── templates/              # Templates d'emails
├── types/                  # Types TypeScript
├── utils/                  # Utilitaires
└── index.ts               # Point d'entrée principal
```

## 🔄 Flux d'une Requête HTTP

Voici comment une requête traverse le backend :

```
1. Client (Frontend)
   ↓
2. Express Server (index.ts)
   ↓
3. Middlewares Globaux (dans l'ordre)
   ├── helmet (sécurité headers)
   ├── cors (gestion CORS)
   ├── express.json() (parsing JSON)
   ├── cookieParser (parsing cookies)
   ├── securityHeaders (headers personnalisés)
   ├── rateLimiter (limitation de débit)
   ├── httpRequestLogger (logging)
   └── responseTimeMiddleware (mesure performance)
   ↓
4. Router Principal (/api/v1)
   ↓
5. Middleware d'Authentification API Key
   ├── authenticateApiKey (validation API Key)
   └── Vérifie dans simple_api_keys collection
   ↓
6. Routes Spécifiques
   ├── /auth/* (authentification)
   ├── /system/* (système)
   ├── /admin/* (administration)
   └── /proxy/* (proxy vers services)
   ↓
7. Middleware d'Autorisation JWT (si nécessaire)
   ├── authenticateJWT (validation token)
   └── authorize (vérification permissions)
   ↓
8. Contrôleur
   ├── Validation des données
   ├── Logique métier
   └── Interaction avec la base de données
   ↓
9. Réponse au Client
   ├── Format JSON standardisé
   └── Codes HTTP appropriés
```

## 🔐 Système d'Authentification Actuel

### Niveau 1 : API Key (OBLIGATOIRE)

**Fichier:** `backend/src/middlewares/apiKey.middleware.ts`

```typescript
// Vérifie que chaque requête a une API Key valide
export const authenticateApiKey = async (req, res, next) => {
  // 1. Extraction de l'API Key depuis headers
  const apiKey = req.headers['x-api-key'] || req.headers.authorization;
  
  // 2. Vérification du format (sk_ ou uk_)
  if (!apiKey.startsWith('sk_') && !apiKey.startsWith('uk_')) {
    return error('Format invalide');
  }
  
  // 3. Recherche dans la base de données
  const keyDoc = await SimpleApiKeyModel.verifyApiKey(apiKey);
  
  // 4. Vérification de validité
  if (!keyDoc || keyDoc.expiresAt < now) {
    return error('API Key invalide');
  }
  
  // 5. Attacher à la requête
  req.apiKey = keyDoc;
  next();
}
```

### Niveau 2 : JWT Token (Routes Protégées)

**Fichier:** `backend/src/middlewares/auth.middleware.ts`

```typescript
// Vérifie le token JWT pour les routes protégées
export const authenticateJWT = (req, res, next) => {
  // 1. Extraction du token
  const token = req.headers.authorization?.split(' ')[1];
  
  // 2. Vérification et décodage
  const decoded = jwt.verify(token, JWT_SECRET);
  
  // 3. Récupération de l'utilisateur
  const user = await UserModel.findById(decoded.id);
  
  // 4. Attacher à la requête
  req.user = user;
  next();
}
```

## 📊 Modèles de Données Principaux

### 1. User (Utilisateur)

**Fichier:** `backend/src/database/models/user.model.ts`

```typescript
{
  _id: string,              // UUID
  firstName: string,        // Chiffré
  lastName: string,         // Chiffré
  email: string,           // Chiffré
  emailHash: string,       // Index aveugle pour recherche
  password: string,        // Haché avec bcrypt
  isVerified: boolean,     // Email vérifié ?
  isActive: boolean,       // Compte actif ?
  apiKey: string,          // API Key personnelle (uk_)
  roles: [Role],           // Rôles de l'utilisateur
  createdAt: Date,
  updatedAt: Date
}
```

### 2. SimpleApiKey (Clé API)

**Fichier:** `backend/src/database/models/simpleApiKey.model.ts`

```typescript
{
  _id: string,
  keyId: string,           // La clé elle-même (sk_ ou uk_)
  userId: User,            // Référence vers l'utilisateur
  name: string,            // Nom de la clé
  description: string,     // Description
  permissions: [string],   // Permissions accordées
  isActive: boolean,       // Clé active ?
  expiresAt: Date,        // Date d'expiration (optionnel)
  lastUsedAt: Date,       // Dernière utilisation
  createdAt: Date,
  updatedAt: Date
}
```

### 3. Role (Rôle)

```typescript
{
  _id: string,
  name: string,            // 'admin', 'user', etc.
  permissions: [Permission], // Permissions du rôle
  description: string
}
```

### 4. RefreshToken (Token de rafraîchissement)

```typescript
{
  _id: string,
  token: string,           // Token chiffré
  user: User,              // Référence utilisateur
  expiresAt: Date,        // Date d'expiration
  createdAt: Date
}
```

## 🛣️ Routes Principales

### Routes d'Authentification (`/api/v1/auth`)

**Fichier:** `backend/src/routes/auth.routes.ts`

```typescript
POST   /register          // Étape 1 : Demande d'inscription
POST   /verify            // Étape 2 : Validation du code
POST   /login             // Connexion
POST   /logout            // Déconnexion
POST   /refresh-token     // Renouvellement des tokens
GET    /me                // Profil utilisateur
PATCH  /update-me         // Mise à jour profil
POST   /regenerate-api-key // Régénération API Key
POST   /forgot-password   // Mot de passe oublié
POST   /reset-password/:token // Réinitialisation
PATCH  /update-password   // Changement de mot de passe
```

### Routes Système (`/api/v1/system`)

```typescript
GET    /health            // État de santé du système
GET    /metrics           // Métriques de performance
GET    /logs              // Logs système
```

## 🔧 Processus d'Inscription (Actuel)

### Étape 1 : Demande d'Inscription

**Endpoint:** `POST /api/v1/auth/register`

**Contrôleur:** `backend/src/auth/auth.controller.ts::requestAccountVerification`

```typescript
1. Client envoie : { firstName, lastName, email, password }
2. Backend vérifie que l'email n'existe pas
3. Backend génère un code à 6 chiffres
4. Backend crée un JWT temporaire avec les données + code
5. Backend envoie le code par email
6. Backend retourne : { verificationToken }
```

### Étape 2 : Validation du Compte

**Endpoint:** `POST /api/v1/auth/verify`

**Contrôleur:** `backend/src/auth/auth.controller.ts::verifyAndCreateAccount`

```typescript
1. Client envoie : { verificationToken, code }
2. Backend décode le JWT et vérifie le code
3. Backend crée l'utilisateur dans la BDD
4. Backend génère une API Key (uk_)
5. Backend crée l'enregistrement dans simple_api_keys
6. Backend génère les tokens JWT (access + refresh)
7. Backend retourne : { user, tokens, apiKey }
```

## 🔑 Génération d'API Key

**Fichier:** `backend/src/utils/apiKeyGenerator.ts`

```typescript
export async function generateUserApiKey(userId: string, name: string) {
  // 1. Générer une clé aléatoire
  const randomBytes = crypto.randomBytes(16).toString('hex');
  const apiKey = `uk_${randomBytes}`;
  
  // 2. Créer l'enregistrement dans simple_api_keys
  await SimpleApiKeyModel.create({
    keyId: apiKey,
    userId: userId,
    name: `User API Key - ${name}`,
    permissions: ['*'], // Toutes les permissions par défaut
    isActive: true
  });
  
  // 3. Retourner la clé
  return apiKey;
}
```

## 🔒 Sécurité

### Chiffrement des Données Sensibles

**Fichier:** `backend/src/utils/crypto.ts`

```typescript
// Chiffrement AES-256-GCM
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  // ... chiffrement
  return encrypted;
}

// Déchiffrement
export function decrypt(encrypted: string): string {
  // ... déchiffrement
  return decrypted;
}

// Index aveugle pour recherche
export function createBlindIndex(text: string): string {
  return crypto.createHmac('sha256', BLIND_INDEX_KEY)
    .update(text.toLowerCase())
    .digest('hex');
}
```

### Hachage des Mots de Passe

```typescript
// Dans user.model.ts
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
```

## 📧 Envoi d'Emails

**Fichier:** `backend/src/utils/email.ts`

```typescript
export async function sendEmail(options) {
  // 1. Charger le template Handlebars
  const template = fs.readFileSync(`templates/${options.template}.hbs`);
  const compiledTemplate = handlebars.compile(template);
  
  // 2. Générer le HTML avec les données
  const html = compiledTemplate(options.context);
  
  // 3. Envoyer via Nodemailer
  await transporter.sendMail({
    from: 'Sorikama Hub <noreply@sorikama.com>',
    to: options.to,
    subject: options.subject,
    html: html
  });
}
```

## 🚀 Démarrage de l'Application

**Fichier:** `backend/src/index.ts`

```typescript
async function startServer() {
  // 1. Afficher le banner
  await Banner.displayBanner();
  
  // 2. Préparer le port (tuer processus existant si nécessaire)
  await PortManager.preparePort(7000);
  
  // 3. Démarrer Redis
  await RedisManager.startRedis();
  
  // 4. Connecter MongoDB
  await connectDB();
  
  // 5. Configurer Express
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  
  // 6. Configurer les middlewares
  app.use(rateLimiter);
  app.use(httpRequestLogger);
  
  // 7. Configurer les routes
  app.use('/api/v1', apiRouter);
  
  // 8. Gestionnaire d'erreurs
  app.use(errorHandler);
  
  // 9. Démarrer le serveur
  server.listen(7000, () => {
    console.log('Server running on port 7000');
  });
}
```

## 📝 Logging

Le backend utilise plusieurs niveaux de logging :

1. **Winston Logger** - Logs applicatifs
2. **HTTP Request Logger** - Logs de requêtes HTTP
3. **Redis Logger** - Logs Redis
4. **Application Logger** - Logs métier

## 🎯 Points Clés à Retenir

1. **Architecture en couches** : Routes → Middlewares → Contrôleurs → Services → Modèles
2. **Double authentification** : API Key (niveau 1) + JWT (niveau 2)
3. **Sécurité renforcée** : Chiffrement, hachage, rate limiting, validation
4. **Modularité** : Chaque composant a une responsabilité unique
5. **Traçabilité** : Logging complet de toutes les opérations
6. **Performance** : Cache Redis, optimisations, monitoring

## 🔄 Ce qui va Changer avec la Nouvelle Spec

1. ❌ **Suppression** de l'API Key système (sk_)
2. ✅ **Création automatique** d'une API Key admin (ak_) au démarrage
3. ✅ **Validation complète** des API Keys en BDD
4. ✅ **Retour de l'API Key** à la connexion
5. ✅ **Routes publiques** sans API Key
6. ✅ **Migration** des utilisateurs existants
