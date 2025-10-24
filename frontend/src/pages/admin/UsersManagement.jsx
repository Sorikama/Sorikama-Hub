/**
 * Page de gestion des utilisateurs (Admin uniquement)
 * 
 * Fonctionnalités :
 * - Liste de tous les utilisateurs avec pagination
 * - Recherche et filtres
 * - Bloquer/Débloquer un utilisateur
 * - Voir les détails et l'activité
 * - Révoquer les sessions
 * - Statistiques par utilisateur
 */

import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function UsersManagement() {
  // États pour la liste des utilisateurs
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // États pour la pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);

  // États pour les filtres
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // États pour les modals
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showRolesModal, setShowRolesModal] = useState(false);
  const [blockReason, setBlockReason] = useState('');

  // États pour les statistiques globales
  const [overview, setOverview] = useState(null);
  
  // États pour les rôles
  const [availableRoles, setAvailableRoles] = useState([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);

  /**
   * Charger la liste des utilisateurs
   */
  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Construction des paramètres de requête
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      if (search) params.append('search', search);
      if (roleFilter) params.append('role', roleFilter);
      if (statusFilter) params.append('isBlocked', statusFilter);

      // Appel API
      const response = await api.get(`/admin/users?${params}`);
      
      setUsers(response.data.data.users);
      setTotal(response.data.data.pagination.total);
      setPages(response.data.data.pagination.pages);

    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
      setError(error.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Charger les statistiques globales
   */
  const loadOverview = async () => {
    try {
      const response = await api.get('/admin/users/stats/overview');
      setOverview(response.data.data);
    } catch (error) {
      console.error('Erreur chargement statistiques:', error);
    }
  };

  /**
   * Bloquer un utilisateur
   */
  const handleBlockUser = async () => {
    if (!selectedUser || !blockReason.trim()) {
      alert('Veuillez indiquer une raison');
      return;
    }

    try {
      await api.put(`/admin/users/${selectedUser._id}/block`, {
        reason: blockReason
      });

      alert('Utilisateur bloqué avec succès');
      setShowBlockModal(false);
      setBlockReason('');
      setSelectedUser(null);
      loadUsers();
      loadOverview();

    } catch (error) {
      console.error('Erreur blocage:', error);
      alert(error.response?.data?.message || 'Erreur lors du blocage');
    }
  };

  /**
   * Débloquer un utilisateur
   */
  const handleUnblockUser = async (user) => {
    if (!confirm(`Débloquer ${user.firstName} ${user.lastName} ?`)) return;

    try {
      await api.put(`/admin/users/${user._id}/unblock`);
      alert('Utilisateur débloqué avec succès');
      loadUsers();
      loadOverview();
    } catch (error) {
      console.error('Erreur déblocage:', error);
      alert(error.response?.data?.message || 'Erreur lors du déblocage');
    }
  };

  /**
   * Révoquer toutes les sessions d'un utilisateur
   */
  const handleRevokeSessions = async (user) => {
    if (!confirm(`Révoquer toutes les sessions de ${user.firstName} ${user.lastName} ?`)) return;

    try {
      await api.delete(`/admin/users/${user._id}/sessions`);
      alert('Sessions révoquées avec succès');
    } catch (error) {
      console.error('Erreur révocation:', error);
      alert(error.response?.data?.message || 'Erreur lors de la révocation');
    }
  };

  /**
   * Voir les détails d'un utilisateur
   */
  const handleViewDetails = async (user) => {
    try {
      const response = await api.get(`/admin/users/${user._id}`);
      setSelectedUser(response.data.data.user);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Erreur détails:', error);
      alert('Erreur lors du chargement des détails');
    }
  };

  /**
   * Charger les rôles disponibles
   */
  const loadRoles = async () => {
    try {
      const response = await api.get('/admin/roles');
      setAvailableRoles(response.data.data.roles);
    } catch (error) {
      console.error('Erreur chargement rôles:', error);
    }
  };

  /**
   * Ouvrir le modal d'assignation de rôles
   */
  const handleOpenRolesModal = async (user) => {
    setSelectedUser(user);
    try {
      const response = await api.get(`/admin/roles/users/${user._id}/roles`);
      const userRoles = response.data.data.roles || [];
      setSelectedRoleIds(userRoles.map(r => r._id || r.id));
      setShowRolesModal(true);
    } catch (error) {
      console.error('Erreur chargement rôles utilisateur:', error);
      setSelectedRoleIds([]);
      setShowRolesModal(true);
    }
  };

  /**
   * Assigner des rôles à un utilisateur
   */
  const handleAssignRoles = async () => {
    if (!selectedUser) return;
    
    try {
      await api.put(`/admin/roles/users/${selectedUser._id}/roles`, {
        roleIds: selectedRoleIds
      });
      alert('Rôles assignés avec succès');
      setShowRolesModal(false);
      setSelectedUser(null);
      setSelectedRoleIds([]);
      loadUsers();
    } catch (error) {
      console.error('Erreur assignation rôles:', error);
      alert(error.response?.data?.message || 'Erreur lors de l\'assignation');
    }
  };

  /**
   * Toggle un rôle dans la sélection
   */
  const toggleRole = (roleId) => {
    setSelectedRoleIds(prev =>
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  // Charger les données au montage et quand les filtres changent
  useEffect(() => {
    loadUsers();
  }, [page, search, roleFilter, statusFilter]);

  useEffect(() => {
    loadOverview();
    loadRoles();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
          <p className="text-gray-600 mt-2">Gérez tous les utilisateurs de la plateforme</p>
        </div>

        {/* Statistiques globales */}
        {overview && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-sm text-gray-600 mb-1">Total Utilisateurs</div>
              <div className="text-3xl font-bold text-gray-900">{overview.total}</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-sm text-gray-600 mb-1">Actifs</div>
              <div className="text-3xl font-bold text-green-600">{overview.active}</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-sm text-gray-600 mb-1">Bloqués</div>
              <div className="text-3xl font-bold text-red-600">{overview.blocked}</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-sm text-gray-600 mb-1">Actifs aujourd'hui</div>
              <div className="text-3xl font-bold text-blue-600">{overview.activeToday}</div>
            </div>
          </div>
        )}

        {/* Filtres et recherche */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Rechercher par email ou nom..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tous les rôles</option>
                <option value="user">Utilisateurs</option>
                <option value="admin">Administrateurs</option>
              </select>
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tous les statuts</option>
                <option value="false">Actifs</option>
                <option value="true">Bloqués</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tableau des utilisateurs */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">{error}</div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-gray-600">Aucun utilisateur trouvé</div>
          ) : (
            <>
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Utilisateur</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Rôle</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Connexions</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {user._id.substring(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {user.role === 'admin' ? '👑 Admin' : '👤 User'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.isBlocked ? (
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                            🚫 Bloqué
                          </span>
                        ) : user.isActive ? (
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                            ✓ Actif
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                            ○ Inactif
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{user.loginCount || 0}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewDetails(user)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            title="Voir les détails"
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => handleOpenRolesModal(user)}
                            className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                            title="Gérer les rôles"
                          >
                            🔐
                          </button>
                          {user.role !== 'admin' && (
                            <>
                              {user.isBlocked ? (
                                <button
                                  onClick={() => handleUnblockUser(user)}
                                  className="text-green-600 hover:text-green-800 text-sm font-medium"
                                  title="Débloquer"
                                >
                                  🔓
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setShowBlockModal(true);
                                  }}
                                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                                  title="Bloquer"
                                >
                                  🔒
                                </button>
                              )}
                              <button
                                onClick={() => handleRevokeSessions(user)}
                                className="text-orange-600 hover:text-orange-800 text-sm font-medium"
                                title="Révoquer les sessions"
                              >
                                🚪
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {pages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Page {page} sur {pages} ({total} utilisateurs)
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Précédent
                    </button>
                    <button
                      onClick={() => setPage(p => Math.min(pages, p + 1))}
                      disabled={page === pages}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal de blocage */}
        {showBlockModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Bloquer {selectedUser.firstName} {selectedUser.lastName}
              </h3>
              <p className="text-gray-600 mb-4">
                Cette action bloquera l'utilisateur et révoquera toutes ses sessions actives.
              </p>
              <textarea
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Raison du blocage..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
                rows="3"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowBlockModal(false);
                    setBlockReason('');
                    setSelectedUser(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                >
                  Annuler
                </button>
                <button
                  onClick={handleBlockUser}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
                >
                  Bloquer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de détails */}
        {showDetailsModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Détails de l'utilisateur
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600">Nom complet</label>
                  <p className="text-gray-900">{selectedUser.firstName} {selectedUser.lastName}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Email</label>
                  <p className="text-gray-900">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Rôle</label>
                  <p className="text-gray-900">{selectedUser.role}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Nombre de connexions</label>
                  <p className="text-gray-900">{selectedUser.loginCount || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Dernière activité</label>
                  <p className="text-gray-900">
                    {selectedUser.lastActivity ? new Date(selectedUser.lastActivity).toLocaleString('fr-FR') : 'Jamais'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Créé le</label>
                  <p className="text-gray-900">
                    {new Date(selectedUser.createdAt).toLocaleString('fr-FR')}
                  </p>
                </div>
                {selectedUser.isBlocked && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <label className="text-sm font-semibold text-red-700">Raison du blocage</label>
                    <p className="text-red-900">{selectedUser.blockedReason}</p>
                    <p className="text-xs text-red-600 mt-2">
                      Bloqué le {new Date(selectedUser.blockedAt).toLocaleString('fr-FR')}
                    </p>
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedUser(null);
                }}
                className="w-full mt-6 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
              >
                Fermer
              </button>
            </div>
          </div>
        )}

        {/* Modal Assignation de Rôles */}
        {showRolesModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Gérer les rôles de {selectedUser.firstName} {selectedUser.lastName}
              </h3>
              
              <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                {availableRoles.map((role) => (
                  <label
                    key={role._id}
                    className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedRoleIds.includes(role._id)}
                      onChange={() => toggleRole(role._id)}
                      className="mt-1 w-4 h-4 text-blue-600 rounded"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{role.name}</div>
                      <div className="text-sm text-gray-600">{role.description}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {role.permissions?.length || 0} permission(s)
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRolesModal(false);
                    setSelectedUser(null);
                    setSelectedRoleIds([]);
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAssignRoles}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
