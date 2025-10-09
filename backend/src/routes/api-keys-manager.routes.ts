// src/routes/api-keys-manager.routes.ts
import { Router } from 'express';
import { SimpleApiKeyModel } from '../database/models/simpleApiKey.model';
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
        function createNewKey() {
            document.getElementById('createKeyModal').classList.remove('hidden');
        }
        
        // Fonctions globales
        window.createNewKey = createNewKey;
        window.closeCreateModal = closeCreateModal;
        window.copyToClipboard = copyToClipboard;
        window.revokeKey = revokeKey;
        window.reactivateKey = reactivateKey;
        window.deleteKey = deleteKey;
        
        function closeCreateModal() {
            document.getElementById('createKeyModal').classList.add('hidden');
            // Reset form
            document.getElementById('createKeyForm').reset();
            document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
        }
        
        function copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(() => {
                alert('Cle copiee dans le presse-papiers!');
            });
        }
        
        async function revokeKey(keyId) {
            if (confirm('Etes-vous sur de vouloir revoquer cette cle?')) {
                try {
                    const response = await fetch(\`/api-keys/revoke/\${keyId}\`, { method: 'POST' });
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
                const response = await fetch(\`/api-keys/reactivate/\${keyId}\`, { method: 'POST' });
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
            if (confirm('Etes-vous sur de vouloir supprimer definitivement cette cle?')) {
                try {
                    const response = await fetch(\`/api-keys/delete/\${keyId}\`, { method: 'DELETE' });
                    if (response.ok) {
                        location.reload();
                    } else {
                        alert('Erreur lors de la suppression');
                    }
                } catch (error) {
                    alert('Erreur: ' + error.message);
                }
            }
        }
        
        document.getElementById('createKeyForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('keyName').value.trim();
            const description = document.getElementById('keyDescription').value.trim();
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
            
            try {
                const response = await fetch('/api-keys/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('Cle creee avec succes!\n\nCle API: ' + result.apiKey + '\n\nCopiez cette cle maintenant, elle ne sera plus affichee!');
                    closeCreateModal();
                    location.reload();
                } else {
                    alert('Erreur: ' + result.message);
                }
            } catch (error) {
                alert('Erreur reseau: ' + error.message);
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
    const { name, description, permissions } = req.body;
    
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
    
    const newKey = new SimpleApiKeyModel({
      name: name.trim(),
      description: description?.trim() || '',
      permissions,
      keyId,
      hashedKey: crypto.createHash('sha256').update(keyId).digest('hex'),
      isActive: true,
      createdAt: new Date(),
      usageCount: 0
    });
    
    await newKey.save();
    
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