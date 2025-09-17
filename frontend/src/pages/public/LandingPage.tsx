import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Store, BarChart3, CreditCard, Shield, Moon, Sun } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useTheme } from '../../contexts/ThemeContext';

export const LandingPage: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();

  const features = [
    {
      icon: Store,
      title: 'Boutiques personnalisées',
      description: 'Créez votre boutique en ligne avec votre propre domaine et design personnalisé.'
    },
    {
      icon: BarChart3,
      title: 'Analytiques avancées',
      description: 'Suivez vos ventes, revenus et performance avec des rapports détaillés.'
    },
    {
      icon: CreditCard,
      title: 'Paiements sécurisés',
      description: 'Acceptez les paiements en toute sécurité avec notre système intégré.'
    },
    {
      icon: Shield,
      title: 'Protection des données',
      description: 'Vos données et celles de vos clients sont protégées par un chiffrement de niveau bancaire.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Store className="w-8 h-8 text-theme-primary mr-2" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">WebRichesse</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <Link to="/auth/login">
                <Button variant="ghost">Connexion</Button>
              </Link>
              <Link to="/auth/register">
                <Button>S'inscrire</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Créez votre empire
            <span className="text-theme-primary block">numérique</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            WebRichesse est la plateforme tout-en-un pour créer, gérer et développer votre boutique de produits numériques. 
            Transformez vos connaissances en revenus passifs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth/register">
              <Button size="lg" icon={ArrowRight} iconPosition="right">
                Créer ma boutique gratuitement
              </Button>
            </Link>
            <Button variant="secondary" size="lg">
              Voir une démo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Tout ce dont vous avez besoin pour réussir
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Des outils professionnels pour créer, vendre et gérer vos produits numériques
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300">
                <div className="bg-theme-primary-50 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-theme-primary" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-theme-primary">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Prêt à commencer votre aventure entrepreneuriale ?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Rejoignez des milliers d'entrepreneurs qui font déjà confiance à WebRichesse
          </p>
          <Link to="/auth/register">
            <Button variant="secondary" size="lg" icon={ArrowRight} iconPosition="right">
              Commencer maintenant
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Store className="w-6 h-6 text-theme-primary mr-2" />
              <span className="text-lg font-bold">WebRichesse</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2024 WebRichesse. Tous droits réservés.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};