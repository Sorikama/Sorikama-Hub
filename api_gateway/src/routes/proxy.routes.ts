// src/routes/proxy.routes.ts
import { Router } from 'express';
import { protect, hasPermission } from '../middlewares/auth.middleware';
import { createProxy } from '../services/proxy.service';
import { MASEBUY_SERVICE_URL } from '../config';
import { logger } from '../utils/logger';

const router = Router();

// ===================================================================================
// --- 📖 Table de Routage des Microservices ---
// ===================================================================================
/**
 * C'est ici que vous définissez la cartographie de votre architecture.
 * Chaque objet représente une "règle" de redirection.
 *
 * - path: Le segment d'URL qui déclenche la redirection (ex: '/maisons').
 * Toutes les requêtes commençant par ce chemin seront redirigées
 * (ex: /maisons, /maisons/123, /maisons/123/commentaires).
 *
 * - target: L'URL du microservice qui doit recevoir la requête.
 * Elle provient de votre fichier .env pour rester flexible.
 *
 * - permissions: Un tableau des permissions requises pour accéder à cette route.
 * Le middleware 'hasPermission' vérifiera que l'utilisateur (via son token)
 * possède TOUTES les permissions listées ici avant de le laisser passer.
 */
const serviceRoutes = [
  {
    path: '/masebuy',
    target: MASEBUY_SERVICE_URL,
    permissions: ['read:masebuy'], 
  },
];

// ===================================================================================
// --- ⚙️ Application de la Logique de Routage ---
// ===================================================================================

// 1. Appliquer le middleware 'protect' à toutes les routes de ce fichier.
//    Aucune requête ne passera ce point sans un token JWT valide.
router.use(protect);

// 2. Parcourir la table de routage et créer dynamiquement les redirections.
serviceRoutes.forEach(route => {
  // Sécurité : on vérifie que l'URL du service est bien configurée dans .env
  if (!route.target) {
    logger.warn(`[PROXY] L'URL du service pour la route "${route.path}" n'est pas définie. Cette route sera ignorée.`);
    return; // On passe à la règle suivante.
  }

  // On utilise notre "usine" pour créer un proxy spécifique à cette route.
  const proxy = createProxy(route.target);

  /**
   * On attache les middlewares dans le bon ordre à la route :
   *
   * 1. `router.use(route.path, ...)`: Express appliquera ce qui suit uniquement
   * pour les requêtes commençant par ce chemin.
   *
   * 2. `hasPermission(...route.permissions)`: Le gardien. Il vérifie les permissions
   * de l'utilisateur. S'il n'a pas les droits, la requête est rejetée (403 Forbidden)
   * et n'atteint jamais le proxy.
   *
   * 3. `proxy`: Si les permissions sont validées, le proxy prend le relais et
   * transfère la requête au microservice cible.
   */
  router.use(route.path, hasPermission(...route.permissions), proxy);

  logger.info(`[PROXY] Route ${route.path} configurée pour rediriger vers ${route.target}`);
});

export default router;