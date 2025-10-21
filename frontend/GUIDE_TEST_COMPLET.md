# 🧪 Guide de Test Complet - Frontend Sorikama Hub

## 📋 Prérequis

### 1. Vérification Backend
```bash
# Dans le dossier backend
cd backend
npm run dev

# Vérifier que le serveur démarre sur le port 7000
# Logs attendus :
# ✅ Redis démarré avec succès
# ✅ MongoDB connecté  
# ✅ Serveur HTTP démarré - Port 7000
```

### 2. Vérification Frontend
```bash
# Dans le dossier frontend
cd frontend
npm install
npm run dev

# Le serveur Vite démarre généralement sur le port 5173
```

### 3. Variables d'environnement
Vérifier le fichier `frontend/.env` :
```env
VITE_API_GATEWAY_URL=http://localhost:7000/api/v1
VITE_API_KEY=sk_59105e8b548140fe11e8bad8db2572f174a6266fe4b3c4ab
```

## 🔄 Tests du Processus d'Authentification

### Test 1 : Inscription Complète (2 étapes)

#### Étape 1A : Formulaire d'inscription
1. **Aller sur** : `http://localhost:5173/signup`
2. **Remplir le formulaire** :
   - Prénom : `Jean`
   - Nom : `Dupont`
   - Email : `jean.dupont@test.com`
   - Mot de passe : `Password123!`
3. **Cliquer** : "Créer le compte"

#### Vérifications Étape 1A :
- ✅ **Console navigateur** : `📝 Demande d'inscription pour: jean.dupont@test.com`
- ✅ **Console backend** : `🔑 API Key requise pour: /auth/register`
- ✅ **Interface** : Passage automatique à l'étape de vérification
- ✅ **Email** : Code de vérification reçu (vérifier les logs backend)

#### Étape 1B : Vérification du code
1. **Récupérer le code** dans les logs backend :
   ```
   Code de vérification généré: 123456
   ```
2. **Saisir le code** dans le champ (6 chiffres)
3. **Cliquer** : "Vérifier"

#### Vérifications Étape 1B :
- ✅ **Console navigateur** : `🔍 Vérification du code...`
- ✅ **Console navigateur** : `✅ Compte créé et utilisateur connecté`
- ✅ **Redirection** : Vers `/profile`
- ✅ **LocalStorage** : 4 clés sauvegardées
- ✅ **Navbar** : Affichage "Bonjour, Jean"

### Test 2 : Vérification du Profil

#### Actions :
1. **Vérifier l'affichage** du profil utilisateur
2. **Noter l'API Key** générée (format `uk_...`)
3. **Tester la modification** du prénom/nom
4. **Tester la régénération** de l'API Key

#### Vérifications :
- ✅ **Données affichées** : Prénom, nom, email, API Key
- ✅ **API Key format** : Commence par `uk_`
- ✅ **Modification profil** : Sauvegarde et mise à jour
- ✅ **Régénération API Key** : Nouvelle clé générée

### Test 3 : Déconnexion/Reconnexion

#### Actions :
1. **Cliquer** : "Déconnexion" dans la navbar
2. **Vérifier** : Redirection vers l'accueil
3. **Aller sur** : `/login`
4. **Se reconnecter** avec les mêmes identifiants

#### Vérifications :
- ✅ **Déconnexion** : LocalStorage vidé
- ✅ **Navbar** : Retour aux boutons Connexion/Inscription
- ✅ **Reconnexion** : Succès avec redirection vers profil
- ✅ **API Key** : Même clé récupérée

## 🔍 Tests des Fonctionnalités Avancées

### Test 4 : Gestion des Erreurs

#### Test 4A : Email déjà utilisé
1. **Essayer de s'inscrire** avec le même email
2. **Vérifier** : Message d'erreur approprié

#### Test 4B : Code de vérification incorrect
1. **S'inscrire** avec un nouvel email
2. **Saisir un mauvais code** (ex: 000000)
3. **Vérifier** : Message d'erreur

#### Test 4C : Identifiants incorrects
1. **Essayer de se connecter** avec un mauvais mot de passe
2. **Vérifier** : Message d'erreur

### Test 5 : Protection des Routes

