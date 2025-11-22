import React, { useState } from 'react';
import { Code, GitBranch, Lock, Zap, Server, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';

const TechnicalDocumentation = () => {
  const [openSection, setOpenSection] = useState('overview');

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const Section = ({ id, title, icon: Icon, children }) => {
    const isOpen = openSection === id;
    
    return (
      <div className="mb-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection(id)}
          className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          </div>
          <span className="text-gray-500">{isOpen ? '−' : '+'}</span>
        </button>
        
        {isOpen && (
          <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            {children}
          </div>
        )}
      </div>
    );
  };

  const CodeBlock = ({ children, language = 'javascript' }) => (
    <div className="relative">
      <div className="absolute top-2 right-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
        {language}
      </div>
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
        <code>{children}</code>
      </pre>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Code className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Documentation Technique</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">Guide complet pour intégrer un service à Sorikama Hub</p>
      </div>

      {/* Content */}
      <div>
        
        {/* Vue d'ensemble */}
        <Section id="overview" title="Vue d'ensemble de l'architecture" icon={Server}>
          <div className="prose dark:prose-invert max-w-none">
            <h3 className="text-xl font-semibold mb-4">Architecture SSO Sorikama Hub</h3>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-4">
                  <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg">
                    <p className="font-semibold text-blue-900 dark:text-blue-100">Frontend Service</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">(ex: Masebuy)</p>
                  </div>
                  <ArrowRight className="w-6 h-6 text-gray-400" />
                  <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded-lg">
                    <p className="font-semibold text-purple-900 dark:text-purple-100">Sorikama Hub</p>
                    <p className="text-sm text-purple-700 dark:text-purple-300">(Gateway SSO)</p>
                  </div>
                  <ArrowRight className="w-6 h-6 text-gray-400" />
                  <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg">
                    <p className="font-semibold text-green-900 dark:text-green-100">Backend Service</p>
                    <p className="text-sm text-green-700 dark:text-green-300">(API)</p>
                  </div>
                </div>
              </div>
            </div>

            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Composants principaux :</h4>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Gateway (Port 7000)</strong> - Point d'entrée centralisé pour l'authentification</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Proxy Middleware</strong> - Transmet les requêtes authentifiées vers les services</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Session SSO</strong> - Gère les sessions utilisateur entre services</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>JWT Tokens</strong> - Authentification sécurisée avec tokens chiffrés</span>
              </li>
            </ul>
          </div>
        </Section>

        {/* Étape 1 : Création du service */}
        <Section id="create-service" title="Étape 1 : Créer un service dans Sorikama" icon={GitBranch}>
          <div className="prose dark:prose-invert max-w-none">
            <h3 className="text-xl font-semibold mb-4">Configuration du service</h3>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 p-4 mb-6">
              <p className="text-blue-900 dark:text-blue-100 font-medium">
                📝 Avant de commencer, vous devez enregistrer votre service dans Sorikama Hub
              </p>
            </div>

            <h4 className="font-semibold mb-3">Via l'interface admin :</h4>
            <ol className="space-y-3 text-gray-700 dark:text-gray-300 list-decimal list-inside">
              <li>Connectez-vous en tant qu'administrateur</li>
              <li>Allez dans <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">Admin → Gestion Services</code></li>
              <li>Cliquez sur "Créer un service"</li>
              <li>Remplissez les informations :
                <ul className="ml-6 mt-2 space-y-1 list-disc">
                  <li><strong>Nom</strong> : Nom du service (ex: "Masebuy")</li>
                  <li><strong>Slug</strong> : Identifiant unique (ex: "masebuy")</li>
                  <li><strong>Backend URL</strong> : URL de votre API (ex: http://localhost:4001)</li>
                  <li><strong>Frontend URL</strong> : URL de votre frontend (ex: http://localhost:3001)</li>
                </ul>
              </li>
            </ol>

            <div className="mt-6">
              <h4 className="font-semibold mb-3">Informations générées :</h4>
              <CodeBlock language="json">{`{
  "apiKey": "sk_live_abc123...",  // Clé API unique
  "slug": "masebuy",               // Identifiant du service
  "enabled": true                  // Service actif
}`}</CodeBlock>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 mt-6">
              <p className="text-yellow-900 dark:text-yellow-100">
                <strong>⚠️ Important :</strong> Conservez la clé API en sécurité, elle sera nécessaire pour les requêtes
              </p>
            </div>
          </div>
        </Section>

        {/* Étape 2 : Configuration Backend */}
        <Section id="backend-config" title="Étape 2 : Configuration du Backend" icon={Server}>
          <div className="prose dark:prose-invert max-w-none">
            <h3 className="text-xl font-semibold mb-4">Configuration des variables d'environnement</h3>
            
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Créez un fichier <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">.env</code> dans votre backend :
            </p>

            <CodeBlock language="bash">{`# URLs Sorikama Hub
SORIKAMA_FRONTEND_URL=http://localhost:5173
SORIKAMA_BACKEND_URL=http://localhost:7000

# Sécurité (DOIT être identique à Sorikama Hub)
SERVICE_HMAC_SECRET=votre_secret_hmac_partagé
ENCRYPTION_KEY=votre_clé_de_chiffrement_aes256

# MongoDB
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=votre_service

# Port de votre service
PORT=4001`}</CodeBlock>

            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-600 p-4 mt-6">
              <p className="text-red-900 dark:text-red-100 font-medium">
                🔒 <strong>Sécurité critique :</strong> Les clés SERVICE_HMAC_SECRET et ENCRYPTION_KEY doivent être identiques 
                entre Sorikama Hub et votre service pour le déchiffrement des tokens !
              </p>
            </div>

            <h4 className="font-semibold mt-6 mb-3">Middleware d'authentification Sorikama</h4>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Créez un middleware pour vérifier les requêtes provenant du Gateway :
            </p>

            <CodeBlock language="python">{`# Python/FastAPI Example
from fastapi import Request, HTTPException
import hmac
import hashlib
from cryptography.fernet import Fernet

def verify_sorikama_request(request: Request):
    # 1. Vérifier la signature HMAC
    signature = request.headers.get('X-Sorikama-Signature')
    if not signature:
        raise HTTPException(401, "Signature manquante")
    
    # 2. Récupérer les headers utilisateur
    user_id_encrypted = request.headers.get('X-User-Id')
    user_email = request.headers.get('X-User-Email')
    user_role = request.headers.get('X-User-Role')
    
    # 3. Déchiffrer l'ID utilisateur
    user_id = decrypt_user_id(user_id_encrypted)
    
    # 4. Retourner l'utilisateur authentifié
    return {
        "id": user_id,
        "email": user_email,
        "role": user_role
    }`}</CodeBlock>

            <CodeBlock language="javascript">{`// Node.js/Express Example
const crypto = require('crypto');

function verifySorikamaRequest(req, res, next) {
  // 1. Vérifier la signature HMAC
  const signature = req.headers['x-sorikama-signature'];
  if (!signature) {
    return res.status(401).json({ error: 'Signature manquante' });
  }
  
  // 2. Récupérer les headers utilisateur
  const userIdEncrypted = req.headers['x-user-id'];
  const userEmail = req.headers['x-user-email'];
  const userRole = req.headers['x-user-role'];
  
  // 3. Déchiffrer l'ID utilisateur
  const userId = decryptUserId(userIdEncrypted);
  
  // 4. Ajouter l'utilisateur à la requête
  req.user = {
    id: userId,
    email: userEmail,
    role: userRole
  };
  
  next();
}`}</CodeBlock>
          </div>
        </Section>

        {/* Étape 3 : Configuration Frontend */}
        <Section id="frontend-config" title="Étape 3 : Configuration du Frontend" icon={Code}>
          <div className="prose dark:prose-invert max-w-none">
            <h3 className="text-xl font-semibold mb-4">Intégration du bouton "Se connecter avec Sorikama"</h3>
            
            <h4 className="font-semibold mb-3">1. Redirection vers Sorikama Hub</h4>
            <CodeBlock language="javascript">{`// React Example
const handleSorikamaLogin = () => {
  const redirectUrl = encodeURIComponent(
    window.location.origin + '/auth/callback'
  );
  
  const sorikamaUrl = 
    'http://localhost:7000/api/v1/auth/check' +
    '?redirect=' + redirectUrl +
    '&service=masebuy';  // Votre slug de service
  
  window.location.href = sorikamaUrl;
};

// Dans votre composant Login
<button onClick={handleSorikamaLogin}>
  Se connecter avec Sorikama
</button>`}</CodeBlock>

            <h4 className="font-semibold mt-6 mb-3">2. Page de callback</h4>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Créez une page <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">/auth/callback</code> pour recevoir le code d'autorisation :
            </p>

            <CodeBlock language="javascript">{`// Callback Component
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function SorikamaCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    const code = searchParams.get('code');
    
    if (code) {
      // Échanger le code contre un token
      exchangeCodeForToken(code);
    }
  }, []);
  
  const exchangeCodeForToken = async (code) => {
    const response = await fetch(
      'http://localhost:7000/api/v1/sso/token',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, service: 'masebuy' })
      }
    );
    
    const data = await response.json();
    
    // Stocker le token
    localStorage.setItem('masebuy_token', data.data.accessToken);
    localStorage.setItem('masebuy_user', JSON.stringify(data.data.user));
    
    // Rediriger vers le dashboard
    navigate('/dashboard');
  };
  
  return <div>Connexion en cours...</div>;
}`}</CodeBlock>
          </div>
        </Section>

        {/* Étape 4 : Flow des requêtes */}
        <Section id="request-flow" title="Étape 4 : Flow des requêtes via le Gateway" icon={Zap}>
          <div className="prose dark:prose-invert max-w-none">
            <h3 className="text-xl font-semibold mb-4">Comment les requêtes transitent par le Gateway</h3>
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg mb-6">
              <h4 className="font-semibold mb-4">Schéma du flow :</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
                  <div className="flex-1">
                    <p className="font-medium">Frontend → Gateway</p>
                    <code className="text-sm">GET http://localhost:7000/api/v1/proxy/masebuy/stores/my-stores</code>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
                  <div className="flex-1">
                    <p className="font-medium">Gateway vérifie le JWT et crée/vérifie la session SSO</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
                  <div className="flex-1">
                    <p className="font-medium">Gateway → Backend Service</p>
                    <code className="text-sm">GET http://localhost:4001/api/stores/my-stores</code>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-orange-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">4</div>
                  <div className="flex-1">
                    <p className="font-medium">Backend traite et retourne la réponse</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">5</div>
                  <div className="flex-1">
                    <p className="font-medium">Gateway → Frontend (réponse)</p>
                  </div>
                </div>
              </div>
            </div>

            <h4 className="font-semibold mb-3">Configuration des requêtes frontend :</h4>
            <CodeBlock language="javascript">{`// Service HTTP Client
const API_BASE_URL = 'http://localhost:7000/api/v1/proxy/masebuy';

async function getStores() {
  const token = localStorage.getItem('masebuy_token');
  
  const response = await fetch(\`\${API_BASE_URL}/stores/my-stores\`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${token}\`
    }
  });
  
  return response.json();
}

// Le Gateway transforme automatiquement :
// /api/v1/proxy/masebuy/stores/my-stores
// → http://localhost:4001/api/stores/my-stores`}</CodeBlock>

            <h4 className="font-semibold mt-6 mb-3">Headers ajoutés par le Gateway :</h4>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 font-semibold">Header</th>
                    <th className="text-left py-2 font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 dark:text-gray-300">
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2"><code>X-User-Id</code></td>
                    <td>ID utilisateur chiffré</td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2"><code>X-User-Email</code></td>
                    <td>Email de l'utilisateur</td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2"><code>X-User-Role</code></td>
                    <td>Rôle de l'utilisateur</td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2"><code>X-Session-Id</code></td>
                    <td>ID de session SSO</td>
                  </tr>
                  <tr>
                    <td className="py-2"><code>X-Sorikama-Signature</code></td>
                    <td>Signature HMAC pour vérification</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </Section>

        {/* Sécurité */}
        <Section id="security" title="Sécurité et Bonnes Pratiques" icon={Lock}>
          <div className="prose dark:prose-invert max-w-none">
            <h3 className="text-xl font-semibold mb-4">Mesures de sécurité implémentées</h3>
            
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">Chiffrement AES-256</h4>
                    <p className="text-sm text-green-800 dark:text-green-200">
                      Les IDs utilisateurs sont chiffrés dans les tokens JWT
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">Signature HMAC</h4>
                    <p className="text-sm text-green-800 dark:text-green-200">
                      Toutes les requêtes sont signées avec HMAC-SHA256
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">Sessions SSO</h4>
                    <p className="text-sm text-green-800 dark:text-green-200">
                      Gestion centralisée des sessions avec expiration
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">Rate Limiting</h4>
                    <p className="text-sm text-green-800 dark:text-green-200">
                      Protection contre les abus et attaques DDoS
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-600 p-4">
              <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">⚠️ À ne JAMAIS faire :</h4>
              <ul className="space-y-1 text-red-800 dark:text-red-200 text-sm">
                <li>❌ Exposer les clés HMAC ou de chiffrement dans le code frontend</li>
                <li>❌ Stocker les tokens en clair dans la base de données</li>
                <li>❌ Accepter des requêtes sans vérifier la signature HMAC</li>
                <li>❌ Utiliser HTTP au lieu de HTTPS en production</li>
              </ul>
            </div>
          </div>
        </Section>

      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
          Questions techniques ? Contactez l'équipe dev à <a href="mailto:dev@sorikama.com" className="text-blue-600 hover:underline">dev@sorikama.com</a>
        </p>
      </div>
    </div>
  );
};

export default TechnicalDocumentation;
