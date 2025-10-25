# 🔄 Système de Proxy Sorikama - Explication Complète

## 📡 Comment fonctionne le proxy ?

### Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────────────┐
│                    FLUX COMPLET DU PROXY                             │
└─────────────────────────────────────────────────────────────────────┘

1️⃣ Frontend Service Externe (Masebuy)
   │
   │ fetch('http://localhost:7000/api/v1/proxy/masebuy/products')
   │ Headers: {
   │   Authorization: Bearer eyJhbGc...
   │   Content-Type: application/json
   │ }
   ▼
   
2️⃣ Backend Sorikama (Proxy Dynamique)
   │
   ├─ Extrait "masebuy" de l'URL
   ├─ Cherche le service en BDD: { proxyPath: "masebuy" }
   ├─ Trouve: { backendUrl: "http://localhost:4001" }
   │
   ├─ Vérifie si requireAuth: true
   │   ├─ Décode le JWT token
   │   ├─ Charge l'utilisateur depuis MongoDB
   │   └─ Vérifie les rôles autorisés
   │
   ├─ Ajoute des headers personnalisés:
   │   ├─ X-Proxied-By: Sorikama-Hub
   │   ├─ X-Service-Name: Masebuy
   │   ├─ X-User-Id: 06bd7178-e841-42e9-a159-a1ca9df8204d
   │   ├─ X-User-Email: user@example.com
   │   ├─ X-User-Role: admin
   │   └─ Authorization: Bearer eyJhbGc... (transféré)
   │
   │ Proxie vers: http://localhost:4001/products
   ▼
   
3️⃣ Backend Service Externe (Masebuy Backend)
   │
   ├─ Reçoit la requête avec tous les headers
   ├─ Peut lire X-User-Id, X-User-Email, X-User-Role
   ├─ Peut vérifier le token JWT si besoin
   ├─ Traite la requête normalement
   │
   │ Response: {
   │   success: true,
   │   products: [...]
   │ }
   ▼
   
4️⃣ Backend Sorikama (Proxy)
   │
   ├─ Reçoit la réponse du service
   ├─ Ajoute des headers de réponse:
   │   ├─ X-Proxied-By: Sorikama-Hub
   │   └─ X-Service-Name: Masebuy
   ├─ Log l'activité (temps de réponse, statut, etc.)
   │
   │ Response: {
   │   success: true,
   │   products: [...]
   │ }
   ▼
   
5️⃣ Frontend Service Externe (Masebuy)
   │
   └─ Reçoit les données et les affiche
