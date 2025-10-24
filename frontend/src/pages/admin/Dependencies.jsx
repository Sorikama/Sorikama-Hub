/**
 * Page des dépendances système
 * 
 * Affiche :
 * - Liste des packages npm (backend et frontend)
 * - Versions installées
 * - Versions disponibles
 * - Vulnérabilités connues
 * - Mises à jour recommandées
 */

import { useState, useEffect } from 'react';

export default function Dependencies() {
  const [dependencies, setDependencies] = useState({ backend: [], frontend: [] });
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Données de démonstration
  const demoDependencies = {
    backend: [
      { name: 'express', current: '4.18.2', latest: '4.19.0', type: 'production', vulnerabilities: 0, status: 'outdated' },
      { name: 'mongoose', current: '8.0.3', latest: '8.0.3', type: 'production', vulnerabilities: 0, status: 'up-to-date' },
      { name: 'jsonwebtoken', current: '9.0.2', latest: '9.0.2', type: 'production', vulnerabilities: 0, status: 'up-to-date' },
      { name: 'bcrypt', current: '5.1.1', latest: '5.1.1', type: 'production', vulnerabilities: 0, status: 'up-to-date' },
      { name: 'cors', current: '2.8.5', latest: '2.8.5', type: 'production', vulnerabilities: 0, status: 'up-to-date' },
      { name: 'helmet', current: '7.1.0', latest: '7.1.0', type: 'production', vulnerabilities: 0, status: 'up-to-date' },
      { name: 'redis', current: '4.6.11', latest: '4.6.12', type: 'production', vulnerabilities: 0, status: 'outdated' },
      { name: 'nodemailer', current: '6.9.7', latest: '6.9.8', type: 'production', vulnerabilities: 1, status: 'vulnerable' },
      { name: 'typescript', current: '5.3.3', latest: '5.3.3', type: 'development', vulnerabilities: 0, status: 'up-to-date' },
      { name: 'nodemon', current: '3.0.2', latest: '3.0.3', type: 'development', vulnerabilities: 0, status: 'outdated' },
    ],
    frontend: [
      { name: 'react', current: '18.2.0', latest: '18.2.0', type: 'production', vulnerabilities: 0, status: 'up-to-date' },
      { name: 'react-dom', current: '18.2.0', latest: '18.2.0', type: 'production', vulnerabilities: 0, status: 'up-to-date' },
      { name: 'react-router-dom', current: '6.21.1', latest: '6.22.0', type: 'production', vulnerabilities: 0, status: 'outdated' },
      { name: 'axios', current: '1.6.5', latest: '1.6.7', type: 'production', vulnerabilities: 0, status: 'outdated' },
      { name: 'tailwindcss', current: '3.4.1', latest: '3.4.1', type: 'development', vulnerabilities: 0, status: 'up-to-date' },
      { name: 'vite', current: '5.0.11', latest: '5.0.12', type: 'development', vulnerabilities: 0, status: 'outdated' },
      { name: '@vitejs/plugin-react', current: '4.2.1', latest: '4.2.1', type: 'development', vulnerabilities: 0, status: 'up-to-date' },
    ]
  };

  useEffect(() => {
    setDependencies(demoDependencies);
    setIsLoading(false);
  }, []);

  const allDeps = [...dependencies.backend, ...dependencies.frontend];
  
  const filteredDeps = allDeps.filter(dep => {
    if (search && !dep.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === 'outdated' && dep.status !== 'outdated') return false;
    if (filter === 'vulnerable' && dep.status !== 'vulnerable') return false;
    if (filter === 'production' && dep.type !== 'production') return false;
    if (filter === 'development' && dep.type !== 'development') return false;
    return true;
  });

  const stats = {
    total: allDeps.length,
    upToDate: allDeps.filter(d => d.status === 'up-to-date').length,
    outdated: allDeps.filter(d => d.status === 'outdated').length,
    vulnerable: allDeps.filter(d => d.status === 'vulnerable').length,
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'up-to-date': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'outdated': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'vulnerable': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'up-to-date': return '✅';
      case 'outdated': return '⚠️';
      case 'vulnerable': return '🚨';
      default: return '❓';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'up-to-date': return 'À jour';
      case 'outdated': return 'Mise à jour disponible';
      case 'vulnerable': return 'Vulnérable';
      default: return 'Inconnu';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Analyse des dépendances...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dépendances</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Packages npm et leurs versions
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">📦</span>
            <h3 className="font-semibold text-gray-900 dark:text-white">Total</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats.total}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Packages installés</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">✅</span>
            <h3 className="font-semibold text-gray-900 dark:text-white">À jour</h3>
          </div>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {stats.upToDate}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {((stats.upToDate / stats.total) * 100).toFixed(0)}% du total
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">⚠️</span>
            <h3 className="font-semibold text-gray-900 dark:text-white">Obsolètes</h3>
          </div>
          <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
            {stats.outdated}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Mises à jour disponibles</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🚨</span>
            <h3 className="font-semibold text-gray-900 dark:text-white">Vulnérables</h3>
          </div>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">
            {stats.vulnerable}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Action requise</p>
        </div>
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
              placeholder="Nom du package..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Filtrer par
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">Tous les packages</option>
              <option value="outdated">Obsolètes</option>
              <option value="vulnerable">Vulnérables</option>
              <option value="production">Production</option>
              <option value="development">Développement</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des dépendances */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Package</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Version actuelle</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Dernière version</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredDeps.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  Aucun package trouvé
                </td>
              </tr>
            ) : (
              filteredDeps.map((dep, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📦</span>
                      <code className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                        {dep.name}
                      </code>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-sm text-gray-600 dark:text-gray-400">
                      v{dep.current}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    <code className={`text-sm font-semibold ${
                      dep.current === dep.latest
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-blue-600 dark:text-blue-400'
                    }`}>
                      v{dep.latest}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      dep.type === 'production'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {dep.type === 'production' ? 'Prod' : 'Dev'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(dep.status)}`}>
                        {getStatusIcon(dep.status)} {getStatusLabel(dep.status)}
                      </span>
                      {dep.vulnerabilities > 0 && (
                        <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-semibold">
                          {dep.vulnerabilities} CVE
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Actions recommandées */}
      {(stats.outdated > 0 || stats.vulnerable > 0) && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <span className="text-3xl">💡</span>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Actions recommandées
              </h3>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                {stats.vulnerable > 0 && (
                  <li className="flex items-center gap-2">
                    <span className="text-red-600 dark:text-red-400">🚨</span>
                    <strong>Urgent :</strong> {stats.vulnerable} package(s) avec des vulnérabilités connues. 
                    Exécutez <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded">npm audit fix</code>
                  </li>
                )}
                {stats.outdated > 0 && (
                  <li className="flex items-center gap-2">
                    <span className="text-yellow-600 dark:text-yellow-400">⚠️</span>
                    {stats.outdated} package(s) obsolète(s). 
                    Exécutez <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded">npm update</code>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Note */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          💡 <strong>Note :</strong> Les données affichées sont des données de démonstration. 
          L'intégration avec <code>npm list</code> et <code>npm outdated</code> est en cours.
        </p>
      </div>
    </div>
  );
}
