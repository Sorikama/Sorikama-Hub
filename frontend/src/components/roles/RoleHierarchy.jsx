/**
 * Composant pour afficher la hiérarchie des rôles système
 */

import { FiStar, FiShield, FiUser } from 'react-icons/fi';

const roleConfig = {
  super_admin: {
    icon: FiStar,
    label: 'Super Admin',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    description: 'Accès complet - Gestion de tous les admins'
  },
  admin: {
    icon: FiShield,
    label: 'Admin',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    description: 'Gestion des utilisateurs et services'
  },
  user: {
    icon: FiUser,
    label: 'Utilisateur',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    description: 'Accès aux services de la plateforme'
  }
};

export default function RoleHierarchy() {
  const roles = ['super_admin', 'admin', 'user'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        Hiérarchie des rôles système
      </h3>
      
      <div className="space-y-4">
        {roles.map((roleKey, index) => {
          const config = roleConfig[roleKey];
          const Icon = config.icon;
          
          return (
            <div key={roleKey} className="flex items-center gap-4">
              {/* Niveau */}
              <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-400">
                {index + 1}
              </div>
              
              {/* Icône et info */}
              <div className="flex items-center gap-3 flex-1">
                <div className={`w-10 h-10 ${config.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${config.color}`} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {config.label}
                    </h4>
                    <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded font-mono text-gray-600 dark:text-gray-400">
                      {roleKey}
                    </code>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {config.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Note */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>Note :</strong> Les 3 rôles système sont créés automatiquement. 
          Vous pouvez créer des rôles personnalisés supplémentaires selon vos besoins.
        </p>
      </div>
    </div>
  );
}

/**
 * Badge de rôle réutilisable
 */
export function RoleBadge({ role, size = 'md' }) {
  const config = roleConfig[role] || roleConfig.user;
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };
  
  return (
    <span className={`inline-flex items-center gap-1 ${config.bgColor} ${config.color} rounded-full font-medium ${sizeClasses[size]}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}
