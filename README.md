# 🌟 Sorikama API Gateway - Guide Complet

## 📖 Qu'est-ce que Sorikama Hub ?

Sorikama Hub est un **API Gateway** - pensez-y comme un **portier intelligent** pour votre écosystème d'applications. Au lieu d'avoir 6 applications séparées qui ne se parlent pas, Sorikama Hub les connecte toutes ensemble.

### 🏢 L'écosystème Sorikama
- **🛍️ SoriStore** - Marketplace e-commerce
- **💳 SoriPay** - Système de paiement  
- **💰 SoriWallet** - Portefeuille numérique
- **📚 SoriLearn** - Plateforme d'apprentissage
- **🏥 SoriHealth** - Gestion de santé
- **♿ SoriAccess** - Accessibilité et inclusion

## 🔧 Comment ça marche ?

### 1. 🚪 Le Portier (API Gateway)
Imaginez Sorikama Hub comme le **portier d'un grand immeuble** :
- Toutes les demandes passent par lui
- Il vérifie votre identité (API Key)
- Il vous dirige vers le bon service
- Il garde une trace de qui fait quoi

### 2. 🔑 Système d'Authentification à 2 Niveaux

#### Niveau 1 : API Key (Obligatoire pour TOUT)
```
X-API-Key: sk_59105e8b548140fe11e8bad8db2572f174a6266fe4b3c4ab
```
- **Comme une carte d'accès à l'immeuble**
- Obligatoire pour TOUTES les requêtes API
- Stockée dans la table `simple_api_keys`
- Permet l'accès aux services système

#### Niveau 2 : JWT Token (Pour les données utilisateur)
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```
- **Comme votre badge personnel dans l'immeuble**
- Nécessaire pour accéder à VOS données personnelles
- Obtenu après connexion via `/auth/login`
- Expire après 24h (configurable)

## 🌐 Comment les Services Externes Contactent l'API Gateway

### Scénario 1 : Application Mobile SoriStore
```bash
# L'app mobile veut afficher les produits
curl -X GET "http://localhost:7000/api/v1/soristore/products" \
  -H "X-API-Key: sk_59105e8b548140fe11e8bad8db2572f174a6266fe4b3c4ab"
```

**Ce qui se passe :**
1. 📱 App mobile → 🌐 Sorikama Hub (port 7000)
2. 🔍 Hub vérifie l'API Key
3. 🎯 Hub redirige vers SoriStore (port 3001)
4. 📦 SoriStore répond avec les produits
5. 🔄 Hub renvoie la réponse à l'app

### Scénario 2 : Utilisateur Connecté
```bash
# L'utilisateur veut voir son profil
curl -X GET "http://localhost:7000/api/v1/auth/me" \
  -H "X-API-Key: sk_59105e8b548140fe11e8bad8db2572f174a6266fe4b3c4ab" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Ce qui se passe :**
1. 📱 App → 🌐 Hub
2. 🔍 Hub vérifie API Key ✅
3. 🔍 Hub vérifie JWT Token ✅
4. 👤 Hub récupère les données utilisateur
5. 📤 Hub renvoie le profil

## 🛣️ Routage et Redirection

### Routes Système (API Key seule)
```
GET /api/v1/system/health     → Santé du système
GET /api/v1/admin/analytics   → Statistiques admin
GET /api/v1/system/services   → Liste des services
```

### Routes Utilisateur (API Key + JWT)
```
GET /api/v1/auth/me           → Profil utilisateur
PATCH /api/v1/auth/update-me  → Modifier profil
POST /api/v1/auth/logout      → Déconnexion
```

### Routes Proxy (Redirection vers services)
```
GET /api/v1/soristore/*       → Redirige vers SoriStore (port 3001)
GET /api/v1/soripay/*         → Redirige vers SoriPay (port 3002)
GET /api/v1/soriwallet/*      → Redirige vers SoriWallet (port 3003)
```

## 🔄 Flux de Communication

### 1. Inscription d'un Utilisateur
```
1. App → Hub: POST /auth/register (avec API Key)
2. Hub → Base: Crée compte temporaire
3. Hub → Email: Envoie code de vérification
4. App → Hub: POST /auth/verify (avec code)
5. Hub → Base: Active le compte
6. Hub → App: Retourne JWT Token
```

