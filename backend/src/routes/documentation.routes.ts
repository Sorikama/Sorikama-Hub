// src/routes/documentation.routes.ts
import { Router, Request, Response } from 'express';

const router = Router();

// Documentation HTML simple
router.get('/', (req: Request, res: Response) => {
  const token = req.query.token;
  
  res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sorikama API Gateway - Documentation</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', sans-serif; background: #f8f9fa; line-height: 1.6; }
            .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 30px; border-radius: 12px; margin-bottom: 30px; }
            .header h1 { font-size: 2.5rem; margin-bottom: 10px; }
            .header p { font-size: 1.1rem; opacity: 0.9; }
            .section { background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .section h2 { color: #333; margin-bottom: 15px; border-bottom: 2px solid #667eea; padding-bottom: 5px; }
            .endpoint { background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 10px 0; border-left: 4px solid #667eea; }
            .method { display: inline-block; padding: 4px 8px; border-radius: 4px; color: white; font-weight: bold; margin-right: 10px; }
            .get { background: #28a745; }
            .post { background: #007bff; }
            .put { background: #ffc107; color: #333; }
            .delete { background: #dc3545; }
            .code { background: #f1f3f4; padding: 10px; border-radius: 4px; font-family: 'Courier New', monospace; margin: 10px 0; }
            .api-key { background: #e7f3ff; padding: 15px; border-radius: 6px; border-left: 4px solid #007bff; margin: 15px 0; }
            .test-btn { background: #667eea; color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; margin: 5px; }
            .test-btn:hover { background: #5a6fd8; }
            .swagger-btn { background: #28a745; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; margin-top: 15px; font-size: 1.1rem; }
            .swagger-btn:hover { background: #218838; }
            .response { background: #f8f9fa; padding: 10px; border-radius: 4px; margin-top: 10px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚀 Sorikama API Gateway</h1>
                <p>Documentation complète de l'API Gateway centralisée</p>
                <p><strong>Token de session:</strong> ${token}</p>
                <button class="swagger-btn" onclick="openSwagger()">📖 Ouvrir Swagger UI</button>
            </div>
            
            <div class="section">
                <h2>🔐 Authentification</h2>
                <div class="api-key">
                    <strong>API Key par défaut (Développement):</strong><br>
                    <code>sk_dev_default_key_12345678901234567890123456789012345678901234567890</code>
                </div>
                <p>Utilisez cette API Key dans l'en-tête <code>X-API-Key</code> pour toutes vos requêtes.</p>
            </div>
            
            <div class="section">
                <h2>📋 Endpoints Disponibles</h2>
                
                <div class="endpoint">
                    <span class="method get">GET</span>
                    <strong>/api/v1/system/health</strong>
                    <p>Vérifier l'état de santé du système</p>
                    <button class="test-btn" onclick="testEndpoint('/api/v1/system/health', 'GET')">Tester</button>
                    <div id="response-health" class="response" style="display:none;"></div>
                </div>
                
                <div class="endpoint">
                    <span class="method post">POST</span>
                    <strong>/api/v1/auth/login</strong>
                    <p>Connexion utilisateur avec email/password</p>
                    <div class="code">
{
  "email": "admin@sorikama.com",
  "password": "Admin@123"
}
                    </div>
                    <button class="test-btn" onclick="testLogin()">Tester</button>
                    <div id="response-login" class="response" style="display:none;"></div>
                </div>
                
                <div class="endpoint">
                    <span class="method get">GET</span>
                    <strong>/api/v1/system/services</strong>
                    <p>Liste des services disponibles</p>
                    <button class="test-btn" onclick="testEndpoint('/api/v1/system/services', 'GET', true)">Tester</button>
                    <div id="response-services" class="response" style="display:none;"></div>
                </div>
                
                <div class="endpoint">
                    <span class="method get">GET</span>
                    <strong>/api/v1/system/roles</strong>
                    <p>Liste des rôles disponibles</p>
                    <button class="test-btn" onclick="testEndpoint('/api/v1/system/roles', 'GET', true)">Tester</button>
                    <div id="response-roles" class="response" style="display:none;"></div>
                </div>
                
                <div class="endpoint">
                    <span class="method get">GET</span>
                    <strong>/api/v1/system/permissions</strong>
                    <p>Liste des permissions disponibles</p>
                    <button class="test-btn" onclick="testEndpoint('/api/v1/system/permissions', 'GET', true)">Tester</button>
                    <div id="response-permissions" class="response" style="display:none;"></div>
                </div>
            </div>
            
            <div class="section">
                <h2>🛠️ Services Externes</h2>
                <p>Les services sont gérés dynamiquement. Consultez <a href="/api/v1/system/services">/api/v1/system/services</a> pour la liste complète.</p>
                
                <div class="endpoint">
                    <span class="method get">GET</span>
                    <strong>/api/v1/proxy/:serviceId/*</strong>
                    <p>Proxy vers les services externes enregistrés</p>
                </div>
            </div>
        </div>
        
        <script>
            const API_KEY = 'sk_dev_default_key_12345678901234567890123456789012345678901234567890';
            const TOKEN = '${token}';
            
            function openSwagger() {
                // Ouvrir Swagger avec l'API key dans l'URL
                const swaggerUrl = '/api-docs?token=' + TOKEN + '&x_api_key=' + encodeURIComponent(API_KEY);
                console.log('URL Swagger:', swaggerUrl);
                window.location.href = swaggerUrl;
            }
            
            async function testEndpoint(url, method, requireAuth = false) {
                const responseId = 'response-' + url.split('/').pop();
                const responseDiv = document.getElementById(responseId);
                
                const headers = {
                    'Content-Type': 'application/json'
                };
                
                if (requireAuth) {
                    headers['X-API-Key'] = API_KEY;
                }
                
                try {
                    const response = await fetch(url, {
                        method: method,
                        headers: headers
                    });
                    
                    const data = await response.json();
                    responseDiv.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
                    responseDiv.style.display = 'block';
                } catch (error) {
                    responseDiv.innerHTML = '<pre style="color: red;">Erreur: ' + error.message + '</pre>';
                    responseDiv.style.display = 'block';
                }
            }
            
            async function testLogin() {
                const responseDiv = document.getElementById('response-login');
                
                try {
                    const response = await fetch('/api/v1/auth/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            email: 'admin@sorikama.com',
                            password: 'Admin@123'
                        })
                    });
                    
                    const data = await response.json();
                    responseDiv.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
                    responseDiv.style.display = 'block';
                } catch (error) {
                    responseDiv.innerHTML = '<pre style="color: red;">Erreur: ' + error.message + '</pre>';
                    responseDiv.style.display = 'block';
                }
            }
        </script>
    </body>
    </html>
  `);
});

export default router;