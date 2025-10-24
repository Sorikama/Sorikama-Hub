// src/routes/index.ts
import { Router } from 'express';
import authRouter from './auth.routes';
import proxyRouter from './proxy.routes';
import systemRouter from './system.routes';
import ssoRouter from './sso.routes';
import adminUsersRouter from './admin/users.routes';
import adminRolesRouter from './admin/roles.routes';
import adminRateLimitRouter from './admin/rateLimit.routes';
import adminAuditRouter from './admin/audit.routes';
import adminWebhooksRouter from './admin/webhooks.routes';
import path from 'path';

const router = Router();
// Note : Express.static sert déjà index.html sur '/', mais cette route
// assure que même si le comportement change, la racine est bien gérée.
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
});

// Routes d'authentification
router.use('/auth', authRouter);

// Routes système (rôles, permissions, services)
router.use('/system', systemRouter);

// Routes SSO
router.use('/sso', ssoRouter);

// Routes admin (gestion des utilisateurs, services, etc.)
router.use('/admin/users', adminUsersRouter);
router.use('/admin/roles', adminRolesRouter);
router.use('/admin/rate-limit', adminRateLimitRouter);
router.use('/admin/audit', adminAuditRouter);
router.use('/admin/webhooks', adminWebhooksRouter);

// Routes de proxy vers les microservices
router.use('/', proxyRouter);

export default router;