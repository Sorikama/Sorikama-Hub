/**
 * Timeline des logs d'audit
 */

export default function AuditTimeline({ logs, isLoading, onViewDetails }) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Chargement des logs...</p>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Aucun log trouvé
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Aucune activité ne correspond aux filtres sélectionnés
        </p>
      </div>
    );
  }

  const getCategoryIcon = (category) => {
    const icons = {
      auth: '🔐',
      users: '👥',
      roles: '🎭',
      services: '🔧',
      config: '⚙️'
    };
    return icons[category] || '📝';
  };

  const getCategoryColor = (category) => {
    const colors = {
      auth: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      users: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      roles: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
      services: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
      config: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
    };
    return colors[category] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
  };

  const getActionLabel = (action) => {
    const labels = {
      create: '➕ Créer',
      update: '✏️ Modifier',
      delete: '🗑️ Supprimer',
      login: '🔓 Connexion',
      logout: '🔒 Déconnexion',
      block: '🚫 Bloquer',
      unblock: '🔓 Débloquer'
    };
    return labels[action] || action;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          Journal d'audit ({logs.length})
        </h2>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {logs.map((log) => (
          <div
            key={log._id}
            className="p-6 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors cursor-pointer"
            onClick={() => onViewDetails(log)}
          >
            <div className="flex items-start gap-4">
              {/* Timeline dot */}
              <div className="flex-shrink-0 mt-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${getCategoryColor(log.category)}`}>
                  {getCategoryIcon(log.category)}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(log.category)}`}>
                        {log.category}
                      </span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {getActionLabel(log.action)}
                      </span>
                      {log.status === 'success' ? (
                        <span className="text-green-600 dark:text-green-400">✅</span>
                      ) : (
                        <span className="text-red-600 dark:text-red-400">❌</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {log.user ? (
                        <>
                          Par <strong>{log.user.firstName} {log.user.lastName}</strong> ({log.user.email})
                        </>
                      ) : (
                        <>Par utilisateur {log.userId?.substring(0, 8)}...</>
                      )}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(log.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(log.createdAt).toLocaleTimeString('fr-FR')}
                    </div>
                  </div>
                </div>

                {/* Details preview */}
                {log.details && (
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {log.ip && <span className="mr-3">📍 {log.ip}</span>}
                    {log.details.targetEmail && <span>→ {log.details.targetEmail}</span>}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
