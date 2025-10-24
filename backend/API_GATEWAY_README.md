# 🚀 Sorikama API Gateway - Guide Technique

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Authentification & Sécurité](#authentification--sécurité)
4. [Système de Permissions](#système-de-permissions)
5. [API Keys](#api-keys)
6. [Services & Routage](#services--routage)
7. [Installation & Configuration](#installation--configuration)
8. [Utilisation](#utilisation)
9. [Monitoring & Métriques](#monitoring--métriques)
10. [Développement](#développement)

---

## 🎯 Vue d'ensemble

L'**API Gateway Sorikama** est le point d'entrée centralisé pour tout l'écosystème Sorikama. Elle agit comme un hub intelligent qui :

- **Authentifie** et **autorise** tous les accès
- **Route** les requêtes vers les microservices appropriés
- **Sécurise** les communications avec filtrage avancé
- **Monitore** les performances et la santé des services
- **Gère** les API Keys pour les intégrations tierces

### 🏗️ Rôle dans l'Écosystème

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Applications  │───▶│  API Gateway     │───▶│  Microservices  │
│   & Intégrations│    │  (Sorikama-Hub)  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────┐
                       │   MongoDB    │
                       │ (Auth/Config)│
                       └──────────────┘
```

---

## 🏛️ Architecture

### Composants Principaux

#### 1. **Couche d'Authentification**
- JWT Tokens pour les applications web
- API Keys pour les intégrations
- Sessions sécurisées avec TTL
- Cache des permissions (5min)

#### 2. **Couche d'Autorisation**
- Système RBAC (Role-Based Access Control)
- Permissions granulaires par action/ressource
- Règles contextuelles dynamiques
- Hiérarchie des rôles

#### 3. **Couche de Sécurité**
- Rate limiting dynamique par rôle
- Validation et sanitisation des requêtes
- Détection d'activités suspectes
- Headers de sécurité (Helmet.js)

#### 4. **Couche de Routage**
- Découverte automatique des services
- Load balancing intelligent
- Circuit breaker pattern
- Health checks périodiques

#### 5. **Couche de Monitoring**
- Métriques temps réel
- Logging structuré
- Alertes automatiques
- Tableaux de bord

### Stack Technique

```typescript
// Technologies utilisées
{
  "runtime": "Node.js + TypeScript",
  "framework": "Express.js",
  "database": "MongoDB + Mongoose",
  "auth": "JWT + API Keys",
  "proxy": "http-proxy-middleware",
  "security": "Helmet + Rate Limiting",
  "validation": "Joi",
  "logging": "Winston",
  "docs": "Swagger/OpenAPI 3.0"
}
```

---

## 🔐 Authentification & Sécurité

### Méthodes d'Authentification

#### 1. **JWT Tokens** (Applications Web)
```bash
# Login
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "password"
}

# Utilisation
Authorization: Bearer <jwt_token>
```

#### 2. **API Keys** (Intégrations)
```bash
# Création
POST /api/v1/api/keys
{
  "name": "Mon Integration",
  "permissions": ["read:soristore", "write:soripay"]
}

# Utilisation
X-API-Key: sk_1234567890abcdef...
# ou
Authorization: Bearer sk_1234567890abcdef...
# ou
?api_key=sk_1234567890abcdef...
```

### Sécurité Avancée

#### Rate Limiting Dynamique
```typescript
const rateLimits = {
  superadmin: 10000,  // req/15min
  admin: 1000,        // req/15min
  premium: 500,       // req/15min
  user: 100,          // req/15min
  guest: 20           // req/15min
}
```

#### Validation des Requêtes
- Sanitisation anti-XSS/injection
- Validation des en-têtes requis
- Contrôle de la taille des payloads
- Détection de patterns suspects

#### Restrictions IP/Domaine
```typescript
// Configuration API Key
{
  "allowedIPs": ["192.168.1.100", "10.0.0.0/8"],
  "allowedDomains": ["*.monentreprise.com"]
}
```

---

## 🛡️ Système de Permissions

### Hiérarchie des Rôles

```
superadmin  ──┐
admin       ──┤── Gestion complète
moderator   ──┘
              
premium     ──┐
user        ──┤── Utilisation standard
guest       ──┘
```

### Permissions par Domaine

#### **Système**
- `manage:system` - Contrôle total
- `read:system` - Lecture des infos système

#### **Utilisateurs**
- `manage:user` - CRUD utilisateurs
- `read:user` - Consultation profils
- `update:user` - Modification données

#### **Services Sorikama**
```typescript
const services = [
  'soristore',   // E-commerce
  'soripay',     // Paiements
  'soriwallet',  // Portefeuille
  'sorilearn',   // Formation
  'sorihealth',  // Santé
  'soriaccess'   // Accessibilité
];

const actions = ['read', 'write', 'manage'];
// Génère: read:soristore, write:soripay, etc.
```

#### **Analytics & Monitoring**
- `read:analytics` - Consultation métriques
- `export:analytics` - Export données
- `monitor:gateway` - Surveillance système

### Vérification des Permissions

```typescript
// Exemple d'utilisation
app.get('/soristore/products', 
  authenticateApiKey,
  requireApiKeyPermissions(['read:soristore']),
  proxyToService
);
```

---

## 🔑 API Keys

### Génération Sécurisée

```typescript
// Format: sk_<64_chars_hex>
const apiKey = "sk_1234567890abcdef...";

// Stockage sécurisé
{
  prefix: "sk_12345",           // 8 premiers chars
  keyHash: "sha256(fullKey)",   // Hash complet
  userId: "user-uuid",
  permissions: ["read:soristore"],
  isActive: true
}
```

### Gestion Complète

#### Création
```bash
POST /api/v1/api/keys
{
  "name": "Integration E-commerce",
  "permissions": ["read:soristore", "write:soristore"],
  "expiresAt": "2024-12-31T23:59:59Z",
  "rateLimit": {
    "requests": 5000,
    "windowMs": 3600000
  },
  "allowedIPs": ["203.0.113.0/24"]
}
```

#### Gestion
```bash
GET    /api/v1/api/keys           # Liste
PUT    /api/v1/api/keys/{id}      # Modification
POST   /api/v1/api/keys/{id}/revoke  # Révocation
DELETE /api/v1/api/keys/{id}      # Suppression
GET    /api/v1/api/keys/{id}/stats   # Statistiques
```

### Fonctionnalités Avancées

- **Expiration automatique**
- **Rate limiting personnalisé**
- **Restrictions IP/domaine**
- **Audit trail complet**
- **Révocation instantanée**
- **Statistiques d'usage**

---

## 🌐 Services & Routage

### Services de l'Écosystème

| Service | Path | Description | Permissions |
|---------|------|-------------|-------------|
| **SoriStore** | `/soristore` | Marketplace e-commerce | `read:soristore`, `write:soristore` |
| **SoriPay** | `/soripay` | Système de paiement | `read:soripay`, `write:soripay` |
| **SoriWallet** | `/soriwallet` | Portefeuille numérique | `read:soriwallet`, `write:soriwallet` |
| **SoriLearn** | `/sorilearn` | Plateforme formation | `read:sorilearn`, `write:sorilearn` |
| **SoriHealth** | `/sorihealth` | Suivi santé | `read:sorihealth`, `write:sorihealth` |
| **SoriAccess** | `/soriaccess` | Accessibilité | `read:soriaccess`, `write:soriaccess` |

### Routage Intelligent

#### Load Balancing
```typescript
{
  strategy: 'round-robin', // 'least-connections', 'weighted'
  targets: [
    { url: 'http://soristore-1:3001', weight: 2 },
    { url: 'http://soristore-2:3001', weight: 1 }
  ]
}
```

#### Circuit Breaker
```typescript
{
  failureThreshold: 5,    // Échecs avant ouverture
  resetTimeout: 60000     // Temps avant retry (ms)
}
```

#### Health Checks
- Vérification automatique toutes les 30s
- Endpoint `/health` sur chaque service
- Exclusion automatique des services défaillants

### Configuration des Services

```typescript
// Exemple de configuration service
{
  name: 'soristore',
  path: '/soristore',
  target: process.env.SORISTORE_SERVICE_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  permissions: ['read:soristore'],
  timeout: 30000,
  retries: 3,
  healthCheck: '/health'
}
```

---

## ⚙️ Installation & Configuration

### Prérequis

```bash
# Versions requises
Node.js >= 18.0.0
MongoDB >= 5.0.0
npm >= 8.0.0
```

### Installation

```bash
# 1. Cloner le projet
git clone https://github.com/sorikama/sorikama-hub.git
cd sorikama-hub/backend

# 2. Installer les dépendances
npm install

# 3. Configuration
cp .env.example .env
# Éditer .env avec vos valeurs

# 4. Initialiser la base de données
npm run db:seed

# 5. Démarrer en développement
npm run dev
```

### Variables d'Environnement

```bash
# Application
NODE_ENV=development
PORT=3000
BASE_URL=http://localhost:3000

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d

# MongoDB
MONGO_URI=mongodb://localhost:27017/sorikama_gateway

# Services Sorikama
SORISTORE_SERVICE_URL=http://localhost:3001
SORIPAY_SERVICE_URL=http://localhost:3002
SORIWALLET_SERVICE_URL=http://localhost:3003
SORILEARN_SERVICE_URL=http://localhost:3004
SORIHEALTH_SERVICE_URL=http://localhost:3005
SORIACCESS_SERVICE_URL=http://localhost:3006

# Admin par défaut
DEFAULT_ADMIN_EMAIL=admin@sorikama.com
DEFAULT_ADMIN_PASSWORD=Admin@123

# Sécurité
ENCRYPTION_KEY=your-32-char-encryption-key
BLIND_INDEX_PEPPER=your-blind-index-pepper

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@sorikama.com
```

---

## 🚀 Utilisation

### Authentification JWT

```bash
# 1. Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@sorikama.com",
    "password": "Admin@123"
  }'

# Réponse
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": { ... }
  }
}

# 2. Utilisation du token
curl -X GET http://localhost:3000/api/v1/soristore/products \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

### Authentification API Key

```bash
# 1. Créer une API key (avec token JWT)
curl -X POST http://localhost:3000/api/v1/api/keys \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mon Integration",
    "permissions": ["read:soristore", "write:soripay"]
  }'

# Réponse (SAUVEGARDER LA CLÉ!)
{
  "success": true,
  "data": {
    "key": "sk_1234567890abcdef...",
    "name": "Mon Integration",
    "permissions": ["read:soristore", "write:soripay"]
  }
}

# 2. Utilisation de l'API key
curl -X GET http://localhost:3000/api/v1/soristore/products \
  -H "X-API-Key: sk_1234567890abcdef..."
```

### Accès aux Services

```bash
# SoriStore - E-commerce
GET    /api/v1/soristore/products
POST   /api/v1/soristore/products
PUT    /api/v1/soristore/products/{id}
DELETE /api/v1/soristore/products/{id}

# SoriPay - Paiements
GET    /api/v1/soripay/transactions
POST   /api/v1/soripay/payments
GET    /api/v1/soripay/invoices

# SoriWallet - Portefeuille
GET    /api/v1/soriwallet/balance
POST   /api/v1/soriwallet/transfer
GET    /api/v1/soriwallet/history

# Etc. pour tous les services...
```

---

## 📊 Monitoring & Métriques

### Endpoints de Monitoring

```bash
# Santé du système
GET /api/v1/system/health

# Métriques de performance
GET /api/v1/system/metrics

# Liste des services
GET /api/v1/system/services

# Rôles et permissions
GET /api/v1/system/roles
GET /api/v1/system/permissions
```

### Métriques Collectées

#### Par Service
- Nombre de requêtes
- Temps de réponse moyen
- Taux d'erreur
- Dernière activité
- Statut de santé

#### Globales
- Uptime du gateway
- Utilisation mémoire
- Connexions actives
- Rate limits atteints

### Exemple de Réponse Métriques

```json
{
  "success": true,
  "data": {
    "overview": {
      "totalRequests": 15420,
      "totalErrors": 23,
      "errorRate": 0.15,
      "avgResponseTime": 145
    },
    "services": [
      {
        "service": "soristore",
        "requests": 8500,
        "errors": 12,
        "avgResponseTime": 120,
        "errorRate": 0.14,
        "lastRequest": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

---

## 🛠️ Développement

### Structure du Projet

```
backend/
├── src/
│   ├── auth/                 # Authentification
│   ├── config/              # Configuration
│   ├── controllers/         # Contrôleurs
│   ├── database/
│   │   ├── models/          # Modèles MongoDB
│   │   └── seeders/         # Données initiales
│   ├── middlewares/         # Middlewares
│   ├── routes/              # Routes
│   ├── services/            # Services métier
│   ├── types/               # Types TypeScript
│   └── utils/               # Utilitaires
├── public/                  # Fichiers statiques
├── .env.example            # Variables d'environnement
├── package.json
└── tsconfig.json
```

### Scripts Disponibles

```bash
# Développement
npm run dev          # Démarrage avec hot-reload
npm run build        # Compilation TypeScript
npm start           # Démarrage production

# Base de données
npm run db:seed     # Initialisation des données

# Tests
npm test           # Tests unitaires
npm run test:watch # Tests en mode watch
npm run test:coverage # Couverture de code
```

### Ajout d'un Nouveau Service

1. **Ajouter l'URL dans `.env`**
```bash
NOUVEAU_SERVICE_URL=http://localhost:3007
```

2. **Configurer dans `routingEngine.service.ts`**
```typescript
{
  name: 'nouveau-service',
  path: '/nouveau-service',
  target: process.env.NOUVEAU_SERVICE_URL,
  methods: ['GET', 'POST'],
  permissions: ['read:nouveau-service'],
  healthCheck: '/health'
}
```

3. **Ajouter les permissions dans `permissions.seeder.ts`**
```typescript
{ action: 'read', subject: 'nouveau-service', description: '...' },
{ action: 'write', subject: 'nouveau-service', description: '...' }
```

4. **Mettre à jour la documentation Swagger**

### Tests

```bash
# Test d'une API key
curl -X GET http://localhost:3000/api/v1/system/health \
  -H "X-API-Key: sk_development_key"

# Test d'authentification JWT
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sorikama.com","password":"Admin@123"}'
```

---

## 🔧 Dépannage

### Problèmes Courants

#### 1. **Service Indisponible (502/503)**
```bash
# Vérifier la santé des services
curl http://localhost:3000/api/v1/system/health

# Vérifier les logs
docker logs sorikama-gateway
```

#### 2. **Rate Limit Dépassé (429)**
```bash
# Vérifier les limites de l'API key
curl http://localhost:3000/api/v1/api/keys \
  -H "Authorization: Bearer <token>"
```

#### 3. **Permissions Insuffisantes (403)**
```bash
# Vérifier les permissions disponibles
curl http://localhost:3000/api/v1/system/permissions \
  -H "X-API-Key: <api_key>"
```

### Logs Utiles

```bash
# Suivre les logs en temps réel
tail -f logs/gateway.log

# Filtrer par niveau
grep "ERROR" logs/gateway.log
grep "SECURITY" logs/gateway.log
```

---

## 📚 Ressources

### Documentation
- **API Docs**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/api/v1/system/health
- **Métriques**: http://localhost:3000/api/v1/system/metrics

### Support
- **Email**: dev@sorikama.com
- **Issues**: GitHub Issues
- **Wiki**: Documentation interne

---

**Sorikama API Gateway** - Le cœur intelligent de l'écosystème Sorikama 🚀