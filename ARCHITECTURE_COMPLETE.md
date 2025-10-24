# 🏗️ Architecture Complète - Sorikama Hub

## 📋 Table des Matières

1. [Vue d'ensemble de l'écosystème](#vue-densemble-de-lécosystème)
2. [Architecture technique](#architecture-technique)
3. [Flux de communication](#flux-de-communication)
4. [Gestion des requêtes](#gestion-des-requêtes)
5. [Implémentation côté service externe](#implémentation-côté-service-externe)
6. [Sécurité et authentification](#sécurité-et-authentification)
7. [Exemples de code complets](#exemples-de-code-complets)

---

## 🌟 Vue d'ensemble de l'écosystème

### Qu'est-ce que Sorikama Hub ?

**Sorikama Hub** est une plateforme centralisée qui agit comme un **API Gateway intelligent** pour tout l'écosystème Sorikama. Elle connecte plusieurs services externes et gère l'authentification, l'autorisation et le routage de manière centralisée.

### Les composants principaux

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ÉCOSYSTÈME SORIKAMA                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────┐         ┌──────────────────────┐         │
│  │   FRONTEND           │         │   BACKEND            │         │
│  │   Sorikama Hub       │◄───────►│   API Gateway        │         │
│  │   (React)            │         │   (Node.js/Express)  │         │
│  │   Port: 5173         │         │   Port: 7000         │         │
│  └──────────────────────┘         └──────────┬───────────┘         │
│                                               │                      │
│                                               │                      │
│                    ┌──────────────────────────┼──────────────┐      │
│                    │                          │              │      │
│                    ▼                          ▼              ▼      │
│         ┌─────────────────┐       ┌─────────────────┐  ┌──────────┐│
│         │   SoriStore     │       │   SoriPay       │  │SoriWallet││
│         │   Port: 3001    │       │   Port: 3002    │  │Port: 3003││
│         │   E-commerce    │       │   Paiements     │  │Wallet    ││
│         └─────────────────┘       └─────────────────┘  └──────────┘│
│                    │                          │              │      │
│                    ▼                          ▼              ▼      │
│         ┌─────────────────┐       ┌─────────────────┐  ┌──────────┐│
│         │   SoriLearn     │       │   SoriHealth    │  │SoriAccess││
│         │   Port: 3004    │       │   Port: 3005    │  │Port: 3006││
│         │   Formation     │       │   Santé         │  │Accès     ││
│         └─────────────────┘       └─────────────────┘  └──────────┘│
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Les services de l'écosystème

| Service | Port | Description | Permissions |
|---------|------|-------------|-------------|
| **SoriStore** | 3001 | Marketplace e-commerce | `read:soristore`, `write:soristore` |
| **SoriPay** | 3002 | Système de paiement | `read:soripay`, `write:soripay` |
| **SoriWallet** | 3003 | Portefeuille numérique | `read:soriwallet`, `write:soriwallet` |
| **SoriLearn** | 3004 | Plateforme d'apprentissage | `read:sorilearn`, `write:sorilearn` |
| **SoriHealth** | 3005 | Gestion de santé | `read:sorihealth`, `write:sorihealth` |
| **SoriAccess** | 3006 | Accessibilité et inclusion | `read:soriaccess`, `write:soriaccess` |


---

## 🏛️ Architecture Technique

### Stack Technologique

#### Frontend (Sorikama Hub)
```javascript
{
  "framework": "React 18",
  "routing": "React Router v6",
  "http": "Axios",
  "styling": "Tailwind CSS",
  "animations": "GSAP",
  "notifications": "React Toastify",
  "port": 5173,
  "build": "Vite"
}
```

#### Backend (API Gateway)
```javascript
{
  "runtime": "Node.js",
  "language": "TypeScript",
  "framework": "Express.js",
  "database": "MongoDB + Mongoose",
  "cache": "Redis",
  "auth": "JWT + API Keys",
  "proxy": "http-proxy-middleware",
  "security": "Helmet + Rate Limiting",
  "validation": "Joi",
  "logging": "Winston",
  "docs": "Swagger/OpenAPI 3.0",
  "port": 7000
}
```

### Architecture en couches

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Browser/App)                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  FRONTEND (React App)                        │
│  - Pages & Components                                        │
│  - State Management                                          │
│  - API Client (Axios)                                        │
│  - Routing (React Router)                                    │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND - API GATEWAY (Express)                 │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  COUCHE 1: SÉCURITÉ                                  │  │
│  │  - Helmet (Headers sécurisés)                        │  │
│  │  - CORS (Cross-Origin)                               │  │
│  │  - Rate Limiting (Protection DDoS)                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                         │                                    │
│  ┌──────────────────────▼──────────────────────────────┐  │
│  │  COUCHE 2: AUTHENTIFICATION                         │  │
│  │  - API Key Validation                                │  │
│  │  - JWT Token Verification                            │  │
│  │  - Session Management                                │  │
│  └──────────────────────────────────────────────────────┘  │
│                         │                                    │
│  ┌──────────────────────▼──────────────────────────────┐  │
│  │  COUCHE 3: AUTORISATION                             │  │
│  │  - RBAC (Role-Based Access Control)                 │  │
│  │  - Permission Checking                               │  │
│  │  - Context-Based Rules                               │  │
│  └──────────────────────────────────────────────────────┘  │
│                         │                                    │
│  ┌──────────────────────▼──────────────────────────────┐  │
│  │  COUCHE 4: ROUTAGE INTELLIGENT                       │  │
│  │  - Service Discovery                                 │  │
│  │  - Load Balancing                                    │  │
│  │  - Circuit Breaker                                   │  │
│  │  - Health Checks                                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                         │                                    │
│  ┌──────────────────────▼──────────────────────────────┐  │
│  │  COUCHE 5: MONITORING & LOGGING                      │  │
│  │  - Request Logging                                   │  │
│  │  - Performance Metrics                               │  │
│  │  - Error Tracking                                    │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  SoriStore   │  │   SoriPay    │  │  SoriWallet  │
│  Service     │  │   Service    │  │   Service    │
└──────────────┘  └──────────────┘  └──────────────┘
```


---

## 🔄 Flux de Communication

### 1. Comment les services externes contactent le Frontend

#### Scénario A: Redirection SSO depuis un service externe

```
┌─────────────────────────────────────────────────────────────────┐
│  ÉTAPE 1: Utilisateur sur SoriStore veut se connecter           │
└─────────────────────────────────────────────────────────────────┘

Utilisateur sur SoriStore (http://localhost:3001)
    │
    │ Clique sur "Se connecter avec Sorikama"
    │
    ▼
SoriStore Frontend
    │
    │ Redirige vers:
    │ http://localhost:5173/authorize?
    │   service_id=soristore&
    │   redirect_url=http://localhost:3001/auth/callback
    │
    ▼
Sorikama Hub Frontend (Page d'autorisation)
    │
    │ Affiche:
    │ - Logo du service (SoriStore)
    │ - Permissions demandées
    │ - Bouton "Autoriser"
    │
    ▼
Utilisateur clique sur "Autoriser"
    │
    ▼
Frontend → Backend API Gateway
    │ POST /api/v1/sso/authorize
    │ {
    │   serviceId: "soristore",
    │   userId: "user-uuid-123",
    │   scopes: ["profile", "email", "orders"]
    │ }
    │
    ▼
Backend génère un token SSO
    │
    │ Token SSO = JWT contenant:
    │ {
    │   userId: "user-uuid-123",
    │   serviceId: "soristore",
    │   scopes: ["profile", "email", "orders"],
    │   exp: timestamp + 24h
    │ }
    │
    ▼
Backend redirige vers le service externe
    │
    │ Redirect: http://localhost:3001/auth/callback?
    │   token=eyJhbGciOiJIUzI1NiIs...&
    │   service=soristore
    │
    ▼
SoriStore reçoit le token SSO
    │
    │ 1. Valide le token auprès de l'API Gateway
    │ 2. Récupère les infos utilisateur
    │ 3. Crée une session locale
    │ 4. Redirige vers le dashboard
    │
    ▼
Utilisateur connecté sur SoriStore ✅
```

#### Scénario B: Lien direct depuis le Hub vers un service

```
┌─────────────────────────────────────────────────────────────────┐
│  ÉTAPE 1: Utilisateur connecté sur le Hub clique sur SoriStore  │
└─────────────────────────────────────────────────────────────────┘

Utilisateur sur Sorikama Hub Dashboard
    │
    │ Clique sur la carte "SoriStore"
    │
    ▼
Frontend génère un lien SSO
    │
    │ GET /api/v1/sso/generate-link
    │ {
    │   serviceId: "soristore",
    │   redirectUrl: "http://localhost:3001/dashboard"
    │ }
    │
    ▼
Backend génère un token SSO temporaire
    │
    │ Token valide 5 minutes
    │
    ▼
Frontend redirige vers:
    │
    │ http://localhost:3001/sso/login?
    │   token=eyJhbGciOiJIUzI1NiIs...
    │
    ▼
SoriStore valide le token et connecte l'utilisateur ✅
```

### 2. Comment les services externes contactent le Backend (API Gateway)

#### Flux complet d'une requête

```
┌─────────────────────────────────────────────────────────────────┐
│  Service Externe → API Gateway → Service Cible                  │
└─────────────────────────────────────────────────────────────────┘

SoriStore Backend veut récupérer les infos utilisateur
    │
    │ GET http://localhost:7000/api/v1/auth/user-info
    │ Headers:
    │   X-API-Key: sk_soristore_api_key_123
    │   Authorization: Bearer <sso_token>
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│  API GATEWAY - ÉTAPE 1: Vérification API Key                    │
└─────────────────────────────────────────────────────────────────┘
    │
    │ Middleware: authenticateApiKey
    │
    │ 1. Extrait l'API Key du header X-API-Key
    │ 2. Cherche dans la DB (collection: simple_api_keys)
    │ 3. Vérifie:
    │    - La clé existe
    │    - La clé est active (isActive = true)
    │    - La clé n'est pas expirée
    │    - Le service correspond (serviceId = "soristore")
    │
    ▼
API Key valide ✅
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│  API GATEWAY - ÉTAPE 2: Vérification Token SSO                  │
└─────────────────────────────────────────────────────────────────┘
    │
    │ Middleware: authenticateJWT
    │
    │ 1. Extrait le token du header Authorization
    │ 2. Vérifie la signature JWT
    │ 3. Vérifie l'expiration
    │ 4. Extrait les données:
    │    {
    │      userId: "user-uuid-123",
    │      serviceId: "soristore",
    │      scopes: ["profile", "email"]
    │    }
    │
    ▼
Token SSO valide ✅
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│  API GATEWAY - ÉTAPE 3: Vérification des Permissions            │
└─────────────────────────────────────────────────────────────────┘
    │
    │ Middleware: requirePermissions(['read:user'])
    │
    │ 1. Récupère les rôles de l'utilisateur
    │ 2. Récupère les permissions des rôles
    │ 3. Vérifie si 'read:user' est autorisé
    │ 4. Vérifie les scopes du token SSO
    │
    ▼
Permissions OK ✅
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│  API GATEWAY - ÉTAPE 4: Traitement de la Requête                │
└─────────────────────────────────────────────────────────────────┘
    │
    │ Controller: getUserInfo
    │
    │ 1. Récupère l'utilisateur depuis MongoDB
    │ 2. Filtre les données selon les scopes
    │ 3. Formate la réponse
    │
    ▼
Réponse envoyée au service externe
    │
    │ {
    │   "success": true,
    │   "data": {
    │     "id": "user-uuid-123",
    │     "firstName": "Marie",
    │     "lastName": "Curie",
    │     "email": "marie@example.com",
    │     "roles": ["user"]
    │   }
    │ }
    │
    ▼
SoriStore reçoit les données ✅
```


### 3. Comment l'API Gateway route les requêtes vers les bons services

#### Système de Routing Intelligent

```
┌─────────────────────────────────────────────────────────────────┐
│  CONFIGURATION DES ROUTES                                        │
└─────────────────────────────────────────────────────────────────┘

// backend/src/services/routingEngine.service.ts

const serviceRoutes = [
  {
    name: 'soristore',
    path: '/soristore',
    target: 'http://localhost:3001',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    permissions: ['read:soristore'],
    healthCheck: '/health',
    timeout: 30000,
    retries: 3
  },
  {
    name: 'soripay',
    path: '/soripay',
    target: 'http://localhost:3002',
    methods: ['GET', 'POST'],
    permissions: ['read:soripay'],
    healthCheck: '/health',
    timeout: 30000,
    retries: 3
  }
  // ... autres services
];
```

#### Flux de Routing

```
┌─────────────────────────────────────────────────────────────────┐
│  EXEMPLE: Requête vers SoriStore                                 │
└─────────────────────────────────────────────────────────────────┘

Client envoie:
    │
    │ GET http://localhost:7000/api/v1/soristore/products
    │ Headers:
    │   X-API-Key: sk_xxx
    │   Authorization: Bearer <token>
    │
    ▼
API Gateway reçoit la requête
    │
    │ 1. Parse l'URL: /api/v1/soristore/products
    │ 2. Identifie le service: "soristore"
    │ 3. Trouve la configuration du service
    │
    ▼
Vérification des autorisations
    │
    │ 1. Vérifie l'API Key ✅
    │ 2. Vérifie le Token JWT ✅
    │ 3. Vérifie les permissions: 'read:soristore' ✅
    │
    ▼
Proxy vers le service cible
    │
    │ Transforme la requête:
    │ GET http://localhost:3001/products
    │ Headers:
    │   X-Original-User: user-uuid-123
    │   X-Original-Service: sorikama-hub
    │   X-Forwarded-For: client-ip
    │   Authorization: Bearer <token>
    │
    ▼
SoriStore traite la requête
    │
    │ 1. Reçoit la requête
    │ 2. Valide le token auprès de l'API Gateway
    │ 3. Récupère les produits
    │ 4. Retourne la réponse
    │
    ▼
API Gateway reçoit la réponse
    │
    │ 1. Log la requête (temps, status, etc.)
    │ 2. Ajoute des headers de sécurité
    │ 3. Retourne au client
    │
    ▼
Client reçoit la réponse ✅
```

### 4. Comment l'API Gateway vérifie les autorisations avant de router

#### Système RBAC (Role-Based Access Control)

```
┌─────────────────────────────────────────────────────────────────┐
│  HIÉRARCHIE DES RÔLES                                            │
└─────────────────────────────────────────────────────────────────┘

superadmin  ──┐
              ├─► Accès total au système
admin       ──┤   Gestion des utilisateurs et services
moderator   ──┘   Modération et gestion limitée
              
premium     ──┐
              ├─► Utilisation des services
user        ──┤   Accès standard
guest       ──┘   Accès limité en lecture seule
```

#### Vérification des Permissions

```
┌─────────────────────────────────────────────────────────────────┐
│  PROCESSUS DE VÉRIFICATION                                       │
└─────────────────────────────────────────────────────────────────┘

Requête arrive avec token JWT
    │
    ▼
1. EXTRACTION DES DONNÉES
    │
    │ Token décodé:
    │ {
    │   userId: "user-uuid-123",
    │   roles: ["user", "premium"],
    │   serviceId: "soristore"
    │ }
    │
    ▼
2. RÉCUPÉRATION DES PERMISSIONS
    │
    │ Pour chaque rôle, récupère les permissions:
    │
    │ Rôle "user":
    │   - read:soristore
    │   - read:soripay
    │   - read:soriwallet
    │
    │ Rôle "premium":
    │   - write:soristore
    │   - write:soripay
    │   - read:analytics
    │
    ▼
3. VÉRIFICATION DE LA PERMISSION REQUISE
    │
    │ Route demandée: POST /soristore/products
    │ Permission requise: write:soristore
    │
    │ Vérification:
    │ ✅ L'utilisateur a le rôle "premium"
    │ ✅ Le rôle "premium" a la permission "write:soristore"
    │
    ▼
4. VÉRIFICATION DES SCOPES SSO
    │
    │ Token SSO contient:
    │ scopes: ["profile", "email", "orders", "products"]
    │
    │ Vérification:
    │ ✅ Le scope "products" est présent
    │
    ▼
5. AUTORISATION ACCORDÉE ✅
    │
    │ La requête peut être routée vers SoriStore
    │
    ▼
Proxy vers le service cible
```

#### Exemple de Code - Middleware de Vérification

```typescript
// backend/src/middlewares/auth.middleware.ts

export const requirePermissions = (permissions: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Récupérer l'utilisateur depuis le token
      const userId = req.user?.id;
      
      // 2. Récupérer les rôles de l'utilisateur
      const user = await User.findById(userId).populate('roles');
      
      // 3. Récupérer toutes les permissions des rôles
      const userPermissions = [];
      for (const role of user.roles) {
        const roleData = await Role.findById(role).populate('permissions');
        userPermissions.push(...roleData.permissions);
      }
      
      // 4. Vérifier si l'utilisateur a les permissions requises
      const hasPermission = permissions.every(permission => 
        userPermissions.some(p => 
          p.action === permission.split(':')[0] &&
          p.subject === permission.split(':')[1]
        )
      );
      
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'Permissions insuffisantes'
        });
      }
      
      // 5. Vérifier les scopes du token SSO
      const tokenScopes = req.user?.scopes || [];
      const requiredScope = permissions[0].split(':')[1];
      
      if (!tokenScopes.includes(requiredScope)) {
        return res.status(403).json({
          success: false,
          message: 'Scope SSO insuffisant'
        });
      }
      
      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la vérification des permissions'
      });
    }
  };
};
```


---

## 🛡️ Gestion des Requêtes

### Toutes les requêtes passent par l'API Gateway

#### Principe de Base

```
┌─────────────────────────────────────────────────────────────────┐
│  RÈGLE D'OR: Aucune communication directe entre services        │
└─────────────────────────────────────────────────────────────────┘

❌ INTERDIT:
SoriStore → SoriPay (direct)

✅ CORRECT:
SoriStore → API Gateway → SoriPay
```

#### Avantages de cette Architecture

1. **Sécurité Centralisée**: Un seul point de contrôle pour l'authentification
2. **Monitoring Unifié**: Toutes les requêtes sont loggées au même endroit
3. **Rate Limiting Global**: Protection contre les abus
4. **Gestion des Erreurs**: Traitement uniforme des erreurs
5. **Versioning**: Gestion centralisée des versions d'API

### L'API Gateway vérifie les tokens SSO et les permissions

#### Processus de Vérification Complet

```
┌─────────────────────────────────────────────────────────────────┐
│  ÉTAPE 1: Vérification de l'API Key                             │
└─────────────────────────────────────────────────────────────────┘

Middleware: authenticateApiKey()

1. Extraction de la clé
   - Header: X-API-Key
   - Query: ?api_key=xxx
   - Bearer: Authorization: Bearer sk_xxx

2. Validation
   ✅ Format correct (sk_xxx)
   ✅ Clé existe dans la DB
   ✅ Clé active (isActive = true)
   ✅ Clé non expirée
   ✅ Service autorisé

3. Rate Limiting
   ✅ Nombre de requêtes < limite
   ✅ Fenêtre de temps respectée

4. Restrictions IP/Domaine
   ✅ IP dans la liste autorisée
   ✅ Domaine dans la liste autorisée

┌─────────────────────────────────────────────────────────────────┐
│  ÉTAPE 2: Vérification du Token SSO                             │
└─────────────────────────────────────────────────────────────────┘

Middleware: authenticateJWT()

1. Extraction du token
   - Header: Authorization: Bearer <token>
   - Cookie: sso_token=<token>

2. Validation JWT
   ✅ Signature valide
   ✅ Token non expiré
   ✅ Issuer correct (sorikama-hub)
   ✅ Audience correcte (serviceId)

3. Extraction des données
   {
     userId: "user-uuid-123",
     serviceId: "soristore",
     scopes: ["profile", "email", "orders"],
     exp: 1234567890
   }

4. Vérification de la session
   ✅ Session existe dans la DB
   ✅ Session active (isActive = true)
   ✅ Session non révoquée

┌─────────────────────────────────────────────────────────────────┐
│  ÉTAPE 3: Vérification des Permissions                          │
└─────────────────────────────────────────────────────────────────┘

Middleware: requirePermissions(['read:soristore'])

1. Récupération des rôles utilisateur
   User → Roles: ["user", "premium"]

2. Récupération des permissions des rôles
   Role "user" → Permissions:
     - read:soristore
     - read:soripay
   
   Role "premium" → Permissions:
     - write:soristore
     - read:analytics

3. Vérification de la permission requise
   Permission requise: read:soristore
   ✅ Trouvée dans le rôle "user"

4. Vérification des scopes SSO
   Scopes du token: ["profile", "email", "orders"]
   Scope requis: "orders"
   ✅ Scope présent

┌─────────────────────────────────────────────────────────────────┐
│  ÉTAPE 4: Logging et Métriques                                  │
└─────────────────────────────────────────────────────────────────┘

Middleware: requestLogger()

1. Log de la requête
   {
     timestamp: "2024-01-15T10:30:00Z",
     userId: "user-uuid-123",
     serviceId: "soristore",
     method: "GET",
     path: "/products",
     ip: "192.168.1.100",
     userAgent: "Mozilla/5.0..."
   }

2. Métriques
   - Incrémente le compteur de requêtes
   - Enregistre le temps de début
   - Prépare le tracking de performance

┌─────────────────────────────────────────────────────────────────┐
│  ÉTAPE 5: Routage vers le Service                               │
└─────────────────────────────────────────────────────────────────┘

Middleware: proxyToService()

1. Identification du service cible
   URL: /api/v1/soristore/products
   Service: soristore
   Target: http://localhost:3001

2. Transformation de la requête
   Original: GET /api/v1/soristore/products
   Proxied: GET /products
   
   Headers ajoutés:
   - X-Original-User: user-uuid-123
   - X-Original-Service: sorikama-hub
   - X-Forwarded-For: 192.168.1.100
   - X-Request-ID: req_1234567890

3. Envoi de la requête
   → http://localhost:3001/products

4. Réception de la réponse
   ← Status: 200
   ← Body: { products: [...] }

5. Transformation de la réponse
   - Ajout de headers de sécurité
   - Ajout de headers CORS
   - Log du temps de réponse

6. Retour au client
   → Status: 200
   → Body: { products: [...] }
```

### L'API Gateway redirige vers le bon service si autorisé

#### Table de Routage

```typescript
// Configuration des routes dans l'API Gateway

const routingTable = {
  '/soristore': {
    target: 'http://localhost:3001',
    permissions: ['read:soristore'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // 100 requêtes par fenêtre
    }
  },
  '/soripay': {
    target: 'http://localhost:3002',
    permissions: ['read:soripay'],
    methods: ['GET', 'POST'],
    rateLimit: {
      windowMs: 15 * 60 * 1000,
      max: 50 // Plus restrictif pour les paiements
    }
  },
  '/soriwallet': {
    target: 'http://localhost:3003',
    permissions: ['read:soriwallet'],
    methods: ['GET', 'POST', 'PUT'],
    rateLimit: {
      windowMs: 15 * 60 * 1000,
      max: 200
    }
  }
  // ... autres services
};
```

### Gestion des erreurs et des tokens expirés

#### Types d'Erreurs

```
┌─────────────────────────────────────────────────────────────────┐
│  ERREURS D'AUTHENTIFICATION                                      │
└─────────────────────────────────────────────────────────────────┘

401 Unauthorized
├─ API Key manquante
│  {
│    "success": false,
│    "message": "API Key requise",
│    "code": "API_KEY_MISSING"
│  }
│
├─ API Key invalide
│  {
│    "success": false,
│    "message": "API Key invalide",
│    "code": "API_KEY_INVALID"
│  }
│
├─ Token JWT manquant
│  {
│    "success": false,
│    "message": "Token d'authentification requis",
│    "code": "TOKEN_MISSING"
│  }
│
└─ Token JWT expiré
   {
     "success": false,
     "message": "Token expiré",
     "code": "TOKEN_EXPIRED",
     "refreshUrl": "/api/v1/auth/refresh-token"
   }

┌─────────────────────────────────────────────────────────────────┐
│  ERREURS D'AUTORISATION                                          │
└─────────────────────────────────────────────────────────────────┘

403 Forbidden
├─ Permissions insuffisantes
│  {
│    "success": false,
│    "message": "Permissions insuffisantes",
│    "code": "INSUFFICIENT_PERMISSIONS",
│    "required": ["write:soristore"],
│    "current": ["read:soristore"]
│  }
│
└─ Scope SSO insuffisant
   {
     "success": false,
     "message": "Scope SSO insuffisant",
     "code": "INSUFFICIENT_SCOPE",
     "required": ["orders"],
     "current": ["profile", "email"]
   }

┌─────────────────────────────────────────────────────────────────┐
│  ERREURS DE RATE LIMITING                                        │
└─────────────────────────────────────────────────────────────────┘

429 Too Many Requests
{
  "success": false,
  "message": "Trop de requêtes",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 900, // secondes
  "limit": 100,
  "remaining": 0,
  "resetAt": "2024-01-15T10:45:00Z"
}

┌─────────────────────────────────────────────────────────────────┐
│  ERREURS DE SERVICE                                              │
└─────────────────────────────────────────────────────────────────┘

502 Bad Gateway
{
  "success": false,
  "message": "Service indisponible",
  "code": "SERVICE_UNAVAILABLE",
  "service": "soristore",
  "retryAfter": 60
}

504 Gateway Timeout
{
  "success": false,
  "message": "Timeout du service",
  "code": "SERVICE_TIMEOUT",
  "service": "soristore",
  "timeout": 30000
}
```

#### Gestion du Refresh Token

```
┌─────────────────────────────────────────────────────────────────┐
│  PROCESSUS DE REFRESH                                            │
└─────────────────────────────────────────────────────────────────┘

Client reçoit une erreur 401 (Token expiré)
    │
    ▼
Client envoie une requête de refresh
    │
    │ POST /api/v1/auth/refresh-token
    │ {
    │   "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
    │ }
    │
    ▼
API Gateway vérifie le refresh token
    │
    │ 1. Vérifie la signature
    │ 2. Vérifie l'expiration (7 jours)
    │ 3. Vérifie que le token n'est pas révoqué
    │ 4. Récupère l'utilisateur
    │
    ▼
API Gateway génère de nouveaux tokens
    │
    │ {
    │   "accessToken": "eyJhbGciOiJIUzI1NiIs...", // 1h
    │   "refreshToken": "eyJhbGciOiJIUzI1NiIs..." // 7j
    │ }
    │
    ▼
Client stocke les nouveaux tokens
    │
    ▼
Client réessaie la requête originale ✅
```


---

## 💻 Implémentation côté Service Externe

### Comment recevoir le token SSO

#### Étape 1: Configuration du Service

```javascript
// .env du service externe (ex: SoriStore)

# Configuration du service
PORT=3001
SERVICE_ID=soristore
SERVICE_NAME=SoriStore

# Configuration Sorikama Hub
HUB_FRONTEND_URL=http://localhost:5173
HUB_API_URL=http://localhost:7000/api/v1
HUB_API_KEY=sk_soristore_your_api_key_here
HUB_CLIENT_ID=soristore_client_id
HUB_CLIENT_SECRET=soristore_secret_xyz

# Base de données locale
MONGODB_URI=mongodb://localhost:27017/soristore

# JWT Secret (pour vos propres sessions)
JWT_SECRET=your_service_jwt_secret
```

#### Étape 2: Route de Callback SSO

```javascript
// routes/auth.routes.js

const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * Route de callback SSO
 * Appelée par Sorikama Hub après autorisation
 */
router.get('/auth/callback', async (req, res) => {
  try {
    // 1. Récupérer le token SSO depuis l'URL
    const { token, service } = req.query;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token SSO manquant'
      });
    }
    
    // 2. Valider le token auprès de l'API Gateway
    const validation = await axios.post(
      `${process.env.HUB_API_URL}/sso/validate`,
      { token },
      {
        headers: {
          'X-API-Key': process.env.HUB_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!validation.data.success) {
      return res.status(401).json({
        success: false,
        message: 'Token SSO invalide'
      });
    }
    
    // 3. Récupérer les informations utilisateur
    const userInfo = await axios.get(
      `${process.env.HUB_API_URL}/auth/user-info`,
      {
        headers: {
          'X-API-Key': process.env.HUB_API_KEY,
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    const user = userInfo.data.data;
    
    // 4. Créer ou mettre à jour l'utilisateur dans votre DB locale
    let localUser = await User.findOne({ sorikama_id: user.id });
    
    if (!localUser) {
      localUser = await User.create({
        sorikama_id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles
      });
    } else {
      localUser.email = user.email;
      localUser.firstName = user.firstName;
      localUser.lastName = user.lastName;
      localUser.roles = user.roles;
      await localUser.save();
    }
    
    // 5. Stocker le token SSO dans votre DB
    await SSOToken.create({
      userId: localUser._id,
      token: token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
      scopes: validation.data.scopes
    });
    
    // 6. Créer une session locale pour l'utilisateur
    const localToken = jwt.sign(
      { userId: localUser._id, email: localUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // 7. Stocker le token dans un cookie
    res.cookie('auth_token', localToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24h
    });
    
    // 8. Rediriger vers le dashboard
    res.redirect('/dashboard');
    
  } catch (error) {
    console.error('Erreur SSO callback:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'authentification SSO'
    });
  }
});

module.exports = router;
```

#### Étape 3: Middleware de Vérification du Token

```javascript
// middlewares/auth.middleware.js

const axios = require('axios');
const SSOToken = require('../models/SSOToken');

/**
 * Middleware pour vérifier le token SSO
 */
const verifySSOToken = async (req, res, next) => {
  try {
    // 1. Récupérer le token depuis le cookie ou header
    const token = req.cookies.auth_token || 
                  req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token d\'authentification requis'
      });
    }
    
    // 2. Vérifier le token local
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Récupérer l'utilisateur
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    // 4. Vérifier si le token SSO est toujours valide
    const ssoToken = await SSOToken.findOne({
      userId: user._id,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });
    
    if (!ssoToken) {
      return res.status(401).json({
        success: false,
        message: 'Session SSO expirée',
        code: 'SSO_TOKEN_EXPIRED',
        redirectUrl: `${process.env.HUB_FRONTEND_URL}/authorize?service_id=${process.env.SERVICE_ID}`
      });
    }
    
    // 5. Attacher l'utilisateur à la requête
    req.user = user;
    req.ssoToken = ssoToken.token;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expiré',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification du token'
    });
  }
};

