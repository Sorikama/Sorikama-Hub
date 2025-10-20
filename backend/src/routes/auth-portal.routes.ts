// src/routes/auth-portal.routes.ts
import { Router } from 'express';
import { logger } from '../utils/logger';
import crypto from 'crypto';
import path from 'path';
import bcrypt from 'bcrypt';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiting pour les tentatives de connexion
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives max par IP
  message: {
    success: false,
    message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
});

// Sessions sécurisées avec informations étendues
export const portalSessions = new Map<string, { 
  expires: number; 
  username: string; 
  apiKey: string;
  createdAt: number;
  lastActivity: number;
  ipAddress: string;
  userAgent: string;
  csrfToken: string;
}>();

// Nettoyage automatique des sessions expirées
setInterval(() => {
  const now = Date.now();
  for (const [token, session] of portalSessions.entries()) {
    if (session.expires < now) {
      portalSessions.delete(token);
      logger.info('🧹 Session expirée nettoyée', { token: token.substring(0, 8) + '...' });
    }
  }
}, 60000); // Nettoyage toutes les minutes

// Validation et sanitisation des entrées
function validateInput(input: string): string {
  if (typeof input !== 'string') {
    throw new Error('Entrée invalide');
  }
  return input.trim().replace(/[<>"'&]/g, '');
}

// Génération de token CSRF
function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Vérification du token CSRF
function verifyCSRFToken(sessionToken: string, providedToken: string): boolean {
  const session = portalSessions.get(sessionToken);
  return session && session.csrfToken === providedToken;
}

/**
 * GET /portal/login - Page de connexion du portail
 */
router.get('/login', (req, res) => {
  // Si déjà connecté, rediriger vers /api
  const sessionToken = req.cookies.sorikama_session;
  if (sessionToken) {
    const session = portalSessions.get(sessionToken);
    if (session && session.expires > Date.now()) {
      return res.redirect('/api');
    }
  }
  
  res.sendFile(path.join(__dirname, '../../public/views/login.html'));
});

/**
 * POST /portal/authenticate - Authentification sécurisée du portail
 */
router.post('/authenticate', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    const clientIP = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent') || 'Unknown';
    
    // Validation et sanitisation des entrées
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }
    
    let sanitizedUsername: string;
    let sanitizedPassword: string;
    
    try {
      sanitizedUsername = validateInput(username);
      sanitizedPassword = validateInput(password);
    } catch (error) {
      logger.warn('🚨 Tentative d\'injection détectée', {
        username: username?.substring(0, 10),
        ip: clientIP,
        userAgent,
        timestamp: new Date().toISOString()
      });
      
      return res.status(400).json({
        success: false,
        message: 'Invalid input format'
      });
    }
    
    // Vérification des identifiants depuis les variables d'environnement
    const validUsername = process.env.PORTAL_USERNAME || 'admin';
    const validPasswordHash = process.env.PORTAL_PASSWORD_HASH;
    const validPassword = process.env.PORTAL_PASSWORD || 'sorikama2024!';
    
    // Vérification avec timing attack protection
    let isValidUser = false;
    let isValidPassword = false;
    
    // Comparaison sécurisée du nom d'utilisateur
    if (sanitizedUsername.length === validUsername.length) {
      isValidUser = crypto.timingSafeEqual(
        Buffer.from(sanitizedUsername),
        Buffer.from(validUsername)
      );
    }
    
    // Vérification du mot de passe - utiliser comparaison simple pour l'instant
    if (sanitizedPassword.length === validPassword.length) {
      isValidPassword = crypto.timingSafeEqual(
        Buffer.from(sanitizedPassword),
        Buffer.from(validPassword)
      );
    }
    
    if (!isValidUser || !isValidPassword) {
      // Log de sécurité avec délai artificiel pour éviter les timing attacks
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
      
      logger.warn('🚨 Tentative de connexion portail échouée', {
        username: sanitizedUsername,
        ip: clientIP,
        userAgent,
        timestamp: new Date().toISOString()
      });
      
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Générer des tokens sécurisés
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const tempApiKey = `temp_${crypto.randomBytes(24).toString('hex')}`;
    const csrfToken = generateCSRFToken();
    const now = Date.now();
    const expires = now + (24 * 60 * 60 * 1000); // 24 heures
    
    // Stocker la session avec informations de sécurité
    portalSessions.set(sessionToken, { 
      expires,
      username: sanitizedUsername,
      apiKey: tempApiKey,
      createdAt: now,
      lastActivity: now,
      ipAddress: clientIP,
      userAgent,
      csrfToken
    });
    
    // Log de succès
    logger.info('✅ Connexion portail réussie', {
      username: sanitizedUsername,
      ip: clientIP,
      sessionToken: sessionToken.substring(0, 8) + '...',
      apiKey: tempApiKey.substring(0, 12) + '...',
      timestamp: new Date().toISOString()
    });
    
    // Définir le cookie sécurisé avec options renforcées
    res.cookie('sorikama_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 heures
      path: '/',
      domain: process.env.NODE_ENV === 'production' ? process.env.DOMAIN : undefined
    });
    
    res.json({
      success: true,
      message: 'Authentication successful',
      redirectUrl: '/api',
      csrfToken // Pour les requêtes futures
    });
    
  } catch (error) {
    logger.error('❌ Erreur authentification portail:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * POST /portal/logout - Déconnexion sécurisée du portail
 */
router.post('/logout', (req, res) => {
  const sessionToken = req.cookies.sorikama_session;
  
  if (sessionToken && portalSessions.has(sessionToken)) {
    const session = portalSessions.get(sessionToken);
    portalSessions.delete(sessionToken);
    
    logger.info('🚪 Déconnexion portail', {
      username: session?.username,
      ip: req.ip,
      sessionDuration: session ? Date.now() - session.createdAt : 0,
      timestamp: new Date().toISOString()
    });
  }
  
  // Supprimer le cookie avec options sécurisées
  res.clearCookie('sorikama_session', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  });
  
  res.json({
    success: true,
    message: 'Logout successful',
    redirectUrl: '/portal/login'
  });
});

/**
 * GET /portal/session-status - Vérification du statut de session
 */
router.get('/session-status', (req: any, res) => {
  const sessionToken = req.cookies.sorikama_session;
  if (!sessionToken) {
    return res.status(401).json({ success: false, message: 'No session' });
  }
  const session = portalSessions.get(req.cookies.sorikama_session);
  
  if (session) {
    res.json({
      success: true,
      username: session.username,
      expiresAt: session.expires,
      lastActivity: session.lastActivity,
      timeRemaining: session.expires - Date.now()
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'No valid session'
    });
  }
});

/**
 * Middleware de vérification de session portail sécurisé
 */
export const verifyPortalSession = (req: any, res: any, next: any) => {
  const sessionToken = req.cookies.sorikama_session;
  const clientIP = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent') || 'Unknown';
  
  if (!sessionToken) {
    logger.warn('🚨 Accès non autorisé - Pas de token de session', {
      ip: clientIP,
      userAgent,
      path: req.path
    });
    return res.redirect('/portal/login');
  }
  
  const session = portalSessions.get(sessionToken);
  const now = Date.now();
  
  if (!session || session.expires < now) {
    if (session) {
      portalSessions.delete(sessionToken);
      logger.info('🕐 Session expirée supprimée', {
        username: session.username,
        ip: clientIP
      });
    }
    res.clearCookie('sorikama_session');
    return res.redirect('/portal/login');
  }
  
  // Vérification de l'IP et User-Agent pour détecter le vol de session
  if (session.ipAddress !== clientIP) {
    logger.error('🚨 ALERTE SÉCURITÉ - IP différente détectée', {
      username: session.username,
      originalIP: session.ipAddress,
      currentIP: clientIP,
      sessionToken: sessionToken.substring(0, 8) + '...'
    });
    
    portalSessions.delete(sessionToken);
    res.clearCookie('sorikama_session');
    return res.status(401).json({
      success: false,
      message: 'Session security violation detected'
    });
  }
  
  if (session.userAgent !== userAgent) {
    logger.warn('🚨 User-Agent différent détecté', {
      username: session.username,
      originalUA: session.userAgent,
      currentUA: userAgent,
      ip: clientIP
    });
  }
  
  // Vérification d'inactivité (30 minutes)
  const maxInactivity = 30 * 60 * 1000; // 30 minutes
  if (now - session.lastActivity > maxInactivity) {
    logger.info('🕐 Session expirée par inactivité', {
      username: session.username,
      lastActivity: new Date(session.lastActivity).toISOString()
    });
    
    portalSessions.delete(sessionToken);
    res.clearCookie('sorikama_session');
    return res.redirect('/portal/login');
  }
  
  // Mise à jour de la dernière activité
  session.lastActivity = now;
  
  // Session valide
  req.portalUser = { 
    username: session.username, 
    apiKey: session.apiKey,
    sessionToken,
    csrfToken: session.csrfToken
  };
  
  next();
};

/**
 * Middleware de vérification CSRF
 */
export const verifyCSRF = (req: any, res: any, next: any) => {
  const sessionToken = req.cookies.sorikama_session;
  const csrfToken = req.headers['x-csrf-token'] || req.body.csrfToken;
  
  if (!verifyCSRFToken(sessionToken, csrfToken)) {
    logger.warn('🚨 Token CSRF invalide', {
      ip: req.ip,
      path: req.path,
      sessionToken: sessionToken?.substring(0, 8) + '...'
    });
    
    return res.status(403).json({
      success: false,
      message: 'CSRF token validation failed'
    });
  }
  
  next();
};

// Génération du hash pour information
if (process.env.PORTAL_PASSWORD) {
  bcrypt.hash(process.env.PORTAL_PASSWORD, 12).then(hash => {
    logger.info('💡 Hash bcrypt généré pour sécurité future: ' + hash);
  }).catch(err => logger.error('Erreur hash:', err));
}

export default router;