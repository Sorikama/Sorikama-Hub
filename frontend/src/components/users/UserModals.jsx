/**
 * Modals pour la gestion des utilisateurs
 */

export function BlockUserModal({ user, isOpen, onClose, onConfirm, reason, setReason }) {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-xl">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Bloquer {user.firstName} {user.lastName}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Cette action bloquera l'utilisateur et révoquera toutes ses sessions.
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Raison du blocage..."
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
          rows="3"
        />
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Bloquer
          </button>
        </div>
      </div>
    </div>
  );
}

export function UserDetailsModal({ user, isOpen, onClose }) {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-xl">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Détails de l'utilisateur</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Infos de base */}
          <div>
            <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Nom complet</label>
            <p className="text-gray-900 dark:text-white mt-1">{user.firstName} {user.lastName}</p>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Email</label>
            <p className="text-gray-900 dark:text-white mt-1">{user.email}</p>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Rôle</label>
            <p className="text-gray-900 dark:text-white mt-1 capitalize">{user.role}</p>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Connexions</label>
            <p className="text-gray-900 dark:text-white mt-1">{user.loginCount || 0}</p>
          </div>
          
          {/* Infos de connexion */}
          <div>
            <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Première connexion</label>
            <p className="text-gray-900 dark:text-white mt-1">
              {user.firstLoginAt ? new Date(user.firstLoginAt).toLocaleString('fr-FR') : 'Jamais'}
            </p>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Dernière connexion</label>
            <p className="text-gray-900 dark:text-white mt-1">
              {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('fr-FR') : 'Jamais'}
            </p>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">IP de connexion</label>
            <p className="text-gray-900 dark:text-white mt-1 font-mono text-sm">
              {user.lastLoginIP || 'N/A'}
            </p>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Device</label>
            <p className="text-gray-900 dark:text-white mt-1 text-xs">
              {user.lastLoginDevice ? user.lastLoginDevice.substring(0, 50) + '...' : 'N/A'}
            </p>
          </div>
          
          {/* Dates */}
          <div>
            <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Dernière activité</label>
            <p className="text-gray-900 dark:text-white mt-1">
              {user.lastActivity ? new Date(user.lastActivity).toLocaleString('fr-FR') : 'Jamais'}
            </p>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Créé le</label>
            <p className="text-gray-900 dark:text-white mt-1">
              {new Date(user.createdAt).toLocaleString('fr-FR')}
            </p>
          </div>
        </div>

        {/* Blocage */}
        {user.isBlocked && (
          <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <label className="text-sm font-semibold text-red-700 dark:text-red-400">Raison du blocage</label>
            <p className="text-red-900 dark:text-red-300 mt-1">{user.blockedReason}</p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-2">
              Bloqué le {new Date(user.blockedAt).toLocaleString('fr-FR')}
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full mt-6 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}
