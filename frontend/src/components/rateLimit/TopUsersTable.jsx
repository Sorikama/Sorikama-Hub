/**
 * Tableau des top utilisateurs
 */

export default function TopUsersTable({ topUsers }) {
  if (!topUsers || topUsers.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
        <div className="text-4xl mb-2">📊</div>
        <p className="text-gray-500 dark:text-gray-400">Aucune activité récente</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          Top Utilisateurs (Dernière heure)
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
                Requêtes
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                Services
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {topUsers.map((item, index) => (
              <tr key={item.userId} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      {item.user ? (
                        <>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {item.user.firstName} {item.user.lastName}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{item.user.email}</div>
                        </>
                      ) : (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {item.userId.substring(0, 8)}...
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-semibold">
                    {item.totalRequests.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {item.services.map(service => (
                      <span key={service} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                        {service}
                      </span>
                    ))}
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
