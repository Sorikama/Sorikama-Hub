# Sorikama API Gateway

## 🚀 Vue d'ensemble

L'API Gateway Sorikama est le point d'entrée centralisé pour tout l'écosystème Sorikama. Elle gère l'authentification, l'autorisation, le routage intelligent et la sécurité pour tous les microservices.

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Client Apps   │───▶│  API Gateway     │───▶│  Microservices  │
│                 │    │  (Sorikama-Hub)  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────┐
                       │   MongoDB    │
                       │ (Users/Roles)│
                       └──────────────┘
```

## 🔐 Fonctionnalités de Sécurité

### Authentification
- JWT avec refresh tokens
- Sessions sécurisées avec TTL
- Support multi-sources (Bearer, Cookie, Header)

### Autorisation
- Système RBAC (Role-Based Access Control)
- Permissions granulaires par action/ressource
- Cache des permissions (5min TTL)
- Règles contextuelles avancées

### Filtrage des Requêtes
- Rate limiting dynamique par rôle
- Validation des en-têtes et payload
- Détection d'activités suspectes
- Sanitisation anti-XSS/injection

### Sécurité Headers
- Helmet.js pour les en-têtes de sécurité
- CSP (Content Security Policy)
- HSTS (HTTP Strict Transport Security)

## 🛣️ Routage Intelligent

### Fonctionnalités
- Découverte automatique des services
- Health checks périodiques
- Load balancing (Round-robin, Least-connections, Weighted)
- Circuit breaker pattern
- Retry automatique avec backoff

### Services Supportés
- **SoriStore** - Marketplace e-commerce
- **SoriPay** - Système de paiement
- **SoriWallet** - Portefeuille numérique
- **SoriLearn** - Plateforme d'apprentissage
- **SoriHealth** - Suivi santé
- **SoriAccess** - Accessibilité

## 📊 Monitoring & Métriques

### Endpoints de Monitoring
```
GET /gateway/health     - État des services
GET /gateway/routes     - Configuration des routes
GET /gateway/metrics    - Métriques de performance
```

### Métriques Collectées
- Nombre de requêtes par service
- Temps de réponse moyen
- Taux d'erreur
- Dernière activité

## 🚦 Installation & Configuration

### 1. Installation des dépendances
```bash
npm install
```

### 2. Configuration des variables d'environnement
```bash
cp .env.example .env
# Éditer .env avec vos valeurs
```

### 3. Initialisation de la base de données
```bash
npm run db:seed
```

### 4. Démarrage
```bash
# Développement
npm run dev

# Production
npm run build
npm start
```

## 🔑 Système de Rôles et Permissions

### Hiérarchie des Rôles
1. **superadmin** - Contrôle total du système
2. **admin** - Gestion des utilisateurs et services
3. **moderator** - Modération et gestion limitée
4. **premium** - Utilisateur avec accès étendu
5. **user** - Utilisateur standard
6. **guest** - Accès limité en lecture

### Permissions par Domaine
- **system** - Gestion système
- **user** - Gestion utilisateurs
- **role/permission** - Gestion RBAC
- **gateway** - Configuration gateway
- **sori*** - Services Sorikama
- **analytics** - Données et rapports

## 🔄 Utilisation des APIs

### Authentification
```bash
POST /auth/login
{
  "email": "user@example.com",
  "password": "password"
}
```

### Accès aux Services
```bash
# Toutes les requêtes vers les services passent par le gateway
GET /soristore/products
POST /soripay/transactions
PUT /soriwallet/balance
```

### Headers Requis
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
User-Agent: <your_app>
```

## 🛡️ Sécurité Best Practices

### Rate Limiting par Rôle
- **admin**: 1000 req/15min
- **premium**: 500 req/15min  
- **user**: 100 req/15min
- **guest**: 20 req/15min

### Validation des Données
- Taille max payload: 10MB
- Sanitisation anti-injection
- Validation des en-têtes requis

### Logging de Sécurité
- Tentatives d'accès non autorisé
- Activités suspectes
- Erreurs d'authentification
- Dépassements de rate limit

## 🔧 Configuration Avancée

### Load Balancing
```typescript
{
  loadBalancing: {
    strategy: 'round-robin', // 'least-connections', 'weighted'
    targets: [
      { url: 'http://service1:3001', weight: 2 },
      { url: 'http://service2:3001', weight: 1 }
    ]
  }
}
```

### Circuit Breaker
```typescript
{
  circuitBreaker: {
    failureThreshold: 5,    // Échecs avant ouverture
    resetTimeout: 60000     // Temps avant retry (ms)
  }
}
```

### Retry Policy
```typescript
{
  retries: 3,              // Nombre de tentatives
  timeout: 30000           // Timeout par requête (ms)
}
```

## 📝 Logs et Debugging

### Niveaux de Log
- **error** - Erreurs critiques
- **warn** - Avertissements de sécurité
- **info** - Informations générales
- **debug** - Détails techniques

### Format des Logs
```json
{
  "timestamp": "2024-01-01T12:00:00.000Z",
  "level": "info",
  "message": "[GATEWAY] Routing GET /soristore/products -> soristore",
  "userId": "user123",
  "ip": "192.168.1.1",
  "service": "soristore"
}
```

## 🚨 Gestion d'Erreurs

### Codes d'Erreur Standards
- **401** - Non authentifié
- **403** - Accès refusé
- **404** - Service non trouvé
- **429** - Rate limit dépassé
- **502** - Service indisponible
- **503** - Service en maintenance
- **504** - Timeout gateway

### Format de Réponse d'Erreur
```json
{
  "error": "Service Unavailable",
  "message": "Le service soristore est temporairement indisponible",
  "code": "SERVICE_DOWN",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "requestId": "req_1234567890_abc123"
}
```

## 🔄 Mise à Jour et Maintenance

### Ajout d'un Nouveau Service
1. Ajouter l'URL dans `.env`
2. Configurer la route dans `routingEngine.service.ts`
3. Définir les permissions nécessaires
4. Tester les health checks

### Mise à Jour des Permissions
1. Modifier `permissions.seeder.ts`
2. Exécuter `npm run db:seed`
3. Vérifier les rôles affectés

## 📞 Support

Pour toute question ou problème :
- Documentation API : `/api-docs`
- Health check : `/gateway/health`
- Métriques : `/gateway/metrics`

---

**Sorikama Hub** - Le cerveau de l'écosystème Sorikama 🧠✨