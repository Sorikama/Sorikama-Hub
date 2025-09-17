import React from 'react';
import { DollarSign, ShoppingCart, Users, Package, TrendingUp, Eye } from 'lucide-react';
import { StatsCard } from '../../components/dashboard/StatsCard';
import { Card } from '../../components/ui/Card';
import { DataGrid } from '../../components/ui/DataGrid';
import { useStore } from '../../contexts/StoreContext';
import { useMockData } from '../../hooks/useMockData';

export const DashboardHome: React.FC = () => {
  const { selectedStore } = useStore();
  const { analytics, sales, products } = useMockData(selectedStore?.id || null);

  if (!selectedStore) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          Veuillez sélectionner une boutique pour voir les statistiques
        </p>
      </div>
    );
  }

  const recentSalesColumns = [
    { key: 'id', header: 'ID', width: '100px' },
    { key: 'amount', header: 'Montant', render: (sale: any) => `${sale.amount}€` },
    { key: 'status', header: 'Status', render: (sale: any) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        sale.status === 'completed' 
          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
          : sale.status === 'pending'
          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      }`}>
        {sale.status === 'completed' ? 'Terminé' : sale.status === 'pending' ? 'En cours' : 'Remboursé'}
      </span>
    )},
    { key: 'createdAt', header: 'Date', render: (sale: any) => new Date(sale.createdAt).toLocaleDateString('fr-FR') },
  ];

  const topProductsColumns = [
    { key: 'name', header: 'Produit', render: (item: any) => item.product.name },
    { key: 'price', header: 'Prix', render: (item: any) => `${item.product.price}€` },
    { key: 'sales', header: 'Ventes', render: (item: any) => item.sales },
    { key: 'revenue', header: 'Revenus', render: (item: any) => `${item.product.price * item.sales}€` },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Tableau de bord - {selectedStore.name}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Vue d'ensemble de vos performances et activités récentes
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Revenus totaux"
          value={`${analytics?.totalRevenue || 0}€`}
          icon={DollarSign}
          change="+12% ce mois"
          changeType="positive"
          color="green"
        />
        <StatsCard
          title="Ventes"
          value={analytics?.totalSales || 0}
          icon={ShoppingCart}
          change="+8% ce mois"
          changeType="positive"
          color="blue"
        />
        <StatsCard
          title="Clients"
          value={analytics?.totalCustomers || 0}
          icon={Users}
          change="+15% ce mois"
          changeType="positive"
          color="yellow"
        />
        <StatsCard
          title="Produits"
          value={analytics?.totalProducts || 0}
          icon={Package}
          change="2 nouveaux"
          changeType="positive"
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Ventes récentes
            </h2>
            <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm font-medium">
              Voir tout
            </button>
          </div>
          <DataGrid
            data={sales.slice(0, 5)}
            columns={recentSalesColumns}
            emptyMessage="Aucune vente récente"
          />
        </Card>

        {/* Top Products */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Produits les plus vendus
            </h2>
            <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm font-medium">
              Voir tout
            </button>
          </div>
          <DataGrid
            data={analytics?.topProducts || []}
            columns={topProductsColumns}
            emptyMessage="Aucune donnée disponible"
          />
        </Card>
      </div>

      {/* Revenue Chart Placeholder */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Évolution des revenus
          </h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <TrendingUp className="w-4 h-4" />
            <span>30 derniers jours</span>
          </div>
        </div>
        <div className="h-64 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Eye className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400">Graphique des revenus</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Disponible dans la version complète</p>
          </div>
        </div>
      </Card>
    </div>
  );
};