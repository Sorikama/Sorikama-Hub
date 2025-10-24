# 🎉 Guide d'Utilisation des Toasts

## Introduction

Le système de toasts permet d'afficher des notifications élégantes et animées à l'utilisateur. Il est déjà intégré dans toute l'application et prêt à l'emploi.

## Utilisation de Base

### 1. Importer le hook

```jsx
import { useToast } from '../context/ToastContext';
```

### 2. Utiliser dans un composant

```jsx
function MonComposant() {
  const toast = useToast();
  
  const handleAction = () => {
    // Afficher un toast de succès
    toast.success('Action réussie !');
  };
  
  return <button onClick={handleAction}>Cliquer</button>;
}
```

## Types de Toasts

### ✅ Success (Succès)

```jsx
toast.success('Opération réussie !');
toast.success('Profil mis à jour', 3000); // Durée personnalisée
```

### ❌ Error (Erreur)

```jsx
toast.error('Une erreur est survenue');
toast.error('Connexion échouée', 5000);
```

### ℹ️ Info (Information)

```jsx
toast.info('Nouvelle fonctionnalité disponible');
toast.info('Chargement en cours...', 0); // Toast permanent (durée = 0)
```

### ⚠️ Warning (Avertissement)

```jsx
toast.warning('Attention : action irréversible');
toast.warning('Session expire dans 5 minutes');
```

## Paramètres

### Message
Le texte à afficher dans le toast.

```jsx
toast.success('Votre message ici');
```

### Durée (optionnel)
Durée d'affichage en millisecondes. Par défaut : 5000ms (5 secondes).

```jsx
toast.success('Message court', 2000);  // 2 secondes
toast.info('Message long', 10000);     // 10 secondes
toast.warning('Permanent', 0);         // Ne se ferme pas automatiquement
```

## Exemples d'Utilisation

### Dans un formulaire

```jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    await api.post('/data', formData);
    toast.success('Données enregistrées avec succès !');
  } catch (error) {
    toast.error(error.message || 'Erreur lors de l\'enregistrement');
  }
};
```

### Avec async/await

```jsx
const deleteItem = async (id) => {
  try {
    toast.info('Suppression en cours...');
    await api.delete(`/items/${id}`);
    toast.success('Élément supprimé !');
  } catch (error) {
    toast.error('Impossible de supprimer l\'élément');
  }
};
```

### Avec des conditions

```jsx
const validateForm = () => {
  if (!email) {
    toast.warning('Veuillez saisir votre email');
    return false;
  }
  
  if (!password || password.length < 8) {
    toast.error('Le mot de passe doit contenir au moins 8 caractères');
    return false;
  }
  
  return true;
};
```

### Messages personnalisés

```jsx
// Message avec nom d'utilisateur
toast.success(`Bienvenue ${user.firstName} !`);

// Message avec détails
toast.error(`Échec de connexion : ${error.response?.data?.message}`);

// Message avec emoji
toast.success('🎉 Inscription réussie !');
```

## Bonnes Pratiques

### ✅ À FAIRE

- Utiliser des messages clairs et concis
- Choisir le bon type de toast selon le contexte
- Donner un feedback immédiat après une action
- Utiliser des durées appropriées (courts pour succès, plus longs pour erreurs)

```jsx
// ✅ Bon
toast.success('Profil mis à jour');
toast.error('Email invalide');

// ✅ Très bon - avec contexte
toast.success('Votre photo de profil a été mise à jour');
toast.error('Impossible de se connecter. Vérifiez vos identifiants.');
```

### ❌ À ÉVITER

- Messages trop longs ou techniques
- Trop de toasts en même temps
- Toasts permanents pour des actions simples
- Messages génériques sans contexte

```jsx
// ❌ Mauvais
toast.error('Error');
toast.success('OK');

// ❌ Trop long
toast.info('Votre demande a été prise en compte et sera traitée dans les plus brefs délais par notre équipe qui vous contactera par email dès que possible...');
```

## Intégration Automatique

Les toasts sont déjà intégrés dans :

- ✅ **Inscription** : Confirmation d'envoi du code
- ✅ **Vérification** : Bienvenue après création du compte
- ✅ **Connexion** : Message de bienvenue
- ✅ **Déconnexion** : Confirmation de déconnexion
- ✅ **Mise à jour profil** : Confirmation de sauvegarde
- ✅ **Régénération API Key** : Confirmation de régénération

## Personnalisation Avancée

### Méthode générique

```jsx
const toast = useToast();

// Utiliser la méthode addToast pour plus de contrôle
toast.addToast('Message personnalisé', 'success', 7000);
```

### Fermeture manuelle

```jsx
// Les toasts se ferment automatiquement
// L'utilisateur peut aussi cliquer sur le bouton X
```

## Design

Les toasts sont :
- 🎨 **Stylés** avec des dégradés de couleurs
- ✨ **Animés** avec des transitions fluides
- 📱 **Responsives** et adaptés mobile
- ♿ **Accessibles** avec ARIA labels
- 🎯 **Positionnés** en haut à droite de l'écran

## Support

Pour toute question ou problème, consultez :
- Le code source : `frontend/src/context/ToastContext.jsx`
- Le composant : `frontend/src/components/Toast.jsx`
- Le conteneur : `frontend/src/components/ToastContainer.jsx`
