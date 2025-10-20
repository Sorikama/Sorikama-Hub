# 🧪 Guide de Test - Système d'Authentification avec Vérification Email

## 🚀 **Démarrage**

### 1. Lancer les Services
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### 2. Accès
- **Frontend** : http://localhost:5173
- **Backend** : http://localhost:7000

## 📧 **Test Complet d'Inscription avec Email**

### **Étape 1 : Inscription**
1. Aller sur http://localhost:5173
2. Cliquer "S'inscrire"
3. Remplir le formulaire :
   ```
   Prénom: Test
   Nom: User  
   Email: test@example.com
   Mot de passe: password123
   Confirmer: password123
   ```
4. Cliquer "S'inscrire"

### **Étape 2 : Vérification Email**
1. **Page de vérification s'affiche automatiquement**
2. **Vérifier dans les logs backend** le code de vérification :
   ```bash
   # Dans le terminal backend, chercher :
   📧 Code de vérification pour test@example.com: 123456
   ```
3. **Saisir le code** dans l'interface (6 chiffres)
4. Cliquer "Vérifier le code"

### **Étape 3 : Connexion Réussie**
- ✅ Toast "Compte vérifié avec succès !"
- ✅ Redirection vers `/services`
- ✅ API Key générée automatiquement
- ✅ Indicateur vert dans la navbar

## 🔧 **Tests d'Erreurs**

### **Code Invalide**
1. Saisir un mauvais code (ex: 000000)
2. **Vérifier** : Message d'erreur affiché
3. **Vérifier** : Toast d'erreur rouge

### **Code Expiré**
1. Attendre 10 minutes (ou modifier en backend)
2. Essayer de vérifier
3. **Vérifier** : "Code expiré" affiché

### **Renvoi de Code**
1. Cliquer "Renvoyer le code"
2. **Vérifier** : Toast "Code renvoyé !"
3. **Vérifier** : Cooldown de 60 secondes
4. **Vérifier** : Nouveau code dans les logs backend

## 🎯 **Fonctionnalités à Tester**

### **Interface de Vérification**
- ✅ Email affiché correctement
- ✅ Input accepte seulement les chiffres
- ✅ Bouton désactivé si code incomplet
- ✅ Animation de chargement
- ✅ Messages d'erreur clairs

### **Système de Toast**
- ✅ Toast de succès (vert)
- ✅ Toast d'erreur (rouge)  
- ✅ Auto-fermeture après 5 secondes
- ✅ Bouton de fermeture manuelle

### **Gestion d'État**
- ✅ Retour à l'inscription possible
- ✅ Modification d'email possible
- ✅ Cooldown de renvoi fonctionnel

## 🔍 **Vérifications Backend**

### **Logs à Surveiller**
```bash
# Code de vérification généré
📧 Code de vérification pour test@example.com: 123456

# Tentative de vérification
🔍 Vérification du code pour: test@example.com

# Succès
✅ Compte vérifié: test@example.com

# Erreur
❌ Code invalide pour: test@example.com
```

### **Base de Données**
```javascript
// Vérifier dans MongoDB
db.users.findOne({email: "test@example.com"})

// Champs à vérifier :
{
  isVerified: true,
  verificationCode: null,
  verificationExpires: null,
  apiKey: "sk_...",
  createdAt: Date,
  updatedAt: Date
}
```

## 🛠️ **Debug et Dépannage**

### **Console DevTools**
```javascript
// Vérifier le localStorage
localStorage.getItem('token')      // JWT Token
localStorage.getItem('userApiKey') // API Key
localStorage.getItem('user')       // Données utilisateur

// Vérifier les requêtes réseau
// Network tab → Voir les appels API
```

### **Composant AuthTest**
- Coin bas-droite de l'écran
- Boutons de test rapide
- Statut d'authentification en temps réel

### **Erreurs Communes**

**"Email déjà utilisé"**
- Utiliser un autre email
- Ou supprimer l'utilisateur en base

**"Code non reçu"**
- Vérifier les logs backend
- Le code s'affiche dans la console

**"Token invalide"**
- Vérifier l'API Key dans .env
- Redémarrer le backend

## 📱 **Test Mobile/Responsive**

1. Ouvrir DevTools (F12)
2. Mode responsive
3. Tester sur différentes tailles
4. Vérifier l'interface de vérification

## ✅ **Checklist Complète**

### Inscription
- [ ] Formulaire validation côté client
- [ ] Messages d'erreur appropriés
- [ ] Redirection vers vérification

### Vérification Email  
- [ ] Code généré et loggé
- [ ] Interface claire et intuitive
- [ ] Validation du format (6 chiffres)
- [ ] Gestion des erreurs
- [ ] Renvoi de code fonctionnel
- [ ] Cooldown respecté

### Post-Vérification
- [ ] API Key générée
- [ ] JWT Token créé
- [ ] Redirection vers services
- [ ] Toasts de confirmation
- [ ] État d'authentification correct

### Sécurité
- [ ] Code expire après 10 minutes
- [ ] Limite de tentatives
- [ ] Nettoyage après succès
- [ ] Headers sécurisés

**🎯 Commencer par l'inscription puis suivre le flux complet !**