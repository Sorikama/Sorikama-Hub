/**
 * Cards de statistiques pour Rate Limiting
 */

export default function StatsCards({ stats, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
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
      title: 'Utilisateurs Bloqués',
      value: stats.overview?.blockedUsers || 0,
      subtitle: 'Actuellement',
      icon: '🚫',
      color: 'red'
    },
    {
      title: 'Total Requêtes',
      value: (stats.overview?.totalRequests || 0).toLocaleString(),
      subtitle: stats.overview?.period || 'Dernière heure',
      icon: '📊',
      color: 'blue'
    },
    {
      title: 'Services Actifs',
      value: stats.requestsByService?.length || 0,
      subtitle: 'Avec activité',
      icon: '🔗',
      color: 'green'
    }
  ];

  const colorClasses = {
    red: 'text-red-600 dark:text-red-400',
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400'
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">{card.title}</div>
            <span className="text-3xl">{card.icon}</span>
          </div>
          <div className={`text-3xl font-bold ${colorClasses[card.color]} mb-1`}>
            {card.value}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{card.subtitle}</div>
        </div>
      ))}
    </div>
  );
}
