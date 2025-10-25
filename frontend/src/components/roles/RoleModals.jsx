/**
 * Modals pour la gestion des rôles
 */

import { FiX, FiAlertCircle } from 'react-icons/fi';

/**
 * Modal de création/édition de rôle
 */
export function RoleFormModal({ 
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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {isEdit ? `Modifier le rôle: ${role.name}` : 'Créer un nouveau rôle'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Nom du rôle *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="ex: moderator"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows="3"
              placeholder="Description du rôle..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Permissions ({formData.permissions.length} sélectionnées)
            </label>
            <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50">
              {Object.entries(permissions).map(([subject, perms]) => (
                <div key={subject} className="mb-4 last:mb-0">
                  <div className="font-bold text-gray-900 dark:text-white mb-2 sticky top-0 bg-gray-50 dark:bg-gray-900/50 py-1">
                    {subject}
                  </div>
                  <div className="space-y-2 ml-4">
                    {perms.map(perm => (
                      <label 
                        key={perm.id} 
                        className="flex items-start gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(perm.id)}
                          onChange={() => togglePermission(perm.id)}
                          className="w-4 h-4 text-blue-600 rounded mt-0.5"
                        />
                        <div className="flex-1">
                          <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                            {perm.fullPermission}
                          </span>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {perm.description}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onSubmit}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isEdit ? 'Mettre à jour' : 'Créer'}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Modal de suppression de rôle
 */
export function DeleteRoleModal({ isOpen, onClose, onConfirm, role }) {
  if (!isOpen || !role) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
        {/* Icon */}
        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiAlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
        </div>

        {/* Content */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
          Supprimer le rôle
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
          Êtes-vous sûr de vouloir supprimer le rôle{' '}
          <strong className="text-gray-900 dark:text-white">{role.name}</strong> ?
          <br />
          <span className="text-sm">Cette action est irréversible.</span>
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}
