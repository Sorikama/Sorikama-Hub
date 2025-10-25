/**
 * Composant d'information sur les rôles système
 * Explique pourquoi on ne peut pas créer de nouveaux rôles
 */

import { FiInfo, FiLock, FiShield } from 'react-icons/fi';

export default function SystemRolesInfo() {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-blue-600 dark:bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <FiShield className="w-6 h-6 text-white" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            Système de rôles simplifié
          </h3>
          
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
            Cette plateforme utilise <strong>3 rôles système uniquement</strong> pour garantir 
            la sécurité et la simplicité de gestion des accès.
          </p>

          <div className="space-y-3">
            {/* Super Admin */}
            <div className="flex items-start gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg backdrop-blur-sm">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <FiLock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900 dark:text-white">Super Admin</span>
                  <code className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded">
                    super_admin
                  </code>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Contrôle total de la plateforme - Peut gérer tous les admins
                </p>
              </div>
            </div>

            {/* Admin */}
            <div className="flex items-start gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg backdrop-blur-sm">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <FiShield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900 dark:text-white">Admin</span>
                  <code className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                    admin
                  </code>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Gestion des utilisateurs, services et statistiques
                </p>
              </div>
            </div>

            {/* User */}
            <div className="flex items-start gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg backdrop-blur-sm">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <FiInfo className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900 dark:text-white">User</span>
                  <code className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded">
                    user
                  </code>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Accès aux services de la plateforme uniquement
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-xs text-amber-800 dark:text-amber-200">
              <strong>Note :</strong> Ces rôles sont protégés et ne peuvent pas être modifiés ou supprimés. 
              Pour changer le rôle d'un utilisateur, rendez-vous dans la section "Gestion des Utilisateurs".
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
