// src/routes/proxy.routes.ts
import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware'; // On garde le middleware de protection
import { proxyToBackend } from '../services/proxy.service'; // On importe notre nouveau service de proxy

const router = Router();

/*
================================================================================================
NOUVEAU CONTENU - Route générique pour le proxy
================================================================================================
On crée une route "catch-all" qui sera utilisée pour toutes les requêtes qui arrivent
sur ce routeur.
*/

// 1. D'abord, on applique le middleware `protect`. Toute requête qui arrive ici doit
//    avoir un token JWT valide. Si ce n'est pas le cas, le middleware `protect` la rejettera.
// 2. Si le token est valide, `protect` ajoute `req.user`.
// 3. Ensuite, on passe la main au middleware `proxyToBackend`. Il prend la requête
//    validée et enrichie, et la transfère au service backend.
router.use('/', protect, proxyToBackend);


export default router;

/*
================================================================================================
ANCIEN CONTENU - Mis en commentaire pour référence
================================================================================================

import { hasPermission } from '../middlewares/auth.middleware';
import { proxyRequest } from '../services/proxy.service';
import { MAISONS_SERVICE_URL } from '../config';

// L'ancienne approche était trop spécifique à une seule route.
// La nouvelle approche est plus flexible et s'adapte à une architecture microservices.

router.get(
  '/maisons',
  protect,
  hasPermission('read:maison'),
  (req, res, next) => {
    if (req.user) {
      req.headers['X-User-Id'] = req.user.id;
      if (Array.isArray(req.user.roles)) {
        req.headers['X-User-Roles'] = req.user.roles.map((r: any) => r.name).join(',');
      }
    }
    proxyRequest(MAISONS_SERVICE_URL!)(req, res, next);
  }
);
*/