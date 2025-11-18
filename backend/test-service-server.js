/**
 * 🧪 Serveur de test pour tester le callback SSO
 * 
 * Ce serveur simule un service externe
 * qui reçoit le callback SSO du Hub Sorikama
 * 
 * Usage:
 *   node test-service-server.js
 * 
 * Puis testez avec:
 *   http://localhost:5173/authorize?service_id=test_local_service&redirect_url=http://localhost:8080/auth/callback
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = 8080;

// Page d'accueil
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>🧪 Service de Test SSO</title>
      <style>
        body {
          font-family: system-ui, -apple-system, sans-serif;
          max-width: 800px;
          margin: 50px auto;
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .container {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        h1 { margin-top: 0; }
        .button {
          display: inline-block;
          background: white;
          color: #667eea;
          padding: 15px 30px;
          border-radius: 10px;
          text-decoration: none;
          font-weight: bold;
          margin: 10px 5px;
          transition: transform 0.2s;
        }
        .button:hover {
          transform: scale(1.05);
        }
        code {
          background: rgba(0, 0, 0, 0.3);
          padding: 2px 8px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🧪 Service de Test SSO</h1>
        <p>Ce serveur simule un service externe qui utilise le SSO Sorikama Hub.</p>
        
        <h2>🚀 Tester le SSO</h2>
        <p>Cliquez sur le bouton ci-dessous pour vous connecter avec Sorikama :</p>
        <a href="http://localhost:5173/authorize?service_id=test_local_service&redirect_url=http://localhost:8080/auth/callback" class="button">
          🔐 Se connecter avec Sorikama
        </a>
        
        <h2>📋 Endpoints disponibles</h2>
        <ul>
          <li><code>GET /</code> - Cette page</li>
          <li><code>GET /auth/callback</code> - Callback SSO (reçoit le token)</li>
          <li><code>GET /auth/sorikama</code> - Endpoint d'authentification</li>
          <li><code>GET /health</code> - Health check</li>
        </ul>
        
        <h2>ℹ️ Configuration</h2>
        <ul>
          <li><strong>Service ID:</strong> <code>test_local_service</code></li>
          <li><strong>Port:</strong> <code>8080</code></li>
          <li><strong>Callback URL:</strong> <code>http://localhost:8080/auth/callback</code></li>
        </ul>
      </div>
    </body>
    </html>
  `);
});

// Endpoint de callback SSO - C'est ici que le Hub redirige après autorisation
app.get('/auth/callback', (req, res) => {
  const { token, state, redirect_uri, client_id } = req.query;
  
  console.log('\n🎉 ========================================');
  console.log('🎉 CALLBACK SSO REÇU !');
  console.log('🎉 ========================================\n');
  
  if (!token) {
    console.error('❌ Aucun token reçu !');
    return res.status(400).send('❌ Token manquant');
  }
  
  // Décoder le token (sans vérifier la signature pour le test)
  let decoded;
  try {
    decoded = jwt.decode(token);
    console.log('📦 Token décodé:');
    console.log(JSON.stringify(decoded, null, 2));
  } catch (error) {
    console.error('❌ Erreur décodage token:', error.message);
  }
  
  console.log('\n📋 Paramètres reçus:');
  console.log('   Token:', token.substring(0, 50) + '...');
  console.log('   State:', state);
  console.log('   Redirect URI:', redirect_uri);
  console.log('   Client ID:', client_id);
  
  if (decoded) {
    console.log('\n👤 Informations utilisateur:');
    console.log('   User ID:', decoded.userId);
    console.log('   Username:', decoded.username);
    console.log('   Email:', decoded.email);
    console.log('   Service ID:', decoded.serviceId);
    console.log('   Session ID:', decoded.sessionId);
    console.log('   Expire à:', new Date(decoded.exp * 1000).toLocaleString());
  }
  
  console.log('\n========================================\n');
  
  // Afficher une page de succès
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>✅ SSO Réussi !</title>
      <style>
        body {
          font-family: system-ui, -apple-system, sans-serif;
          max-width: 900px;
          margin: 50px auto;
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: w