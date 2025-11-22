/**
 * Tableau des utilisateurs
 */

import { FiEye, FiLock, FiUnlock, FiShield, FiUserCheck } from 'react-icons/fi';

export default function UserTable({ users, isLoading, onViewDetails, onBlock, onUnblock }) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">👥</div>
        <p className="text-gray-500 dark:text-gray-400">Aucun utilisateur trouvé</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Utilisateur
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Rôle
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Statut
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Connexions
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {users.map((user) => (
            <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      ID: {user._id?.substring(0, 8)}...
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{user.email}</td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                  user.role === 'admin' 
                    ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}>
                  {user.role === 'admin' ? <FiShield className="w-3 h-3" /> : null}
                  {user.role === 'admin' ? 'Admin' : 'User'}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col gap-1">
                  {user.isBlocked ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400">
                      <FiLock className="w-3 h-3" />
                      Bloqué
                    </span>
                  ) : user.isActive ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                      <FiUserCheck className="w-3 h-3" />
                      Actif
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                      Inactif
                    </span>
                  )}
                  
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{user.loginCount || 0}</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onViewDetails(user)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Voir les détails"
                  >
                    <FiEye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </button>
                  {user.role !== 'admin' && (
                    <>
                      {user.isBlocked ? (
                        <button
                          onClick={() => onUnblock(user)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Débloquer"
                        >
                          <FiUnlock className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </button>
                      ) : (
                        <button
                          onClick={() => onBlock(user)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Bloquer"
                        >
                          <FiLock className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
