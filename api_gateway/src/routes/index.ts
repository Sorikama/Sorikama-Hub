// src/routes/index.ts
import { Router } from 'express';
import authRouter from './auth.routes';
import proxyRouter from './proxy.routes';
import path from 'path';

const router = Router();
// Note : Express.static sert déjà index.html sur '/', mais cette route
// assure que même si le comportement change, la racine est bien gérée.
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
});

// Toutes les routes commençant par /auth sont gérées par authRouter
router.use('/auth', authRouter);

// Les autres routes (proxy) sont gérées par proxyRouter
router.use('/', proxyRouter);

export default router;