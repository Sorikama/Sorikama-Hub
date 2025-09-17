import React from 'react';
import { Download, Filter } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { DataGrid } from '../../components/ui/DataGrid';
import { useStore } from '../../contexts/StoreContext';
import { useMockData } from '../../hooks/useMockData';

export const SalesPage: React.FC = () => {
  const { selectedStore } = useStore();
  const { sales } = useMockData(selectedStore?.id || null);

  const columns = [
    { key: 'id', header: 'ID Vente', width: '100px' },
    { key: 'productId', header: 'Produit ID' },
    { key: 'customerId', header: 'Client ID' },
    { key: 'amount', header: 'Montant', render: (sale: any) => `${sale.amount}€` },
    { 
      key: 'status', 
      header: 'Status', 
      render: (sale: any) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          sale.status === 'completed' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            : sale.status === 'pending'
            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
        }`}>
          {sale.status === 'completed' ? 'Terminé' : sale.status === 'pending' ? 'En cours' : 'Remboursé'}
        </span>
      )
    },
    { 
      key: 'createdAt', 
      header: 'Date', 
      render: (sale: any) => new Date(sale.createdAt).toLocaleDateString('fr-FR') 
    }
  ];

  if (!selectedStore) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          Veuillez sélectionner une boutique pour voir vos ventes
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ventes</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Historique des ventes pour {selectedStore.name}
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="secondary" icon={Filter}>
            Filtrer
          </Button>
          <Button icon={Download}>
            Exporter
          </Button>
        </div>
      </div>

      <DataGrid
        data={sales}
        columns={columns}
        emptyMessage="Aucune vente enregistrée"
      />
    </div>
  );
};