import React from 'react';
import { Construction } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, description }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full py-12">
      <div className="text-center">
        <Construction className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-md">
          {description}
        </p>
        <div className="mt-6 px-4 py-2 bg-theme-primary-50 rounded-lg">
          <p className="text-sm text-theme-primary">
            Cette section sera disponible dans une future version
          </p>
        </div>
      </div>
    </div>
  );
};