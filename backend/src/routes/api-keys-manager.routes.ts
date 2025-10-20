// src/routes/api-keys-manager.routes.ts
import { Router } from 'express';
import { SimpleApiKeyModel } from '../database/models/simpleApiKey.model';
import { logger } from '../utils/logger';
import crypto from 'crypto';

const router = Router();

/**
 * GET /api-keys/manager - Gestionnaire des clés API
 */
router.get('/manager', async (req, res) => {
  try {
    const apiKeys = await SimpleApiKeyModel.find({}).sort({ createdAt: -1 });
    
    const managerHTML = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🔑 API Keys Manager - Sorikama</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700;900&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Poppins', sans-serif;
            background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #0f3460 100%);
            min-height: 100vh;
        }
        .glass-morphism {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        .neon-glow {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.3);
        }
        .gradient-text {
            background: linear-gradient(135deg, #3b82f6, #8b5cf6, #06b6d4, #10b981);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .key-card {
            transition: all 0.3s ease;
        }
        .key-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4);
        }
        .form-checkbox {
            appearance: none;
            background-color: rgba(255, 255, 255, 0.1);
            border: 2px solid rgba(255, 255, 255, 0.2);
            border-radius: 4px;
            width: 20px;
            height: 20px;
            position: relative;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .form-checkbox:checked {
            background-color: #3b82f6;
            border-color: #3b82f6;
        }
        .form-checkbox:checked::after {
            content: '✓';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 12px;
            font-weight: bold;
        }
        .form-checkbox:hover {
            border-color: #3b82f6;
            box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
        }
        .animate-pulse-border {
            animation: pulse-border 2s infinite;
        }
        @keyframes pulse-border {
            0%, 100% { border-opacity: 0.3; }
            50% { border-opacity: 0.8; }
        }
    </style>
</head>
<body class="text-white">
    <div class="min-h-screen p-6">
        <!-- Header -->
        <div class="max-w-7xl mx-auto mb-8">
            <div class="glass-morphism rounded-3xl p-6">
                <div class="flex justify-between items-center">
                    <div class="flex items-center space-x-4">
                        <div class="w-16 h-16 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-2xl flex items-center justify-center neon-glow">
                            <i class="fas fa-key text-white text-2xl"></i>
                        </div>
                        <div>
                            <h1 class="text-3xl font-bold gradient-text">API Keys Manager</h1>
                            <p class="text-yellow-300">Gestion des clés d'authentification</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-4">
                        <button onclick="createNewKey()" class="bg-green-500 bg-opacity-20 hover:bg-opacity-30 px-6 py-3 rounded-xl text-green-300 hover:text-white transition-all font-semibold">
                            <i class="fas fa-plus mr-2"></i>Nouvelle Clé
                        </button>
                        <a href="/api" class="glass-morphism px-6 py-3 rounded-xl hover:bg-white hover:bg-opacity-10 transition-all">
                            <i class="fas fa-arrow-left mr-2"></i>Retour
                        </a>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Stats -->
        <div class="max-w-7xl mx-auto mb-8">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div class="glass-morphism rounded-2xl p-6 text-center">
                    <div class="text-3xl font-bold text-blue-400">${apiKeys.length}</div>
                    <p class="text-gray-400 text-sm">Clés Totales</p>
                </div>
                <div class="glass-morphism rounded-2xl p-6 text-center">
                    <div class="text-3xl font-bold text-green-400">${apiKeys.filter(k => k.isActive).length}</div>
                    <p class="text-gray-400 text-sm">Actives</p>
                </div>
                <div class="glass-morphism rounded-2xl p-6 text-center">
                    <div class="text-3xl font-bold text-red-400">${apiKeys.filter(k => !k.isActive).length}</div>
                    <p class="text-gray-400 text-sm">Révoquées</p>
                </div>
                <div class="glass-morphism rounded-2xl p-6 text-center">
                    <div class="text-3xl font-bold text-purple-400">${apiKeys.filter(k => k.expiresAt && new Date(k.expiresAt) < new Date()).length}</div>
                    <p class="text-gray-400 text-sm">Expirées</p>
                </div>
            </div>
        </div>
        
        <!-- API Keys List -->
        <div class="max-w-7xl mx-auto">
            <div class="glass-morphism rounded-2xl p-6">
                <h3 class="text-xl font-bold text-white mb-6 flex items-center">
                    <i class="fas fa-list text-blue-400 mr-3"></i>
                    Clés API (${apiKeys.length})
                </h3>
                
                <div class="space-y-4">
                    ${apiKeys.map(key => `
                    <div class="key-card glass-morphism rounded-lg p-6">
                        <div class="flex justify-between items-start">
                            <div class="flex-1">
                                <div class="flex items-center space-x-3 mb-3">
                                    <h4 class="font-bold text-white text-lg">${key.name || 'Sans nom'}</h4>
                                    <span class="px-3 py-1 rounded-full text-xs font-semibold ${key.isActive ? 'bg-green-500 bg-opacity-20 text-green-300' : 'bg-red-500 bg-opacity-20 text-red-300'}">
                                        ${key.isActive ? 'Active' : 'Révoquée'}
                                    </span>
                                    ${key.expiresAt && new Date(key.expiresAt) < new Date() ? '<span class="px-3 py-1 rounded-full text-xs font-semibold bg-orange-500 bg-opacity-20 text-orange-300">Expirée</span>' : ''}
                                    <span class="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500 bg-opacity-20 text-blue-300">
                                        ${key.permissions.join(', ')}
                                    </span>
                                </div>
                                
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span class="text-gray-400">Clé:</span>
                                        <code class="text-yellow-300 font-mono ml-2">${key.keyId.substring(0, 20)}...</code>
                                        <button onclick="copyToClipboard('${key.keyId}')" class="ml-2 text-blue-400 hover:text-blue-300">
                                            <i class="fas fa-copy"></i>
                                        </button>
                                    </div>
                                    <div>
                                        <span class="text-gray-400">Créée:</span>
                                        <span class="text-white ml-2">${new Date(key.createdAt).toLocaleDateString('fr-FR')}</span>
                                    </div>
                                    <div>
                                        <span class="text-gray-400">Dernière utilisation:</span>
                                        <span class="text-white ml-2">${key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString('fr-FR') : 'Jamais'}</span>
                                    </div>
                                    <div>
                                        <span class="text-gray-400">Utilisation:</span>
                                        <span class="text-white ml-2">${key.usageCount || 0} fois</span>
                                    </div>
                                    ${key.expiresAt ? `<div class="col-span-2"><span class="text-gray-400">Expire le:</span><span class="text-${new Date(key.expiresAt) < new Date() ? 'red' : 'yellow'}-300 ml-2 font-semibold">${new Date(key.expiresAt).toLocaleDateString('fr-FR')}</span></div>` : ''}
                                </div>
                                
                                ${key.description ? `<p class="text-gray-300 text-sm mt-3">${key.description}</p>` : ''}
                            </div>
                            
                            <div class="flex space-x-2 ml-4">
                                ${key.isActive ? `
                                <button onclick="revokeKey('${key._id}')" class="bg-red-500 bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg text-red-300 hover:text-white transition-all text-sm">
                                    <i class="fas fa-ban mr-1"></i>Révoquer
                                </button>
                                ` : `
                                <button onclick="reactivateKey('${key._id}')" class="bg-green-500 bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg text-green-300 hover:text-white transition-all text-sm">
                                    <i class="fas fa-check mr-1"></i>Réactiver
                                </button>
                                `}
                                <button onclick="deleteKey('${key._id}')" class="bg-gray-500 bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg text-gray-300 hover:text-white transition-all text-sm">
                                    <i class="fas fa-trash mr-1"></i>Supprimer
                                </button>
                            </div>
                        </div>
                    </div>
                    `).join('')}
                </div>
                
                ${apiKeys.length === 0 ? `
                <div class="text-center py-12">
                    <i class="fas fa-key text-gray-500 text-6xl mb-4"></i>
                    <p class="text-gray-400 text-lg">Aucune clé API trouvée</p>
                    <button onclick="createNewKey()" class="mt-4 bg-blue-500 bg-opacity-20 hover:bg-opacity-30 px-6 py-3 rounded-xl text-blue-300 hover:text-white transition-all font-semibold">
                        <i class="fas fa-plus mr-2"></i>Créer votre première clé
                    </button>
                </div>
                ` : ''}
            </div>
        </div>
    </div>
    
    <!-- Modal Success API Key -->
    <div id="apiKeySuccessModal" class="fixed inset-0 bg-black bg-opacity-80 hidden flex items-center justify-center z-50">
        <div class="glass-morphism rounded-3xl p-8 max-w-2xl w-full mx-4 border-2 border-green-400 border-opacity-30 animate-pulse-border">
            <div class="text-center mb-6">
                <div class="w-24 h-24 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-bounce">
                    <i class="fas fa-key text-white text-4xl"></i>
                </div>
                <h3 class="text-3xl font-bold text-white mb-2">🎉 Clé API Créée avec Succès !</h3>
                <p class="text-green-300 font-medium text-lg" id="keySuccessName">Nom de la clé</p>
            </div>
            
            <div class="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl p-6 mb-6 border-2 border-green-400 border-opacity-40 shadow-2xl">
                <div class="flex items-center justify-between mb-4">
                    <label class="text-lg font-bold text-green-300 flex items-center">
                        <i class="fas fa-key mr-2"></i>Votre Clé API Secrète
                    </label>
                    <div class="flex items-center space-x-2">
                        <span class="text-xs bg-red-500 bg-opacity-40 text-red-200 px-3 py-2 rounded-full font-bold animate-pulse border border-red-400">
                            <i class="fas fa-exclamation-triangle mr-1"></i>AFFICHAGE UNIQUE
                        </span>
                        <span class="text-xs bg-yellow-500 bg-opacity-40 text-yellow-200 px-3 py-2 rounded-full font-bold border border-yellow-400">
                            <i class="fas fa-clock mr-1"></i>SAUVEGARDEZ MAINTENANT
                        </span>
                    </div>
                </div>
                <div class="relative mb-4">
                    <input type="text" id="generatedApiKey" readonly class="w-full bg-black bg-opacity-70 border-2 border-green-400 border-opacity-60 rounded-xl px-4 py-4 text-green-300 font-mono text-base focus:outline-none focus:ring-4 focus:ring-green-400 focus:border-green-400 shadow-inner">
                    <div class="absolute inset-0 bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-10 animate-pulse pointer-events-none rounded-xl"></div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <button onclick="copyToAdvancedClipboard()" id="copyApiKeyBtn" class="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 px-6 py-4 rounded-xl text-white font-bold transition-all flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105">
                        <i class="fas fa-copy text-lg"></i>
                        <span>Copier la Clé</span>
                    </button>
                    <button onclick="downloadAsFile()" class="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-6 py-4 rounded-xl text-white font-bold transition-all flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105">
                        <i class="fas fa-download text-lg"></i>
                        <span>Télécharger</span>
                    </button>
                </div>
            </div>
            
            <div class="bg-gradient-to-r from-red-500 to-orange-500 bg-opacity-15 border-2 border-red-400 border-opacity-40 rounded-2xl p-6 mb-6 shadow-lg">
                <div class="flex items-start space-x-4">
                    <div class="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <i class="fas fa-shield-alt text-white text-xl"></i>
                    </div>
                    <div>
                        <h4 class="text-red-300 font-bold text-lg mb-3 flex items-center">
                            <i class="fas fa-exclamation-triangle mr-2 animate-pulse"></i>
                            Consignes de Sécurité Critiques
                        </h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div class="flex items-center space-x-2">
                                <i class="fas fa-eye-slash text-red-400"></i>
                                <span class="text-red-200">Affichage unique - Ne sera plus visible</span>
                            </div>
                            <div class="flex items-center space-x-2">
                                <i class="fas fa-key text-red-400"></i>
                                <span class="text-red-200">Stockez dans un coffre-fort numérique</span>
                            </div>
                            <div class="flex items-center space-x-2">
                                <i class="fas fa-user-secret text-red-400"></i>
                                <span class="text-red-200">Ne jamais partager publiquement</span>
                            </div>
                            <div class="flex items-center space-x-2">
                                <i class="fas fa-ban text-red-400"></i>
                                <span class="text-red-200">Révoquer si compromise</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="flex space-x-4">
                <button onclick="copyToAdvancedClipboard()" class="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 px-6 py-4 rounded-xl text-white font-bold transition-all border-2 border-green-400 border-opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105">
                    <i class="fas fa-clipboard-check mr-2"></i>Copier & Sauvegarder
                </button>
                <button onclick="closeApiKeyModal()" class="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-6 py-4 rounded-xl text-white font-bold transition-all border-2 border-blue-400 border-opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105">
                    <i class="fas fa-check-circle mr-2"></i>J'ai Sauvegardé
                </button>
            </div>
        </div>
    </div>
    
    <!-- Toast de copie personnalisé amélioré -->
    <div id="copyToast" class="fixed top-6 right-6 bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-2xl shadow-2xl transform translate-x-full transition-all duration-500 z-50 border-2 border-green-400">
        <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <i class="fas fa-check text-green-200 animate-bounce"></i>
            </div>
            <div>
                <div class="font-bold text-lg">Clé Copiée !</div>
                <div class="text-green-200 text-sm">Sauvegardez-la maintenant</div>
            </div>
            <i class="fas fa-clipboard-check text-2xl text-green-200 animate-pulse"></i>
        </div>
    </div>
    
    <!-- Toast de téléchargement -->
    <div id="downloadToast" class="fixed top-6 right-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-2xl shadow-2xl transform translate-x-full transition-all duration-500 z-50 border-2 border-blue-400">
        <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <i class="fas fa-download text-blue-200 animate-bounce"></i>
            </div>
            <div>
                <div class="font-bold text-lg">Fichier Téléchargé !</div>
                <div class="text-blue-200 text-sm">Clé sauvegardée localement</div>
            </div>
            <i class="fas fa-file-download text-2xl text-blue-200 animate-pulse"></i>
        </div>
    </div>
    
    <!-- Toast simple pour copie -->
    <div id="simpleCopyToast" class="fixed top-6 right-6 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl shadow-2xl transform translate-x-full transition-all duration-500 z-50 border border-green-400">
        <div class="flex items-center space-x-2">
            <i class="fas fa-check text-green-200"></i>
            <span class="font-semibold">Clé copiée dans le presse-papiers !</span>
        </div>
    </div>
    
    <!-- Modal de confirmation de suppression -->
    <div id="deleteConfirmModal" class="fixed inset-0 bg-black bg-opacity-80 hidden flex items-center justify-center z-50">
        <div class="glass-morphism rounded-3xl p-8 max-w-md w-full mx-4 border-2 border-red-400 border-opacity-50 shadow-2xl">
            <input type="hidden" id="deleteKeyId">
            <div class="text-center mb-6">
                <div class="w-20 h-20 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
                    <i class="fas fa-trash-alt text-white text-3xl"></i>
                </div>
                <h3 class="text-2xl font-bold text-white mb-3">⚠️ Supprimer la Clé API</h3>
                <div class="bg-red-500 bg-opacity-20 border border-red-400 border-opacity-40 rounded-xl p-4 mb-4">
                    <p class="text-red-200 font-medium text-lg mb-2">Cette action est irréversible !</p>
                    <p class="text-red-300 text-sm">La clé API sera définitivement supprimée et ne pourra plus être utilisée.</p>
                </div>
                <p class="text-gray-300">Êtes-vous absolument certain de vouloir continuer ?</p>
            </div>
            <div class="flex space-x-4">
                <button onclick="closeDeleteModal()" class="flex-1 bg-gray-500 bg-opacity-20 hover:bg-opacity-30 px-6 py-4 rounded-xl text-gray-300 hover:text-white transition-all font-semibold border border-gray-400 border-opacity-30">
                    <i class="fas fa-times mr-2"></i>Annuler
                </button>
                <button onclick="confirmDeleteKey(document.getElementById('deleteKeyId').value)" class="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-6 py-4 rounded-xl text-white font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 border border-red-400 border-opacity-50">
                    <i class="fas fa-trash-alt mr-2"></i>Supprimer
                </button>
            </div>
        </div>
    </div>
    
    <!-- Modal d'erreur -->
    <div id="errorModal" class="fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center z-50">
        <div class="glass-morphism rounded-2xl p-8 max-w-md w-full mx-4 border-2 border-red-400 border-opacity-30">
            <div class="text-center mb-6">
                <div class="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-exclamation-triangle text-white text-2xl"></i>
                </div>
                <h3 class="text-xl font-bold text-white mb-2">Erreur</h3>
                <p class="text-red-300" id="errorMessage">Une erreur est survenue</p>
            </div>
            <button onclick="closeErrorModal()" class="w-full bg-red-500 bg-opacity-20 hover:bg-opacity-30 px-6 py-3 rounded-xl text-red-300 hover:text-white transition-all font-semibold">
                <i class="fas fa-times mr-2"></i>Fermer
            </button>
        </div>
    </div>
    
    <!-- Modal Create Key -->
    <div id="createKeyModal" class="fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center z-50">
        <div class="glass-morphism rounded-2xl p-8 max-w-md w-full mx-4">
            <h3 class="text-xl font-bold text-white mb-6">Créer une nouvelle clé API</h3>
            <form id="createKeyForm">
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">Nom de la clé</label>
                        <input type="text" id="keyName" class="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: Production API Key">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">Description (optionnel)</label>
                        <textarea id="keyDescription" class="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" rows="3" placeholder="Description de l'usage de cette clé"></textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">Date d'expiration (optionnel)</label>
                        <input type="date" id="keyExpiration" class="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <p class="text-xs text-gray-400 mt-1">Laissez vide pour une clé sans expiration</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-3">Permissions</label>
                        <div class="space-y-3">
                            <label class="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-white hover:bg-opacity-5 transition-all">
                                <input type="checkbox" value="read" class="form-checkbox">
                                <span class="text-white font-medium">Lecture</span>
                                <span class="text-gray-400 text-xs ml-auto">Acces en lecture seule</span>
                            </label>
                            <label class="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-white hover:bg-opacity-5 transition-all">
                                <input type="checkbox" value="write" class="form-checkbox">
                                <span class="text-white font-medium">Ecriture</span>
                                <span class="text-gray-400 text-xs ml-auto">Modification des donnees</span>
                            </label>
                            <label class="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-white hover:bg-opacity-5 transition-all">
                                <input type="checkbox" value="admin" class="form-checkbox">
                                <span class="text-white font-medium">Administration</span>
                                <span class="text-gray-400 text-xs ml-auto">Acces complet</span>
                            </label>
                        </div>
                    </div>
                </div>
                <div class="flex space-x-4 mt-6">
                    <button type="submit" class="flex-1 bg-green-500 bg-opacity-20 hover:bg-opacity-30 px-6 py-3 rounded-lg text-green-300 hover:text-white transition-all font-semibold">
                        <i class="fas fa-plus mr-2"></i>Créer
                    </button>
                    <button type="button" onclick="closeCreateModal()" class="flex-1 bg-gray-500 bg-opacity-20 hover:bg-opacity-30 px-6 py-3 rounded-lg text-gray-300 hover:text-white transition-all font-semibold">
                        Annuler
                    </button>
                </div>
            </form>
        </div>
    </div>
    
    <script>
        // Déclaration de toutes les fonctions d'abord
        function createNewKey() {
            document.getElementById('createKeyModal').classList.remove('hidden');
        }
        
        function closeCreateModal() {
            document.getElementById('createKeyModal').classList.add('hidden');
            // Reset form
            document.getElementById('createKeyForm').reset();
            document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
        }
        
        function copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(() => {
                showCopyToast();
            });
        }
        
        function showCopyToast() {
            const toast = document.getElementById('simpleCopyToast');
            toast.classList.remove('translate-x-full');
            toast.classList.add('translate-x-0');
            
            setTimeout(() => {
                toast.classList.remove('translate-x-0');
                toast.classList.add('translate-x-full');
            }, 3000);
        }
        
        async function revokeKey(keyId) {
            if (confirm('Etes-vous sur de vouloir revoquer cette cle?')) {
                try {
                    const response = await fetch('/api-keys/revoke/' + keyId, { method: 'POST' });
                    if (response.ok) {
                        location.reload();
                    } else {
                        alert('Erreur lors de la revocation');
                    }
                } catch (error) {
                    alert('Erreur: ' + error.message);
                }
            }
        }
        
        async function reactivateKey(keyId) {
            try {
                const response = await fetch('/api-keys/reactivate/' + keyId, { method: 'POST' });
                if (response.ok) {
                    location.reload();
                } else {
                    alert('Erreur lors de la reactivation');
                }
            } catch (error) {
                alert('Erreur: ' + error.message);
            }
        }
        
        async function deleteKey(keyId) {
            showDeleteConfirmModal(keyId);
        }
        
        async function confirmDeleteKey(keyId) {
            try {
                const response = await fetch('/api-keys/delete/' + keyId, { method: 'DELETE' });
                if (response.ok) {
                    closeDeleteModal();
                    location.reload();
                } else {
                    alert('Erreur lors de la suppression');
                }
            } catch (error) {
                alert('Erreur: ' + error.message);
            }
        }
        
        function showDeleteConfirmModal(keyId) {
            document.getElementById('deleteKeyId').value = keyId;
            document.getElementById('deleteConfirmModal').classList.remove('hidden');
        }
        
        function closeDeleteModal() {
            document.getElementById('deleteConfirmModal').classList.add('hidden');
        }
        
        function showApiKeyModal(apiKey, keyName) {
            document.getElementById('generatedApiKey').value = apiKey;
            document.getElementById('keySuccessName').textContent = keyName;
            document.getElementById('apiKeySuccessModal').classList.remove('hidden');
        }
        
        function closeApiKeyModal() {
            document.getElementById('apiKeySuccessModal').classList.add('hidden');
            location.reload();
        }
        
        function copyToAdvancedClipboard() {
            const apiKey = document.getElementById('generatedApiKey').value;
            const keyName = document.getElementById('keySuccessName').textContent;
            const copyBtn = document.getElementById('copyApiKeyBtn');
            const toast = document.getElementById('copyToast');
            
            // Méthode moderne de copie avec fallback
            const copyToClipboard = async () => {
                try {
                    // Essayer l'API moderne
                    if (navigator.clipboard && window.isSecureContext) {
                        await navigator.clipboard.writeText(apiKey);
                        return true;
                    } else {
                        // Fallback pour navigateurs plus anciens
                        const textArea = document.createElement('textarea');
                        textArea.value = apiKey;
                        textArea.style.position = 'fixed';
                        textArea.style.left = '-999999px';
                        textArea.style.top = '-999999px';
                        document.body.appendChild(textArea);
                        textArea.focus();
                        textArea.select();
                        
                        const successful = document.execCommand('copy');
                        document.body.removeChild(textArea);
                        return successful;
                    }
                } catch (err) {
                    return false;
                }
            };
            
            copyToClipboard().then(success => {
                if (success) {
                    // Animation du bouton
                    const originalHTML = copyBtn.innerHTML;
                    const originalClass = copyBtn.className;
                    
                    copyBtn.innerHTML = '<i class="fas fa-check animate-bounce text-xl"></i><span>Copié !</span>';
                    copyBtn.className = 'bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 rounded-xl text-white font-bold transition-all flex items-center justify-center space-x-2 shadow-xl transform scale-105';
                    
                    // Afficher le toast avancé
                    showAdvancedToast('copy');
                    
                    setTimeout(() => {
                        copyBtn.innerHTML = originalHTML;
                        copyBtn.className = originalClass;
                    }, 2000);
                } else {
                    // Fallback - sélectionner le texte
                    selectAllKey();
                    showErrorToast('Veuillez copier manuellement (Ctrl+C)');
                }
            });
        }
        
        function downloadAsFile() {
            const apiKey = document.getElementById('generatedApiKey').value;
            const keyName = document.getElementById('keySuccessName').textContent;
            const timestamp = new Date().toISOString().split('T')[0];
            
            const content = \`# Clé API Sorikama\n# Nom: \${keyName}\n# Créée le: \${new Date().toLocaleString('fr-FR')}\n# ATTENTION: Gardez cette clé secrète et sécurisée\n\nAPI_KEY=\${apiKey}\n\n# Utilisation:\n# X-API-Key: \${apiKey}\n# ou\n# Authorization: Bearer \${apiKey}\`;
            
            const blob = new Blob([content], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = \`sorikama-api-key-\${keyName.replace(/\\s+/g, '-').toLowerCase()}-\${timestamp}.txt\`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            showAdvancedToast('download');
        }
        
        function showAdvancedToast(type) {
            const toastId = type === 'copy' ? 'copyToast' : 'downloadToast';
            const toast = document.getElementById(toastId);
            
            toast.classList.remove('translate-x-full');
            toast.classList.add('translate-x-0');
            
            setTimeout(() => {
                toast.classList.remove('translate-x-0');
                toast.classList.add('translate-x-full');
            }, 4000);
        }
        
        function showErrorToast(message) {
            // Créer un toast d'erreur temporaire
            const errorToast = document.createElement('div');
            errorToast.className = 'fixed top-6 right-6 bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-4 rounded-2xl shadow-2xl z-50 border-2 border-red-400';
            errorToast.innerHTML = \`
                <div class="flex items-center space-x-3">
                    <i class="fas fa-exclamation-triangle text-red-200 animate-pulse"></i>
                    <span class="font-semibold">\${message}</span>
                </div>
            \`;
            
            document.body.appendChild(errorToast);
            
            setTimeout(() => {
                document.body.removeChild(errorToast);
            }, 5000);
        }
        
        function selectAllKey() {
            const input = document.getElementById('generatedApiKey');
            input.focus();
            input.select();
            input.setSelectionRange(0, 99999); // Pour mobile
        }
        
        function showErrorModal(message) {
            document.getElementById('errorMessage').textContent = message;
            document.getElementById('errorModal').classList.remove('hidden');
        }
        
        function closeErrorModal() {
            document.getElementById('errorModal').classList.add('hidden');
        }
        
        // Assignation aux objets globaux après déclaration
        window.createNewKey = createNewKey;
        window.closeCreateModal = closeCreateModal;
        window.copyToClipboard = copyToClipboard;
        window.revokeKey = revokeKey;
        window.reactivateKey = reactivateKey;
        window.deleteKey = deleteKey;
        window.confirmDeleteKey = confirmDeleteKey;
        window.showDeleteConfirmModal = showDeleteConfirmModal;
        window.closeDeleteModal = closeDeleteModal;
        window.showCopyToast = showCopyToast;
        window.showApiKeyModal = showApiKeyModal;
        window.closeApiKeyModal = closeApiKeyModal;
        window.copyToAdvancedClipboard = copyToAdvancedClipboard;
        window.downloadAsFile = downloadAsFile;
        window.selectAllKey = selectAllKey;
        
        document.getElementById('createKeyForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('keyName').value.trim();
            const description = document.getElementById('keyDescription').value.trim();
            const expirationDate = document.getElementById('keyExpiration').value;
            const permissions = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
            
            if (!name) {
                alert('Le nom de la cle est requis');
                return;
            }
            
            if (permissions.length === 0) {
                alert('Veuillez selectionner au moins une permission');
                return;
            }
            
            const formData = { name, description, permissions };
            if (expirationDate) {
                formData.expiresAt = expirationDate;
            }
            
            try {
                const response = await fetch('/api-keys/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showApiKeyModal(result.apiKey, result.keyData.name);
                    closeCreateModal();
                } else {
                    showErrorModal(result.message || 'Erreur lors de la création de la clé API');
                }
            } catch (error) {
                showErrorModal('Erreur réseau: ' + error.message);
            }
        });
    </script>
</body>
</html>`;
    
    res.send(managerHTML);
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des clés API'
    });
  }
});

