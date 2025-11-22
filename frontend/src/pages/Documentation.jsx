import React, { useState } from 'react';
import { Book, Users, Shield, Zap, HelpCircle, ChevronDown, ChevronRight } from 'lucide-react';

const Documentation = () => {
  const [openSection, setOpenSection] = useState('introduction');

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const Section = ({ id, title, icon: Icon, children }) => {
    const isOpen = openSection === id;
    
    return (
      <div className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection(id)}
          className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Icon className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          </div>
          {isOpen ? (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-500" />
          )}
        </button>
        
        {isOpen && (
          <div className="p-6 bg-gray-50 border-t border-gray-200">
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Book className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Documentation Sorikama Hub</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">Guide complet pour comprendre et utiliser Sorikama Hub</p>
      </div>

      {/* Content */}
      <div>
        
        {/* Introduction */}
        <Section id="introduction" title="Qu'est-ce que Sorikama Hub ?" icon={Book}>
          <div className="prose max-w-none">
            <p className="text-gray-700 mb-4">
              <strong>Sorikama Hub</strong> est une plateforme d'authentification centralisée (SSO - Single Sign-On) 
              qui permet à vos utilisateurs de se connecter une seule fois pour accéder à tous vos services.
            </p>
            
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 my-4">
              <p className="text-blue-900 font-medium">
                💡 En résumé : Un seul compte, une seule connexion, accès à tous vos services !
              </p>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Pourquoi utiliser Sorikama Hub ?</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span><strong>Simplicité</strong> - Vos utilisateurs n'ont qu'un seul compte à gérer</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span><strong>Sécurité</strong> - Authentification centralisée et sécurisée</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span><strong>Gain de temps</strong> - Plus besoin de créer un compte pour chaque service</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span><strong>Contrôle</strong> - Gérez tous vos accès depuis un seul endroit</span>
              </li>
            </ul>
          </div>
        </Section>

        {/* Fonctionnalités */}
        <Section id="features" title="Fonctionnalités principales" icon={Zap}>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-lg shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Authentification Unique (SSO)</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Connectez-vous une fois et accédez à tous vos services sans avoir à vous reconnecter.
              </p>
            </div>

            <div className="bg-white p-5 rounded-lg shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Gestion des Utilisateurs</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Gérez votre profil, vos informations personnelles et vos préférences en un seul endroit.
              </p>
            </div>

            <div className="bg-white p-5 rounded-lg shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Book className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Services Connectés</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Visualisez et gérez tous les services auxquels vous avez accès avec votre compte Sorikama.
              </p>
            </div>

            <div className="bg-white p-5 rounded-lg shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Sécurité Renforcée</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Vos données sont protégées avec un chiffrement de niveau bancaire et des sessions sécurisées.
              </p>
            </div>
          </div>
        </Section>

        {/* Comment ça marche */}
        <Section id="how-it-works" title="Comment ça marche ?" icon={HelpCircle}>
          <div className="prose max-w-none">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Le processus en 3 étapes simples</h3>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Créez votre compte Sorikama</h4>
                  <p className="text-gray-600">
                    Inscrivez-vous une seule fois sur Sorikama Hub avec votre email et un mot de passe sécurisé.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Connectez-vous à un service</h4>
                  <p className="text-gray-600">
                    Lorsque vous accédez à un service (comme Masebuy), cliquez sur "Se connecter avec Sorikama". 
                    Vous serez redirigé vers Sorikama Hub pour vous authentifier.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Accédez automatiquement</h4>
                  <p className="text-gray-600">
                    Une fois connecté, vous êtes automatiquement redirigé vers le service. 
                    Plus besoin de vous reconnecter pour les autres services !
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mt-6">
              <p className="text-yellow-900">
                <strong>💡 Astuce :</strong> Cochez "Se souvenir de moi" lors de la connexion pour rester connecté pendant 30 jours.
              </p>
            </div>
          </div>
        </Section>

        {/* Gestion des Services */}
        <Section id="services" title="Gestion des Services" icon={Users}>
          <div className="prose max-w-none">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Vos services connectés</h3>
            
            <p className="text-gray-700 mb-4">
              Depuis votre tableau de bord Sorikama, vous pouvez :
            </p>

            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">→</span>
                <span><strong>Voir tous vos services</strong> - Liste complète des applications accessibles avec votre compte</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">→</span>
                <span><strong>Gérer vos accès</strong> - Révoquer l'accès à un service si vous ne l'utilisez plus</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">→</span>
                <span><strong>Voir l'activité</strong> - Consultez quand et où vous vous êtes connecté</span>
              </li>
            </ul>

            <div className="bg-white border border-gray-200 rounded-lg p-4 mt-6">
              <h4 className="font-semibold text-gray-900 mb-2">Services actuellement disponibles :</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span><strong>Masebuy</strong> - Plateforme e-commerce</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
                  <span className="text-gray-500">D'autres services arrivent bientôt...</span>
                </li>
              </ul>
            </div>
          </div>
        </Section>

        {/* FAQ */}
        <Section id="faq" title="Questions Fréquentes (FAQ)" icon={HelpCircle}>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">🔐 Mes données sont-elles sécurisées ?</h4>
              <p className="text-gray-600 text-sm">
                Oui ! Sorikama Hub utilise un chiffrement de niveau bancaire (AES-256) pour protéger vos données. 
                Vos mots de passe sont hashés et jamais stockés en clair.
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">❓ Que se passe-t-il si j'oublie mon mot de passe ?</h4>
              <p className="text-gray-600 text-sm">
                Cliquez sur "Mot de passe oublié" sur la page de connexion. Vous recevrez un email avec un lien 
                pour réinitialiser votre mot de passe (valide 10 minutes).
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">🔄 Puis-je me déconnecter de tous les services en même temps ?</h4>
              <p className="text-gray-600 text-sm">
                Oui ! En vous déconnectant de Sorikama Hub, vous serez automatiquement déconnecté de tous les services liés.
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">🗑️ Comment supprimer mon compte ?</h4>
              <p className="text-gray-600 text-sm">
                Rendez-vous dans votre profil, puis cliquez sur "Supprimer mon compte". Vous aurez 7 jours pour annuler 
                la suppression si vous changez d'avis.
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">📧 Puis-je changer mon adresse email ?</h4>
              <p className="text-gray-600 text-sm">
                Actuellement, vous ne pouvez pas changer votre email. Cette fonctionnalité sera disponible prochainement.
              </p>
            </div>
          </div>
        </Section>

      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
          Besoin d'aide ? Contactez-nous à <a href="mailto:support@sorikama.com" className="text-blue-600 hover:underline">support@sorikama.com</a>
        </p>
      </div>
    </div>
  );
};

export default Documentation;
