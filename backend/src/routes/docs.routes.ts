// src/routes/docs.routes.ts
import { Router, Request, Response } from 'express';

const router = Router();

// Route de test simple pour vérifier que Swagger fonctionne
router.get('/test', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Documentation accessible',
    timestamp: new Date().toISOString(),
    token: req.query.token
  });
});

export default router;