### 2. Achat sur SoriStore
```
1. App → Hub: GET /soristore/products (API Key)
2. Hub → SoriStore: GET /products
3. SoriStore → Hub: Liste produits
4. Hub → App: Produits

5. App → Hub: POST /soripay/payment (API Key + JWT)
6. Hub → SoriPay: POST /payment (avec infos user)
7. SoriPay → Hub: Confirmation paiement
8. Hub → App: Succès
```

## 🏗️ Architecture Technique

### Serveur Principal
- **Port** : 7000 (forcé, pas d'alternative)
- **Base de données** : MongoDB
- **Cache** : Redis
- **Logs** : Winston avec rotation

### Middlewares (dans l'ordre)
1. **Security** : Helmet, CORS, Rate limiting
2. **API Key** : Vérification obligatoire
3. **JWT** : Vérification conditionnelle
4. **Logging** : Traçabilité complète
5. **Proxy** : Redirection vers services

### Services Externes (Ports)
```
SoriStore   → localhost:3001
SoriPay     → localhost:3002
SoriWallet  → localhost:3003
SoriLearn   → localhost:3004
SoriHealth  → localhost:3005
SoriAccess  → localhost:3006
```

## 🚀 Démarrage Rapide

### 1. Installation
```bash
cd backend
npm install
```

### 2. Configuration (.env)
```env
PORT=7000
MONGO_URI=mongodb://localhost:27017/sorikama_gateway
JWT_SECRET=votre_secret_jwt
```

### 3. Lancement
```bash
npm run dev
```

### 4. Accès
- **Portail Admin** : http://localhost:7000/portal/login
- **API Documentation** : http://localhost:7000/api-docs
- **Dashboard** : http://localhost:7000/api

## 🔐 Sécurité

### Protection Multi-Niveaux
1. **Rate Limiting** : 100 requêtes/15min par IP
2. **API Key** : Authentification obligatoire
3. **JWT** : Sessions utilisateur sécurisées
4. **Helmet** : Headers de sécurité
5. **CORS** : Contrôle d'accès cross-origin

### Gestion des Erreurs
- **401** : API Key manquante/invalide
- **403** : Permissions insuffisantes
- **429** : Rate limit dépassé
- **500** : Erreur serveur

## 📊 Monitoring

### Logs Temps Réel
- **Accès** : http://localhost:7000/logs
- **Métriques** : Requêtes, erreurs, temps de réponse
- **Alertes** : Détection d'anomalies

### Tableau de Bord
- **Utilisateurs** : Actifs, nouveaux, total
- **Services** : Santé, uptime, latence
- **API** : Utilisation, erreurs, performance

## 🤝 Intégration pour Développeurs

### Obtenir une API Key
1. Connectez-vous au portail admin
2. Allez dans "API Keys Manager"
3. Créez une nouvelle clé
4. Copiez la clé générée

### Exemple d'Intégration
```javascript
// Configuration de base
const API_BASE = 'http://localhost:7000/api/v1';
const API_KEY = 'sk_votre_cle_api';

// Fonction utilitaire
async function callAPI(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  return response.json();
}

// Utilisation
const products = await callAPI('/soristore/products');
```

## 🆘 Dépannage

### Problèmes Courants

**"API key requise"**
- Vérifiez que vous envoyez le header `X-API-Key`
- Vérifiez que votre clé commence par `sk_`

**"Token d'authentification requis"**
- Vous essayez d'accéder à une route utilisateur
- Ajoutez le header `Authorization: Bearer <token>`

**"Port 7000 occupé"**
- Le serveur force le port 7000
- Il tue automatiquement les processus qui l'occupent

## 📞 Support

Pour toute question ou problème :
- **Documentation API** : http://localhost:7000/api-docs
- **Logs système** : http://localhost:7000/logs
- **Monitoring** : http://localhost:7000/monitoring

---

*Sorikama Hub - Connecter l'écosystème, simplifier l'expérience* 🌟