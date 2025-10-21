# Requirements Document - Système d'Authentification par API Key

## Introduction

Ce document définit les exigences pour la refonte complète du système d'authentification par API Key de Sorikama Hub. Le système actuel utilise une API Key système partagée, ce qui pose des problèmes de sécurité et de traçabilité. Le nouveau système utilisera exclusivement des API Keys personnelles pour chaque utilisateur, avec une clé admin spéciale créée au démarrage de l'application.

## Glossary

- **API Key**: Clé d'authentification unique permettant d'accéder aux services Sorikama
- **User API Key (uk_)**: Clé API personnelle générée pour chaque utilisateur lors de l'inscription
- **Admin API Key (ak_)**: Clé API spéciale créée au démarrage pour l'administrateur système
- **SimpleApiKeyModel**: Modèle de base de données stockant les informations des API Keys
- **Middleware**: Composant qui intercepte et valide les requêtes HTTP
- **Backend**: Serveur Node.js/Express gérant la logique métier
- **Frontend**: Application React communiquant avec le backend

## Requirements

### Requirement 1: Suppression de l'API Key Système

**User Story:** En tant qu'architecte système, je veux supprimer l'utilisation de l'API Key système partagée, afin d'améliorer la sécurité et la traçabilité des accès.

#### Acceptance Criteria

1. WHEN le frontend démarre, THE Frontend SHALL utiliser uniquement des API Keys utilisateur pour toutes les requêtes
2. WHEN une route publique est appelée (login, register), THE Frontend SHALL utiliser une API Key temporaire ou un mécanisme alternatif
3. THE Backend SHALL rejeter toute requête utilisant l'ancienne API Key système
4. THE Configuration SHALL supprimer la variable d'environnement VITE_API_KEY du frontend

### Requirement 2: Création Automatique de l'API Key Admin

**User Story:** En tant qu'administrateur système, je veux qu'une API Key admin unique soit créée automatiquement au démarrage de l'application, afin de pouvoir accéder à l'espace d'administration backend.

#### Acceptance Criteria

1. WHEN l'application backend démarre, THE Backend SHALL vérifier si un compte admin existe
2. IF aucun compte admin n'existe, THEN THE Backend SHALL créer un compte admin avec email et mot de passe par défaut
3. WHEN le compte admin est créé, THE Backend SHALL générer une API Key unique avec préfixe "ak_"
4. THE Backend SHALL stocker l'API Key admin dans la collection simple_api_keys avec permissions complètes
5. THE Backend SHALL logger la création de l'API Key admin avec les informations de connexion
6. IF un compte admin existe déjà, THEN THE Backend SHALL vérifier qu'il possède une API Key valide

### Requirement 3: Génération d'API Key à l'Inscription

**User Story:** En tant qu'utilisateur, je veux recevoir automatiquement une API Key personnelle lors de la validation de mon inscription, afin de pouvoir utiliser les services Sorikama.

#### Acceptance Criteria

