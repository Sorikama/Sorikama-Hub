import React from 'react';
import { ArrowLeft, Construction } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

interface PlaceholderSettingsPageProps {
  title: string;
  description: string;
}

export const PlaceholderSettingsPage: React.FC<PlaceholderSettingsPageProps> = ({ 
  title, 
  description 
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard/settings')}
          icon={ArrowLeft}
          className="mr-4"
        >
          Retour
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-16">
        <Construction className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-6">
          {description}
        </p>
        <div className="px-4 py-2 bg-theme-primary-50 rounded-lg">
          <p className="text-sm text-theme-primary">
            Cette section sera disponible dans une future version
          </p>
        </div>
      </div>
    </div>
  );
};