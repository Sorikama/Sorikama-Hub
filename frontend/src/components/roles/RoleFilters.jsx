/**
 * Filtres pour les rôles
 */

import { useState } from 'react';
import { FiSearch, FiX, FiFilter } from 'react-icons/fi';

export default function RoleFilters({ 
  search, 
  setSearch, 
  typeFilter, 
  setTypeFilter,
  onFilterChange 
}) {
  const [localSearch, setLocalSearch] = useState(search);

  const handleSearchChange = (value) => {
    setLocalSearch(value);
    setSearch(value);
    onFilterChange();
  };

  const handleTypeChange = (value) => {
    setTypeFilter(value);
    onFilterChange();
  };

  const handleClearSearch = () => {
    setLocalSearch('');
    setSearch('');
    onFilterChange();
  };

  const handleResetFilters = () => {
    setLocalSearch('');
    setSearch('');
    setTypeFilter('');
    onFilterChange();
  };

  const hasActiveFilters = search || typeFilter;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-3">
        <FiFilter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtres</h3>
        {hasActiveFilters && (
          <button
            onClick={handleResetFilters}
            className="ml-auto text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
          >
            <FiX className="w-4 h-4" />
            Réinitialiser
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recherche */}
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un rôle..."
            value={localSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
          />
          {localSearch && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <FiX className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filtre Type */}
        <div className="relative">
          <select
            value={typeFilter}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none cursor-pointer transition-all"
          >
            <option value="">Tous les types</option>
            <option value="custom">✏️ Personnalisés</option>
            <option value="system">🔒 Système</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Indicateur de filtres actifs */}
      {hasActiveFilters && (
        <div className="mt-3 flex flex-wrap gap-2">
          {search && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm">
              <FiSearch className="w-3 h-3" />
              {search}
              <button onClick={handleClearSearch} className="hover:text-blue-900 dark:hover:text-blue-100">
                <FiX className="w-3 h-3" />
              </button>
            </span>
          )}
          {typeFilter && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm">
              {typeFilter === 'custom' ? '✏️ Personnalisés' : '🔒 Système'}
              <button onClick={() => handleTypeChange('')} className="hover:text-purple-900 dark:hover:text-purple-100">
                <FiX className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
