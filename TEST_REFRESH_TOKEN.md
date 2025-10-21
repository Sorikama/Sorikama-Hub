# Test du Système de Refresh Token Automatique

## 📋 Résumé des Corrections

### 1. **Frontend - Système déjà implémenté** ✅
Le fichier `frontend/src/services/api.js` contient déjà un intercepteur de réponse qui :
- Détecte les erreurs 401 (token expiré)
- Appelle automatiquement l'endpoint `/auth/refresh-token`
- Sauvegarde les nouveaux tokens
- Rejoue la requête originale avec le nouveau token
- Redirige vers `/login` si le refresh échoue

### 2. **Backend - Correction appliquée** ✅
**Problème identifié :** Le controller `refreshToken` récupérait TOUS les tokens en mémoire puis comparait, ce qui était inefficace et ne fonctionnait pas correctement avec le chiffrement.

**Solution appliquée :**
```typescript
// AVANT (inefficace et bugué)
const allTokens = await RefreshTokenModel.find({});
const storedToken = allTokens.find(t => t.token === refreshToken);

// APRÈS (efficace et correct)
const encryptedToken = encrypt(refreshToken);
const storedToken = await RefreshTokenModel.findOne({ token: encryptedToken });
```

### 3. **Configuration** ✅
- L'endpoint `/auth/refresh-token` est bien dans les routes publiques
- Pas besoin de JWT pour appeler le refresh (seulement l'API Key)
- Le refresh token est stocké chiffré en base de données

## 🧪 Comment Tester

### Test Manuel

1. **Connectez-vous à l'application**
   ```
   Email: votre@email.com
   Password: votre_mot_de_passe
   ```

2. **Ouvrez les DevTools du navigateur** (F12)
   - Allez dans l'onglet "Console"
   - Vous verrez les logs de l'API

3. **Attendez que l'access token expire** (15 minutes par défaut)
   OU forcez l'expiration en modifiant le token dans localStorage :
   ```javascript
   // Dans la console du navigateur
   localStorage.setItem('sorikama_access_token', 'token_invalide');
   ```

4. **Faites une action qui nécessite l'authentification**
   - Allez sur votre profil
   - Essayez de modifier vos informations
   - Naviguez vers le dashboard

5. **Observez les logs dans la console**
   Vous devriez voir :
   ```
   ❌ Erreur 401 détectée
   🔄 Tentative de renouvellement du token...
   ✅ Token renouvelé avec succès
   📡 Requête rejouée avec le nouveau token
   ```

### Test Automatique avec Script

Créez un fichier `test-refresh.html` :

```html
<!DOCTYPE html>
<html>
<head>
    <title>Test Refresh Token</title>
</head>
<body>
    <h1>Test du Refresh Token</h1>
    <button onclick="testRefresh()">Tester le Refresh</button>
    <pre id="result"></pre>

    <script>
        async function testRefresh() {
            const result = document.getElementById('result');
            
            try {
                // 1. Connexion
                result.textContent = '1. Connexion...\n';
                const loginRes = await fetch('http://localhost:3000/api/v1/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-API-Key': 'VOTRE_API_KEY_SYSTEME'
                    },
                    body: JSON.stringify({
                        email: 'test@example.com',
                        password: 'Test1234!'
                    })
                });
                
                const loginData = await loginRes.json();
                const { accessToken, refreshToken } = loginData.data.tokens;
                result.textContent += '✅ Connexion réussie\n\n';
                
                // 2. Simuler un token expiré
                result.textContent += '2. Simulation token expiré...\n';
                const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid';
                
                // 3. Tenter une requête avec le faux token
                result.textContent += '3. Requête avec token invalide...\n';
                const profileRes = await fetch('http://localhost:3000/api/v1/auth/me', {
                    headers: {
                        'Authorization': `Bearer ${fakeToken}`,
                        'X-API-Key': 'VOTRE_API_KEY_UTILISATEUR'
                    }
                });
                
                result.textContent += `Status: ${profileRes.status}\n`;
                
                if (profileRes.status === 401) {
                    result.textContent += '✅ 401 détecté (normal)\n\n';
                    
                    // 4. Appeler le refresh
                    result.textContent += '4. Appel du refresh token...\n';
                    const refreshRes = await fetch('http://localhost:3000/api/v1/auth/refresh-token', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-API-Key': 'VOTRE_API_KEY_SYSTEME'
                        },
                        body: JSON.stringify({ refreshToken })
                    });
                    
                    const refreshData = await refreshRes.json();
                    
                    if (refreshRes.ok) {
                        result.textContent += '✅ Refresh réussi!\n';
                        result.textContent += `Nouveau access token: ${refreshData.data.tokens.accessToken.substring(0, 20)}...\n`;
                        result.textContent += `Nouveau refresh token: ${refreshData.data.tokens.refreshToken.substring(0, 20)}...\n`;
                    } else {
                        result.textContent += '❌ Échec du refresh\n';
                        result.textContent += JSON.stringify(refreshData, null, 2);
                    }
                }
                
            } catch (error) {
                result.textContent += '❌ Erreur: ' + error.message;
            }
        }
    </script>
</body>
</html>
```

## 🔍 Points de Vérification

### Dans le Frontend (`api.js`)
- ✅ Intercepteur de réponse configuré
- ✅ Détection des erreurs 401
- ✅ Flag `_retry` pour éviter les boucles infinies
- ✅ Sauvegarde des nouveaux tokens
- ✅ Rejeu de la requête originale

### Dans le Backend (`auth.controller.ts`)
- ✅ Chiffrement du token avant recherche
- ✅ Recherche directe en base (pas de récupération de tous les tokens)
- ✅ Vérification de l'expiration
- ✅ Génération de nouveaux tokens
- ✅ Suppression de l'ancien refresh token

### Configuration
- ✅ Route `/auth/refresh-token` dans les routes publiques
- ✅ Pas besoin de JWT pour le refresh
- ✅ API Key système ou utilisateur requise

## 📊 Flux Complet

```
1. Utilisateur fait une requête → Access Token expiré
                ↓
2. Intercepteur détecte 401
                ↓
3. Appel automatique /auth/refresh-token avec Refresh Token
                ↓
4. Backend vérifie le Refresh Token (chiffré)
                ↓
5. Backend génère nouveaux Access + Refresh Tokens
                ↓
6. Frontend sauvegarde les nouveaux tokens
                ↓
7. Frontend rejoue la requête originale avec nouveau Access Token
                ↓
8. Requête réussit ✅
```

## ⚠️ Cas d'Erreur

Si le refresh échoue :
- Le localStorage est nettoyé
- L'utilisateur est redirigé vers `/login`
- Un message d'erreur peut être affiché

## 🎯 Résultat Attendu

Avec ces corrections, le système de refresh token automatique devrait fonctionner parfaitement :
- ✅ Renouvellement transparent pour l'utilisateur
- ✅ Pas de déconnexion intempestive
- ✅ Sécurité maintenue (tokens chiffrés)
- ✅ Performance optimisée (recherche directe en base)
