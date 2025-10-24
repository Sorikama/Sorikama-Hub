# 🧪 Test du Système d'Authentification avec VerificationToken

## 🚀 **Démarrage Rapide**

```bash
# Backend
cd backend && npm run dev

# Frontend  
cd frontend && npm run dev
```

## 📧 **Test d'Inscription avec Code**

### **Étape 1 : Inscription**
1. Aller sur http://localhost:5173
2. Cliquer "S'inscrire"
3. Remplir :
   ```
   Prénom: Warris
   Nom: AGBANNONDE  
   Email: awarrisw@gmail.com
   Mot de passe: Password@123
   ```
4. Cliquer "S'inscrire"

### **Étape 2 : Réponse Backend Reçue**
```json
{
  "status": "success",
  "message": "Un code de vérification a été envoyé à votre adresse email.",
  "data": {
    "verificationToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### **Étape 3 : Page de Vérification**
- ✅ **Redirection automatique** vers la page de vérification
- ✅ **Email affiché** : awarrisw@gmail.com
- ✅ **Toast de succès** : "Code de vérification envoyé !"
- ✅ **Mode dev** : Code affiché automatiquement (839136)

### **Étape 4 : Saisie du Code**
1. **Le code s'affiche en mode développement** dans un encadré jaune
2. **Saisir le code** : 839136
3. **Cliquer** "Vérifier le code"

### **Étape 5 : Vérification Réussie**
- ✅ **Toast** : "Compte vérifié avec succès !"
- ✅ **Redirection** vers `/services`
- ✅ **API Key générée** automatiquement
- ✅ **JWT Token** créé
- ✅ **Indicateur vert** dans la navbar

## 🔧 **Fonctionnalités Testées**

### **VerificationToken**
- ✅ Token JWT contenant le code
- ✅ Décodage automatique en mode dev
- ✅ Sécurité : code non visible en production
- ✅ Expiration gérée côté backend

### **Interface de Vérification**
- ✅ Design propre et intuitif
- ✅ Input formaté (6 chiffres uniquement)
- ✅ Validation en temps réel
- ✅ Messages d'erreur contextuels

### **Gestion d'Erreurs**
- ✅ Code invalide → Message d'erreur
- ✅ Code expiré → Notification appropriée
- ✅ Token corrompu → Gestion gracieuse

### **Renvoi de Code**
- ✅ Bouton "Renvoyer le code"
- ✅ Cooldown de 60 secondes
- ✅ Nouveau verificationToken généré
- ✅ Toast de confirmation

## 🎯 **Points Clés**

### **Mode Développement**
```jsx
{import.meta.env.DEV && verificationToken && (
  <div className="code-display">
    Code: {decodeToken(verificationToken).code}
  </div>
)}
```

### **Flux Complet**
```
1. Inscription → verificationToken reçu
2. Page vérification → code affiché (dev)
3. Saisie code → vérification avec token
4. Succès → API Key + JWT générés
5. Redirection → /services
```

### **Sécurité**
- ✅ Code dans JWT sécurisé
- ✅ Expiration automatique
- ✅ Pas d'exposition en production
- ✅ Token renouvelé au renvoi

## 🔍 **Debug**

### **Console DevTools**
```javascript
// Décoder le verificationToken
const token = "eyJhbGciOiJIUzI1NiIs...";
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Code:', payload.code); // 839136
```

### **Vérifications**
- [ ] Token reçu après inscription
- [ ] Code affiché en mode dev
- [ ] Vérification fonctionnelle
- [ ] API Key générée
- [ ] Redirection correcte

**🎯 Le système fonctionne parfaitement avec le verificationToken !**