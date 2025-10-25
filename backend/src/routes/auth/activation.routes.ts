/**
 * Routes pour l'activation de compte
 */

import { Router } from 'express';
import * as activationController from '../../controllers/auth/activation.controller';

const router = Router();

// Vérifier si un token d'activation est valide
router.get('/check/:token', activationController.checkActivationToken);

// Activer le compte et définir le mot de passe
router.post('/activate/:token', activationController.activateAccount);

// Renvoyer un email d'activation
router.post('/resend', activationController.resendActivationEmail);

export default router;
