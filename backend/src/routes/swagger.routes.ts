// src/routes/swagger.routes.ts
import { Router, Request, Response } from 'express';
import { ApiKeyModel } from '../database/models/apiKey.model';
import crypto from 'crypto';

const router = Router();

// Sessions en mémoire (simple)
const swaggerSessions = new Map<string, { expires: number; apiKey: string }>();

// Page de connexion pour Swagger
router.get('/login', (req: Request, res: Response) => {
  // Si API Key dans l'URL, la pré-remplir
  const apiKeyFromUrl = req.query.apiKey as string;
  res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sorikama API Gateway - Accès Documentation</title>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            .container {
                background: white;
                padding: 40px;
                border-radius: 20px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                max-width: 450px;
                width: 100%;
                position: relative;
                overflow: hidden;
            }
            .container::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: linear-gradient(90deg, #667eea, #764ba2);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 48px;
                margin-bottom: 10px;
                background: linear-gradient(135deg, #667eea, #764ba2);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            h1 {
                color: #333;
                font-size: 24px;
                font-weight: 600;
                margin-bottom: 8px;
            }
            .subtitle {
                color: #666;
                font-size: 14px;
            }
            .info-card {
                background: linear-gradient(135deg, #e3f2fd, #f3e5f5);
                padding: 20px;
                border-radius: 12px;
                margin-bottom: 25px;
                border-left: 4px solid #667eea;
            }
            .info-title {
                font-weight: 600;
                color: #333;
                margin-bottom: 8px;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .api-key-display {
                background: #f8f9fa;
                padding: 12px;
                border-radius: 8px;
                font-family: 'Courier New', monospace;
                font-size: 12px;
                word-break: break-all;
                border: 1px solid #e9ecef;
                position: relative;
            }
            .copy-btn {
                position: absolute;
                top: 8px;
                right: 8px;
                background: #667eea;
                color: white;
                border: none;
                padding: 4px 8px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 10px;
            }
            .form-group {
                margin-bottom: 20px;
                position: relative;
            }
            label {
                display: block;
                margin-bottom: 8px;
                color: #333;
                font-weight: 500;
            }
            .input-wrapper {
                position: relative;
            }
            input {
                width: 100%;
                padding: 15px 20px 15px 50px;
                border: 2px solid #e9ecef;
                border-radius: 12px;
                font-size: 14px;
                transition: all 0.3s ease;
                background: #f8f9fa;
            }
            input:focus {
                outline: none;
                border-color: #667eea;
                background: white;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }
            .input-icon {
                position: absolute;
                left: 18px;
                top: 50%;
                transform: translateY(-50%);
                color: #666;
            }
            .submit-btn {
                width: 100%;
                padding: 15px;
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                border: none;
                border-radius: 12px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }
            .submit-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
            }
            .submit-btn:disabled {
                opacity: 0.7;
                cursor: not-allowed;
                transform: none;
            }
            .loading {
                display: none;
                position: absolute;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
            }
            .error {
                background: #fee;
                color: #c33;
                padding: 12px;
                border-radius: 8px;
                margin-top: 15px;
                border-left: 4px solid #c33;
                display: none;
            }
            .success {
                background: #efe;
                color: #363;
                padding: 12px;
                border-radius: 8px;
                margin-top: 15px;
                border-left: 4px solid #363;
                display: none;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            .spinner {
                border: 2px solid #f3f3f3;
                border-top: 2px solid white;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                animation: spin 1s linear infinite;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🚀</div>
                <h1>Sorikama API Gateway</h1>
                <p class="subtitle">Accès sécurisé à la documentation</p>
            </div>
            
            <div class="info-card">
                <div class="info-title">
                    <i class="fas fa-key"></i>
                    API Key par défaut (Développement)
                </div>
                <div class="api-key-display">
                    sk_dev_default_key_12345678901234567890123456789012345678901234567890
                    <button class="copy-btn" id="copyBtn">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
            
            <form id="loginForm">
                <div class="form-group">
                    <label for="apiKey">
                        <i class="fas fa-key"></i> Votre API Key
                    </label>
                    <div class="input-wrapper">
                        <i class="fas fa-lock input-icon"></i>
                        <input 
                            type="text" 
                            id="apiKey" 
                            name="apiKey" 
                            placeholder="Collez votre API Key ici..." 
                            required
                            autocomplete="off"
                        >
                    </div>
                </div>
                
                <button type="submit" class="submit-btn" id="submitBtn">
                    <span class="btn-text">Accéder à la Documentation</span>
                    <div class="loading">
                        <div class="spinner"></div>
                    </div>
                </button>
                
                <div id="error" class="error"></div>
                <div id="success" class="success"></div>
            </form>
        </div>
        
        <script>
            document.addEventListener('DOMContentLoaded', function() {
                // Auto-remplir avec la clé par défaut ou depuis l'URL
                const urlParams = new URLSearchParams(window.location.search);
                const apiKeyFromUrl = urlParams.get('apiKey');
                const defaultKey = 'sk_dev_default_key_12345678901234567890123456789012345678901234567890';
                document.getElementById('apiKey').value = apiKeyFromUrl || defaultKey;
                
                // Fonction de copie
                document.getElementById('copyBtn').addEventListener('click', function() {
                    const apiKey = 'sk_dev_default_key_12345678901234567890123456789012345678901234567890';
                    
                    if (navigator.clipboard) {
                        navigator.clipboard.writeText(apiKey).then(() => {
                            showCopySuccess(this);
                        }).catch(() => {
                            fallbackCopy(apiKey);
                            showCopySuccess(this);
                        });
                    } else {
                        fallbackCopy(apiKey);
                        showCopySuccess(this);
                    }
                });
                
                function showCopySuccess(btn) {
                    const originalText = btn.innerHTML;
                    btn.innerHTML = '<i class="fas fa-check"></i>';
                    btn.style.background = '#28a745';
                    setTimeout(() => {
                        btn.innerHTML = originalText;
                        btn.style.background = '#667eea';
                    }, 2000);
                }
                
                function fallbackCopy(text) {
                    const textArea = document.createElement('textarea');
                    textArea.value = text;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                }
                
                // Gestion du formulaire
                document.getElementById('loginForm').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    
                    const apiKey = document.getElementById('apiKey').value.trim();
                    const errorDiv = document.getElementById('error');
                    const successDiv = document.getElementById('success');
                    const submitBtn = document.getElementById('submitBtn');
                    const btnText = submitBtn.querySelector('.btn-text');
                    const loading = submitBtn.querySelector('.loading');
                    
                    // Reset messages
                    errorDiv.style.display = 'none';
                    successDiv.style.display = 'none';
                    
                    // Loading state
                    submitBtn.disabled = true;
                    btnText.style.opacity = '0';
                    loading.style.display = 'block';
                    
                    try {
                        const response = await fetch('/swagger/verify', {
                            method: 'POST',
                            headers: { 
                                'Content-Type': 'application/json',
                                'Accept': 'application/json'
                            },
                            body: JSON.stringify({ apiKey })
                        });
                        
                        const data = await response.json();
                        
                        if (response.ok) {
                            successDiv.textContent = 'Authentification réussie ! Redirection...';
                            successDiv.style.display = 'block';
                            
                            setTimeout(() => {
                                window.location.href = data.redirectUrl;
                            }, 1000);
                        } else {
                            throw new Error(data.message || 'API Key invalide');
                        }
                    } catch (err) {
                        errorDiv.textContent = err.message || 'Erreur de connexion au serveur';
                        errorDiv.style.display = 'block';
                        
                        // Reset button
                        submitBtn.disabled = false;
                        btnText.style.opacity = '1';
                        loading.style.display = 'none';
                    }
                });
            });
        </script>
        </script>
    </body>
    </html>
  `);
});

// Vérification de l'API Key
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { apiKey } = req.body;
    
    console.log('API Key reçue:', apiKey?.substring(0, 20) + '...'); // Debug sécurisé
    
    if (!apiKey || !apiKey.startsWith('sk_')) {
      return res.status(400).json({ 
        success: false,
        message: 'Format d\'API Key invalide. Doit commencer par "sk_"' 
      });
    }
    
    // Pour la clé par défaut, on accepte directement
    const defaultKey = 'sk_dev_default_key_12345678901234567890123456789012345678901234567890';
    if (apiKey === defaultKey) {
      const sessionToken = crypto.randomBytes(32).toString('hex');
      const expires = Date.now() + 3600000;
      
      swaggerSessions.set(sessionToken, { expires, apiKey });
      
      console.log('Authentification avec clé par défaut réussie');
      
      return res.json({ 
        success: true, 
        token: sessionToken,
        message: 'Authentification réussie',
        redirectUrl: `/dashboard?apiKey=${apiKey}&token=${sessionToken}`
      });
    }
    
    // Vérifier l'API Key en base
    let keyDoc;
    try {
      keyDoc = await ApiKeyModel.verifyApiKey(apiKey);
    } catch (dbError) {
      console.error('Erreur DB:', dbError);
      // Fallback: accepter la clé par défaut même en cas d'erreur DB
      if (apiKey === defaultKey) {
        const sessionToken = crypto.randomBytes(32).toString('hex');
        swaggerSessions.set(sessionToken, { expires: Date.now() + 3600000, apiKey });
        return res.json({ 
          success: true, 
          token: sessionToken,
          message: 'Authentification réussie (mode dégradé)',
          redirectUrl: `/dashboard?apiKey=${apiKey}&token=${sessionToken}`
        });
      }
      return res.status(500).json({ 
        success: false,
        message: 'Erreur de vérification de l\'API Key' 
      });
    }
    
    if (!keyDoc) {
      return res.status(401).json({ 
        success: false,
        message: 'API Key invalide, expirée ou révoquée' 
      });
    }
    
    // Générer un token de session temporaire
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + 3600000; // 1 heure
    
    // Stocker en mémoire
    swaggerSessions.set(sessionToken, { expires, apiKey });
    
    console.log('Session créée pour API Key valide');
    
    res.json({ 
      success: true, 
      token: sessionToken,
      message: 'Authentification réussie',
      redirectUrl: `/dashboard?apiKey=${apiKey}&token=${sessionToken}`
    });
    
  } catch (error) {
    console.error('Erreur verify:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur interne du serveur' 
    });
  }
});

export default router;