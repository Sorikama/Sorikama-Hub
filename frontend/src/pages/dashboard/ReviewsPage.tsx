import React from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { DataGrid } from '../../components/ui/DataGrid';
import { useStore } from '../../contexts/StoreContext';
import { useMockData } from '../../hooks/useMockData';

export const ReviewsPage: React.FC = () => {
  const { selectedStore } = useStore();
  const { reviews } = useMockData(selectedStore?.id || null);

  const columns = [
    { key: 'productId', header: 'Produit ID' },
    { key: 'customerId', header: 'Client ID' },
    { 
      key: 'rating', 
      header: 'Note', 
      render: (review: any) => (
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < review.rating 
                  ? 'text-yellow-400 fill-current' 
                  : 'text-gray-300 dark:text-gray-600'
              }`}
            />
          ))}
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
            ({review.rating}/5)
          </span>
        </div>
      )
    },
    { 
      key: 'comment', 
      header: 'Commentaire',
      render: (review: any) => (
        <div className="max-w-xs truncate">
          {review.comment}
        </div>
      )
    },
    { 
      key: 'createdAt', 
      header: 'Date', 
      render: (review: any) => new Date(review.createdAt).toLocaleDateString('fr-FR') 
    }
  ];

  if (!selectedStore) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          Veuillez sélectionner une boutique pour voir les avis
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Avis clients</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Consultez les avis de vos clients pour {selectedStore.name}
          </p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Aucun avis client pour le moment
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            Les avis apparaîtront ici après vos premières ventes
          </p>
        </div>
      ) : (
        <DataGrid
          data={reviews}
          columns={columns}
          emptyMessage="Aucun avis disponible"
        />
      )}
    </div>
  );
};