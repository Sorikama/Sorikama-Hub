/**
 * Gestionnaire de permissions
 */

import { useState } from 'react';
import { FiRefreshCw, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import api from '../../services/api';

export default function PermissionsManager({ onPermissionsSeeded }) {
  const [isSeeding, setIsSeeding] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSeedPermissions = async () => {
    if (!confirm('Voulez-vous initialiser les permissions par défaut ? Cela créera les rôles admin et user avec leurs permissions.')) {
      return;
    }

    try {
      setIsSeeding(true);
      setError('');
      setResult(null);

      const response = await api.post('/admin/roles/permissions/seed');
      setResult(response.data.data);
      
      if (onPermissionsSeeded) {
        onPermissionsSeeded();
      }
    } catch (error) {
      console.error('Erreur seeding:', error);
      setError(error.response?.data?.message || 'Erreur lors de l\'initialisation');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
          <FiRefreshCw className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            Initialiser les permissions par défaut
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Créez ou mettez à jour les permissions et rôles système (admin, user) avec leurs permissions par défaut.
          </p>

          {result && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <FiCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-300 mb-1">
                    Initialisation réussie !
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    {result.permissionsCount} permissions et {result.rolesCount} rôles créés/mis à jour
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <FiAlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleSeedPermissions}
            disabled={isSeeding}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isSeeding ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Initialisation...</span>
              </>
            ) : (
              <>
                <FiRefreshCw className="w-4 h-4" />
                <span>Initialiser les permissions</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          <strong>Note :</strong> Cette action est sûre et peut être exécutée plusieurs fois. 
          Les permissions et rôles existants seront mis à jour, pas supprimés.
        </p>
      </div>
    </div>
  );
}
