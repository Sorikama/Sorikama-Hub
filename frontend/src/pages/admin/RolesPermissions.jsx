/**
 * Page de gestion des rôles et permissions - Version améliorée
 */

import { useState, useEffect } from 'react';
import { FiGrid, FiList } from 'react-icons/fi';
import * as roleService from '../../services/roleService';
import ImportExportButtons from '../../components/common/ImportExportButtons';
import { rolesImportExportConfig } from '../../config/importExportConfig';
import RoleStatsCards from '../../components/roles/RoleStatsCards';
import RoleFilters from '../../components/roles/RoleFilters';
import RoleCard from '../../components/roles/RoleCard';
import RoleHierarchy from '../../components/roles/RoleHierarchy';
import PermissionsManager from '../../components/roles/PermissionsManager';
import RoleFormModal from '../../components/roles/RoleFormModal';
import { useConfirm } from '../../context/ConfirmContext';

export default function RolesPermissions() {
  const { confirm, alert } = useConfirm();
  
  // États pour les rôles
  const [roles, setRoles] = useState([]);
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  
  // États pour les permissions
  const [permissions, setPermissions] = useState({});
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);
  
  // États pour les filtres
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // grid ou list
  
  // États pour les modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // États pour le formulaire
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: []
  });
  
  // États pour les stats
  const [stats, setStats] = useState({
    total: 0,
    custom: 0,
    system: 0,
    totalUsers: 0
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  /**
   * Charger les rôles
   */
  const loadRoles = async () => {
    try {
      setIsLoadingRoles(true);
      const data = await roleService.getRoles();
      const rolesData = data.roles || [];
      setRoles(rolesData);
      
      // Calculer les stats
      const customRoles = rolesData.filter(r => r.isEditable).length;
      const systemRoles = rolesData.filter(r => !r.isEditable).length;
      const totalUsers = rolesData.reduce((sum, r) => sum + (r.userCount || 0), 0);
      
      setStats({
        total: rolesData.length,
        custom: customRoles,
        system: systemRoles,
        totalUsers
      });
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
      const data = await roleService.getAllPermissions();
      setPermissions(data.permissions || {});
    } catch (error) {
      console.error('Erreur chargement permissions:', error);
      setError('Erreur lors du chargement des permissions');
    } finally {
      setIsLoadingPermissions(false);
    }
  };

  /**
   * Filtrer les rôles
   */
  useEffect(() => {
    let filtered = [...roles];

    // Filtre par recherche
    if (search) {
      filtered = filtered.filter(role =>
        role.name.toLowerCase().includes(search.toLowerCase()) ||
        role.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filtre par type
    if (typeFilter === 'custom') {
      filtered = filtered.filter(role => role.isEditable);
    } else if (typeFilter === 'system') {
      filtered = filtered.filter(role => !role.isEditable);
    }

    setFilteredRoles(filtered);
  }, [roles, search, typeFilter]);

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

      await roleService.createRole(formData);
      setShowCreateModal(false);
      setFormData({ name: '', description: '', permissions: [] });
      loadRoles();
      
      alert({
        title: 'Succès',
        message: 'Rôle créé avec succès',
        type: 'success'
      });
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

      await roleService.updateRole(selectedRole._id, formData);
      setShowEditModal(false);
      setSelectedRole(null);
      setFormData({ name: '', description: '', permissions: [] });
      loadRoles();
      
      alert({
        title: 'Succès',
        message: 'Rôle mis à jour avec succès',
        type: 'success'
      });
    } catch (error) {
      console.error('Erreur mise à jour rôle:', error);
      setError(error.response?.data?.message || 'Erreur lors de la mise à jour');
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
   * Supprimer un rôle avec confirmation
   */
  const openDeleteModal = async (role) => {
    try {
      setError('');

      const confirmed = await confirm({
        title: 'Supprimer le rôle',
        message: `Êtes-vous sûr de vouloir supprimer le rôle "${role.name}" ? Cette action est irréversible.`,
        type: 'danger',
        confirmText: 'Supprimer',
        cancelText: 'Annuler'
      });

      if (!confirmed) return;

      await roleService.deleteRole(role._id);
      loadRoles();
      
      alert({
        title: 'Succès',
        message: 'Rôle supprimé avec succès',
        type: 'success'
      });
    } catch (error) {
      console.error('Erreur suppression rôle:', error);
      alert({
        title: 'Erreur',
        message: error.response?.data?.message || 'Erreur lors de la suppression',
        type: 'danger'
      });
    }
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
      await roleService.exportRoles(exportConfig);
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
      const result = await roleService.importRoles(importConfig);
      
      // Recharger les données
      loadRoles();
      loadPermissions();
      
      alert({
        title: 'Import réussi',
        message: `${result.data?.created || 0} rôles créés, ${result.data?.updated || 0} mis à jour`,
        type: 'success'
      });
    } catch (error) {
      console.error('Erreur import:', error);
      alert({
        title: 'Erreur d\'import',
        message: error.response?.data?.message || 'Une erreur est survenue lors de l\'import',
        type: 'danger'
      });
    }
  };

  /**
   * Gérer le changement de filtres
   */
  const handleFilterChange = () => {
    // Les filtres sont déjà appliqués via useEffect
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
          {/* <ImportExportButtons
            entityName={rolesImportExportConfig.entityName}
            entityNamePlural={rolesImportExportConfig.entityNamePlural}
            onExport={handleExportRoles}
            onImport={handleImportRoles}
            exportConfig={rolesImportExportConfig.export}
            importConfig={rolesImportExportConfig.import}
          /> */}
          <button
            onClick={() => {
              setFormData({ name: '', description: '', permissions: [] });
              setShowCreateModal(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/30"
          >
            <span className="text-xl">➕</span>
            <span className="font-medium">Créer un rôle</span>
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

      {/* Stats Cards */}
      <RoleStatsCards stats={stats} isLoading={isLoadingRoles} />

      {/* Hiérarchie des rôles */}
      <RoleHierarchy />

      {/* Gestionnaire de permissions */}
      <PermissionsManager 
        onPermissionsSeeded={() => {
          loadRoles();
          loadPermissions();
        }}
      />

      {/* Filtres */}
      <RoleFilters
        search={search}
        setSearch={setSearch}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        onFilterChange={handleFilterChange}
      />

      {/* Barre d'outils */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {filteredRoles.length} rôle{filteredRoles.length > 1 ? 's' : ''} trouvé{filteredRoles.length > 1 ? 's' : ''}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
            title="Vue grille"
          >
            <FiGrid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
            title="Vue liste"
          >
            <FiList className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Liste des rôles */}
      {isLoadingRoles ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : filteredRoles.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-gray-600 dark:text-gray-400 mb-2 font-medium">Aucun rôle trouvé</p>
          <p className="text-gray-500 dark:text-gray-500 text-sm">
            {search || typeFilter
              ? 'Essayez de modifier vos filtres de recherche'
              : 'Créez votre premier rôle pour commencer'}
          </p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
          {filteredRoles.map((role) => (
            <RoleCard
              key={role._id}
              role={role}
              onEdit={openEditModal}
              onDelete={openDeleteModal}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <RoleFormModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setFormData({ name: '', description: '', permissions: [] });
        }}
        onSubmit={handleCreateRole}
        formData={formData}
        setFormData={setFormData}
        permissions={permissions}
        togglePermission={togglePermission}
      />

      <RoleFormModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedRole(null);
          setFormData({ name: '', description: '', permissions: [] });
        }}
        onSubmit={handleUpdateRole}
        role={selectedRole}
        formData={formData}
        setFormData={setFormData}
        permissions={permissions}
        togglePermission={togglePermission}
      />


    </div>
  );
}
