# 🔄 Proxy Sorikama - Explication Simple

## 🎯 En résumé

### Le proxy Sorikama est comme un **portier intelligent** :

1. **Reçoit** les requêtes du frontend
2. **Vérifie** l'identité (token JWT)
3. **Ajoute** des informations sur l'utilisateur
4. **Transfère** vers le bon backend
5. **Retourne** la réponse au frontend

---

## 📊 Schéma Simple

```
Frontend Masebuy                 Sorikama Hub                Backend Masebuy
(localhost:3001)                 (localhost:7000)            (localhost:4001)
     │                                 │                           │
     │  1. GET /products               │                           │
     │  + Token JWT                    │                           │
     ├────────────────────────────────>│                           │
     │                                 │                           │
     │                                 │  2. Vérifie le token      │
     │                                 │  3. Charge l'utilisateur  │
     │                                 │  4. Ajoute X-User-*       │
     │                                 │                           │
     │                                 │  5. GET /products         │
     │                                 │  + Token JWT              │
     │                                 │  + X-User-Id              │
     │                                 │  + X-User-Email           │
     │                                 │  + X-User-Role            │
     │                                 ├──────────────────────────>│
     │                                 │                           │
     │                                 │                           │  6. Traite
     │                                 │                           │     la requête
     │                                 │                           │
     │                                 │  7. Response: { products }│
     │                                 │<──────────────────────────┤
     │                                 │                           │
     │  8. Response: { products }      │                           │
     │<────────────────────────────────┤                           │
     │                                 │                           │
```

---

## 🔑 Données échangées

### 1️⃣ Frontend → Sorikama

```javascript
fetch('http://localhost:7000/api/v1/proxy/masebuy/products', {
  headers: {
    'Authorization': 'Bearer eyJhbGc...'
  }
})
```

**Données envoyées :**
- URL avec le proxyPath (`masebuy`)
- Token JWT dans le header Authorization

### 2️⃣ Sorikama → Backend du Service

```http
GET /products HTTP/1.1
Host: localhost:4001
Authorization: Bearer eyJhbGc...
X-User-Id: 06bd7178-e841-42e9-a159-a1ca9df8204d
X-User-Email: user@example.com
X-User-Role: admin
X-Proxied-By: Sorikama-Hub
X-Service-Name: Masebuy
```

**Données envoyées :**
- Token JWT original
- Informations utilisateur (ID, email, rôle)
- Métadonnées (service name, proxied by)

### 3️⃣ Backend du Service → Sorikama

```json
{
  "success": true,
  "products": [
    { "id": 1, "name": "Product 1" },
    { "id": 2, "name": "Product 2" }
  ]
}
```

**Données envoyées :**
- Réponse normale du backend

### 4️⃣ Sorikama → Frontend

```json
{
  "success": true,
  "products": [
    { "id": 1, "name": "Product 1" },
    { "id": 2, "name": "Product 2" }
  ]
}
```

**Données envoyées :**
- Même réponse que le backend (transparente)

---

## 💡 Questions fréquentes

### Q1: Le frontend du service reçoit-il des données de Sorikama ?

**Non**, le frontend ne reçoit RIEN directement de Sorikama.

Le frontend :
1. S'authentifie auprès de Sorikama (login)
2. Reçoit un token JWT
3. Utilise ce token pour toutes les requêtes
4. Communique avec son backend via le proxy

### Q2: Comment le backend du service sait qui est l'utilisateur ?

Via les headers `X-User-*` ajoutés par Sorikama :

```javascript
// Backend Masebuy
app.get('/products', (req, res) => {
  const userId = req.headers['x-user-id'];
  const userEmail = req.headers['x-user-email'];
  const userRole = req.headers['x-user-role'];
  
  console.log(`Requête de ${userEmail} (${userRole})`);
});
```

### Q3: Le backend du service doit-il vérifier le token ?

**Non obligatoire**, car Sorikama l'a déjà vérifié.

Mais il **peut** le faire pour plus de sécurité :

```javascript
const jwt = require('jsonwebtoken');

app.get('/products', (req, res) => {
  const token = req.headers.authorization?.substring(7);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Token valide
  } catch (error) {
    return res.status(401).json({ error: 'Token invalide' });
  }
});
```

### Q4: Que se passe-t-il si le service backend est hors ligne ?

Sorikama retourne une erreur 502 :

```json
{
  "success": false,
  "message": "Erreur de connexion au service",
  "service": "Masebuy"
}
```

### Q5: Comment ajouter un nouveau service ?

1. Aller sur `/admin/services`
2. Cliquer sur "Ajouter un service"
3. Remplir le formulaire
4. Le proxy est automatiquement configuré !

---

## 🎨 Exemple Concret

### Service Masebuy

**Configuration :**
```javascript
{
  name: 'Masebuy',
  frontendUrl: 'http://localhost:3001',
  backendUrl: 'http://localhost:4001',
  proxyPath: 'masebuy'
}
```

**Frontend (React) :**
```javascript
// Requête vers Sorikama
fetch('http://localhost:7000/api/v1/proxy/masebuy/products', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

**Backend (Express) :**
```javascript
// Reçoit la requête proxiée
app.get('/products', (req, res) => {
  // Lit les infos utilisateur
  const userRole = req.headers['x-user-role'];
  
  // Retourne les produits
  res.json({ products: [...] });
});
```

---

## 🎯 Avantages

✅ **Un seul token** pour tous les services
✅ **Pas de CORS** (même domaine)
✅ **Authentification centralisée**
✅ **Logs centralisés**
✅ **Sécurité renforcée**
✅ **Configuration dynamique**

**C'est comme avoir un portier qui vérifie l'identité et guide chacun vers le bon service ! 🚪**
