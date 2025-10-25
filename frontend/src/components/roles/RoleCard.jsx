/**
 * Carte de rôle réutilisable
 */

import { FiEdit2, FiTrash2, FiLock, FiUsers } from 'react-icons/fi';

export default function RoleCard({ role, onEdit, onDelete }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {role.name}
            </h3>
            {!role.isEditable && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full font-semibold flex items-center gap-1">
                <FiLock className="w-3 h-3" />
                Système
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {role.description || 'Aucune description'}
          </p>
        </div>
        
        {role.isEditable && (
          <div className="flex gap-2 ml-4">
            <button
              onClick={() => onEdit(role)}
              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              title="Modifier"
            >
              <FiEdit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(role)}
              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Supprimer"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-sm">
          <FiUsers className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600 dark:text-gray-400">
            {role.userCount || 0} utilisateur{(role.userCount || 0) > 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            {role.permissions?.length || 0} permission{(role.permissions?.length || 0) > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Permissions */}
      <div>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
          Permissions
        </p>
        <div className="flex flex-wrap gap-2">
          {role.permissions && role.permissions.length > 0 ? (
            role.permissions.slice(0, 6).map((perm) => (
              <span
                key={perm.id || perm._id}
                className="px-2 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full font-medium"
              >
                {perm.action}:{perm.subject}
              </span>
            ))
          ) : (
            <span className="text-sm text-gray-400 dark:text-gray-500 italic">
              Aucune permission
            </span>
          )}
          {role.permissions && role.permissions.length > 6 && (
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full font-medium">
              +{role.permissions.length - 6} autres
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
