import React from 'react';
import { UserPlus, Mail } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { DataGrid } from '../../components/ui/DataGrid';
import { useStore } from '../../contexts/StoreContext';
import { useMockData } from '../../hooks/useMockData';

export const CustomersPage: React.FC = () => {
  const { selectedStore } = useStore();
  const { customers } = useMockData(selectedStore?.id || null);

  const columns = [
    { key: 'name', header: 'Nom' },
    { key: 'email', header: 'Email' },
    { key: 'totalSpent', header: 'Total dépensé', render: (customer: any) => `${customer.totalSpent}€` },
    { key: 'ordersCount', header: 'Nb commandes' },
    { 
      key: 'createdAt', 
      header: 'Client depuis', 
      render: (customer: any) => new Date(customer.createdAt).toLocaleDateString('fr-FR') 
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (customer: any) => (
        <div className="flex items-center space-x-2">
          <button 
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            title="Envoyer un email"
          >
            <Mail className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  if (!selectedStore) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          Veuillez sélectionner une boutique pour voir vos clients
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Clients</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gérez vos clients pour {selectedStore.name}
          </p>
        </div>
        <Button icon={UserPlus}>
          Inviter un client
        </Button>
      </div>

      <DataGrid
        data={customers}
        columns={columns}
        emptyMessage="Aucun client enregistré"
      />
    </div>
  );
};