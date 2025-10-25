/**
 * Modal d'import des utilisateurs
 */

import { useState, useRef } from 'react';
import { FiX, FiUpload, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

export default function ImportModal({ isOpen, onClose, onImport }) {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [importMode, setImportMode] = useState('create'); // create, update, merge
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    setError('');
    
    // Vérifier le type de fichier
    const validTypes = ['application/json', 'text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (!validTypes.includes(file.type) && !file.name.endsWith('.csv')) {
      setError('Format de fichier non supporté. Utilisez JSON, CSV ou Excel.');
      return;
    }

    setFile(file);

    // Prévisualiser le fichier
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        if (file.type === 'application/json') {
          const data = JSON.parse(e.target.result);
          setPreview({
            type: 'json',
            count: Array.isArray(data) ? data.length : (data.users ? data.users.length : 0),
            sample: Array.isArray(data) ? data[0] : (data.users ? data.users[0] : null)
          });
        } else {
          // Pour CSV, compter les lignes
          const lines = e.target.result.split('\n').filter(line => line.trim());
          setPreview({
            type: 'csv',
            count: lines.length - 1, // -1 pour l'en-tête
            sample: lines[1]
          });
        }
      } catch (err) {
        setError('Erreur lors de la lecture du fichier');
      }
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (!file) {
      setError('Veuillez sélectionner un fichier');
      return;
    }

    onImport({ file, mode: importMode });
  };

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    setError('');
    onClose();
  };

  /**
   * Télécharger le template JSON
   */
  const downloadTemplateJSON = () => {
    const jsonContent = [
      {
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'user'
      },
      {
        email: 'jane.smith@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'user'
      },
      {
        email: 'admin.test@example.com',
        firstName: 'Admin',
        lastName: 'Test',
        role: 'admin'
      },
      {
        email: 'alice.martin@example.com',
        firstName: 'Alice',
        lastName: 'Martin',
        role: 'user'
      },
      {
        email: 'bob.wilson@example.com',
        firstName: 'Bob',
        lastName: 'Wilson',
        role: 'user'
      }
    ];

    const blob = new Blob([JSON.stringify(jsonContent, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'template-import-users.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  /**
   * Télécharger le template CSV
   */
  const downloadTemplateCSV = () => {
    const csvContent = `email,firstName,lastName,role
john.doe@example.com,John,Doe,user
jane.smith@example.com,Jane,Smith,user
admin.test@example.com,Admin,Test,admin`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'template-import-users.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  /**
   * Télécharger le template Excel (format CSV compatible Excel)
   */
  const downloadTemplateExcel = () => {
    // Créer un CSV avec BOM pour Excel
    const BOM = '\uFEFF';
    const csvContent = `email,firstName,lastName,role
john.doe@example.com,John,Doe,user
jane.smith@example.com,Jane,Smith,user
admin.test@example.com,Admin,Test,admin
alice.martin@example.com,Alice,Martin,user
bob.wilson@example.com,Bob,Wilson,user`;

    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'template-import-users.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <FiUpload className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Importer des utilisateurs</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">JSON, CSV ou Excel</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Zone de drop */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl p-8 transition-all ${
              dragActive
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.csv,.xlsx,.xls"
              onChange={handleChange}
              className="hidden"
            />

            {!file ? (
              <div className="text-center">
                <FiUpload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">
                  Glissez-déposez votre fichier ici
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  ou
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Parcourir les fichiers
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                  Formats supportés: JSON, CSV, Excel (.xlsx, .xls)
                </p>
              </div>
            ) : (
              <div className="text-center">
                <FiCheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
                <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">
                  {file.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
                <button
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                  }}
                  className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                >
                  Changer de fichier
                </button>
              </div>
            )}
          </div>

          {/* Prévisualisation */}
          {preview && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <FiCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-green-800 dark:text-green-300 mb-1">
                    Fichier valide détecté
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    {preview.count} utilisateur{preview.count > 1 ? 's' : ''} trouvé{preview.count > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Erreur */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <FiAlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            </div>
          )}

          {/* Mode d'import */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Mode d'import
            </label>
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50 ${importMode === 'create' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}">
                <input
                  type="radio"
                  name="importMode"
                  value="create"
                  checked={importMode === 'create'}
                  onChange={(e) => setImportMode(e.target.value)}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Créer uniquement</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Créer de nouveaux utilisateurs, ignorer les doublons
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50 ${importMode === 'update' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}">
                <input
                  type="radio"
                  name="importMode"
                  value="update"
                  checked={importMode === 'update'}
                  onChange={(e) => setImportMode(e.target.value)}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Mettre à jour uniquement</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Mettre à jour les utilisateurs existants (par email)
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50 ${importMode === 'merge' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}">
                <input
                  type="radio"
                  name="importMode"
                  value="merge"
                  checked={importMode === 'merge'}
                  onChange={(e) => setImportMode(e.target.value)}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Fusionner</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Créer les nouveaux et mettre à jour les existants
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Télécharger le template */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="font-medium text-purple-900 dark:text-purple-300 mb-1">
                  📋 Besoin d'un modèle ?
                </p>
                <p className="text-sm text-purple-700 dark:text-purple-400">
                  Téléchargez un fichier template avec les en-têtes et exemples
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={downloadTemplateJSON}
                  className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center gap-2 whitespace-nowrap"
                >
                  📄 JSON
                </button>
                <button
                  onClick={downloadTemplateCSV}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-2 whitespace-nowrap"
                >
                  📊 CSV
                </button>
                <button
                  onClick={downloadTemplateExcel}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-2 whitespace-nowrap"
                >
                  📗 Excel
                </button>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              ℹ️ Format JSON attendu: <code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">{'[{email, firstName, lastName, role, ...}]'}</code>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleImport}
            disabled={!file || !!error}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <FiUpload className="w-4 h-4" />
            Importer
          </button>
        </div>
      </div>
    </div>
  );
}