```

---

## 🔍 Code du Proxy Dynamique

### Fichier: `backend/src/middlewares/dynamicProxy.middleware.ts`

```typescript
export const dynamicProxyMiddleware = async (req, res, next) => {
  // 1. Extraire le proxyPath de l'URL
  // URL: /api/v1/proxy/masebuy/products
  // proxyPath: "masebuy"
  // remainingPath: "/products"
  const match = req.path.match(/^\/proxy\/([^\/]+)(\/.*)?$/);
  const [, proxyPath, remainingPath = ''] = match;

  // 2. Chercher le service en BDD
  const service = await ServiceModel.findOne({
    proxyPath: "masebuy",
    enabled: true
  });

  // 3. Vérifier l'authentification si requireAuth: true
  if (service.requireAuth) {
    const token = req.headers.authorization?.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decoded.id);
    
    // Vérifier les rôles
    if (service.allowedRoles.length > 0) {
      if (!service.allowedRoles.includes(user.role)) {
        return res.status(403).json({ error: 'Accès refusé' });
      }
    }
    
    req.user = user;
  }

  // 4. Créer le proxy
  const proxy = createProxyMiddleware({
    target: service.backendUrl, // http://localhost:4001
    changeOrigin: true,
    pathRewrite: {
      [`^/api/v1/proxy/${service.proxyPath}`]: '' // Enlève le préfixe
    },
    onProxyReq: (proxyReq, req, res) => {
      // Ajouter des headers personnalisés
      proxyReq.setHeader('X-Proxied-By', 'Sorikama-Hub');
      proxyReq.setHeader('X-Service-Name', service.name);
      
      if (req.user) {
        proxyReq.setHeader('X-User-Id', req.user._id);
        proxyReq.setHeader('X-User-Email', req.user.email);
        proxyReq.setHeader('X-User-Role', req.user.role);
      }
      
      // Transférer le token
      const authHeader = req.headers.authorization;
      if (authHeader) {
        proxyReq.setHeader('Authorization', authHeader);
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      // Ajouter des headers de réponse
      proxyRes.headers['X-Proxied-By'] = 'Sorikama-Hub';
      proxyRes.headers['X-Service-Name'] = service.name;
    }
  });

  // 5. Exécuter le proxy
  return proxy(req, res, next);
};
```

---

## 📤 Données envoyées par Sorikama

### 1. **Headers HTTP envoyés au Backend du Service**

```http
GET /products HTTP/1.1
Host: localhost:4001
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
X-Proxied-By: Sorikama-Hub
X-Service-Name: Masebuy
X-User-Id: 06bd7178-e841-42e9-a159-a1ca9df8204d
X-User-Email: user@example.com
X-User-Role: admin
X-User-FirstName: John
X-User-LastName: Doe
```

### 2. **Détails des headers personnalisés**

| Header | Description | Exemple |
|--------|-------------|---------|
| `X-Proxied-By` | Identifie que la requête passe par Sorikama | `Sorikama-Hub` |
| `X-Service-Name` | Nom du service configuré | `Masebuy` |
| `X-User-Id` | ID unique de l'utilisateur | `06bd7178-...` |
| `X-User-Email` | Email de l'utilisateur | `user@example.com` |
| `X-User-Role` | Rôle de l'utilisateur | `admin`, `user` |
| `Authorization` | Token JWT original | `Bearer eyJ...` |

### 3. **Body de la requête (si POST/PUT/PATCH)**

Le body est transféré tel quel :

```javascript
// Frontend Masebuy
fetch('http://localhost:7000/api/v1/proxy/masebuy/products', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Nouveau produit',
    price: 99.99
  })
});

