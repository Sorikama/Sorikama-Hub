/**
 * Cards de statistiques pour Audit Trail
 */

export default function AuditStatsCards({ stats, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    {
      title: 'Total Actions',
      value: stats.totalActions?.toLocaleString() || 0,
      subtitle: '7 derniers jours',
      icon: '📊',
      color: 'blue',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      title: 'Succès',
      value: stats.successCount?.toLocaleString() || 0,
      subtitle: `${stats.successRate || 0}% de réussite`,
      icon: '✅',
      color: 'green',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      title: 'Échecs',
      value: stats.failureCount?.toLocaleString() || 0,
      subtitle: `${stats.failureRate || 0}% d'échec`,
      icon: '❌',
      color: 'red',
      bgColor: 'bg-red-50 dark:bg-red-900/20'
    },
    {
      title: 'Utilisateurs Actifs',
      value: stats.uniqueUsers || 0,
      subtitle: 'Utilisateurs uniques',
      icon: '👥',
      color: 'purple',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    }
  ];

  const colorClasses = {
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    red: 'text-red-600 dark:text-red-400',
    purple: 'text-purple-600 dark:text-purple-400'
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div key={index} className={`${card.bgColor} rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all`}>
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">{card.title}</div>
            <span className="text-3xl">{card.icon}</span>
          </div>
          <div className={`text-3xl font-bold ${colorClasses[card.color]} mb-1`}>
            {card.value}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">{card.subtitle}</div>
        </div>
      ))}
    </div>
  );
}