/**
 * POST /api-keys/create - Créer une nouvelle clé API
 */
router.post('/create', async (req, res) => {
  try {
    const { name, description, permissions, expiresAt } = req.body;
    
    // Validation des données
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Le nom de la clé est requis'
      });
    }
    
    if (!permissions || !Array.isArray(permissions) || permissions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Au moins une permission est requise'
      });
    }
    
    const validPermissions = ['read', 'write', 'admin'];
    const invalidPerms = permissions.filter(p => !validPermissions.includes(p));
    if (invalidPerms.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Permissions invalides: ${invalidPerms.join(', ')}`
      });
    }
    
    const keyId = `sk_${crypto.randomBytes(24).toString('hex')}`;
    
    const keyData = {
      name: name.trim(),
      description: description?.trim() || '',
      permissions,
      keyId,
      hashedKey: crypto.createHash('sha256').update(keyId).digest('hex'),
      isActive: true,
      createdAt: new Date(),
      usageCount: 0
    };
    
    if (expiresAt) {
      keyData.expiresAt = new Date(expiresAt);
    }
    
    const newKey = new SimpleApiKeyModel(keyData);
    
    await newKey.save();
    
    logger.info(`🔑 Nouvelle clé API créée: ${newKey.name}`, {
      keyId: newKey._id,
      keyName: newKey.name,
      permissions: newKey.permissions,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      message: 'Clé API créée avec succès',
      apiKey: keyId,
      keyData: {
        id: newKey._id,
        name: newKey.name,
        permissions: newKey.permissions,
        createdAt: newKey.createdAt
      }
    });
    
  } catch (error) {
    console.error('Erreur création clé API:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la clé API: ' + error.message
    });
  }
});

/**
 * POST /api-keys/revoke/:id - Révoquer une clé API
 */
router.post('/revoke/:id', async (req, res) => {
  try {
    await SimpleApiKeyModel.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Clé révoquée avec succès' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la révocation' });
  }
});

/**
 * POST /api-keys/reactivate/:id - Réactiver une clé API
 */
router.post('/reactivate/:id', async (req, res) => {
  try {
    await SimpleApiKeyModel.findByIdAndUpdate(req.params.id, { isActive: true });
    res.json({ success: true, message: 'Clé réactivée avec succès' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la réactivation' });
  }
});

/**
 * DELETE /api-keys/delete/:id - Supprimer une clé API
 */
router.delete('/delete/:id', async (req, res) => {
  try {
    await SimpleApiKeyModel.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Clé supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la suppression' });
  }
});

export default router;