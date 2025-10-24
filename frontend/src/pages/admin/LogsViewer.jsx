/**
 * Visualiseur de logs système
 * 
 * Affiche les logs en temps réel avec :
 * - Filtres par niveau (info, warn, error)
 * - Recherche
 * - Pagination
 * - Export
 */

import { useState, useEffect } from 'react';

export default function LogsViewer() {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Logs de démonstration (à remplacer par API)
  const demoLogs = [
    { id: 1, level: 'info', message: 'Utilisateur connecté', timestamp: new Date(), service: 'auth' },
    { id: 2, level: 'warn', message: 'Tentative de connexion échouée', timestamp: new Date(), service: 'auth' },
    { id: 3, level: 'error', message: 'Erreur de connexion à la base de données', timestamp: new Date(), service: 'database' },
    { id: 4, level: 'info', message: 'Service SSO démarré', timestamp: new Date(), service: 'sso' },
    { id: 5, level: 'info', message: 'Nouveau service créé', timestamp: new Date(), service: 'services' },
  ];

  useEffect(() => {
    setLogs(demoLogs);
  }, []);

  const filteredLogs = logs.filter(log => {
    if (filter !== 'all' && log.level !== filter) return false;
    if (search && !log.message.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getLevelColor = (level) => {
    switch (level) {
      case 'error': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'warn': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'info': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case 'error': return '❌';
      case 'warn': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📝';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Logs Système</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Consultation des journaux d'événements
        </p>
      </div>

      {/* Filtres */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Rechercher
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher dans les logs..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Niveau
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">Tous les niveaux</option>
              <option value="info">Info</option>
              <option value="warn">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des logs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              Aucun log trouvé
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-start gap-4">
                  <span className="text-2xl">{getLevelIcon(log.level)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getLevelColor(log.level)}`}>
                        {log.level.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {log.service}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {log.timestamp.toLocaleString('fr-FR')}
                      </span>
                    </div>
                    <p className="text-gray-900 dark:text-white font-mono text-sm">
                      {log.message}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Note */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          💡 <strong>Note :</strong> Cette page affiche des logs de démonstration. 
          L'intégration avec l'API backend est en cours de développement.
        </p>
      </div>
    </div>
  );
}
