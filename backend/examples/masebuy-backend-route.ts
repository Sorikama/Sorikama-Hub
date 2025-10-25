/**
 * EXEMPLE DE ROUTE BACKEND POUR MASEBUY
 * 
 * Ce fichier montre comment implémenter la route d'échange de code
 * dans le backend de MaseBuy (ou tout autre service externe)
 * 
 * À copier dans votre projet MaseBuy: routes/auth.routes.ts
 */

import express, { Request, Response } from 'express';
import axios from 'axios';

const router = express.Router();

// Configuration (à mettre dans .env)
const SORIKAMA_HUB_URL = process.env.SORIKAMA_HUB_URL || 'http://localhost:7000/api/v1';
const SERVICE_SLUG = process.env.SORIKAMA_SERVICE_SLUG || 'masebuy';

/**
 * POST /api/auth/callback
 * 
 * Route appelée par le frontend MaseBuy pour échanger le code d'autorisation
 * contre un token JWT Sorikama
 * 
 * @body {string} code - Code d'autorisation reçu de Sorikama
 * @returns {object} Token JWT et données utilisateur
 */
router.post('/auth/callback', async (req: Request, res: Response) => {
  try {
    const { code } = req.body;

    // ============================================
    // 1. VALIDATION
    // ============================================
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Code d\'autorisation manquant'
      });
    }

    console.log('📥 [Auth] Réception du code d\'autorisation');

    // ============================================
    // 2. ÉCHANGER LE CODE CONTRE UN TOKEN
    // ============================================
    console.log('🔄 [Auth] Échange du code avec Sorikama Hub...');

    const response = await axios.post(
      `${SORIKAMA_HUB_URL}/auth/exchange`,
      { code },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 secondes
      }
    );

    // Vérifier la réponse
    if (response.data.status !== 'success') {
      throw new Error('Réponse invalide de Sorikama Hub');
    }

    const { token, user, service } = response.data.data;

    console.log('✅ [Auth] Token reçu de Sorikama Hub');
    console.log(`👤 [Auth] Utilisateur: ${user.email}`);

    // ============================================
    // 3. VÉRIFIER QUE LE TOKEN EST POUR CE SERVICE
    // ============================================
    // Décoder le token pour vérifier (optionnel)
    const tokenParts = token.split('.');
    if (tokenParts.length === 3) {
      const payload = JSON.parse(
        Buffer.from(tokenParts[1], 'base64').toString('utf-8')
      );

      if (payload.service !== SERVICE_SLUG) {
        console.error('❌ [Auth] Token non valide pour ce service');
        return res.status(403).json({
          success: false,
          message: 'Token non valide pour ce service'
        });
      }

      console.log(`✅ [Auth] Token valide pour ${payload.service}`);
    }

    // ============================================
    // 4. OPTIONNEL: CRÉER UNE SESSION LOCALE
    // ============================================
    // Vous pouvez créer une session locale dans votre base de données
    // pour tracker l'utilisateur Sorikama dans votre système

    /*
    const localUser = await User.findOrCreate({
      where: { sorikamaId: user.id },
      defaults: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        sorikamaToken: token
      }
    });
    */

    // ============================================
    // 5. OPTIONNEL: CRÉER UN COOKIE HTTPONLY
    // ============================================
    // Pour plus de sécurité, stocker le token dans un cookie HttpOnly
    res.cookie('sorikama_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS uniquement en prod
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 heures
    });

    // ============================================
    // 6. RETOURNER LES DONNÉES AU FRONTEND
    // ============================================
    res.json({
      success: true,
      token, // Le frontend peut aussi stocker le token en localStorage
      user: {
        id: user.id,
        email: user.email,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        roles: user.roles || [user.role],
        created_at: new Date().toISOString()
      },
      service: {
        name: service.name,
        slug: service.slug
      }
    });

    console.log('✅ [Auth] Authentification réussie');

  } catch (error: any) {
    console.error('❌ [Auth] Erreur lors de l\'échange du code:', error.message);

    // Gérer les différents types d'erreurs
    if (error.response) {
      // Erreur de Sorikama Hub
      const status = error.response.status;
      const message = error.response.data?.message || 'Erreur d\'authentification';

      if (status === 401) {
        return res.status(401).json({
          success: false,
          message: 'Code d\'autorisation invalide ou expiré'
        });
      }

      return res.status(status).json({
        success: false,
        message
      });
    }

    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        message: 'Sorikama Hub est indisponible'
      });
    }

    // Erreur générique
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'authentification'
    });
  }
});

/**
 * GET /api/auth/verify
 * 
 * Vérifier si un token Sorikama est valide
 * 
 * @header {string} Authorization - Bearer token
 * @returns {object} Informations sur le token
 */
router.get('/auth/verify', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token manquant'
      });
    }

    // Décoder le token (sans vérifier la signature)
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      return res.status(401).json({
        success: false,
        message: 'Token invalide'
      });
    }

    const payload = JSON.parse(
      Buffer.from(tokenParts[1], 'base64').toString('utf-8')
    );

    // Vérifier l'expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return res.status(401).json({
        success: false,
        message: 'Token expiré'
      });
    }

    res.json({
      success: true,
      user: {
        id: payload.id,
        email: payload.email,
        role: payload.role,
        roles: payload.roles
      },
      expiresAt: new Date(payload.exp * 1000).toISOString()
    });

  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token invalide'
    });
  }
});

/**
 * POST /api/auth/logout
 * 
 * Déconnexion (supprime le cookie)
 */
router.post('/auth/logout', (req: Request, res: Response) => {
  res.clearCookie('sorikama_token');
  
  res.json({
    success: true,
    message: 'Déconnexion réussie'
  });
});

export default router;