1. WHEN un utilisateur valide son code de vérification, THE Backend SHALL générer une API Key unique avec préfixe "uk_"
2. THE Backend SHALL stocker l'API Key dans la collection simple_api_keys avec les informations suivantes:
   - keyId: la clé générée
   - userId: référence vers l'utilisateur
   - name: "User API Key - [Prénom] [Nom]"
   - description: description détaillée
   - permissions: permissions par défaut de l'utilisateur
   - isActive: true
   - expiresAt: null (pas d'expiration par défaut)
3. THE Backend SHALL stocker l'API Key dans le champ apiKey du document utilisateur
4. THE Backend SHALL retourner l'API Key dans la réponse de vérification avec les tokens JWT

### Requirement 4: Retour de l'API Key à la Connexion

**User Story:** En tant qu'utilisateur, je veux recevoir mon API Key lors de la connexion, afin de pouvoir l'utiliser pour mes requêtes authentifiées.

#### Acceptance Criteria

1. WHEN un utilisateur se connecte avec succès, THE Backend SHALL récupérer l'API Key de l'utilisateur depuis la base de données
2. IF l'utilisateur n'a pas d'API Key, THEN THE Backend SHALL en générer une automatiquement
3. THE Backend SHALL retourner l'API Key dans la réponse de connexion avec les données utilisateur et les tokens JWT
4. THE Frontend SHALL stocker l'API Key dans le localStorage avec la clé "sorikama_user_api_key"

### Requirement 5: Validation Complète des API Keys par le Middleware

**User Story:** En tant que système de sécurité, je veux valider complètement chaque API Key reçue, afin de garantir que seules les clés valides et autorisées peuvent accéder aux ressources.

#### Acceptance Criteria

1. WHEN une requête arrive avec une API Key, THE Middleware SHALL extraire l'API Key depuis les headers (X-API-Key ou Authorization)
2. THE Middleware SHALL vérifier que l'API Key existe dans la collection simple_api_keys
3. THE Middleware SHALL vérifier que l'API Key est active (isActive = true)
4. IF l'API Key a une date d'expiration, THEN THE Middleware SHALL vérifier qu'elle n'est pas expirée
5. THE Middleware SHALL vérifier que l'utilisateur associé à l'API Key est actif (isActive = true)
6. THE Middleware SHALL charger les permissions de l'utilisateur depuis ses rôles
7. THE Middleware SHALL attacher les informations de l'API Key et de l'utilisateur à la requête (req.apiKey, req.user)
8. IF la validation échoue à n'importe quelle étape, THEN THE Middleware SHALL retourner une erreur 401 avec un message explicite

### Requirement 6: Gestion des Routes Publiques

**User Story:** En tant que visiteur non connecté, je veux pouvoir accéder aux routes publiques (login, register, verify) sans avoir d'API Key, afin de pouvoir créer un compte.

#### Acceptance Criteria

1. THE Backend SHALL définir une liste de routes publiques ne nécessitant pas d'API Key
2. WHEN une requête arrive sur une route publique, THE Middleware SHALL autoriser l'accès sans validation d'API Key
3. THE Routes publiques SHALL inclure: /auth/login, /auth/register, /auth/verify, /system/health
4. THE Middleware SHALL logger les accès aux routes publiques pour audit

### Requirement 7: Mise à Jour du Frontend

**User Story:** En tant que développeur frontend, je veux que l'application utilise correctement les API Keys utilisateur, afin que toutes les requêtes soient authentifiées correctement.

#### Acceptance Criteria

1. THE Frontend SHALL supprimer toute référence à l'API Key système
2. WHEN un utilisateur se connecte ou s'inscrit, THE Frontend SHALL stocker l'API Key reçue dans le localStorage
3. WHEN une requête est envoyée, THE Frontend SHALL inclure l'API Key utilisateur dans le header X-API-Key
4. IF aucune API Key n'est disponible et que la route n'est pas publique, THEN THE Frontend SHALL rediriger vers la page de connexion
5. WHEN un utilisateur se déconnecte, THE Frontend SHALL supprimer l'API Key du localStorage

### Requirement 8: Régénération d'API Key

**User Story:** En tant qu'utilisateur, je veux pouvoir régénérer mon API Key en cas de compromission, afin de sécuriser mon compte.

#### Acceptance Criteria

1. WHEN un utilisateur demande la régénération de son API Key, THE Backend SHALL désactiver l'ancienne clé (isActive = false)
2. THE Backend SHALL générer une nouvelle API Key avec un nouveau keyId
3. THE Backend SHALL créer un nouvel enregistrement dans simple_api_keys avec les mêmes permissions
4. THE Backend SHALL mettre à jour le champ apiKey de l'utilisateur
5. THE Backend SHALL retourner la nouvelle API Key au frontend
6. THE Frontend SHALL mettre à jour l'API Key stockée dans le localStorage

### Requirement 9: Audit et Logging

**User Story:** En tant qu'administrateur, je veux avoir des logs détaillés de l'utilisation des API Keys, afin de détecter les activités suspectes.

#### Acceptance Criteria

1. WHEN une API Key est utilisée, THE Middleware SHALL logger l'événement avec les informations suivantes:
   - Date et heure
   - API Key (premiers caractères seulement)
   - Utilisateur associé
   - Route accédée
   - Adresse IP
   - Résultat de la validation (succès/échec)
2. WHEN une API Key est créée, THE Backend SHALL logger l'événement
3. WHEN une API Key est régénérée, THE Backend SHALL logger l'événement avec l'ancienne et la nouvelle clé
4. THE Logs SHALL être stockés de manière sécurisée et accessible uniquement aux administrateurs

### Requirement 10: Migration des Données Existantes

**User Story:** En tant qu'administrateur, je veux que les utilisateurs existants reçoivent automatiquement une API Key, afin qu'ils puissent continuer à utiliser l'application.

#### Acceptance Criteria

1. THE Backend SHALL fournir un script de migration pour les utilisateurs existants
2. WHEN le script est exécuté, THE Backend SHALL parcourir tous les utilisateurs sans API Key
3. FOR EACH utilisateur sans API Key, THE Backend SHALL générer une API Key et la stocker
4. THE Script SHALL logger le nombre d'utilisateurs migrés
5. THE Script SHALL gérer les erreurs et continuer en cas d'échec sur un utilisateur

## Constraints

- La migration doit être effectuée sans interruption de service
- Les API Keys doivent être stockées de manière sécurisée (hachage ou chiffrement)
- Le système doit supporter au moins 10 000 utilisateurs simultanés
- Les performances de validation ne doivent pas dépasser 50ms par requête
- Le système doit être compatible avec l'architecture existante (MongoDB, Express, React)
