// src/routes/index.ts
import { Router } from 'express';
import authRouter from './auth.routes';
import proxyRouter from './proxy.routes';
import apiKeyRouter from './apiKey.routes';
import systemRouter from './system.routes';
import path from 'path';

const router = Router();
// Note : Express.static sert déjà index.html sur '/', mais cette route
// assure que même si le comportement change, la racine est bien gérée.
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
});

// Routes d'authentification
router.use('/auth', authRouter);

// Routes de gestion des API Keys
router.use('/api/keys', apiKeyRouter);

// Routes système (rôles, permissions, services)
router.use('/system', systemRouter);

// Routes de proxy vers les microservices
router.use('/', proxyRouter);

export default router;