#### Actions :
1. **Se déconnecter**
2. **Essayer d'accéder** à `/profile` directement
3. **Vérifier** : Redirection vers `/login`
4. **Se reconnecter**
5. **Vérifier** : Redirection automatique vers `/profile`

### Test 6 : Refresh Token Automatique

#### Actions (Test avancé) :
1. **Se connecter**
2. **Ouvrir DevTools** → Application → Local Storage
3. **Modifier manuellement** l'access token (le corrompre)
4. **Faire une action** nécessitant l'authentification
5. **Vérifier** : Token renouvelé automatiquement

## 🌐 Tests de l'Interface

### Test 7 : Navigation

#### Actions :
1. **Tester tous les liens** de la navbar
2. **Vérifier les redirections** appropriées
3. **Tester le responsive** (mobile/desktop)

### Test 8 : État du Système

#### Actions :
1. **Aller sur** la page d'accueil
2. **Vérifier** : Affichage de l'état du système
3. **Vérifier** : Informations utilisateur si connecté

## 🔧 Tests Techniques

### Test 9 : Console et Logs

#### Vérifications Console Navigateur :
```javascript
// Logs attendus lors de l'inscription
📝 Demande d'inscription pour: email@test.com
✅ Code de vérification envoyé
🔍 Vérification du code d'inscription...
✅ Compte créé et utilisateur connecté

// Logs attendus lors de la connexion
🚪 Tentative de connexion pour: email@test.com
✅ Connexion réussie

// Logs attendus pour les requêtes API
🔑 Requête API: POST /auth/register
🔑 Requête API: POST /auth/verify
```

### Test 10 : LocalStorage

#### Vérifications DevTools :
```javascript
// Clés présentes après connexion
sorikama_access_token: "eyJhbGciOiJIUzI1NiIs..."
sorikama_refresh_token: "uuid-v4-token"
sorikama_user: "{\"_id\":\"...\",\"firstName\":\"Jean\"...}"
sorikama_user_api_key: "uk_a1b2c3d4e5f6..."
```

## 🚨 Résolution des Problèmes

### Problème 1 : "API key requise"
**Solution** : Vérifier le fichier `.env` et redémarrer le serveur frontend

### Problème 2 : "CORS Error"
**Solution** : Vérifier que le backend est démarré sur le port 7000

### Problème 3 : "Code de vérification invalide"
**Solution** : Récupérer le code dans les logs backend (console serveur)

### Problème 4 : "Token d'authentification requis"
**Solution** : Se reconnecter ou vider le localStorage

### Problème 5 : Page blanche
**Solution** : Vérifier la console pour les erreurs JavaScript

## ✅ Checklist de Validation

### Fonctionnalités Core :
- [ ] Inscription en 2 étapes fonctionne
- [ ] Connexion/déconnexion fonctionne
- [ ] Profil utilisateur accessible
- [ ] API Key générée automatiquement
- [ ] Protection des routes active
- [ ] Refresh token automatique

### Interface Utilisateur :
- [ ] Navigation fluide
- [ ] Messages d'erreur clairs
- [ ] Design responsive
- [ ] Animations et transitions
- [ ] État de chargement visible

### Sécurité :
- [ ] API Key obligatoire pour toutes les requêtes
- [ ] JWT Token pour routes protégées
- [ ] Tokens stockés sécurisement
- [ ] Déconnexion nettoie le stockage
- [ ] Gestion des erreurs appropriée

## 📊 Métriques de Performance

### Temps de Réponse Attendus :
- **Inscription** : < 2 secondes
- **Connexion** : < 1 seconde
- **Chargement profil** : < 500ms
- **Régénération API Key** : < 1 seconde

### Taille des Bundles :
- **JavaScript** : < 500KB (gzippé)
- **CSS** : < 50KB (gzippé)
- **Images** : Optimisées

## 🎯 Tests de Charge (Optionnel)

### Test Simple :
1. **Ouvrir 5 onglets** avec l'application
2. **Se connecter** sur chacun
3. **Vérifier** : Pas de conflits de session

### Test API :
1. **Faire plusieurs requêtes** simultanées
2. **Vérifier** : Rate limiting respecté
3. **Vérifier** : Pas d'erreurs 429

---

**🎉 Si tous les tests passent, le frontend est prêt pour la production !**