module.exports = { verifySSOToken };
```

### Comment faire des requêtes via l'API Gateway

#### Client HTTP Configuré

```javascript
// utils/apiClient.js

const axios = require('axios');

/**
 * Client HTTP pour communiquer avec l'API Gateway
 */
class ApiGatewayClient {
  constructor() {
    this.baseURL = process.env.HUB_API_URL;
    this.apiKey = process.env.HUB_API_KEY;
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    // Intercepteur pour ajouter le token SSO
    this.client.interceptors.request.use(
      (config) => {
        // Récupérer le token SSO depuis le contexte de la requête
        if (config.ssoToken) {
          config.headers.Authorization = `Bearer ${config.ssoToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    // Intercepteur pour gérer les erreurs
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expiré, rediriger vers le Hub
          console.error('Token SSO expiré');
        }
        return Promise.reject(error);
      }
    );
  }
  
  /**
   * Récupérer les informations utilisateur
   */
  async getUserInfo(ssoToken) {
    const response = await this.client.get('/auth/user-info', {
      ssoToken
    });
    return response.data;
  }
  
  /**
   * Faire une requête vers un autre service via l'API Gateway
   */
  async callService(serviceName, endpoint, method = 'GET', data = null, ssoToken) {
    const config = {
      method,
      url: `/${serviceName}${endpoint}`,
      ssoToken
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await this.client.request(config);
    return response.data;
  }
  
  /**
   * Valider un token SSO
   */
  async validateSSOToken(token) {
    const response = await this.client.post('/sso/validate', { token });
    return response.data;
  }
}

module.exports = new ApiGatewayClient();
```

#### Utilisation dans les Routes

```javascript
// routes/products.routes.js

const express = require('express');
const router = express.Router();
const apiClient = require('../utils/apiClient');
const { verifySSOToken } = require('../middlewares/auth.middleware');

/**
 * Récupérer les produits
 * Cette route utilise le token SSO pour faire une requête via l'API Gateway
 */
router.get('/products', verifySSOToken, async (req, res) => {
  try {
    // Faire une requête vers SoriPay pour vérifier le solde
    const paymentInfo = await apiClient.callService(
      'soripay',
      '/user/balance',
      'GET',
      null,
      req.ssoToken
    );
    
    // Récupérer les produits depuis votre DB locale
    const products = await Product.find({ isActive: true });
    
    res.json({
      success: true,
      data: {
        products,
        userBalance: paymentInfo.data.balance
      }
    });
  } catch (error) {
    console.error('Erreur récupération produits:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des produits'
    });
  }
});

/**
 * Créer une commande
 * Communique avec SoriPay via l'API Gateway
 */
router.post('/orders', verifySSOToken, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    // 1. Récupérer le produit
    const product = await Product.findById(productId);
    const totalAmount = product.price * quantity;
    
    // 2. Créer un paiement via SoriPay (via l'API Gateway)
    const payment = await apiClient.callService(
      'soripay',
      '/payments',
      'POST',
      {
        amount: totalAmount,
        currency: 'EUR',
        description: `Achat de ${quantity}x ${product.name}`,
        metadata: {
          productId,
          quantity,
          serviceId: process.env.SERVICE_ID
        }
      },
      req.ssoToken
    );
    
    if (!payment.success) {
      return res.status(400).json({
        success: false,
        message: 'Échec du paiement'
      });
    }
    
    // 3. Créer la commande dans votre DB
    const order = await Order.create({
      userId: req.user._id,
      productId,
      quantity,
      totalAmount,
      paymentId: payment.data.id,
      status: 'paid'
    });
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Erreur création commande:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la commande'
    });
  }
});

module.exports = router;
```


### Comment gérer le refresh des tokens

#### Stratégie de Refresh

```javascript
// utils/tokenManager.js

const axios = require('axios');
const SSOToken = require('../models/SSOToken');

class TokenManager {
  /**
   * Vérifier si le token SSO est proche de l'expiration
   */
  async isTokenExpiringSoon(token) {
    const decoded = jwt.decode(token);
    const expiresAt = new Date(decoded.exp * 1000);
    const now = new Date();
    const timeUntilExpiry = expiresAt - now;
    
    // Considérer comme "proche de l'expiration" si < 1 heure
    return timeUntilExpiry < 60 * 60 * 1000;
  }
  
  /**
   * Rafraîchir le token SSO
   */
  async refreshSSOToken(userId) {
    try {
      // 1. Récupérer le token SSO actuel
      const currentToken = await SSOToken.findOne({
        userId,
        expiresAt: { $gt: new Date() }
      }).sort({ createdAt: -1 });
      
      if (!currentToken) {
        throw new Error('Aucun token SSO valide trouvé');
      }
      
      // 2. Demander un nouveau token à l'API Gateway
      const response = await axios.post(
        `${process.env.HUB_API_URL}/sso/refresh`,
        {
          token: currentToken.token,
          serviceId: process.env.SERVICE_ID
        },
        {
          headers: {
            'X-API-Key': process.env.HUB_API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.data.success) {
        throw new Error('Échec du refresh du token SSO');
      }
      
      const newToken = response.data.data.token;
      
      // 3. Stocker le nouveau token
      await SSOToken.create({
        userId,
        token: newToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        scopes: response.data.data.scopes
      });
      
      // 4. Invalider l'ancien token
      currentToken.isRevoked = true;
      await currentToken.save();
      
      return newToken;
    } catch (error) {
      console.error('Erreur refresh token SSO:', error);
      throw error;
    }
  }
  
  /**
   * Middleware pour auto-refresh du token
   */
  autoRefreshMiddleware() {
    return async (req, res, next) => {
      try {
        if (req.ssoToken && req.user) {
          const isExpiring = await this.isTokenExpiringSoon(req.ssoToken);
          
          if (isExpiring) {
            console.log('Token SSO proche de l\'expiration, refresh...');
            const newToken = await this.refreshSSOToken(req.user._id);
            req.ssoToken = newToken;
            
            // Mettre à jour le cookie si nécessaire
            const localToken = jwt.sign(
              { userId: req.user._id, email: req.user.email },
              process.env.JWT_SECRET,
              { expiresIn: '24h' }
            );
            
            res.cookie('auth_token', localToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              maxAge: 24 * 60 * 60 * 1000
            });
          }
        }
        next();
      } catch (error) {
        console.error('Erreur auto-refresh:', error);
        next();
      }
    };
  }
}

module.exports = new TokenManager();
```

#### Gestion des Erreurs de Token Expiré

```javascript
// middlewares/errorHandler.middleware.js

/**
 * Middleware de gestion des erreurs
 */
const errorHandler = (err, req, res, next) => {
  console.error('Erreur:', err);
  
  // Token SSO expiré
  if (err.code === 'SSO_TOKEN_EXPIRED') {
    return res.status(401).json({
      success: false,
      message: 'Session SSO expirée',
      code: 'SSO_TOKEN_EXPIRED',
      redirectUrl: `${process.env.HUB_FRONTEND_URL}/authorize?` +
                   `service_id=${process.env.SERVICE_ID}&` +
                   `redirect_url=${encodeURIComponent(req.originalUrl)}`
    });
  }
  
  // Token local expiré
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expiré',
      code: 'TOKEN_EXPIRED',
      redirectUrl: `${process.env.HUB_FRONTEND_URL}/authorize?` +
                   `service_id=${process.env.SERVICE_ID}`
    });
  }
  
  // Erreur d'autorisation
  if (err.code === 'INSUFFICIENT_PERMISSIONS') {
    return res.status(403).json({
      success: false,
      message: 'Permissions insuffisantes',
      code: 'INSUFFICIENT_PERMISSIONS'
    });
  }
  
  // Erreur générique
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erreur serveur',
    code: err.code || 'INTERNAL_ERROR'
  });
};

module.exports = errorHandler;
```

### Exemples de Code Complets

#### Exemple 1: Service SoriStore Complet

```javascript
// app.js - Point d'entrée du service SoriStore

const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/products.routes');
const orderRoutes = require('./routes/orders.routes');
const errorHandler = require('./middlewares/errorHandler.middleware');
const tokenManager = require('./utils/tokenManager');

const app = express();

// Middlewares
app.use(cors({
  origin: [
    process.env.HUB_FRONTEND_URL,
    'http://localhost:3001'
  ],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Auto-refresh du token SSO
app.use(tokenManager.autoRefreshMiddleware());

// Routes
app.use('/auth', authRoutes);
app.use('/api', productRoutes);
app.use('/api', orderRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'soristore',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Gestion des erreurs
app.use(errorHandler);

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connecté à MongoDB');
    
    // Démarrage du serveur
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`🚀 SoriStore démarré sur le port ${PORT}`);
      console.log(`📡 API Gateway: ${process.env.HUB_API_URL}`);
      console.log(`🔐 Service ID: ${process.env.SERVICE_ID}`);
    });
  })
  .catch((error) => {
    console.error('❌ Erreur connexion MongoDB:', error);
    process.exit(1);
  });

module.exports = app;
```

#### Exemple 2: Modèle de Données

```javascript
// models/User.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  sorikama_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  roles: [{
    type: String,
    enum: ['user', 'premium', 'admin', 'moderator']
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
```

```javascript
// models/SSOToken.js

const mongoose = require('mongoose');

const ssoTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  token: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  scopes: [{
    type: String
  }],
  isRevoked: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index pour nettoyer automatiquement les tokens expirés
ssoTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('SSOToken', ssoTokenSchema);
```

#### Exemple 3: Frontend du Service Externe

```javascript
// frontend/src/utils/auth.js

/**
 * Utilitaires d'authentification pour le frontend du service externe
 */

const HUB_FRONTEND_URL = import.meta.env.VITE_HUB_FRONTEND_URL;
const SERVICE_ID = import.meta.env.VITE_SERVICE_ID;

/**
 * Rediriger vers le Hub pour l'authentification SSO
 */
export const redirectToSSOLogin = (returnUrl = window.location.href) => {
  const authUrl = `${HUB_FRONTEND_URL}/authorize?` +
    `service_id=${SERVICE_ID}&` +
    `redirect_url=${encodeURIComponent(returnUrl)}`;
  
  window.location.href = authUrl;
};

/**
 * Vérifier si l'utilisateur est connecté
 */
export const isAuthenticated = async () => {
  try {
    const response = await fetch('/api/auth/me', {
      credentials: 'include'
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};

/**
 * Récupérer les informations de l'utilisateur connecté
 */
export const getCurrentUser = async () => {
  try {
    const response = await fetch('/api/auth/me', {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Non authentifié');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Erreur récupération utilisateur:', error);
    return null;
  }
};

/**
 * Se déconnecter
 */
export const logout = async () => {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });
    
    // Rediriger vers le Hub pour déconnexion globale
    window.location.href = `${HUB_FRONTEND_URL}/logout`;
  } catch (error) {
    console.error('Erreur déconnexion:', error);
  }
};
```

```jsx
// frontend/src/components/LoginButton.jsx

import React from 'react';
import { redirectToSSOLogin } from '../utils/auth';

const LoginButton = () => {
  return (
    <button
      onClick={() => redirectToSSOLogin()}
      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
    >
      Se connecter avec Sorikama
    </button>
  );
};

export default LoginButton;
```

```jsx
// frontend/src/components/ProtectedRoute.jsx

import React, { useEffect, useState } from 'react';
import { isAuthenticated, redirectToSSOLogin } from '../utils/auth';

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await isAuthenticated();
      
      if (!isAuth) {
        redirectToSSOLogin();
      } else {
        setAuthenticated(true);
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);
  
  if (loading) {
    return <div>Chargement...</div>;
  }
  
  if (!authenticated) {
    return null;
  }
  
  return children;
};

export default ProtectedRoute;
```


---

## 🔐 Sécurité et Authentification

### Système d'Authentification à 2 Niveaux

#### Niveau 1: API Key (Obligatoire pour TOUT)

```
┌─────────────────────────────────────────────────────────────────┐
│  API KEY - Authentification du Service                          │
└─────────────────────────────────────────────────────────────────┘

Format: sk_<service>_<random_64_chars>
Exemple: sk_soristore_1234567890abcdef...

Utilisation:
  Header: X-API-Key: sk_xxx
  Query: ?api_key=sk_xxx
  Bearer: Authorization: Bearer sk_xxx

Stockage dans la DB:
  {
    _id: "key-uuid-123",
    serviceId: "soristore",
    name: "SoriStore Production",
    prefix: "sk_sorist",
    keyHash: "sha256(fullKey)",
    permissions: ["read:soristore", "write:soristore"],
    isActive: true,
    expiresAt: null,
    rateLimit: {
      requests: 1000,
      windowMs: 900000
    },
    allowedIPs: ["203.0.113.0/24"],
    allowedDomains: ["*.soristore.com"],
    usageCount: 15420,
    lastUsed: "2024-01-15T10:30:00Z"
  }

Vérifications:
  ✅ Format correct (sk_xxx)
  ✅ Clé existe dans la DB
  ✅ Clé active (isActive = true)
  ✅ Clé non expirée
  ✅ Service autorisé
  ✅ IP autorisée (si configuré)
  ✅ Domaine autorisé (si configuré)
  ✅ Rate limit non dépassé
```

#### Niveau 2: JWT Token (Pour les données utilisateur)

```
┌─────────────────────────────────────────────────────────────────┐
│  JWT TOKEN - Authentification de l'Utilisateur                  │
└─────────────────────────────────────────────────────────────────┘

Format: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Utilisation:
  Header: Authorization: Bearer <token>
  Cookie: sso_token=<token>

Structure du Token:
  {
    // Header
    "alg": "HS256",
    "typ": "JWT",
    
    // Payload
    "userId": "user-uuid-123",
    "email": "marie@example.com",
    "roles": ["user", "premium"],
    "serviceId": "soristore",
    "scopes": ["profile", "email", "orders"],
    "iss": "sorikama-hub",
    "aud": "soristore",
    "iat": 1705315200,
    "exp": 1705401600,
    
    // Signature
    "signature": "..."
  }

Vérifications:
  ✅ Signature valide
  ✅ Token non expiré
  ✅ Issuer correct (sorikama-hub)
  ✅ Audience correcte (serviceId)
  ✅ Utilisateur existe
  ✅ Utilisateur actif
  ✅ Session non révoquée
```

### Flux d'Authentification Complet

```
┌─────────────────────────────────────────────────────────────────┐
│  FLUX COMPLET: De la connexion à l'accès aux ressources         │
└─────────────────────────────────────────────────────────────────┘

1. INSCRIPTION / CONNEXION SUR LE HUB
   │
   │ Utilisateur → Frontend Hub
   │ POST /api/v1/auth/login
   │ {
   │   email: "marie@example.com",
   │   password: "Password@123"
   │ }
   │
   ▼
   Backend Hub vérifie les credentials
   │
   │ ✅ Email existe
   │ ✅ Mot de passe correct
   │ ✅ Compte vérifié
   │ ✅ Compte actif
   │
   ▼
   Backend Hub génère les tokens
   │
   │ Access Token (1h):
   │   - userId
   │   - email
   │   - roles
   │
   │ Refresh Token (7j):
   │   - userId
   │   - tokenId
   │
   ▼
   Frontend Hub stocke les tokens
   │
   │ localStorage:
   │   - accessToken
   │   - refreshToken
   │   - user (infos basiques)
   │
   ▼
   Utilisateur connecté sur le Hub ✅

2. AUTORISATION POUR UN SERVICE EXTERNE
   │
   │ Utilisateur clique sur "SoriStore"
   │ ou
   │ SoriStore redirige vers /authorize
   │
   ▼
   Frontend Hub affiche la page d'autorisation
   │
   │ - Logo SoriStore
   │ - Permissions demandées:
   │   ✓ Accès à votre profil
   │   ✓ Accès à votre email
   │   ✓ Gestion de vos commandes
   │
   ▼
   Utilisateur clique sur "Autoriser"
   │
   ▼
   Frontend Hub → Backend Hub
   │ POST /api/v1/sso/authorize
   │ {
   │   serviceId: "soristore",
   │   scopes: ["profile", "email", "orders"]
   │ }
   │ Headers:
   │   Authorization: Bearer <access_token>
   │
   ▼
   Backend Hub génère un token SSO
   │
   │ SSO Token (24h):
   │   - userId
   │   - serviceId: "soristore"
   │   - scopes: ["profile", "email", "orders"]
   │
   │ Stocke dans la DB:
   │   - SSOSession
   │   - userId
   │   - serviceId
   │   - sessionToken
   │   - expiresAt
   │
   ▼
   Backend Hub redirige vers SoriStore
   │
   │ Redirect: http://localhost:3001/auth/callback?
   │   token=<sso_token>&
   │   service=soristore
   │
   ▼
   SoriStore reçoit le token SSO ✅

3. VALIDATION DU TOKEN SSO PAR LE SERVICE
   │
   │ SoriStore Backend reçoit le token
   │
   ▼
   SoriStore → API Gateway
   │ POST /api/v1/sso/validate
   │ {
   │   token: "<sso_token>"
   │ }
   │ Headers:
   │   X-API-Key: sk_soristore_xxx
   │
   ▼
   API Gateway valide le token
   │
   │ ✅ Signature valide
   │ ✅ Token non expiré
   │ ✅ Service correspond (soristore)
   │ ✅ Session active
   │
   ▼
   API Gateway retourne les infos
   │
   │ {
   │   success: true,
   │   data: {
   │     valid: true,
   │     userId: "user-uuid-123",
   │     scopes: ["profile", "email", "orders"]
   │   }
   │ }
   │
   ▼
   SoriStore crée une session locale ✅

4. ACCÈS AUX RESSOURCES
   │
   │ SoriStore Frontend → SoriStore Backend
   │ GET /api/products
   │ Cookie: auth_token=<local_token>
   │
   ▼
   SoriStore Backend vérifie le token local
   │
   │ ✅ Token valide
   │ ✅ Session SSO valide
   │
   ▼
   SoriStore Backend → API Gateway
   │ GET /api/v1/auth/user-info
   │ Headers:
   │   X-API-Key: sk_soristore_xxx
   │   Authorization: Bearer <sso_token>
   │
   ▼
   API Gateway vérifie les autorisations
   │
   │ ✅ API Key valide
   │ ✅ Token SSO valide
   │ ✅ Permissions OK
   │
   ▼
   API Gateway retourne les données
   │
   │ {
   │   success: true,
   │   data: {
   │     id: "user-uuid-123",
   │     firstName: "Marie",
   │     lastName: "Curie",
   │     email: "marie@example.com",
   │     roles: ["user", "premium"]
   │   }
   │ }
   │
   ▼
   SoriStore utilise les données ✅

5. COMMUNICATION INTER-SERVICES
   │
   │ SoriStore veut créer un paiement
   │
   ▼
   SoriStore Backend → API Gateway
   │ POST /api/v1/soripay/payments
   │ {
   │   amount: 99.99,
   │   currency: "EUR",
   │   description: "Achat produit"
   │ }
   │ Headers:
   │   X-API-Key: sk_soristore_xxx
   │   Authorization: Bearer <sso_token>
   │
   ▼
   API Gateway vérifie les autorisations
   │
   │ ✅ API Key valide (SoriStore)
   │ ✅ Token SSO valide
   │ ✅ Permission: write:soripay
   │ ✅ Scope: payments
   │
   ▼
   API Gateway route vers SoriPay
   │
   │ POST http://localhost:3002/payments
   │ Headers:
   │   X-Original-User: user-uuid-123
   │   X-Original-Service: soristore
   │   Authorization: Bearer <sso_token>
   │
   ▼
   SoriPay traite le paiement
   │
   │ ✅ Paiement créé
   │
   ▼
   API Gateway retourne la réponse
   │
   │ {
   │   success: true,
   │   data: {
   │     id: "payment-uuid-456",
   │     status: "pending",
   │     amount: 99.99
   │   }
   │ }
   │
   ▼
   SoriStore reçoit la confirmation ✅
```

### Sécurité Avancée

#### Rate Limiting Dynamique

```typescript
// Configuration du rate limiting par rôle

const rateLimits = {
  superadmin: {
    requests: 10000,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: 'Trop de requêtes (superadmin)'
  },
  admin: {
    requests: 1000,
    windowMs: 15 * 60 * 1000,
    message: 'Trop de requêtes (admin)'
  },
  premium: {
    requests: 500,
    windowMs: 15 * 60 * 1000,
    message: 'Trop de requêtes (premium)'
  },
  user: {
    requests: 100,
    windowMs: 15 * 60 * 1000,
    message: 'Trop de requêtes (user)'
  },
  guest: {
    requests: 20,
    windowMs: 15 * 60 * 1000,
    message: 'Trop de requêtes (guest)'
  }
};

// Middleware de rate limiting
const dynamicRateLimit = (req, res, next) => {
  const userRole = req.user?.roles[0] || 'guest';
  const limit = rateLimits[userRole];
  
  // Vérifier le nombre de requêtes
  const key = `ratelimit:${userRole}:${req.ip}`;
  const count = await redis.incr(key);
  
  if (count === 1) {
    await redis.expire(key, limit.windowMs / 1000);
  }
  
  if (count > limit.requests) {
    return res.status(429).json({
      success: false,
      message: limit.message,
      retryAfter: await redis.ttl(key)
    });
  }
  
  // Ajouter les headers de rate limit
  res.setHeader('X-RateLimit-Limit', limit.requests);
  res.setHeader('X-RateLimit-Remaining', limit.requests - count);
  res.setHeader('X-RateLimit-Reset', Date.now() + (await redis.ttl(key) * 1000));
  
  next();
};
```

#### Protection contre les Attaques

```typescript
// Middlewares de sécurité

// 1. Helmet - Headers de sécurité
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// 2. CORS - Contrôle d'accès
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3001',
      'http://localhost:3002',
      // ... autres services
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Non autorisé par CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
}));

// 3. Validation des entrées
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: error.details.map(d => d.message)
      });
    }
    
    next();
  };
};

// 4. Détection d'activités suspectes
const detectSuspiciousActivity = async (req, res, next) => {
  const key = `suspicious:${req.ip}`;
  
  // Vérifier les patterns suspects
  const suspiciousPatterns = [
    /(\.\.|\/etc\/|\/proc\/)/i,  // Path traversal
    /<script|javascript:/i,       // XSS
    /union.*select|drop.*table/i  // SQL injection
  ];
  
  const requestString = JSON.stringify({
    url: req.url,
    body: req.body,
    query: req.query
  });
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(requestString)) {
      // Incrémenter le compteur de tentatives suspectes
      await redis.incr(key);
      await redis.expire(key, 3600); // 1 heure
      
      // Bloquer après 5 tentatives
      const count = await redis.get(key);
      if (count > 5) {
        return res.status(403).json({
          success: false,
          message: 'Activité suspecte détectée',
          code: 'SUSPICIOUS_ACTIVITY'
        });
      }
      
      // Logger l'activité
      logger.warn('Activité suspecte détectée', {
        ip: req.ip,
        pattern: pattern.toString(),
        request: requestString
      });
    }
  }
  
  next();
};
```


---

## 📚 Exemples de Code Complets

### Exemple Complet: Intégration d'un Nouveau Service

#### Étape 1: Configuration du Service dans le Hub

`