// Backend Masebuy reçoit exactement:
{
  name: 'Nouveau produit',
  price: 99.99
}
```

---

## 📥 Données reçues par le Frontend du Service

### 1. **Aucune donnée directe de Sorikama**

Le frontend du service externe **ne reçoit RIEN directement de Sorikama**.

Le frontend communique uniquement avec :
- Son propre backend via le proxy Sorikama
- Sorikama pour l'authentification (login, token)

### 2. **Flux d'authentification**

```javascript
// Frontend Masebuy - Login via Sorikama
const loginResponse = await fetch('http://localhost:7000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const { token, user } = await loginResponse.json();

// Stocker le token
localStorage.setItem('token', token);
localStorage.setItem('user', JSON.stringify(user));

// Utiliser le token pour les requêtes
fetch('http://localhost:7000/api/v1/proxy/masebuy/products', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### 3. **Données utilisateur disponibles**

Le frontend a accès aux données utilisateur via :

```javascript
// Après login
const user = JSON.parse(localStorage.getItem('user'));

console.log(user);
// {
//   _id: '06bd7178-e841-42e9-a159-a1ca9df8204d',
//   email: 'user@example.com',
//   firstName: 'John',
//   lastName: 'Doe',
//   role: 'admin',
//   isActive: true,
//   isVerified: true
// }
```

---

## 🔐 Sécurité et Authentification

### 1. **Token JWT**

Le token contient :

```json
{
  "id": "06bd7178-e841-42e9-a159-a1ca9df8204d",
  "email": "user@example.com",
  "role": "admin",
  "iat": 1729857600,
  "exp": 1729944000
}
```

### 2. **Vérification côté Backend du Service**

Le backend du service peut :

**Option A : Faire confiance aux headers X-User-***
```javascript
// Backend Masebuy
app.get('/products', (req, res) => {
  const userId = req.headers['x-user-id'];
  const userEmail = req.headers['x-user-email'];
  const userRole = req.headers['x-user-role'];
  
  // Utiliser directement ces infos
  console.log(`Requête de ${userEmail} (${userRole})`);
});
```

**Option B : Vérifier le token JWT**
```javascript
// Backend Masebuy
const jwt = require('jsonwebtoken');

app.get('/products', (req, res) => {
  const token = req.headers.authorization?.substring(7);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('User ID:', decoded.id);
    console.log('User Email:', decoded.email);
  } catch (error) {
    return res.status(401).json({ error: 'Token invalide' });
  }
});
```

**Option C : Appeler Sorikama pour vérifier**
```javascript
// Backend Masebuy
app.get('/products', async (req, res) => {
  const token = req.headers.authorization;
  
  // Vérifier le token auprès de Sorikama
  const response = await fetch('http://localhost:7000/api/v1/auth/verify', {
    headers: { 'Authorization': token }
  });
  
  if (!response.ok) {
    return res.status(401).json({ error: 'Non autorisé' });
  }
  
  const user = await response.json();
  console.log('User vérifié:', user);
});
```

---

## 📊 Exemple Complet : Masebuy

### Configuration du service

```javascript
{
  name: 'Masebuy',
  slug: 'masebuy',
  frontendUrl: 'http://localhost:3001',
  backendUrl: 'http://localhost:4001',
  proxyPath: 'masebuy',
  enabled: true,
  requireAuth: true,
  allowedRoles: ['admin', 'user']
}
```

### Frontend Masebuy (React)

```javascript
// src/config.js
export const API_BASE_URL = 'http://localhost:7000/api/v1';
export const PROXY_PATH = '/proxy/masebuy';

// src/services/api.js
import axios from 'axios';
import { API_BASE_URL, PROXY_PATH } from '../config';

const api = axios.create({
  baseURL: `${API_BASE_URL}${PROXY_PATH}`
});

// Ajouter le token à chaque requête
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

// src/pages/Products.jsx
import api from '../services/api';

function Products() {
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    // Requête vers: http://localhost:7000/api/v1/proxy/masebuy/products
    // Proxiée vers: http://localhost:4001/products
    api.get('/products')
      .then(res => setProducts(res.data.products))
      .catch(err => console.error(err));
  }, []);
  
  return (
    <div>
      {products.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
}
```

### Backend Masebuy (Express)

```javascript
// server.js
const express = require('express');
const app = express();

app.use(express.json());

// Middleware pour logger les infos utilisateur
app.use((req, res, next) => {
  console.log('Headers reçus:', {
    proxiedBy: req.headers['x-proxied-by'],
    serviceName: req.headers['x-service-name'],
    userId: req.headers['x-user-id'],
    userEmail: req.headers['x-user-email'],
    userRole: req.headers['x-user-role']
  });
  next();
});

// Route products
app.get('/products', (req, res) => {
  const userRole = req.headers['x-user-role'];
  
  // Filtrer selon le rôle
  let products = [
    { id: 1, name: 'Product 1', price: 10 },
    { id: 2, name: 'Product 2', price: 20 }
  ];
  
  if (userRole === 'admin') {
    // Les admins voient les prix d'achat
    products = products.map(p => ({
      ...p,
      costPrice: p.price * 0.6
    }));
  }
  
  res.json({
    success: true,
    products
  });
});

app.listen(4001, () => {
  console.log('Masebuy Backend sur port 4001');
});
```

---

## 🎯 Résumé

### Ce que Sorikama envoie au Backend du Service

✅ **Headers HTTP** :
- `X-Proxied-By`: Identifiant Sorikama
- `X-Service-Name`: Nom du service
- `X-User-Id`: ID utilisateur
- `X-User-Email`: Email utilisateur
- `X-User-Role`: Rôle utilisateur
- `Authorization`: Token JWT

✅ **Body de la requête** : Transféré tel quel

✅ **Query params** : Transférés tels quels

### Ce que Sorikama envoie au Frontend du Service

❌ **RIEN directement**

Le frontend :
- S'authentifie auprès de Sorikama (login)
- Reçoit un token JWT
- Utilise ce token pour toutes les requêtes
- Communique avec son backend via le proxy

### Avantages du système

✅ **Authentification centralisée** : Un seul token pour tous les services
✅ **Pas de CORS** : Tout passe par le même domaine
✅ **Sécurité** : Vérification des rôles par Sorikama
✅ **Traçabilité** : Logs de toutes les requêtes
✅ **Simplicité** : Les services n'ont pas besoin de gérer l'auth

**Le proxy Sorikama est un reverse proxy intelligent avec auth centralisée ! 🚀**
