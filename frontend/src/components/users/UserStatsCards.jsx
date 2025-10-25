/**
 * Cartes de statistiques utilisateurs
 */

import { FiUsers, FiUserCheck, FiUserX, FiActivity } from 'react-icons/fi';

export default function UserStatsCards({ stats, isLoading }) {
  const cards = [
    {
      label: 'Total',
      value: stats.total,
      icon: FiUsers,
      color: 'blue'
    },
    {
      label: 'Actifs',
      value: stats.active,
      icon: FiUserCheck,
      color: 'green'
    },
    {
      label: 'Bloqués',
      value: stats.blocked,
      icon: FiUserX,
      color: 'red'
    },
    {
      label: 'Actifs aujourd\'hui',
      value: stats.activeToday,
      icon: FiActivity,
      color: 'purple'
    }
  ];

  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    red: 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    purple: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
  };

  const textColorClasses = {
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    red: 'text-red-600 dark:text-red-400',
    purple: 'text-purple-600 dark:text-purple-400'
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.label} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{card.label}</p>
                {isLoading ? (
                  <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-1" />
                ) : (
                  <p className={`text-2xl font-bold mt-1 ${textColorClasses[card.color]}`}>
                    {card.value}
                  </p>
                )}
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[card.color]}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
