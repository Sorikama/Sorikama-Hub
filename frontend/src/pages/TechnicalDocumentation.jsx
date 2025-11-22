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

        {/* Configuration complète Backend */}
        <Section id="backend-complete" title="Configuration Backend Complète (Exemple Masebuy)" icon={Server}>
          <div className="prose dark:prose-invert max-w-none">
            <h3 className="text-xl font-semibold mb-4">Structure complète du backend</h3>
            
            <h4 className="font-semibold mb-3">1. Middleware Sorikama complet</h4>
            <CodeBlock language="python">{`# app/core/sorikama_middleware.py
from fastapi import Request, HTTPException, Header
from typing import Optional
import hmac
import hashlib
from cryptography.fernet import Fernet
import os

class SorikamaUser:
    def __init__(self, id: str, email: str, role: str, name: str):
        self.id = id
        self.email = email
        self.role = role
        self.name = name

def decrypt_user_id(encrypted_id: str) -> str:
    """Déchiffre l'ID utilisateur avec la clé partagée"""
    encryption_key = os.getenv('ENCRYPTION_KEY')
    
    # Séparer IV et données chiffrées
    parts = encrypted_id.split(':')
    if len(parts) != 2:
        raise ValueError("Format d'ID invalide")
    
    iv_hex, encrypted_hex = parts
    
    # Déchiffrer avec AES-256-CBC
    from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
    from cryptography.hazmat.backends import default_backend
    
    key = bytes.fromhex(encryption_key)
    iv = bytes.fromhex(iv_hex)
    encrypted = bytes.fromhex(encrypted_hex)
    
    cipher = Cipher(
        algorithms.AES(key),
        modes.CBC(iv),
        backend=default_backend()
    )
    decryptor = cipher.decryptor()
    decrypted = decryptor.update(encrypted) + decryptor.finalize()
    
    # Retirer le padding PKCS7
    padding_length = decrypted[-1]
    return decrypted[:-padding_length].decode('utf-8')

def verify_sorikama_signature(
    user_id: str,
    user_email: str,
    user_role: str,
    signature: str
) -> bool:
    """Vérifie la signature HMAC de la requête"""
    hmac_secret = os.getenv('SERVICE_HMAC_SECRET')
    
    # Reconstruire le message signé
    message = f"{user_id}:{user_email}:{user_role}"
    
    # Calculer la signature attendue
    expected_signature = hmac.new(
        hmac_secret.encode(),
        message.encode(),
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(signature, expected_signature)

async def get_sorikama_user(
    request: Request,
    x_user_id: Optional[str] = Header(None),
    x_user_email: Optional[str] = Header(None),
    x_user_role: Optional[str] = Header(None),
    x_sorikama_signature: Optional[str] = Header(None),
    x_proxied_by: Optional[str] = Header(None)
) -> SorikamaUser:
    """Extrait et vérifie l'utilisateur depuis les headers Sorikama"""
    
    # Vérifier que la requête vient du proxy
    if x_proxied_by != "Sorikama-Hub":
        raise HTTPException(401, "Requête non autorisée")
    
    # Vérifier la présence des headers
    if not all([x_user_id, x_user_email, x_user_role, x_sorikama_signature]):
        raise HTTPException(401, "Headers Sorikama manquants")
    
    # Vérifier la signature HMAC
    if not verify_sorikama_signature(
        x_user_id, x_user_email, x_user_role, x_sorikama_signature
    ):
        raise HTTPException(401, "Signature invalide")
    
    # Déchiffrer l'ID utilisateur
    try:
        user_id = decrypt_user_id(x_user_id)
    except Exception as e:
        raise HTTPException(401, f"Erreur déchiffrement: {str(e)}")
    
    # Créer l'objet utilisateur
    return SorikamaUser(
        id=user_id,
        email=x_user_email,
        role=x_user_role,
        name=x_user_email.split('@')[0]
    )`}</CodeBlock>

            <h4 className="font-semibold mt-6 mb-3">2. Utilisation dans les routes</h4>
            <CodeBlock language="python">{`# app/api/routes/stores.py
from fastapi import APIRouter, Depends
from app.core.sorikama_middleware import get_sorikama_user, SorikamaUser

router = APIRouter()

@router.get("/stores/my-stores")
async def get_my_stores(
    current_user: SorikamaUser = Depends(get_sorikama_user)
):
    """Récupère les boutiques de l'utilisateur connecté"""
    
    # L'utilisateur est automatiquement authentifié
    stores = await Store.find({"owner_id": current_user.id})
    
    return {
        "success": True,
        "data": stores
    }`}</CodeBlock>

            <h4 className="font-semibold mt-6 mb-3">3. Configuration CORS</h4>
            <CodeBlock language="python">{`# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS - Autoriser uniquement Sorikama Hub
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:7000",  # Gateway Sorikama
        "http://localhost:5173",  # Frontend Sorikama
        "http://localhost:3001",  # Frontend Service
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)`}</CodeBlock>
          </div>
        </Section>

        {/* Configuration Frontend complète */}
        <Section id="frontend-complete" title="Configuration Frontend Complète" icon={Code}>
          <div className="prose dark:prose-invert max-w-none">
            <h3 className="text-xl font-semibold mb-4">Implémentation complète côté frontend</h3>
            
            <h4 className="font-semibold mb-3">1. Service HTTP avec intercepteur</h4>
            <CodeBlock language="javascript">{`// src/services/httpClient.ts
const API_BASE_URL = 'http://localhost:7000/api/v1/proxy/masebuy';

class HttpClient {
  async request(endpoint: string, options: RequestInit = {}) {
    // Récupérer le token
    const token = localStorage.getItem('masebuy_token');
    
    if (!token) {
      throw new Error('Non authentifié');
    }
    
    // Préparer les headers
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${token}\`,
      ...options.headers
    };
    
    // Faire la requête via le Gateway
    const response = await fetch(\`\${API_BASE_URL}\${endpoint}\`, {
      ...options,
      headers
    });
    
    // Gérer les erreurs
    if (!response.ok) {
      if (response.status === 401) {
        // Token expiré, rediriger vers login
        localStorage.removeItem('masebuy_token');
        localStorage.removeItem('masebuy_user');
        window.location.href = '/login';
      }
      throw new Error(\`HTTP \${response.status}\`);
    }
    
    return response.json();
  }
  
  get(endpoint: string) {
    return this.request(endpoint, { method: 'GET' });
  }
  
  post(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
  
  put(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
  
  delete(endpoint: string) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export default new HttpClient();`}</CodeBlock>

            <h4 className="font-semibold mt-6 mb-3">2. Context d'authentification</h4>
            <CodeBlock language="javascript">{`// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Charger depuis localStorage au démarrage
    const savedToken = localStorage.getItem('masebuy_token');
    const savedUser = localStorage.getItem('masebuy_user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    
    setLoading(false);
  }, []);
  
  const login = (tokenData, userData) => {
    localStorage.setItem('masebuy_token', tokenData);
    localStorage.setItem('masebuy_user', JSON.stringify(userData));
    setToken(tokenData);
    setUser(userData);
  };
  
  const logout = () => {
    localStorage.removeItem('masebuy_token');
    localStorage.removeItem('masebuy_user');
    setToken(null);
    setUser(null);
  };
  
  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);`}</CodeBlock>

            <h4 className="font-semibold mt-6 mb-3">3. Route protégée</h4>
            <CodeBlock language="javascript">{`// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Chargement...</div>;
  }
  
  if (!user) {
    // Rediriger vers Sorikama pour connexion
    const redirectUrl = encodeURIComponent(
      window.location.origin + '/auth/callback'
    );
    window.location.href = 
      \`http://localhost:7000/api/v1/auth/check?redirect=\${redirectUrl}&service=masebuy\`;
    return null;
  }
  
  return children;
}`}</CodeBlock>
          </div>
        </Section>

        {/* Variables d'environnement */}
        <Section id="env-vars" title="Variables d'environnement complètes" icon={Lock}>
          <div className="prose dark:prose-invert max-w-none">
            <h3 className="text-xl font-semibold mb-4">Configuration .env pour chaque composant</h3>
            
            <h4 className="font-semibold mb-3">Sorikama Hub Backend (.env)</h4>
            <CodeBlock language="bash">{`# Application
NODE_ENV=development
PORT=7000
BASE_URL=http://localhost:7000/api/v1
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:7000

# JWT
JWT_SECRET=votre_secret_jwt_très_long_et_sécurisé
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=votre_secret_refresh_différent
JWT_REFRESH_EXPIRES_IN=7d

# MongoDB
MONGO_URI=mongodb://localhost:27017/sorikama_gateway

# Admin par défaut
DEFAULT_ADMIN_EMAIL=admin@sorikama.com
DEFAULT_ADMIN_PASSWORD=Admin@123

# Chiffrement AES-256 (64 caractères hex = 32 bytes)
ENCRYPTION_KEY=ecd0017f89935561d7e9cd6e22120e524441c1e664f8756079664b11adfa288b

# Email (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre_mot_de_passe_application
EMAIL_FROM=noreply@sorikama.com

# Blind Index Pepper (pour hasher les emails)
BLIND_INDEX_PEPPER=2475b4664a6b29525cbc36695d22038ab67c8307f467ce30ea7a5a01eeba351a

# HMAC Secret (128 caractères) - DOIT être partagé avec les services
SERVICE_HMAC_SECRET=deeaa61ceabff54746bdb03b0748e5c6ba49db38f8935bf7b508a7246e22295278cade6c6024c2a5158492f025e65ddc03b3ced6fd5b279c08c4302b0bc30f6e`}</CodeBlock>

            <h4 className="font-semibold mt-6 mb-3">Service Backend (.env) - Exemple Masebuy</h4>
            <CodeBlock language="bash">{`# URLs Sorikama Hub
SORIKAMA_FRONTEND_URL=http://localhost:5173
SORIKAMA_BACKEND_URL=http://localhost:7000

# MongoDB
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=masebuy

# Port du service
PORT=4001

# Sécurité - DOIT être identique à Sorikama Hub
SERVICE_HMAC_SECRET=deeaa61ceabff54746bdb03b0748e5c6ba49db38f8935bf7b508a7246e22295278cade6c6024c2a5158492f025e65ddc03b3ced6fd5b279c08c4302b0bc30f6e
ENCRYPTION_KEY=ecd0017f89935561d7e9cd6e22120e524441c1e664f8756079664b11adfa288b`}</CodeBlock>

            <h4 className="font-semibold mt-6 mb-3">Service Frontend (.env)</h4>
            <CodeBlock language="bash">{`# URL du Gateway Sorikama
VITE_GATEWAY_URL=http://localhost:7000
VITE_SERVICE_SLUG=masebuy

# URL du frontend Sorikama (pour redirection login)
VITE_SORIKAMA_FRONTEND=http://localhost:5173`}</CodeBlock>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 mt-6">
              <p className="text-yellow-900 dark:text-yellow-100 font-medium">
                ⚠️ <strong>CRITIQUE :</strong> Les clés SERVICE_HMAC_SECRET et ENCRYPTION_KEY doivent être 
                EXACTEMENT identiques entre Sorikama Hub et tous les services !
              </p>
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
