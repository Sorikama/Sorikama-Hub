/**
 * Graphique des requêtes par service
 */

export default function ServiceChart({ requestsByService, totalRequests }) {
  if (!requestsByService || requestsByService.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
        <div className="text-4xl mb-2">📈</div>
        <p className="text-gray-500 dark:text-gray-400">Aucun service actif</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          Requêtes par Service
        </h2>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {requestsByService.map((item) => {
            const percentage = totalRequests > 0 ? (item.totalRequests / totalRequests) * 100 : 0;
            return (
              <div key={item._id}>
                <div className="flex justify-between items-center mb-2">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {item._id || 'Global'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {item.totalRequests.toLocaleString()} requêtes • {item.uniqueUsers} utilisateur(s)
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {percentage.toFixed(1)}% du total
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
