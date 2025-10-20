# 🔐 Système d'Authentification Sorikama Hub

## Vue d'ensemble

Le frontend Sorikama Hub implémente un système d'authentification sécurisé à double niveau :
- **API Key utilisateur** : Clé unique générée à l'inscription
- **JWT Token** : Token d'authentification pour les sessions

## 🏗️ Architecture de Sécurité

### 1. Authentification à Double Niveau

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway    │    │   Backend       │
│                 │    │                  │    │                 │
│ API Key + JWT ──┼───▶│ Validation ──────┼───▶│ Services        │
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### 2. Types de Routes

#### Routes Publiques (Clé Système)
- `/auth/login` - Connexion
- `/auth/register` - Inscription  
- `/auth/verify` - Vérification email
- `/auth/forgot-password` - Mot de passe oublié
- `/auth/reset-password` - Réinitialisation

#### Routes Protégées (Clé Utilisateur + JWT)
- `/auth/me` - Profil utilisateur
- `/auth/update-me` - Mise à jour profil
- `/auth/regenerate-api-key` - Nouvelle clé API
- `/services/*` - Accès aux services

## 🔑 Gestion des Clés API

### Génération Automatique
```javascript
// À l'inscription, une clé API unique est générée
const apiKey = `sk_${generateUniqueId()}`;
```

### Stockage Sécurisé
```javascript
// LocalStorage avec clés configurables
localStorage.setItem('token', jwtToken);
localStorage.setItem('userApiKey', apiKey);
localStorage.setItem('user', JSON.stringify(userData));
```

### Régénération
```javascript
// L'utilisateur peut régénérer sa clé API
const newApiKey = await regenerateApiKey();
```

## 🛡️ Composants de Sécurité

### 1. AuthContext
```javascript
const { user, login, signup, logout, regenerateApiKey } = useAuth();
```

### 2. ProtectedRoute
```javascript
<ProtectedRoute requireApiKey={true}>
  <Services />
</ProtectedRoute>
```

### 3. useSecureAuth Hook
```javascript
const { isSecure, hasApiKey, hasValidToken } = useSecureAuth();
```

### 4. SecurityStatus Component
```javascript
<SecurityStatus /> // Affiche le statut de sécurité
```

## 📡 Intercepteurs API

### Request Interceptor
```javascript
// Ajoute automatiquement les headers requis
config.headers['X-API-Key'] = userApiKey || systemApiKey;
config.headers['Authorization'] = `Bearer ${token}`;
```

### Response Interceptor
```javascript
// Gère les erreurs 401 et nettoie les données
if (error.response?.status === 401) {
  clearAuthData();
  redirect('/login');
}
```

## 🔄 Flux d'Authentification

### 1. Inscription
```
1. Utilisateur remplit le formulaire
2. Validation côté client
3. Envoi avec clé système
4. Backend génère clé API utilisateur
5. Retour : { user, token, apiKey }
6. Stockage local des données
```

### 2. Connexion
```
1. Email + mot de passe
2. Validation avec clé système
3. Backend vérifie et retourne données
4. Stockage : { user, token, apiKey }
5. Redirection vers /services
```

### 3. Accès aux Services
```
1. Vérification token + API Key
2. Headers automatiques via intercepteur
3. Accès autorisé aux services
4. SSO vers services externes
```

## 🎯 Validation des Données

### Règles de Validation
```javascript
const signupRules = {
  email: { required: true, type: 'email' },
  password: { required: true, type: 'password' },
  confirmPassword: { required: true, type: 'confirmPassword' }
};
```

### Utilisation
```javascript
const { isValid, errors } = validateForm(formData, signupRules);
```

## 🔧 Configuration

### Variables d'Environnement
```env
VITE_API_GATEWAY_URL=http://localhost:7000/api/v1
VITE_API_KEY=sk_system_key_here
```

### Configuration API
```javascript
// config/api.js
export const SECURITY_CONFIG = {
  TOKEN_STORAGE_KEY: 'token',
  API_KEY_STORAGE_KEY: 'userApiKey',
  PUBLIC_ROUTES: [...],
  SYSTEM_ROUTES: [...]
};
```

## 🚀 Utilisation

### 1. Installation
```bash
cd frontend
npm install
```

### 2. Configuration
```bash
cp .env.example .env
# Modifier les variables d'environnement
```

### 3. Démarrage
```bash
npm run dev
```

## 🔍 Débogage

### Vérifier l'Authentification
```javascript
// Dans la console du navigateur
console.log('Token:', localStorage.getItem('token'));
console.log('API Key:', localStorage.getItem('userApiKey'));
console.log('User:', JSON.parse(localStorage.getItem('user')));
```

### Statut de Sécurité
Le composant `SecurityStatus` affiche en temps réel :
- ✅ Token JWT valide
- ✅ Clé API configurée  
- ✅ Connexion sécurisée active

## 🛠️ Maintenance

### Régénération de Clé API
```javascript
// Depuis le profil utilisateur
const handleRegenerate = async () => {
  const newKey = await regenerateApiKey();
  // Nouvelle clé automatiquement stockée
};
```

### Nettoyage des Données
```javascript
// En cas de déconnexion ou erreur 401
const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userApiKey');
  localStorage.removeItem('user');
};
```

## 🔒 Bonnes Pratiques

1. **Ne jamais exposer les clés API** dans le code source
2. **Utiliser HTTPS** en production
3. **Régénérer les clés** en cas de compromission
4. **Valider côté client ET serveur**
5. **Nettoyer les données** à la déconnexion
6. **Vérifier l'expiration** des tokens JWT

---

*Système d'authentification sécurisé pour l'écosystème Sorikama* 🔐