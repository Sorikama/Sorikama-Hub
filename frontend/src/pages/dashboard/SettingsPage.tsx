import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Palette, 
  Settings as SettingsIcon, 
  Bell, 
  Users, 
  User, 
  BarChart3, 
  Globe, 
  CreditCard,
  ChevronRight,
  Store
} from 'lucide-react';
import { Card } from '../../components/ui/Card';

interface SettingCard {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  category: 'general' | 'account' | 'advanced';
  path: string;
}

const settingsCards: SettingCard[] = [
  // Paramètres généraux
  {
    id: 'appearance',
    title: 'Apparence',
    description: 'Personnalisez l\'aspect visuel, votre nom commercial et ajoutez vos liens vers les réseaux sociaux.',
    icon: Palette,
    category: 'general',
    path: '/dashboard/settings/appearance'
  },
  {
    id: 'stores',
    title: 'Gestion des boutiques',
    description: 'Consultez et modifiez les paramètres de vos boutiques, mettez à jour leurs informations.',
    icon: Store,
    category: 'general',
    path: '/dashboard/settings/stores'
  },
  {
    id: 'configurations',
    title: 'Configurations',
    description: 'Définissez vos coordonnées et paramètres de support client pour vos acheteurs.',
    icon: SettingsIcon,
    category: 'general',
    path: '/dashboard/settings/configurations'
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Configurez vos alertes automatiques par Email et Telegram pour suivre votre activité.',
    icon: Bell,
    category: 'general',
    path: '/dashboard/settings/notifications'
  },
  // Paramètres du compte
  {
    id: 'team',
    title: 'Équipe',
    description: 'Gérez vos collaborateurs, ajoutez de nouveaux membres et suivez leur activité.',
    icon: Users,
    category: 'account',
    path: '/dashboard/settings/team'
  },
  {
    id: 'profile',
    title: 'Mon Profil',
    description: 'Gérez vos informations personnelles, mot de passe et préférences de connexion.',
    icon: User,
    category: 'account',
    path: '/dashboard/settings/profile'
  },
  // Paramètres avancés
  {
    id: 'analytics',
    title: 'Analytiques',
    description: 'Intégrez Facebook Pixel, Google Analytics ou ajoutez votre propre code JavaScript personnalisé.',
    icon: BarChart3,
    category: 'advanced',
    path: '/dashboard/settings/analytics'
  },
  {
    id: 'domain',
    title: 'Nom de domaine',
    description: 'Connectez vos boutiques à des noms de domaine personnalisés pour plus de professionnalisme.',
    icon: Globe,
    category: 'advanced',
    path: '/dashboard/settings/domain'
  },
  {
    id: 'pricing',
    title: 'Tarification',
    description: 'Consultez votre forfait actuel et découvrez les options pour développer votre activité.',
    icon: CreditCard,
    category: 'advanced',
    path: '/dashboard/settings/pricing'
  }
];

const categoryTitles = {
  general: 'Paramètres généraux',
  account: 'Paramètres du compte',
  advanced: 'Paramètres avancés'
};

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();

  const handleCardClick = (path: string) => {
    navigate(path);
  };

  const groupedSettings = settingsCards.reduce((acc, card) => {
    if (!acc[card.category]) {
      acc[card.category] = [];
    }
    acc[card.category].push(card);
    return acc;
  }, {} as Record<string, SettingCard[]>);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Paramètres généraux
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Configurez et personnalisez votre compte et vos boutiques selon vos besoins
        </p>
      </div>

      {Object.entries(groupedSettings).map(([category, cards]) => (
        <div key={category} className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {categoryTitles[category as keyof typeof categoryTitles]}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => (
              <Card 
                key={card.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] group"
              >
                <div 
                  className="flex items-start justify-between h-full"
                  onClick={() => handleCardClick(card.path)}
                >
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <div className="p-2 bg-theme-primary-50 rounded-lg mr-3">
                        <card.icon className="w-5 h-5 text-theme-primary" />
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {card.title}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-theme-primary transition-colors ml-2 flex-shrink-0" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};