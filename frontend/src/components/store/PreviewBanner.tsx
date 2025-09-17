import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const PreviewBanner: React.FC = () => {
  return (
    <div className="w-full bg-amber-500 text-white py-3 px-4 shadow-md">
      <div className="container mx-auto flex items-center justify-center">
        <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
        <div className="text-center">
          <p className="font-medium">
            Ce produit n'est pas encore publié officiellement
          </p>
          <p className="text-sm mt-1">
            Certaines fonctionnalités peuvent être limitées et le contenu pourrait être modifié avant la publication finale
          </p>
        </div>
      </div>
    </div>
  );
};
