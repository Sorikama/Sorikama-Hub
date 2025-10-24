/**
 * Landing Page - Page d'accueil Sorikama Hub
 * Design minimaliste et accueillant
 */

import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      
      {/* Hero Section - Minimaliste */}
      <section className="relative py-12 sm:py-16 md:py-20 px-4 overflow-hidden">
        
        {/* Forme décorative subtile */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-30 -z-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-50 rounded-full blur-3xl opacity-30 -z-10"></div>

        <div className="max-w-4xl mx-auto text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-full mb-8 animate-fade-in-scale">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            <span className="text-blue-700 text-sm font-medium">Système d'authentification unifié</span>
          </div>

          {/* Titre principal */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-4 sm:mb-6 leading-tight animate-slide-in-up">
            Sorikama Hub
          </h1>
          
          {/* Sous-titre */}
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed animate-slide-in-up animation-delay-200 px-4">
            Une seule connexion pour accéder à tous les services de l'écosystème Sorikama
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center animate-slide-in-up animation-delay-400 px-4">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/signup"
                  className="bg-gray-900 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl text-center"
                >
                  Commencer gratuitement
                </Link>
                <Link
                  to="/login"
                  className="bg-white text-gray-900 px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 text-center"
                >
                  Se connecter
                </Link>
              </>
            ) : (
              <Link
                to="/dashboard"
                className="bg-gray-900 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl text-center"
              >
                Accéder au Dashboard
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Section Comment ça marche */}
      <section className="py-12 sm:py-16 md:py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              Un système simple et sécurisé en 3 étapes
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Étape 1 */}
            <div className="text-center px-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-900 text-white rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-4 sm:mb-6 shadow-lg">
                1
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Créez votre compte</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Inscrivez-vous en quelques secondes avec votre email. Vérifiez votre compte avec le code reçu.
              </p>
            </div>

            {/* Étape 2 */}
            <div className="text-center px-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-900 text-white rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-4 sm:mb-6 shadow-lg">
                2
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Connectez-vous une fois</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Une seule authentification vous donne accès à tous les services de l'écosystème.
              </p>
            </div>

            {/* Étape 3 */}
            <div className="text-center px-4 sm:col-span-2 md:col-span-1">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-900 text-white rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-4 sm:mb-6 shadow-lg">
                3
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Accédez à tout</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Naviguez librement entre tous les services sans avoir à vous reconnecter.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Services */}
      <section className="py-12 sm:py-16 md:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              L'écosystème Sorikama
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Six services interconnectés pour tous vos besoins
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            
            {[
              { name: 'SoriStore', icon: '🛍️', desc: 'E-commerce' },
              { name: 'SoriPay', icon: '💳', desc: 'Paiements' },
              { name: 'SoriWallet', icon: '💰', desc: 'Portefeuille' },
              { name: 'SoriLearn', icon: '📚', desc: 'Formation' },
              { name: 'SoriHealth', icon: '🏥', desc: 'Santé' },
              { name: 'SoriAccess', icon: '♿', desc: 'Accessibilité' }
            ].map((service, index) => (
              <div
                key={service.name}
                className="bg-white border-2 border-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-gray-200 hover:shadow-lg transition-all duration-300 animate-fade-in-scale"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">{service.icon}</div>
                <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 mb-1 sm:mb-2">{service.name}</h3>
                <p className="text-gray-600 text-xs sm:text-sm hidden sm:block">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Avantages */}
      <section className="py-12 sm:py-16 md:py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pourquoi Sorikama Hub ?
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-12">
            
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Sécurisé</h3>
              <p className="text-gray-600 leading-relaxed">
                Authentification robuste avec API Key personnelle et tokens JWT
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Rapide</h3>
              <p className="text-gray-600 leading-relaxed">
                Connexion instantanée et navigation fluide entre les services
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Simple</h3>
              <p className="text-gray-600 leading-relaxed">
                Une seule connexion pour tout l'écosystème Sorikama
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      {!isAuthenticated && (
        <section className="py-12 sm:py-16 md:py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">
              Prêt à commencer ?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 px-4">
              Créez votre compte gratuitement en moins de 2 minutes
            </p>
            <Link
              to="/signup"
              className="inline-block bg-gray-900 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-xl text-base sm:text-lg font-semibold hover:bg-gray-800 transition-all duration-300 shadow-xl hover:shadow-2xl"
            >
              Créer mon compte
            </Link>
            <p className="mt-4 sm:mt-6 text-gray-500 text-xs sm:text-sm">
              Aucune carte bancaire requise
            </p>
          </div>
        </section>
      )}

      {/* Footer Simple */}
      <footer className="border-t border-gray-200 py-8 sm:py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Sorikama Hub</h3>
              <p className="text-gray-600 text-sm">
                Votre passerelle vers l'écosystème Sorikama
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-gray-600">
              <a href="#" className="hover:text-gray-900 transition-colors">À propos</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Services</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Support</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Contact</a>
            </div>
          </div>
          
          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200 text-center text-xs sm:text-sm text-gray-500">
            © 2024 Sorikama Hub. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}
