import React from 'react';

interface ProductGridProps {
  children: React.ReactNode;
  layout: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ children, layout }) => {
  // Définir les classes CSS en fonction du layout
  const getGridClasses = () => {
    switch (layout) {
      case 'list':
        return 'flex flex-col space-y-4 sm:space-y-6';
      case 'compact':
        return 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4';
      case 'grid':
      default:
        return 'grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6';
    }
  };
  
  return (
    <div className={`${getGridClasses()} transition-all duration-300`}>
      {children}
    </div>
  );
};
