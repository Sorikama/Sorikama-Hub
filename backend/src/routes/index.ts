// src/routes/index.ts
import { Router } from 'express';
import authRouter from './auth.routes';
import proxyRouter from './proxy.routes';
import systemRouter from './system.routes';
import ssoRouter from './sso.routes';
import ssoSessionsRouter from './sso-sessions.routes';
import accountDeletionRouter from './account-deletion.routes';
import adminUsersRouter from './admin/users.routes';
import adminRolesRouter from './admin/roles.routes';
// import adminRateLimitRouter from './admin/rateLimit.routes'; // Supprimé
// import adminAuditRouter from './admin/audit.routes'; // Supprimé
// import adminWebhooksRouter from './admin/webhooks.routes'; // Supprimé
import adminServicesRouter from './admin/services.routes';
import authorizeRouter from './authorize.routes';
import csrfRouter from './csrf.routes';
import serviceUserRouter from './serviceUser.routes';
import path from 'path';

const router = Router();
// Note : Express.static sert déjà index.html sur '/', mais cette route
// assure que même si le comportement change, la racine est bien gérée.
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
});

// Routes d'authentification
router.use('/auth', authRouter);

// Routes CSRF
router.use('/security', csrfRouter);

// Routes système (rôles, permissions, services)
router.use('/system', systemRouter);

// Routes SSO
router.use('/sso', ssoRouter);
router.use('/sso', ssoSessionsRouter);

// Routes gestion de compte
router.use('/account', accountDeletionRouter);

// Routes admin (gestion des utilisateurs, services, etc.)
router.use('/admin/users', adminUsersRouter);
router.use('/admin/roles', adminRolesRouter);
// router.use('/admin/rate-limit', adminRateLimitRouter); // Supprimé
// router.use('/admin/audit', adminAuditRouter); // Supprimé
// router.use('/admin/webhooks', adminWebhooksRouter); // Supprimé
router.use('/admin/services', adminServicesRouter);

// Routes d'autorisation
router.use('/authorize', authorizeRouter);

// Routes pour les services externes (accès aux données utilisateur)
router.use('/service-user', serviceUserRouter);

// Proxy dynamique pour services externes (version refactorisée)
import { dynamicProxyMiddleware } from '../middlewares/proxy';

// Route proxy dynamique - capture toutes les requêtes vers /proxy/*
router.use('/proxy/*', dynamicProxyMiddleware);

export default router;