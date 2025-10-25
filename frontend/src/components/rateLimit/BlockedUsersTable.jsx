/**
 * Tableau des utilisateurs bloqués
 */

export default function BlockedUsersTable({ 
  blockedUsers, 
  isLoading, 
  onUnblock, 
  onViewHistory,
  formatRemainingTime 
}) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
      </div>
    );
  }

  if (blockedUsers.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Aucun utilisateur bloqué
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Tous les utilisateurs respectent les limites de requêtes
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          Utilisateurs Bloqués ({blockedUsers.length})
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                Utilisateur
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                Service
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                Requêtes
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                Temps restant
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {blockedUsers.map((entry) => (
              <tr key={entry._id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                <td className="px-6 py-4">
                  {entry.user ? (
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {entry.user.firstName} {entry.user.lastName}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{entry.user.email}</div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      ID: {entry.userId.substring(0, 8)}...
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-medium">
                    {entry.service || 'Global'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-sm font-semibold">
                    {entry.requestCount}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    {formatRemainingTime(entry.remainingTime)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onViewHistory(entry)}
                      className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Voir l'historique"
                    >
                      📊
                    </button>
                    <button
                      onClick={() => onUnblock(
                        entry.userId,
                        entry.user ? `${entry.user.firstName} ${entry.user.lastName}` : `Utilisateur ${entry.userId.substring(0, 8)}`
                      )}
                      className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                      title="Débloquer"
                    >
                      🔓
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
