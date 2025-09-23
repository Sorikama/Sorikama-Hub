// src/routes/proxy.routes.ts
import { Router } from 'express';
import { protect, hasPermission } from '../middlewares/auth.middleware';
import { proxyRequest } from '../services/proxy.service';
import { MAISONS_SERVICE_URL } from '../config';

const router = Router();

/**
 * @swagger
 * tags:
 * - name: Maisons  // <-- CORRIGÉ : Utilisation d'un tiret pour indiquer un élément de tableau
 * description: Redirection vers le microservice de gestion des maisons
 */

/**
 * @swagger
 * /maisons:
 * get:
 * summary: Récupérer la liste des maisons
 * tags: [Maisons] // Cette ligne est correcte, elle fait référence au tag "Maisons"
 * description: Route protégée qui nécessite la permission 'read:maison' et qui redirige la requête vers le microservice des maisons.
 * security:
 * - bearerAuth: []
 * responses:
 * '200':
 * description: Succès - La réponse provient directement du microservice des maisons.
 * '401':
 * description: Non autorisé - Token manquant ou invalide.
 * '403':
 * description: Interdit - L'utilisateur n'a pas la permission requise.
 */
// src/routes/proxy.routes.ts

router.get(
  '/maisons',
  protect, // Étape 1 : L'utilisateur est identifié, req.user est maintenant disponible
  hasPermission('read:maison'),
  (req, res, next) => {
    // Étape 2 : On enrichit les headers de la requête
    if (req.user) {
      // On ajoute l'ID de l'utilisateur dans un header personnalisé
      req.headers['X-User-Id'] = req.user.id;

      // On ajoute ses rôles, séparés par une virgule
      if (Array.isArray(req.user.roles)) {
        req.headers['X-User-Roles'] = req.user.roles.map((r: any) => r.name).join(',');
      }
    }
    // On passe à l'étape suivante : la redirection
    proxyRequest(MAISONS_SERVICE_URL!)(req, res, next);
  }
);

export default router;