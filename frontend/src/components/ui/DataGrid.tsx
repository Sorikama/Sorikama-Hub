import React, { useState } from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

type SortDirection = 'asc' | 'desc' | null;

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
  width?: string;
  sortable?: boolean;
}

interface DataGridProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  initialSortKey?: keyof T | string;
  initialSortDirection?: SortDirection;
  onSort?: (key: keyof T | string, direction: SortDirection) => void;
}

export const DataGrid = <T extends Record<string, any>>({
  data,
  columns,
  onRowClick,
  isLoading = false,
  emptyMessage = 'Aucune donnée disponible',
  initialSortKey,
  initialSortDirection,
  onSort
}: DataGridProps<T>) => {
  // État pour le tri - initialiser avec les valeurs fournies si disponibles
  const [sortConfig, setSortConfig] = useState<{ key: keyof T | string; direction: SortDirection }>({ 
    key: initialSortKey || '', 
    direction: initialSortDirection || null 
  });
  
  // Fonction pour gérer le clic sur l'en-tête de colonne pour trier
  const handleSort = (key: keyof T | string) => {
    let direction: SortDirection = 'asc';
    
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else if (sortConfig.direction === 'desc') {
        direction = null;
      }
    }
    
    setSortConfig({ key, direction });
    
    // Appeler la fonction de rappel si elle est fournie
    if (onSort) {
      onSort(key, direction);
    }
  };
  
  // Trier les données en fonction de la configuration de tri
  const sortedData = React.useMemo(() => {
    if (sortConfig.direction === null) {
      return [...data]; // Pas de tri
    }
    
    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof T];
      const bValue = b[sortConfig.key as keyof T];
      
      if (aValue === bValue) return 0;
      
      // Gérer les différents types de données
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      // Pour les nombres et autres types
      return sortConfig.direction === 'asc'
        ? (aValue < bValue ? -1 : 1)
        : (aValue < bValue ? 1 : -1);
    });
  }, [data, sortConfig]);
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer ${
                    column.key === 'actions' ? 'text-center' : 'text-left'
                  }`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.header}</span>
                    {column.sortable !== false && (
                      <span className="inline-flex">
                        {sortConfig.key === column.key ? (
                          sortConfig.direction === 'asc' ? (
                            <ArrowUp className="h-3 w-3 ml-1" />
                          ) : sortConfig.direction === 'desc' ? (
                            <ArrowDown className="h-3 w-3 ml-1" />
                          ) : (
                            <ArrowUpDown className="h-3 w-3 ml-1 text-gray-400" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3 w-3 ml-1 text-gray-400" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
            {sortedData.map((item, rowIndex) => (
              <tr
                key={rowIndex}
                className={`
                  ${onRowClick ? 'hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer' : ''}
                  transition-colors duration-150
                `}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column, colIndex) => (
                  <td 
                    key={colIndex} 
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 ${
                      column.key === 'actions' ? 'text-center' : ''
                    }`}
                  >
                    {column.render ? column.render(item) : item[column.key as keyof T]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};