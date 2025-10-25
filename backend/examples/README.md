# Exemples d'Intégration Sorikama Hub

Ce dossier contient des exemples de code pour intégrer vos services externes avec Sorikama Hub.

## 📁 Fichiers

### 1. `masebuy-backend-route.ts`
Route backend complète pour MaseBuy qui gère l'échange de code d'autorisation.

**À copier dans:** `masebuy-backend/src/routes/auth.routes.ts`

**Fonctionnalités:**
- ✅ Échange de code contre token JWT
- ✅ Validation du token
- ✅ Gestion des cookies HttpOnly
- ✅ Gestion des erreurs complète
- ✅ Route de vérification du token
- ✅ Route de déconnexion

### 2. `masebuy-frontend-config.ts`
Configuration et utilitaires pour le frontend MaseBuy.

**À copier dans:** `masebuy-frontend/src/config/sorikama.ts`

**Fonctionnalités:**
- ✅ Configuration centralisée
- ✅ Helpers d'authentification
- ✅ Instance Axios configurée
- ✅ Intercepteurs automatiques
- ✅ Gestion du localStorage

### 3. `masebuy-callback-component.tsx`
Composant React pour la page de callback SSO.

**À copier dans:** `masebuy-frontend/src/pages/auth/SorikamaCallback.tsx`

**Fonctionnalités:**
- ✅ Gestion du code d'autorisation
- ✅ Échange via le backend
- ✅ Validation du token
- ✅ UI avec états (loading, success, error)
- ✅ Redirection automatique
- ✅ Mode debug en développement

## 🚀 Guide d'Intégration Rapide

### Étape 1: Configuration Backend MaseBuy

1. Copier `masebuy-backend-route.ts` dans votre projet
2. Installer les dépendances:
```bash
npm install axios express
npm install -D @types/express
```

3. Ajouter les variables d'environnement:
```env
SORIKAMA_HUB_URL=http://localhost:7000/api/v1
SORIKAMA_SERVICE_SLUG=masebuy
NODE_ENV=development
```

4. Monter les routes dans votre app:
```typescript
import authRoutes from './routes/auth.routes';
app.use('/api', authRoutes);
```

### Étape 2: Configuration Frontend MaseBuy

1. Copier `masebuy-frontend-config.ts` dans votre projet
2. Copier `masebuy-callback-component.tsx` dans votre projet
3. Ajouter les variables d'environnement:
```env
VITE_SORIKAMA_HUB_URL=http://localhost:7000
VITE_API_URL=http://localhost:8000
VITE_SORIKAMA_CALLBACK_URL=http://localhost:3001/auth/callback
```

4. Ajouter la route dans votre router:
```typescript
import SorikamaCallback from './pages/auth/SorikamaCallback';

<Route path="/auth/callback" element={<SorikamaCallback />} />
```

### Étape 3: Page de Login

Modifier votre page de login pour rediriger vers Sorikama:

```typescript
import { getSorikamaAuthUrl } from '../config/sorikama';

const handleSorikamaLogin = () => {
  window.location.href = getSorikamaAuthUrl();
};

// Dans votre JSX
<button onClick={handleSorikamaLogin}>
  Se connecter avec Sorikama
</button>
```

## 🔐 Flux d'Authentification

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Frontend  │         │   Backend    │         │  Sorikama   │
│   MaseBuy   │         │   MaseBuy    │         │     Hub     │
└──────┬──────┘         └──────┬───────┘         └──────┬──────┘
       │                       │                        │
       │ 1. Redirect to        │                        │
       │    Sorikama           │                        │
       ├───────────────────────┼───────────────────────>│
       │                       │                        │
       │                       │                        │
       │ 2. User authorizes    │                        │
       │    (login + consent)  │                        │
       │                       │                        │
       │                       │                        │
       │ 3. Redirect with CODE │                        │
       │<──────────────────────┼────────────────────────┤
       │                       │                        │
       │                       │                        │
       │ 4. Send CODE to       │                        │
       │    backend            │                        │
       ├──────────────────────>│                        │
       │                       │                        │
       │                       │ 5. Exchange CODE       │
       │                       │    for TOKEN           │
       │                       ├───────────────────────>│
       │                       │                        │
       │                       │ 6. Return TOKEN + USER │
       │                       │<───────────────────────┤
       │                       │                        │
       │ 7. Return TOKEN + USER│                        │
       │<──────────────────────┤                        │
       │                       │                        │
       │ 8. Store & Redirect   │                        │
       │    to dashboard       │                        │
       │                       │                        │
```

## 🔒 Sécurité

### ✅ Ce qui est sécurisé

1. **Code temporaire**: Expire après 5 minutes
2. **Usage unique**: Le code ne peut être utilisé qu'une fois
3. **Échange côté serveur**: Le token ne transite jamais par l'URL
4. **Validation du domaine**: Sorikama vérifie le callback
5. **HttpOnly cookies**: Option pour stocker le token de manière sécurisée

### ⚠️ Recommandations

1. **HTTPS en production**: Toujours utiliser HTTPS
2. **Cookies HttpOnly**: Préférer les cookies au localStorage
3. **CORS strict**: Configurer CORS correctement
4. **Rate limiting**: Limiter les tentatives d'échange
5. **Logs**: Logger toutes les tentatives d'authentification

## 📚 Documentation Complète

Voir `MASEBUY_INTEGRATION.md` pour la documentation complète incluant:
- Format des données retournées
- Gestion des erreurs
- Configuration avancée
- Exemples de requêtes
- Troubleshooting

## 🧪 Test

### Test Manuel

1. Démarrer Sorikama Hub: `cd backend && npm run dev`
2. Démarrer MaseBuy Backend: `cd masebuy-backend && npm run dev`
3. Démarrer MaseBuy Frontend: `cd masebuy-frontend && npm run dev`
4. Ouvrir `http://localhost:3001/auth/login`
5. Cliquer sur "Se connecter avec Sorikama"
6. Autoriser l'accès
7. Vérifier la redirection vers le dashboard

### Vérification

```bash
# Vérifier que le token est stocké
localStorage.getItem('sorikama_token')

# Vérifier les données utilisateur
localStorage.getItem('sorikama_user')

# Décoder le token (dans la console)
JSON.parse(atob(token.split('.')[1]))
```

## 🐛 Troubleshooting

### Erreur: "Code d'autorisation invalide ou expiré"
- Le code expire après 5 minutes
- Le code ne peut être utilisé qu'une fois
- Recommencer le processus d'autorisation

### Erreur: "URL de callback non autorisée"
- Vérifier que l'URL de callback correspond au domaine enregistré
- Vérifier la configuration du service dans Sorikama

### Erreur: "Token non valide pour ce service"
- Vérifier que le slug du service est correct
- Vérifier que le token n'a pas été modifié

### Erreur: "Sorikama Hub est indisponible"
- Vérifier que Sorikama Hub est démarré
- Vérifier l'URL dans les variables d'environnement
- Vérifier la connectivité réseau

## 📞 Support

Pour toute question ou problème:
1. Consulter la documentation complète
2. Vérifier les logs du backend
3. Activer le mode debug en développement
4. Contacter l'équipe Sorikama
