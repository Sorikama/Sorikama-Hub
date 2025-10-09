// src/routes/auth-portal.routes.ts
import { Router } from 'express';
import { logger } from '../utils/logger';
import crypto from 'crypto';

const router = Router();

// Sessions en mémoire pour le portail avec API keys temporaires
export const portalSessions = new Map<string, { 
  expires: number; 
  username: string; 
  apiKey: string;
  createdAt: number;
}>();

/**
 * GET /portal/login - Page de connexion du portail
 */
router.get('/login', (req, res) => {
  const loginHTML = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Connexion - Sorikama API Gateway</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <style>
        body { font-family: 'Inter', sans-serif; }
        .gradient-bg {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .glass-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .floating {
            animation: floating 3s ease-in-out infinite;
        }
        @keyframes floating {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
        }
        .pulse-ring {
            animation: pulse-ring 2s infinite;
        }
        @keyframes pulse-ring {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(1.3); opacity: 0; }
        }
    </style>
</head>
<body class="gradient-bg flex items-center justify-center p-4">

    <div class="w-full max-w-md">
        
        <!-- Logo et titre -->
        <div class="text-center mb-8 floating">
            <div class="relative inline-block">
                <div class="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-network-wired text-white text-3xl"></i>
                </div>
                <div class="absolute inset-0 w-20 h-20 bg-white bg-opacity-10 rounded-2xl pulse-ring mx-auto"></div>
            </div>
            <h1 class="text-3xl font-bold text-white mb-2">Sorikama Gateway</h1>
            <p class="text-blue-100">Accès sécurisé au portail d'administration</p>
        </div>

        <!-- Formulaire de connexion -->
        <div class="glass-card rounded-2xl p-8 shadow-2xl">
            <form id="loginForm" class="space-y-6">
                
                <div>
                    <label for="username" class="block text-sm font-medium text-white mb-2">
                        <i class="fas fa-user mr-2"></i>Nom d'utilisateur
                    </label>
                    <input 
                        type="text" 
                        id="username" 
                        name="username" 
                        required
                        class="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 focus:border-transparent transition-all"
                        placeholder="Entrez votre nom d'utilisateur"
                    >
                </div>

                <div>
                    <label for="password" class="block text-sm font-medium text-white mb-2">
                        <i class="fas fa-lock mr-2"></i>Mot de passe
                    </label>
                    <div class="relative">
                        <input 
                            type="password" 
                            id="password" 
                            name="password" 
                            required
                            class="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 focus:border-transparent transition-all pr-12"
                            placeholder="Entrez votre mot de passe"
                        >
                        <button 
                            type="button" 
                            id="togglePassword"
                            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-200 hover:text-white transition-colors"
                        >
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>

                <button 
                    type="submit" 
                    id="submitBtn"
                    class="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                >
                    <span id="btnText">
                        <i class="fas fa-sign-in-alt mr-2"></i>Se connecter
                    </span>
                    <span id="btnLoading" class="hidden">
                        <i class="fas fa-spinner fa-spin mr-2"></i>Connexion...
                    </span>
                </button>

            </form>

            <!-- Messages -->
            <div id="errorMessage" class="hidden mt-4 p-3 bg-red-500 bg-opacity-20 border border-red-400 border-opacity-50 rounded-lg text-red-100 text-sm">
                <i class="fas fa-exclamation-triangle mr-2"></i>
                <span id="errorText"></span>
            </div>

            <div id="successMessage" class="hidden mt-4 p-3 bg-green-500 bg-opacity-20 border border-green-400 border-opacity-50 rounded-lg text-green-100 text-sm">
                <i class="fas fa-check-circle mr-2"></i>
                <span id="successText"></span>
            </div>
        </div>

        <!-- Informations -->
        <div class="text-center mt-6 text-blue-100 text-sm">
            <p><i class="fas fa-shield-alt mr-1"></i>Connexion sécurisée SSL</p>
            <p class="mt-1">© 2024 Sorikama Hub - Tous droits réservés</p>
        </div>

    </div>

    <script>
        // Toggle password visibility
        document.getElementById('togglePassword').addEventListener('click', function() {
            const passwordInput = document.getElementById('password');
            const icon = this.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.className = 'fas fa-eye-slash';
            } else {
                passwordInput.type = 'password';
                icon.className = 'fas fa-eye';
            }
        });

        // Form submission
        document.getElementById('loginForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const submitBtn = document.getElementById('submitBtn');
            const btnText = document.getElementById('btnText');
            const btnLoading = document.getElementById('btnLoading');
            const errorMessage = document.getElementById('errorMessage');
            const successMessage = document.getElementById('successMessage');
            
            // Reset messages
            errorMessage.classList.add('hidden');
            successMessage.classList.add('hidden');
            
            // Loading state
            submitBtn.disabled = true;
            btnText.classList.add('hidden');
            btnLoading.classList.remove('hidden');
            
            try {
                const response = await fetch('/portal/authenticate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });
                
                const result = await response.json();
                
                if (response.ok && result.success) {
                    document.getElementById('successText').textContent = 'Connexion réussie ! Redirection...';
                    successMessage.classList.remove('hidden');
                    
                    setTimeout(() => {
                        window.location.href = result.redirectUrl;
                    }, 1000);
                } else {
                    throw new Error(result.message || 'Erreur de connexion');
                }
                
            } catch (error) {
                document.getElementById('errorText').textContent = error.message;
                errorMessage.classList.remove('hidden');
                
                // Reset button
                submitBtn.disabled = false;
                btnText.classList.remove('hidden');
                btnLoading.classList.add('hidden');
            }
        });

        // Auto-focus on username
        document.getElementById('username').focus();
    </script>

</body>
</html>`;

  res.send(loginHTML);
});

/**
 * POST /portal/authenticate - Authentification du portail
 */
router.post('/authenticate', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Vérification des identifiants depuis les variables d'environnement
    const validUsername = process.env.PORTAL_USERNAME || 'admin';
    const validPassword = process.env.PORTAL_PASSWORD || 'sorikama2024!';
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nom d\'utilisateur et mot de passe requis'
      });
    }
    
    if (username !== validUsername || password !== validPassword) {
      // Log de sécurité
      logger.warn('🚨 Tentative de connexion portail échouée', {
        username,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      });
      
      return res.status(401).json({
        success: false,
        message: 'Identifiants incorrects'
      });
    }
    
    // Générer un token de session et une API key temporaire
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const tempApiKey = `temp_${crypto.randomBytes(16).toString('hex')}`;
    const expires = Date.now() + 86400000; // 24 heures
    const createdAt = Date.now();
    
    // Stocker la session avec API key
    portalSessions.set(sessionToken, { 
      expires, 
      username, 
      apiKey: tempApiKey,
      createdAt
    });
    
    // Log de succès
    logger.info('✅ Connexion portail réussie', {
      username,
      ip: req.ip,
      sessionToken: sessionToken.substring(0, 8) + '...',
      apiKey: tempApiKey.substring(0, 12) + '...',
      timestamp: new Date().toISOString()
    });
    
    // Définir le cookie sécurisé
    res.cookie('sorikama_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400000 // 24 heures
    });
    
    res.json({
      success: true,
      message: 'Connexion réussie',
      redirectUrl: '/api'
    });
    
  } catch (error) {
    logger.error('❌ Erreur authentification portail:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

/**
 * POST /portal/logout - Déconnexion du portail
 */
router.post('/logout', (req, res) => {
  const sessionToken = req.cookies.sorikama_session;
  
  if (sessionToken && portalSessions.has(sessionToken)) {
    const session = portalSessions.get(sessionToken);
    portalSessions.delete(sessionToken);
    
    logger.info('🚪 Déconnexion portail', {
      username: session?.username,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });
  }
  
  // Supprimer le cookie
  res.clearCookie('sorikama_session');
  
  res.json({
    success: true,
    message: 'Déconnexion réussie',
    redirectUrl: '/portal/login'
  });
});

/**
 * Middleware de vérification de session portail
 */
export const verifyPortalSession = (req: any, res: any, next: any) => {
  const sessionToken = req.cookies.sorikama_session;
  
  if (!sessionToken) {
    return res.redirect('/portal/login');
  }
  
  const session = portalSessions.get(sessionToken);
  
  if (!session || session.expires < Date.now()) {
    if (session) {
      portalSessions.delete(sessionToken);
    }
    res.clearCookie('sorikama_session');
    return res.redirect('/portal/login');
  }
  
  // Session valide
  req.portalUser = { 
    username: session.username, 
    apiKey: session.apiKey,
    sessionToken
  };
  
  next();
};

export default router;