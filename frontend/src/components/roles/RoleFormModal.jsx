/**
 * Modal moderne et simplifiée pour la gestion des rôles
 * Design épuré et intuitif
 */

import { useState } from 'react';
import { FiX, FiInfo, FiLock, FiShield } from 'react-icons/fi';

export default function RoleFormModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  role = null,
  formData,
  setFormData,
  permissions = {},
  togglePermission
}) {
  if (!isOpen) return null;

  const isEdit = !!role;
  const isSystemRole = role?.isSystem || false;
  const [activeTab, setActiveTab] = useState('info');

  // Grouper les permissions par catégorie
  const permissionCategories = {
    'Utilisateurs': ['users'],
    'Services': ['services'],
    'Rôles & Permissions': ['roles', 'permissions'],
    'Système': ['logs', 'audit', 'stats', 'config']
  };

  const getPermissionsByCategory = (subjects) => {
    const result = [];
    subjects.forEach(subject => {
      if (permissions[subject]) {
        result.push(...permissions[subject]);
      }
    });
    return result;
  };

  const selectedCount = formData.permissions.length;
  const totalPermissions = Object.values(permissions).flat().length;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700 shadow-2xl animate-slideUp">
        
        {/* Header avec gradient */}
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <FiShield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">
                {isEdit ? `Modifier: ${role.name}` : 'Nouveau rôle'}
              </h3>
              <p className="text-white/80 text-sm mt-1">
                {isEdit ? 'Mettre à jour les informations du rôle' : 'Créer un nouveau rôle personnalisé'}
              </p>
            </div>
          </div>
        </div>

        {/* Alerte pour les rôles système */}
        {isSystemRole && (
          <div className="mx-6 mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3">
            <FiLock className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                Rôle système protégé
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                Ce rôle fait partie du système et ne peut pas être modifié ou supprimé.
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-6">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'info'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Informations
              {activeTab === 'info' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('permissions')}
              className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'permissions'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Permissions
              <span className="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-full">
                {selectedCount}/{totalPermissions}
              </span>
              {activeTab === 'permissions' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
              )}
            </button>
          </div>
        </div>

        {/* Body avec scroll */}
        <div className="overflow-y-auto max-h-[calc(90vh-280px)] p-6">
          
          {/* Tab: Informations */}
          {activeTab === 'info' && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Nom du rôle *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={isSystemRole}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="ex: moderator, manager, editor"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Utilisez un nom court et descriptif (lettres minuscules, sans espaces)
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={isSystemRole}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                  rows="4"
                  placeholder="Décrivez les responsabilités et le niveau d'accès de ce rôle..."
                />
              </div>

              {/* Info box */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl flex items-start gap-3">
                <FiInfo className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900 dark:text-blue-200">
                  <p className="font-semibold mb-1">À propos des rôles personnalisés</p>
                  <p className="text-blue-700 dark:text-blue-300">
                    Les rôles personnalisés vous permettent de créer des niveaux d'accès spécifiques 
                    pour votre équipe. Assignez uniquement les permissions nécessaires.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Permissions */}
          {activeTab === 'permissions' && (
            <div className="space-y-4">
              {/* Barre de progression */}
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Permissions sélectionnées
                  </span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {selectedCount} / {totalPermissions}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(selectedCount / totalPermissions) * 100}%` }}
                  />
                </div>
              </div>

              {/* Permissions par catégorie */}
              <div className="space-y-4">
                {Object.entries(permissionCategories).map(([category, subjects]) => {
                  const categoryPerms = getPermissionsByCategory(subjects);
                  if (categoryPerms.length === 0) return null;

                  const categorySelected = categoryPerms.filter(p => 
                    formData.permissions.includes(p.id)
                  ).length;

                  return (
                    <div 
                      key={category}
                      className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
                    >
                      {/* Category header */}
                      <div className="bg-gray-50 dark:bg-gray-900/50 px-4 py-3 flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {category}
                        </h4>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded-full">
                          {categorySelected}/{categoryPerms.length}
                        </span>
                      </div>

                      {/* Permissions list */}
                      <div className="p-4 space-y-2">
                        {categoryPerms.map(perm => (
                          <label 
                            key={perm.id} 
                            className="flex items-start gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors group"
                          >
                            <input
                              type="checkbox"
                              checked={formData.permissions.includes(perm.id)}
                              onChange={() => togglePermission(perm.id)}
                              disabled={isSystemRole}
                              className="w-5 h-5 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 mt-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <code className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
                                  {perm.fullPermission}
                                </code>
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {perm.description}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer avec actions */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              Annuler
            </button>
            {!isSystemRole && (
              <button
                onClick={onSubmit}
                disabled={!formData.name.trim()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
              >
                {isEdit ? 'Mettre à jour' : 'Créer le rôle'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
