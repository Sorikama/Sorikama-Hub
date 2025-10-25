# 🔧 Guide de Dépannage

## ❌ Erreurs courantes et solutions

### 1. ERR_CONNECTION_REFUSED (Backend)

**Erreur :**
```
GET http://localhost:7000/api/v1/authorize/service/XXX net::ERR_CONNECTION_REFUSED
```

**Cause :** Le backend n'est pas démarré

**Solution :**
```bash
cd backend
npm run dev
```

**Vérification :**
```bash
# Le backend devrait afficher :
✅ MongoDB connecté
✅ Serveur HTTP démarré - Port 7000
```

---

### 2. MongoDB Connection Timeout

**Erreur :**
```
Server selection timed out after 30000 ms
```

**Cause :** MongoDB n'est pas démarré

**Solution Windows :**
```bash
# Démarrer MongoDB
mongod --dbpath C:\data\db

# Ou si installé comme service
net start MongoDB
```

**Solution Mac/Linux :**
```bash
# Démarrer MongoDB
mongod --dbpath ./data/db

# Ou avec brew (Mac)
brew services start mongodb-community
```

**Vérification :**
```bash
# Tester la connexion
mongosh
# Si ça se connecte, MongoDB fonctionne ✅
```

---

### 3. Mongoose strictQuery Warning

**Warning :**
```
DeprecationWarning: Mongoose: the `strictQuery` option will be switched back to `false`
```

**Solution :** ✅ Déjà corrigé dans `backend/src/database/connexion.ts`

```typescript
mongoose.set('strictQuery', false);
```

---

### 4. React Router Future Flags

**Warning :**
```
React Router Future Flag Warning: v7_startTransition
React Router Future Flag Warning: v7_relativeSplatPath
```

**Solution :** Ajouter les flags dans `App.jsx`

```jsx
<BrowserRouter
  future={{
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }}
>
  {/* ... */}
</BrowserRouter>
```

---

## 🚀 Démarrage complet du projet

### Étape 1: Démarrer MongoDB

```bash
# Windows
mongod --dbpath C:\data\db

# Mac/Linux
mongod --dbpath ./data/db
```

**Vérifier :**
```bash
mongosh
# Devrait se connecter sans erreur
```

### Étape 2: Démarrer le Backend

```bash
cd backend
npm run dev
```

**Logs attendus :**
```
╔══════════════════════════════════════════════════════════╗
║              SORIKAMA HUB - API GATEWAY                  ║
║                    Version 1.0.0                         ║
╚══════════════════════════════════════════════════════════╝

[INFO] Port prêt (success) - Port 7000
[INFO] Redis démarré avec succès (success) - Port 6379
[INFO] MongoDB connecté (success)
[INFO] Compte admin prêt (success) - admin@admin.fr
[INFO] Permissions & rôles prêts (success) - 45 permissions, 3 rôles
[INFO] Services externes prêts (success) - 2 service(s) disponible(s)
[INFO] Serveur HTTP démarré (success) - Port 7000

╔══════════════════════════════════════════════════════════╗
║                  🚀 DÉMARRAGE RÉUSSI                     ║
╠══════════════════════════════════════════════════════════╣
║  🌐 Portail Admin: http://localhost:7000/portal/login   ║
║  📚 Documentation: http://localhost:7000/api-docs        ║
║  🔧 API Gateway:   http://localhost:7000/api/v1          ║
╚══════════════════════════════════════════════════════════╝
```

### Étape 3: Démarrer le Frontend

```bash
cd frontend
npm run dev
```

**Logs attendus :**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### Étape 4: Tester

1. **Ouvrir** `http://localhost:5173`
2. **Se connecter** avec `admin@admin.fr` / `Admin@123`
3. **Aller sur** `/admin/services`
4. **Copier l'ID** du service Masebuy
5. **Tester** l'autorisation :
```
http://localhost:5173/authorize?service_id=VOTRE_ID&redirect_url=http://localhost:3001/callback
```

---

## 🔍 Vérifications rapides

### Backend fonctionne ?

```bash
curl http://localhost:7000/api/v1/system/health
```

**Réponse attendue :**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-10-25T..."
  }
}
```

### MongoDB fonctionne ?

```bash
mongosh
use sorikama_gateway
db.services.find()
```

**Devrait afficher les services (Masebuy, Demo)**

### Frontend fonctionne ?

Ouvrir `http://localhost:5173` dans le navigateur

**Devrait afficher la page d'accueil**

---

## 🐛 Debugging

### Logs Backend

```bash
# Voir les logs en temps réel
cd backend
npm run dev

# Les logs sont aussi dans :
backend/logs/combined.log
backend/logs/error.log
```

### Logs Frontend

Ouvrir la console du navigateur (F12)

**Logs utiles :**
```
✅ Utilisateur trouvé en cache: admin@admin.fr
📡 GET /authorize/service/XXX {hasJWT: true}
```

### MongoDB

```bash
# Voir les collections
mongosh
use sorikama_gateway
show collections

# Voir les services
db.services.find().pretty()

# Voir les autorisations
db.serviceauthorizations.find().pretty()
```

---

## 🆘 Problèmes persistants

### Reset complet

```bash
# 1. Arrêter tout
# Ctrl+C dans tous les terminaux

# 2. Nettoyer MongoDB
mongosh
use sorikama_gateway
db.dropDatabase()
exit

# 3. Nettoyer node_modules
cd backend
rm -rf node_modules
npm install

cd ../frontend
rm -rf node_modules
npm install

# 4. Redémarrer
# Terminal 1: MongoDB
mongod --dbpath ./data/db

# Terminal 2: Backend
cd backend
npm run dev

# Terminal 3: Frontend
cd frontend
npm run dev
```

### Ports déjà utilisés

```bash
# Windows - Tuer le processus sur le port 7000
netstat -ano | findstr :7000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:7000 | xargs kill -9
```

---

## ✅ Checklist de démarrage

- [ ] MongoDB démarré (`mongod`)
- [ ] Backend démarré (`npm run dev`)
- [ ] Frontend démarré (`npm run dev`)
- [ ] Pas d'erreurs dans les logs
- [ ] `http://localhost:7000/api/v1/system/health` répond
- [ ] `http://localhost:5173` s'affiche
- [ ] Connexion avec `admin@admin.fr` fonctionne
- [ ] Services visibles dans `/admin/services`

**Tout fonctionne ! 🎉**
