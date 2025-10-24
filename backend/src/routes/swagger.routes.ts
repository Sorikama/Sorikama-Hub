// src/routes/swagger.routes.ts
import { Router } from 'express';

const router = Router();

// Redirection vers la page de connexion principale
router.get('/login', (req, res) => {
  res.redirect('/portal/login');
});

export default router;