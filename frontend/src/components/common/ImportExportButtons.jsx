/**
 * Composant réutilisable pour les boutons Import/Export
 * Peut être utilisé pour n'importe quelle entité (users, roles, etc.)
 */

import { useState } from 'react';
import { FiDownload, FiUpload } from 'react-icons/fi';
import ExportModal from './ExportModal';
import ImportModal from './ImportModal';

export default function ImportExportButtons({
  entityName = 'données',
  entityNamePlural = 'données',
  onExport,
  onImport,
  exportConfig = {},
  importConfig = {},
  currentFilters = {},
  showImport = true,
  showExport = true,
  className = ''
}) {
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const handleExport = async (config) => {
    try {
      await onExport(config);
      setShowExportModal(false);
    } catch (error) {
      console.error('Erreur export:', error);
    }
  };

  const handleImport = async (config) => {
    try {
      await onImport(config);
      setShowImportModal(false);
    } catch (error) {
      console.error('Erreur import:', error);
    }
  };

  return (
    <>
      <div className={`flex items-center gap-3 ${className}`}>
        {showImport && (
          <button
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            title={`Importer des ${entityNamePlural}`}
          >
            <FiUpload className="w-4 h-4" />
            <span>Importer</span>
          </button>
        )}
        
        {showExport && (
          <button
            onClick={() => setShowExportModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            title={`Exporter des ${entityNamePlural}`}
          >
            <FiDownload className="w-4 h-4" />
            <span>Exporter</span>
          </button>
        )}
      </div>

      {/* Modals */}
      {showExport && (
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          onExport={handleExport}
          currentFilters={currentFilters}
          entityName={entityName}
          entityNamePlural={entityNamePlural}
          config={exportConfig}
        />
      )}

      {showImport && (
        <ImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImport={handleImport}
          entityName={entityName}
          entityNamePlural={entityNamePlural}
          config={importConfig}
        />
      )}
    </>
  );
}
