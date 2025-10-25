/**
 * Filtres pour Audit Trail
 */

export default function AuditFilters({ filters, setFilters, onApply, onReset }) {
  const categories = [
    { value: '', label: 'Toutes les catégories' },
    { value: 'auth', label: '🔐 Authentification' },
    { value: 'users', label: '👥 Utilisateurs' },
    { value: 'roles', label: '🎭 Rôles' },
    { value: 'services', label: '🔧 Services' },
    { value: 'config', label: '⚙️ Configuration' }
  ];

  const actions = [
    { value: '', label: 'Toutes les actions' },
    { value: 'create', label: '➕ Créer' },
    { value: 'update', label: '✏️ Modifier' },
    { value: 'delete', label: '🗑️ Supprimer' },
    { value: 'login', label: '🔓 Connexion' },
    { value: 'logout', label: '🔒 Déconnexion' },
    { value: 'block', label: '🚫 Bloquer' }
  ];

  const statuses = [
    { value: '', label: 'Tous les statuts' },
    { value: 'success', label: '✅ Succès' },
    { value: 'failure', label: '❌ Échec' }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Filtres</h3>
        <button
          onClick={onReset}
          className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          Réinitialiser
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Catégorie */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Catégorie
          </label>
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        {/* Action */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Action
          </label>
          <select
            value={filters.action}
            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {actions.map(act => (
              <option key={act.value} value={act.value}>{act.label}</option>
            ))}
          </select>
        </div>

        {/* Statut */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Statut
          </label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {statuses.map(stat => (
              <option key={stat.value} value={stat.value}>{stat.label}</option>
            ))}
          </select>
        </div>

        {/* Recherche */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Recherche
          </label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="Email, IP, etc."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
          />
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={onApply}
          className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg font-medium"
        >
          Appliquer les filtres
        </button>
      </div>
    </div>
  );
}
