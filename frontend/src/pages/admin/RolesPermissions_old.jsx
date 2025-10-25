/**
 * Page de gestion des rôles et permissions (Admin uniquement)
 * 
 * Fonctionnalités :
 * - Liste des rôles avec leurs permissions
 * - Créer/Modifier/Supprimer des rôles
 * - Matrice permissions/rôles
 * - Assigner des rôles aux utilisateurs
 */

import { useState, useEffect, Fragment } from 'react';
import api from '../../services/api';
import ImportExportButtons from '../../components/common/ImportExportButtons';
import { rolesImportExportConfig } from '../../config/importExportConfig';

export default function RolesPermissions() {
  // États pour les rôles
  const [roles, setRoles] = useState([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  
  // États pour les permissions
  const [permissions, setPermissions] = useState({});
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);
  
  // États pour les modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  
  // États pour le formulaire
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: []
  });
  
  // États pour l'assignation
  const [userEmail, setUserEmail] = useState('');
  const [selectedRoles, setSelectedRoles] = useState([]);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  /**
   * Charger les rôles
   */
  const loadRoles = async () => {
    try {
      setIsLoadingRoles(true);
      const response = await api.get('/admin/roles');
      setRoles(response.data.data.roles);
    } catch (error) {
      console.error('Erreur chargement rôles:', error);
      setError('Erreur lors du chargement des rôles');
    } finally {
      setIsLoadingRoles(false);
    }
  };

  /**
   * Charger les permissions
   */
  const loadPermissions = async () => {
    try {
      setIsLoadingPermissions(true);
      const response = await api.get('/admin/roles/permissions/all');
      setPermissions(response.data.data.permissions);
    } catch (error) {
      console.error('Erreur chargement permissions:', error);
      setError('Erreur lors du chargement des permissions');
    } finally {
      setIsLoadingPermissions(false);
    }
  };

  /**
   * Créer un rôle
   */
  const handleCreateRole = async () => {
    try {
      setError('');
      if (!formData.name.trim()) {
        setError('Le nom du rôle est requis');
        return;
      }

      await api.post('/admin/roles', formData);
      setSuccess('Rôle créé avec succès');
      setShowCreateModal(false);
      setFormData({ name: '', description: '', permissions: [] });
      loadRoles();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Erreur création rôle:', error);
      setError(error.response?.data?.message || 'Erreur lors de la création');
    }
  };

  /**
   * Mettre à jour un rôle
   */
  const handleUpdateRole = async () => {
    try {
      setError('');
      if (!selectedRole) return;

      await api.put(`/admin/roles/${selectedRole._id}`, formData);
      setSuccess('Rôle mis à jour avec succès');
      setShowEditModal(false);
      setSelectedRole(null);
      setFormData({ name: '', description: '', permissions: [] });
      loadRoles();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Erreur mise à jour rôle:', error);
      setError(error.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  };

  /**
   * Supprimer un rôle
   */
  const handleDeleteRole = async () => {
    try {
      setError('');
      if (!selectedRole) return;

      await api.delete(`/admin/roles/${selectedRole._id}`);
      setSuccess('Rôle supprimé avec succès');
      setShowDeleteModal(false);
      setSelectedRole(null);
      loadRoles();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Erreur suppression rôle:', error);
      setError(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  /**
   * Ouvrir le modal d'édition
   */
  const openEditModal = (role) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      description: role.description || '',
      permissions: role.permissions.map(p => p.id || p._id)
    });
    setShowEditModal(true);
  };

  /**
   * Toggle permission dans le formulaire
   */
  const togglePermission = (permissionId) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  /**
   * Exporter les rôles
   */
  const handleExportRoles = async (exportConfig) => {
    try {
      // TODO: Implémenter l'export via API
      console.log('Export rôles:', exportConfig);
      setSuccess('Export en cours de développement');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Erreur export:', error);
      setError('Erreur lors de l\'export');
    }
  };

  /**
   * Importer des rôles
   */
  const handleImportRoles = async (importConfig) => {
    try {
      // TODO: Implémenter l'import via API
      console.log('Import rôles:', importConfig);
      setSuccess('Import en cours de développement');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Erreur import:', error);
      setError('Erreur lors de l\'import');
    }
  };

  // Charger les données au montage
  useEffect(() => {
    loadRoles();
    loadPermissions();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rôles & Permissions</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Gérez les rôles et leurs permissions</p>
        </div>
        <div className="flex items-center gap-3">
          <ImportExportButtons
            entityName={rolesImportExportConfig.entityName}
            entityNamePlural={rolesImportExportConfig.entityNamePlural}
            onExport={handleExportRoles}
            onImport={handleImportRoles}
            exportConfig={rolesImportExportConfig.export}
            importConfig={rolesImportExportConfig.import}
          />
          <button
            onClick={() => {
              setFormData({ name: '', description: '', permissions: [] });
              setShowCreateModal(true);
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <span>➕</span>
            <span>Créer un rôle</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Liste des rôles */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Rôles existants</h2>
        </div>
        
        {isLoadingRoles ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : roles.length === 0 ? (
          <div className="text-center py-12 text-gray-600 dark:text-gray-400">Aucun rôle trouvé</div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {roles.map((role) => (
              <div key={role._id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{role.name}</h3>
                      {!role.isEditable && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full font-semibold">
                          🔒 Système
                        </span>
                      )}
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full font-semibold">
                        {role.userCount || 0} utilisateur(s)
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">{role.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {role.permissions.map((perm) => (
                        <span
                          key={perm.id || perm._id}
                          className="px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full font-medium"
                        >
                          {perm.action}:{perm.subject}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {role.isEditable && (
                      <>
                        <button
                          onClick={() => openEditModal(role)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium px-3 py-1 transition-colors"
                        >
                          ✏️ Modifier
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRole(role);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium px-3 py-1 transition-colors"
                        >
                          🗑️ Supprimer
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Matrice Permissions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Matrice des Permissions</h2>
        </div>
        
        {isLoadingPermissions ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <div className="p-6 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Permission</th>
                  {roles.map(role => (
                    <th key={role._id} className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                      {role.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(permissions).map(([subject, perms]) => (
                  <Fragment key={subject}>
                    <tr className="bg-gray-50 dark:bg-gray-700/50">
                      <td colSpan={roles.length + 1} className="py-2 px-4 font-bold text-gray-900 dark:text-white">
                        {subject}
                      </td>
                    </tr>
                    {perms.map(perm => (
                      <tr key={perm.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                          <div className="font-medium">{perm.fullPermission}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{perm.description}</div>
                        </td>
                        {roles.map(role => {
                          const hasPermission = role.permissions.some(
                            p => (p.id || p._id) === perm.id
                          );
                          return (
                            <td key={role._id} className="text-center py-3 px-4">
                              {hasPermission ? (
                                <span className="text-green-600 dark:text-green-400 text-xl">✓</span>
                              ) : (
                                <span className="text-gray-300 dark:text-gray-600 text-xl">○</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Créer */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Créer un nouveau rôle</h3>
              
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Nom du rôle *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="ex: moderator"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows="3"
                  placeholder="Description du rôle..."
                />
              </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Permissions
                  </label>
                  <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4">
                    {Object.entries(permissions).map(([subject, perms]) => (
                      <div key={subject} className="mb-4">
                        <div className="font-bold text-gray-900 mb-2">{subject}</div>
                        <div className="space-y-2 ml-4">
                          {perms.map(perm => (
                            <label key={perm.id} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.permissions.includes(perm.id)}
                                onChange={() => togglePermission(perm.id)}
                                className="w-4 h-4 text-blue-600 rounded"
                              />
                              <span className="text-sm text-gray-700">
                                {perm.fullPermission}
                                <span className="text-xs text-gray-500 ml-2">
                                  {perm.description}
                                </span>
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setFormData({ name: '', description: '', permissions: [] });
                }}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateRole}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Modifier */}
      {showEditModal && selectedRole && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Modifier le rôle: {selectedRole.name}
            </h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom du rôle *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Permissions
                  </label>
                  <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4">
                    {Object.entries(permissions).map(([subject, perms]) => (
                      <div key={subject} className="mb-4">
                        <div className="font-bold text-gray-900 mb-2">{subject}</div>
                        <div className="space-y-2 ml-4">
                          {perms.map(perm => (
                            <label key={perm.id} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.permissions.includes(perm.id)}
                                onChange={() => togglePermission(perm.id)}
                                className="w-4 h-4 text-blue-600 rounded"
                              />
                              <span className="text-sm text-gray-700">
                                {perm.fullPermission}
                                <span className="text-xs text-gray-500 ml-2">
                                  {perm.description}
                                </span>
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedRole(null);
                    setFormData({ name: '', description: '', permissions: [] });
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                >
                  Annuler
                </button>
                <button
                  onClick={handleUpdateRole}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Mettre à jour
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Modal Supprimer */}
      {showDeleteModal && selectedRole && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Supprimer le rôle</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Êtes-vous sûr de vouloir supprimer le rôle <strong className="text-gray-900 dark:text-white">{selectedRole.name}</strong> ?
              Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedRole(null);
                }}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteRole}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
