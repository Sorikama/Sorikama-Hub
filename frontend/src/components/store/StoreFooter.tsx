import React from 'react';
import { Store } from '../../types';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

interface StoreFooterProps {
  store: Store;
  socialLinks: Record<string, string>;
}

export const StoreFooter: React.FC<StoreFooterProps> = ({ store, socialLinks }) => {
  // Fonction pour rendre les icônes des réseaux sociaux
  const getSocialIcon = (network: string) => {
    switch (network.toLowerCase()) {
      case 'facebook':
        return <Facebook className="w-5 h-5" />;
      case 'twitter':
        return <Twitter className="w-5 h-5" />;
      case 'instagram':
        return <Instagram className="w-5 h-5" />;
      case 'linkedin':
        return <Linkedin className="w-5 h-5" />;
      default:
        return null;
    }
  };
  
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 py-6 mt-8 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="container mx-auto px-4">
        {/* Réseaux sociaux */}
        {Object.keys(socialLinks).length > 0 && (
          <div className="flex justify-center mb-4">
            {Object.entries(socialLinks).map(([network, url]) => (
              <a 
                key={network}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light bg-gray-100 dark:bg-gray-600 p-2 rounded-full transition-all duration-200 hover:scale-110 mx-2"
                aria-label={`Suivez-nous sur ${network}`}
              >
                {getSocialIcon(network)}
              </a>
            ))}
          </div>
        )}
        
        {/* Copyright */}
        <div className="text-center text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
          <p>
            © {currentYear} {store.name}. Tous droits réservés.
          </p>
          <p className="mt-2">
            Propulsé par <a href="#" className="text-primary dark:text-primary-light font-medium transition-colors duration-200 hover:underline">WebRichesse</a>
          </p>
        </div>
      </div>
    </footer>
  );
};
