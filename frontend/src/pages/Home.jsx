/**
 * Page d'accueil - Landing Page Sorikama Hub
 * 
 * Design moderne et professionnel sans mode sombre
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { systemService } from '../services/api';
import Footer from '../components/Footer';

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const [systemHealth, setSystemHealth] = useState(null);

  useEffect(() => {
    const checkSystemHealth = async () => {
      try {
        const health = await systemService.getHealth();
        setSystemHealth(health);
      } catch (error) {
        console.error('Erreur santé système:', error);
      }
    };

    checkSystemHealth();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            
            {/* Badge de statut */}
            {systemHealth && (
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-medium mb-8">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                Tous les services sont opérationnels
              </div>
            )}

            {/* Titre principal */}
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Sorikama
              </span>{' '}
              Hub
            </h1>
            
            {/* Sous-titre */}
            <p className="text-xl md:text-2xl text-gray-600 mb-6 max-w-3xl mx-auto">
              Votre passerelle unique vers l'écosystème Sorikama
            </p>
            
            <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
              Connectez-vous à tous nos services avec une seule authentification. 
              Simple, sécurisé, et parfaitement intégré.
            </p>

            {/* Call to Action */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/signup"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg"
                  >
                    Commencer gratuitement
                  </Link>
                  <Link
                    to="/login"
                    className="border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200"
                  >
                    Se connecter
                  </Link>
                </>
              ) : (
                <div className="text-center">
                  <p className="text-gray-600 mb-4 text-lg">
                    Bonjour <span className="font-semibold text-indigo-600">{user?.firstName}</span> !
                  </p>
                  <Link
                    to="/profile"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg"
                  >
                    Accéder à mon profil
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Éléments décoratifs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              L'écosystème Sorikama
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Six services interconnectés pour répondre à tous vos besoins
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* SoriStore */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-2">
              <div className="text-5xl mb-6">🛍️</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">SoriStore</h3>
              <p className="text-gray-600 leading-relaxed">
                Marketplace e-commerce moderne avec paiements intégrés
              </p>
            </div>

            {/* SoriPay */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-2">
              <div className="text-5xl mb-6">💳</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">SoriPay</h3>
              <p className="text-gray-600 leading-relaxed">
                Solution de paiement sécurisée et instantanée
              </p>
            </div>

            {/* SoriWallet */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-2">
              <div className="text-5xl mb-6">💰</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">SoriWallet</h3>
              <p className="text-gray-600 leading-relaxed">
                Portefeuille numérique pour gérer vos finances
              </p>
            </div>

            {/* SoriLearn */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-2">
              <div className="text-5xl mb-6">📚</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">SoriLearn</h3>
              <p className="text-gray-600 leading-relaxed">
                Plateforme d'apprentissage et de formation
              </p>
            </div>

            {/* SoriHealth */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-2">
              <div className="text-5xl mb-6">🏥</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">SoriHealth</h3>
              <p className="text-gray-600 leading-relaxed">
                Gestion de santé et suivi médical
              </p>
            </div>

            {/* SoriAccess */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-2">
              <div className="text-5xl mb-6">♿</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">SoriAccess</h3>
              <p className="text-gray-600 leading-relaxed">
                Solutions d'accessibilité et d'inclusion
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Pourquoi choisir Sorikama Hub ?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            
            {/* Sécurité */}
            <div className="text-center">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Sécurité Renforcée</h3>
              <p className="text-gray-600 leading-relaxed">
                Authentification à double niveau avec API Keys personnalisées
              </p>
            </div>

            {/* Simplicité */}
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Simplicité d'Usage</h3>
              <p className="text-gray-600 leading-relaxed">
                Une seule connexion pour tous les services Sorikama
              </p>
            </div>

            {/* Performance */}
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Performance Optimale</h3>
              <p className="text-gray-600 leading-relaxed">
                API Gateway haute performance avec monitoring temps réel
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      {!isAuthenticated && (
        <section className="py-20 bg-indigo-600">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-white mb-6">
              Prêt à rejoindre l'écosystème Sorikama ?
            </h2>
            <p className="text-xl text-indigo-100 mb-8">
              Créez votre compte en moins de 2 minutes
            </p>
            <Link
              to="/signup"
              className="bg-white text-indigo-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Créer mon compte gratuitement
            </Link>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}