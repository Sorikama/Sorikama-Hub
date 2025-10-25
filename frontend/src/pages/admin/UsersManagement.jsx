/**
 * Gestion des Utilisateurs - Version avec Service
 */

import { useState, useEffect } from 'react';
import * as userService from '../../services/userService';
import UserStatsCards from '../../components/users/UserStatsCards';
import UserFilters from '../../components/users/UserFilters';
import UserTable from '../../components/users/UserTable';
import { BlockUserModal, UserDetailsModal } from '../../components/users/UserModals';
import AddUserModal from '../../components/users/AddUserModal';
import ImportExportButtons from '../../components/common/ImportExportButtons';
import Pagination from '../../components/Pagination';
import { usersImportExportConfig } from '../../config/importExportConfig';
import { useConfirm } from '../../context/ConfirmContext';

export default function UsersManagement() {
  const { confirm, alert } = useConfirm();
  
  // États
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [error, setError] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);

  // Filtres
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [shouldReload, setShouldReload] = useState(false);

  // Modals
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [blockReason, setBlockReason] = useState('');

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    blocked: 0,
    activeToday: 0
  });

  /**
   * Charger les utilisateurs via le service
   */
  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError('');

      const params = {
        page,
        limit,
        ...(search && { search }),
        ...(roleFilter && { role: roleFilter }),
        ...(statusFilter && { isBlocked: statusFilter })
      };

      const data = await userService.getUsers(params);
      console.log('📊 Données reçues:', data);

      setUsers(data.users || []);
      setTotal(data.pagination?.total || 0);
      setPages(data.pagination?.pages || 1);

    } catch (error) {
      console.error('❌ Erreur chargement:', error);
      setError(error.response?.data?.message || 'Erreur lors du chargement');
      setUsers([]);
      setTotal(0);
      setPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Exporter les utilisateurs avec filtres avancés
   */
  const handleExport = async (exportConfig) => {
    try {
      await userService.exportUsers(exportConfig);
      setShowExportModal(false);
    } catch (error) {
      console.error('❌ Erreur export:', error);
    }
  };

  /**
   * Importer des utilisateurs
   */
  const handleImport = async (importConfig) => {
    try {
      const result = await userService.importUsers(importConfig);
      setShowImportModal(false);
      
      // Recharger les données
      loadUsers();
      loadStats();
      
      alert(`✅ Import réussi: ${result.data?.created || 0} créés, ${result.data?.updated || 0} mis à jour`);
    } catch (error) {
      console.error('❌ Erreur import:', error);
    }
  };

  /**
   * Charger les statistiques via le service
   */
  const loadStats = async () => {
    try {
      setIsLoadingStats(true);
      const data = await userService.getUsersStats();

      setStats({
        total: data.total || 0,
        active: data.active || 0,
        blocked: data.blocked || 0,
        activeToday: data.activeToday || 0
      });
    } catch (error) {
      console.error('❌ Erreur stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  /**
   * Bloquer un utilisateur via le service
   */
  const handleBlockUser = async () => {
    if (!selectedUser || !blockReason.trim()) {
      alert('Veuillez indiquer une raison');
      return;
    }

    try {
      await userService.blockUser(selectedUser._id, blockReason);
      alert('Utilisateur bloqué avec succès');
      setShowBlockModal(false);
      setBlockReason('');
      setSelectedUser(null);
      loadUsers();
      loadStats();
    } catch (error) {
      alert(error.response?.data?.message || 'Erreur lors du blocage');
    }
  };

  /**
   * Débloquer un utilisateur via le service
   */
  const handleUnblockUser = async (user) => {
    const confirmed = await confirm({
      title: 'Débloquer l\'utilisateur',
      message: `Voulez-vous débloquer ${user.firstName} ${user.lastName} ?`,
      type: 'warning',
      confirmText: 'Débloquer',
      cancelText: 'Annuler'
    });

    if (!confirmed) return;

    try {
      await userService.unblockUser(user._id);
      await alert({
        title: 'Succès',
        message: 'Utilisateur débloqué avec succès',
        type: 'success'
      });
      loadUsers();
      loadStats();
    } catch (error) {
      await alert({
        title: 'Erreur',
        message: error.response?.data?.message || 'Erreur lors du déblocage',
        type: 'danger'
      });
    }
  };

  /**
   * Voir les détails via le service
   */
  const handleViewDetails = async (user) => {
    try {
      const data = await userService.getUserById(user._id);
      setSelectedUser(data.user || user);
      setShowDetailsModal(true);
    } catch (error) {
      alert('Erreur lors du chargement des détails');
    }
  };

  /**
   * Gérer le changement de page
   */
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  /**
   * Gérer le changement de filtres
   */
  const handleFilterChange = () => {
    if (page === 1) {
      // Si on est déjà sur la page 1, forcer le rechargement
      setShouldReload(prev => !prev);
    } else {
      // Sinon, retourner à la page 1 (ce qui déclenchera le rechargement)
      setPage(1);
    }
  };

  // Charger les données quand les filtres ou la page changent
  useEffect(() => {
    loadUsers();
  }, [page, search, roleFilter, statusFilter, shouldReload]);

  // Charger les stats au montage
  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des Utilisateurs</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Gérez tous les utilisateurs de la plateforme</p>
        </div>
        <div className="flex items-center gap-3">
          <ImportExportButtons
            entityName={usersImportExportConfig.entityName}
            entityNamePlural={usersImportExportConfig.entityNamePlural}
            onExport={handleExport}
            onImport={handleImport}
            exportConfig={usersImportExportConfig.export}
            importConfig={usersImportExportConfig.import}
            currentFilters={{ search, role: roleFilter, status: statusFilter }}
          />
          <button
            onClick={() => setShowAddUserModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/30"
          >
            <span className="text-xl">➕</span>
            <span className="font-medium">Ajouter un utilisateur</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <UserStatsCards stats={stats} isLoading={isLoadingStats} />

      {/* Filtres */}
      <UserFilters
        search={search}
        setSearch={setSearch}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onFilterChange={handleFilterChange}
      />

      {/* Résultats */}
      {!isLoading && !error && (
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <p>
            {total > 0 ? (
              <>
                Affichage de <span className="font-semibold text-gray-900 dark:text-white">{((page - 1) * limit) + 1}</span> à{' '}
                <span className="font-semibold text-gray-900 dark:text-white">{Math.min(page * limit, total)}</span> sur{' '}
                <span className="font-semibold text-gray-900 dark:text-white">{total}</span> utilisateur{total > 1 ? 's' : ''}
              </>
            ) : (
              'Aucun utilisateur trouvé'
            )}
          </p>
          {(search || roleFilter || statusFilter) && total > 0 && (
            <p className="text-blue-600 dark:text-blue-400">
              🔍 Résultats filtrés
            </p>
          )}
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {error ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚠️</div>
            <p className="text-red-600 dark:text-red-400 mb-2 font-medium">{error}</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Une erreur s'est produite lors du chargement</p>
            <button
              onClick={loadUsers}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Réessayer
            </button>
          </div>
        ) : users.length === 0 && !isLoading ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-600 dark:text-gray-400 mb-2 font-medium">Aucun utilisateur trouvé</p>
            <p className="text-gray-500 dark:text-gray-500 text-sm">
              {search || roleFilter || statusFilter
                ? 'Essayez de modifier vos filtres de recherche'
                : 'Aucun utilisateur n\'est enregistré pour le moment'}
            </p>
          </div>
        ) : (
          <>
            <UserTable
              users={users}
              isLoading={isLoading}
              onViewDetails={handleViewDetails}
              onBlock={(user) => {
                setSelectedUser(user);
                setShowBlockModal(true);
              }}
              onUnblock={handleUnblockUser}
            />

            {/* Pagination */}
            {!isLoading && pages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={pages}
                totalItems={total}
                onPageChange={handlePageChange}
                itemsPerPage={limit}
              />
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <BlockUserModal
        user={selectedUser}
        isOpen={showBlockModal}
        onClose={() => {
          setShowBlockModal(false);
          setBlockReason('');
          setSelectedUser(null);
        }}
        onConfirm={handleBlockUser}
        reason={blockReason}
        setReason={setBlockReason}
      />

      <UserDetailsModal
        user={selectedUser}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedUser(null);
        }}
      />

      <AddUserModal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        onSuccess={(message) => {
          alert({
            title: 'Succès',
            message: message,
            type: 'success'
          });
          loadUsers();
        }}
      />

    </div>
  );
}
