/**
 * Modal d'export générique et réutilisable
 */

import { useState } from 'react';
import { FiX, FiDownload, FiFilter } from 'react-icons/fi';

export default function ExportModal({ 
  isOpen, 
  onClose, 
  onExport, 
  currentFilters = {},
  entityName = 'données',
  entityNamePlural = 'données',
  config = {}
}) {
  const {
    formats = ['json', 'csv', 'excel'],
    filters = [],
    fields = [],
    defaultFormat = 'json'
  } = config;

  const [exportFormat, setExportFormat] = useState(defaultFormat);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [includeFields, setIncludeFields] = useState(
    fields.reduce((acc, field) => ({ ...acc, [field.key]: field.default !== false }), {})
  );

  if (!isOpen) return null;

  const handleExport = () => {
    const exportFilters = {};
    
    // Appliquer les filtres sélectionnés
    Object.entries(selectedFilters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        exportFilters[key] = value;
      }
    });

    onExport({
      format: exportFormat,
      filters: exportFilters,
      fields: Object.keys(includeFields).filter(key => includeFields[key])
    });
  };

  const toggleField = (field) => {
    setIncludeFields(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleFilterChange = (filterKey, value) => {
    setSelectedFilters(prev => ({ ...prev, [filterKey]: value }));
  };

  const selectedFieldsCount = Object.values(includeFields).filter(Boolean).length;

  const formatIcons = {
    json: '📄',
    csv: '📊',
    excel: '📗'
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <FiDownload className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Exporter {entityNamePlural}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Configurez votre export</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Format d'export */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Format d'export
            </label>
            <div className={`grid grid-cols-${formats.length} gap-3`}>
              {formats.map(format => (
                <button
                  key={format}
                  onClick={() => setExportFormat(format)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    exportFormat === format
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{formatIcons[format] || '📄'}</div>
                  <div className="font-medium text-gray-900 dark:text-white uppercase">{format}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Filtres */}
          {filters.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FiFilter className="w-4 h-4 text-gray-500" />
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Filtres d'export
                </label>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {filters.map(filter => (
                  <div key={filter.key}>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">
                      {filter.label}
                    </label>
                    <select
                      value={selectedFilters[filter.key] || 'all'}
                      onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="all">{filter.allLabel || 'Tous'}</option>
                      {filter.options.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.icon && `${option.icon} `}{option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Champs à inclure */}
          {fields.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Champs à inclure ({selectedFieldsCount} sélectionnés)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {fields.map(field => (
                  <label
                    key={field.key}
                    className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={includeFields[field.key]}
                      onChange={() => toggleField(field.key)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {field.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Info */}
          {Object.keys(currentFilters).length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                ℹ️ Les filtres actuels de la page seront ignorés. Utilisez les filtres ci-dessus pour personnaliser l'export.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleExport}
            disabled={fields.length > 0 && selectedFieldsCount === 0}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <FiDownload className="w-4 h-4" />
            Exporter
          </button>
        </div>
      </div>
    </div>
  );
}
