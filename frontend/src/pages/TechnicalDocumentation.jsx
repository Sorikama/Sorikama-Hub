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

        {/* Guide pratique */}
        <Section id="practical-guide" title="🎯 Guide Pratique : Créer un nouveau service de A à Z" icon={GitBranch}>
          <div className="prose dark:prose-invert max-w-none">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-4">Ce que vous allez créer :</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Un service externe (ex: "MonService") avec son frontend et backend, connecté à Sorikama Hub 
                pour l'authentification SSO. Les utilisateurs pourront se connecter avec leur compte Sorikama.
              </p>
            </div>

            <h3 className="text-2xl font-bold mb-4">📋 Prérequis</h3>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300 mb-6">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Sorikama Hub installé et fonctionnel (port 7000)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Compte administrateur sur Sorikama Hub</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Node.js ou Python installé pour votre backend</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>React ou framework frontend de votre choix</span>
              </li>
            </ul>
          </div>
        </Section>

        {/* Étape 1 : Enregistrer le service */}
        <Section id="step1-register" title="Étape 1 : Enregistrer votre service dans Sorikama" icon={Server}>
          <div className="prose dark:prose-invert max-w-none">
            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 p-4 mb-6">
              <p className="text-blue-900 dark:text-blue-100 font-medium">
                🎯 <strong>Objectif :</strong> Créer l'entrée de votre service dans Sorikama Hub
              </p>
            </div>

            <h4 className="font-semibold mb-3">Actions à faire :</h4>
            <ol className="space-y-4 text-gray-700 dark:text-gray-300 list-decimal list-inside">
              <li>
                <strong>Connectez-vous en tant qu'admin</strong> sur Sorikama Hub
                <div className="ml-6 mt-2">
                  <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">http://localhost:5173/login</code>
                </div>
              </li>
              
              <li>
                <strong>Allez dans la gestion des services</strong>
                <div className="ml-6 mt-2">
                  Menu Admin → Gestion Services → Créer un service
                </div>
              </li>
              
              <li>
                <strong>Remplissez le formulaire :</strong>
                <div className="ml-6 mt-2 space-y-2">
                  <div className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
                    <p><strong>Nom :</strong> MonService</p>
                    <p><strong>Slug :</strong> monservice (identifiant unique, minuscules)</p>
                    <p><strong>Description :</strong> Description de votre service</p>
                    <p><strong>Backend URL :</strong> http://localhost:4001</p>
                    <p><strong>Frontend URL :</strong> http://localhost:3001</p>
                    <p><strong>Callback URL :</strong> http://localhost:3001/auth/callback</p>
                  </div>
                </div>
              </li>
              
              <li>
                <strong>Sauvegardez et notez la clé API générée</strong>
                <div className="ml-6 mt-2">
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded border border-yellow-200 dark:border-yellow-800">
                    <p className="text-yellow-900 dark:text-yellow-100 text-sm">
                      ⚠️ Conservez cette clé en sécurité : <code>sk_live_abc123...</code>
                    </p>
                  </div>
                </div>
              </li>
            </ol>

            <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-600 p-4 mt-6">
              <p className="text-green-900 dark:text-green-100 font-medium">
                ✅ <strong>Résultat :</strong> Votre service est maintenant enregistré dans Sorikama Hub !
              </p>
            </div>
          </div>
        </Section>

        {/* Étape 2 : Créer le Backend */}
        <Section id="step2-backend" title="Étape 2 : Créer le Backend de votre service" icon={Server}>
          <div className="prose dark:prose-invert max-w-none">
            <div className="bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-600 p-4 mb-6">
              <p className="text-purple-900 dark:text-purple-100 font-medium">
                🎯 <strong>Objectif :</strong> Créer un backend qui accepte les requêtes authentifiées de Sorikama
              </p>
            </div>

            <h4 className="font-semibold mb-3">2.1 - Créer le projet backend</h4>
            <CodeBlock language="bash">{`# Créer le dossier
mkdir monservice-backend
cd monservice-backend

# Python/FastAPI
pip install fastapi uvicorn python-dotenv cryptography

# OU Node.js/Express
npm init -y
npm install express dotenv crypto`}</CodeBlock>

            <h4 className="font-semibold mt-6 mb-3">2.2 - Créer le fichier .env</h4>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Créez un fichier <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">.env</code> à la racine :
            </p>
            <CodeBlock language="bash">{`# URLs Sorikama Hub
SORIKAMA_FRONTEND_URL=http://localhost:5173
SORIKAMA_BACKEND_URL=http://localhost:7000

# MongoDB (ou votre BDD)
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=monservice

# Port de votre service
PORT=4001

# 🔒 SÉCURITÉ - Copiez ces valeurs depuis Sorikama Hub .env
SERVICE_HMAC_SECRET=deeaa61ceabff54746bdb03b0748e5c6ba49db38f8935bf7b508a7246e22295278cade6c6024c2a5158492f025e65ddc03b3ced6fd5b279c08c4302b0bc30f6e
ENCRYPTION_KEY=ecd0017f89935561d7e9cd6e22120e524441c1e664f8756079664b11adfa288b`}</CodeBlock>

            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-600 p-4 mt-4 mb-6">
              <p className="text-red-900 dark:text-red-100 font-medium">
                🔒 <strong>IMPORTANT :</strong> Les clés SERVICE_HMAC_SECRET et ENCRYPTION_KEY doivent être 
                EXACTEMENT les mêmes que dans le .env de Sorikama Hub !
              </p>
            </div>

            <h4 className="font-semibold mb-3">2.3 - Créer le middleware d'authentification</h4>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Créez <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">middleware/sorikama_auth.py</code> (Python) :
            </p>
            <CodeBlock language="python">{`# middleware/sorikama_auth.py
from fastapi import Request, HTTPException, Header
from typing import Optional
import hmac
import hashlib
import os

class SorikamaUser:
    def __init__(self, id: str, email: str, role: str):
        self.id = id
        self.email = email
        self.role = role

def decrypt_user_id(encrypted_id: str) -> str:
    """Déchiffre l'ID utilisateur"""
    from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
    from cryptography.hazmat.backends import default_backend
    
    encryption_key = os.getenv('ENCRYPTION_KEY')
    
    # Séparer IV:données
    iv_hex, encrypted_hex = encrypted_id.split(':')
    
    key = bytes.fromhex(encryption_key)
    iv = bytes.fromhex(iv_hex)
    encrypted = bytes.fromhex(encrypted_hex)
    
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
    decryptor = cipher.decryptor()
    decrypted = decryptor.update(encrypted) + decryptor.finalize()
    
    # Retirer padding
    padding_length = decrypted[-1]
    return decrypted[:-padding_length].decode('utf-8')

async def get_current_user(
    x_user_id: Optional[str] = Header(None),
    x_user_email: Optional[str] = Header(None),
    x_user_role: Optional[str] = Header(None),
    x_proxied_by: Optional[str] = Header(None)
) -> SorikamaUser:
    """Extrait l'utilisateur depuis les headers Sorikama"""
    
    # Vérifier que ça vient du Gateway
    if x_proxied_by != "Sorikama-Hub":
        raise HTTPException(401, "Non autorisé")
    
    if not all([x_user_id, x_user_email, x_user_role]):
        raise HTTPException(401, "Headers manquants")
    
    # Déchiffrer l'ID
    user_id = decrypt_user_id(x_user_id)
    
    return SorikamaUser(id=user_id, email=x_user_email, role=x_user_role)`}</CodeBlock>

            <p className="text-gray-700 dark:text-gray-300 mt-4 mb-3">
              OU en Node.js <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">middleware/sorikamaAuth.js</code> :
            </p>
            <CodeBlock language="javascript">{`// middleware/sorikamaAuth.js
const crypto = require('crypto');

function decryptUserId(encryptedId) {
  const encryptionKey = process.env.ENCRYPTION_KEY;
  const [ivHex, encryptedHex] = encryptedId.split(':');
  
  const key = Buffer.from(encryptionKey, 'hex');
  const iv = Buffer.from(ivHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  
  // Retirer padding
  const paddingLength = decrypted[decrypted.length - 1];
  return decrypted.slice(0, -paddingLength).toString('utf-8');
}

function sorikamaAuth(req, res, next) {
  const proxiedBy = req.headers['x-proxied-by'];
  const userIdEncrypted = req.headers['x-user-id'];
  const userEmail = req.headers['x-user-email'];
  const userRole = req.headers['x-user-role'];
  
  // Vérifier que ça vient du Gateway
  if (proxiedBy !== 'Sorikama-Hub') {
    return res.status(401).json({ error: 'Non autorisé' });
  }
  
  if (!userIdEncrypted || !userEmail || !userRole) {
    return res.status(401).json({ error: 'Headers manquants' });
  }
  
  // Déchiffrer l'ID
  const userId = decryptUserId(userIdEncrypted);
  
  // Ajouter l'utilisateur à la requête
  req.user = {
    id: userId,
    email: userEmail,
    role: userRole
  };
  
  next();
}

module.exports = { sorikamaAuth };`}</CodeBlock>

            <h4 className="font-semibold mt-6 mb-3">2.4 - Créer une route protégée</h4>
            <CodeBlock language="python">{`# routes/items.py (Python/FastAPI)
from fastapi import APIRouter, Depends
from middleware.sorikama_auth import get_current_user, SorikamaUser

router = APIRouter()

@router.get("/items")
async def get_items(current_user: SorikamaUser = Depends(get_current_user)):
    """Route protégée - accessible uniquement via Sorikama"""
    
    return {
        "success": True,
        "message": f"Bonjour {current_user.email}",
        "data": {
            "user_id": current_user.id,
            "items": []
        }
    }`}</CodeBlock>

            <CodeBlock language="javascript">{`// routes/items.js (Node.js/Express)
const express = require('express');
const { sorikamaAuth } = require('../middleware/sorikamaAuth');

const router = express.Router();

router.get('/items', sorikamaAuth, (req, res) => {
  // req.user est automatiquement rempli par le middleware
  
  res.json({
    success: true,
    message: \`Bonjour \${req.user.email}\`,
    data: {
      user_id: req.user.id,
      items: []
    }
  });
});

module.exports = router;`}</CodeBlock>

            <h4 className="font-semibold mt-6 mb-3">2.5 - Configurer CORS</h4>
            <CodeBlock language="python">{`# main.py (Python/FastAPI)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:7000",  # Gateway
        "http://localhost:3001",  # Votre frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)`}</CodeBlock>

            <h4 className="font-semibold mt-6 mb-3">2.6 - Lancer le backend</h4>
            <CodeBlock language="bash">{`# Python
uvicorn main:app --reload --port 4001

# Node.js
node server.js`}</CodeBlock>

            <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-600 p-4 mt-6">
              <p className="text-green-900 dark:text-green-100 font-medium">
                ✅ <strong>Résultat :</strong> Votre backend est prêt à recevoir des requêtes authentifiées !
              </p>
            </div>
          </div>
        </Section>
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

        {/* Étape 2 suite */}
        <Section id="step2-backend-continued" title="Étape 2 (suite) : Implémenter le middleware" icon={Lock}>
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

        {/* Étape 3 : Créer le Frontend */}
        <Section id="step3-frontend" title="Étape 3 : Créer le Frontend de votre service" icon={Code}>
          <div className="prose dark:prose-invert max-w-none">
            <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-600 p-4 mb-6">
              <p className="text-green-900 dark:text-green-100 font-medium">
                🎯 <strong>Objectif :</strong> Créer un frontend qui redirige vers Sorikama pour la connexion
              </p>
            </div>

            <h4 className="font-semibold mb-3">3.1 - Créer le projet React</h4>
            <CodeBlock language="bash">{`# Créer le projet
npx create-react-app monservice-frontend
cd monservice-frontend

# Installer les dépendances
npm install react-router-dom axios`}</CodeBlock>

            <h4 className="font-semibold mt-6 mb-3">3.2 - Créer le fichier .env</h4>
            <CodeBlock language="bash">{`# .env
REACT_APP_GATEWAY_URL=http://localhost:7000
REACT_APP_SERVICE_SLUG=monservice
REACT_APP_SORIKAMA_FRONTEND=http://localhost:5173`}</CodeBlock>

            <h4 className="font-semibold mt-6 mb-3">3.3 - Créer la page de Login</h4>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Créez <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">src/pages/Login.jsx</code> :
            </p>
            <CodeBlock language="javascript">{`// src/pages/Login.jsx
import React from 'react';

function Login() {
  const handleSorikamaLogin = () => {
    // URL de callback après connexion
    const callbackUrl = encodeURIComponent(
      window.location.origin + '/auth/callback'
    );
    
    // Rediriger vers Sorikama Hub
    const sorikamaUrl = 
      \`\${process.env.REACT_APP_GATEWAY_URL}/api/v1/auth/check\` +
      \`?redirect=\${callbackUrl}\` +
      \`&service=\${process.env.REACT_APP_SERVICE_SLUG}\`;
    
    window.location.href = sorikamaUrl;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Connexion à MonService</h1>
        
        <button
          onClick={handleSorikamaLogin}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700"
        >
          Se connecter avec Sorikama
        </button>
      </div>
    </div>
  );
}

export default Login;`}</CodeBlock>

            <h4 className="font-semibold mt-6 mb-3">3.4 - Créer la page de Callback</h4>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Créez <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">src/pages/SorikamaCallback.jsx</code> :
            </p>
            <CodeBlock language="javascript">{`// src/pages/SorikamaCallback.jsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function SorikamaCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    const code = searchParams.get('code');
    
    if (code) {
      exchangeCodeForToken(code);
    } else {
      navigate('/login');
    }
  }, []);
  
  const exchangeCodeForToken = async (code) => {
    try {
      // Échanger le code contre un token
      const response = await fetch(
        \`\${process.env.REACT_APP_GATEWAY_URL}/api/v1/sso/token\`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: code,
            service: process.env.REACT_APP_SERVICE_SLUG
          })
        }
      );
      
      const data = await response.json();
      
      if (data.status === 'success') {
        // Stocker le token et l'utilisateur
        localStorage.setItem('monservice_token', data.data.accessToken);
        localStorage.setItem('monservice_user', JSON.stringify(data.data.user));
        
        // Rediriger vers le dashboard
        navigate('/dashboard');
      } else {
        throw new Error('Échec de l\'authentification');
      }
    } catch (error) {
      console.error('Erreur:', error);
      navigate('/login');
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Connexion en cours...</p>
      </div>
    </div>
  );
}

export default SorikamaCallback;`}</CodeBlock>

            <h4 className="font-semibold mt-6 mb-3">3.5 - Créer le service HTTP</h4>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Créez <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">src/services/httpClient.js</code> :
            </p>
            <CodeBlock language="javascript">{`// src/services/httpClient.js
const API_BASE_URL = \`\${process.env.REACT_APP_GATEWAY_URL}/api/v1/proxy/\${process.env.REACT_APP_SERVICE_SLUG}\`;

class HttpClient {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('monservice_token');
    
    if (!token) {
      window.location.href = '/login';
      throw new Error('Non authentifié');
    }
    
    const response = await fetch(\`\${API_BASE_URL}\${endpoint}\`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${token}\`,
        ...options.headers
      }
    });
    
    if (response.status === 401) {
      // Token expiré
      localStorage.removeItem('monservice_token');
      localStorage.removeItem('monservice_user');
      window.location.href = '/login';
    }
    
    return response.json();
  }
  
  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }
  
  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
}

export default new HttpClient();`}</CodeBlock>

            <h4 className="font-semibold mt-6 mb-3">3.6 - Créer une route protégée</h4>
            <CodeBlock language="javascript">{`// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('monservice_token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

export default ProtectedRoute;`}</CodeBlock>

            <h4 className="font-semibold mt-6 mb-3">3.7 - Configurer les routes</h4>
            <CodeBlock language="javascript">{`// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import SorikamaCallback from './pages/SorikamaCallback';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<SorikamaCallback />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="/" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;`}</CodeBlock>

            <h4 className="font-semibold mt-6 mb-3">3.8 - Exemple d'utilisation dans une page</h4>
            <CodeBlock language="javascript">{`// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import httpClient from '../services/httpClient';

function Dashboard() {
  const [items, setItems] = useState([]);
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // Charger l'utilisateur
    const userData = localStorage.getItem('monservice_user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    // Charger les données via le Gateway
    loadItems();
  }, []);
  
  const loadItems = async () => {
    try {
      const response = await httpClient.get('/items');
      setItems(response.data.items);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">
        Bienvenue {user?.firstName} !
      </h1>
      <p>Email: {user?.email}</p>
      
      {/* Vos données ici */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-3">Mes items</h2>
        {/* Liste des items */}
      </div>
    </div>
  );
}

export default Dashboard;`}</CodeBlock>

            <h4 className="font-semibold mt-6 mb-3">3.9 - Lancer le frontend</h4>
            <CodeBlock language="bash">{`npm start
# Le frontend sera accessible sur http://localhost:3001`}</CodeBlock>

            <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-600 p-4 mt-6">
              <p className="text-green-900 dark:text-green-100 font-medium">
                ✅ <strong>Résultat :</strong> Votre frontend est prêt ! Les utilisateurs peuvent se connecter avec Sorikama.
              </p>
            </div>
          </div>
        </Section>
            
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

        {/* Étape 4 : Tester */}
        <Section id="step4-test" title="Étape 4 : Tester votre intégration" icon={CheckCircle}>
          <div className="prose dark:prose-invert max-w-none">
            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 p-4 mb-6">
              <p className="text-blue-900 dark:text-blue-100 font-medium">
                🎯 <strong>Objectif :</strong> Vérifier que tout fonctionne correctement
              </p>
            </div>

            <h4 className="font-semibold mb-3">Checklist de test :</h4>
            <div className="space-y-3">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm">1</div>
                  <div>
                    <p className="font-semibold">Sorikama Hub fonctionne</p>
                    <code className="text-sm">http://localhost:7000</code>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm">2</div>
                  <div>
                    <p className="font-semibold">Backend service fonctionne</p>
                    <code className="text-sm">http://localhost:4001</code>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm">3</div>
                  <div>
                    <p className="font-semibold">Frontend service fonctionne</p>
                    <code className="text-sm">http://localhost:3001</code>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm">4</div>
                  <div>
                    <p className="font-semibold">Service enregistré dans Sorikama</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Vérifier dans Admin → Gestion Services</p>
                  </div>
                </div>
              </div>
            </div>

            <h4 className="font-semibold mt-6 mb-3">Test du flow complet :</h4>
            <ol className="space-y-3 text-gray-700 dark:text-gray-300 list-decimal list-inside">
              <li>
                <strong>Ouvrez votre frontend</strong>
                <div className="ml-6 mt-1">
                  <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">http://localhost:3001</code>
                </div>
              </li>
              
              <li>
                <strong>Cliquez sur "Se connecter avec Sorikama"</strong>
                <div className="ml-6 mt-1 text-sm">
                  → Vous devez être redirigé vers Sorikama Hub
                </div>
              </li>
              
              <li>
                <strong>Connectez-vous sur Sorikama</strong>
                <div className="ml-6 mt-1 text-sm">
                  → Utilisez vos identifiants Sorikama
                </div>
              </li>
              
              <li>
                <strong>Autorisez l'accès au service</strong>
                <div className="ml-6 mt-1 text-sm">
                  → Cliquez sur "Autoriser"
                </div>
              </li>
              
              <li>
                <strong>Vérifiez la redirection</strong>
                <div className="ml-6 mt-1 text-sm">
                  → Vous devez être redirigé vers votre dashboard
                </div>
              </li>
            </ol>

            <h4 className="font-semibold mt-6 mb-3">Vérifier les logs :</h4>
            <CodeBlock language="bash">{`# Backend Sorikama Hub
# Vous devriez voir :
🔄 Requête proxy reçue
✅ Authentification réussie
✅ Session SSO vérifiée

# Backend de votre service
# Vous devriez voir :
📨 Requête Sorikama: GET /items
✅ Utilisateur authentifié: user@example.com`}</CodeBlock>

            <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-600 p-4 mt-6">
              <p className="text-green-900 dark:text-green-100 font-medium">
                🎉 <strong>Félicitations !</strong> Votre service est maintenant connecté à Sorikama Hub !
              </p>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 mt-4">
              <p className="text-yellow-900 dark:text-yellow-100 font-medium mb-2">
                ⚠️ <strong>Problèmes courants :</strong>
              </p>
              <ul className="text-sm space-y-1 text-yellow-800 dark:text-yellow-200">
                <li>• Erreur 401 : Vérifiez que les clés HMAC et ENCRYPTION_KEY sont identiques</li>
                <li>• Erreur CORS : Vérifiez la configuration CORS de votre backend</li>
                <li>• Redirection infinie : Vérifiez l'URL de callback dans Sorikama</li>
                <li>• Token expiré : Vérifiez que le JWT_SECRET est correct</li>
              </ul>
            </div>
          </div>
        </Section>

        {/* Flow des requêtes */}
        <Section id="request-flow" title="Comprendre le Flow des requêtes" icon={Zap}>
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
