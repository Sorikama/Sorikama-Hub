// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { systemService } from '../services/api';

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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-indigo-600">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl">
              Sorikama Hub
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-indigo-200 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Votre passerelle vers l'écosystème Sorikama. Connectez-vous à tous nos services avec une seule authentification.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              {!isAuthenticated ? (
                <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex">
                  <Link
                    to="/signup"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                  >
                    Créer un compte
                  </Link>
                  <Link
                    to="/login"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-500 hover:bg-indigo-400 md:py-4 md:text-lg md:px-10"
                  >
                    Se connecter
                  </Link>
                </div>
              ) : (
                <Link
                  to="/profile"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                >
                  Accéder à mon profil
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">
              Écosystème Sorikama
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Tous nos services connectés
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  🛍️
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">SoriStore</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Marketplace e-commerce pour tous vos achats
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  💳
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">SoriPay</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Système de paiement sécurisé et rapide
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  💰
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">SoriWallet</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Portefeuille numérique pour gérer vos finances
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  📚
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">SoriLearn</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Plateforme d'apprentissage et de formation
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      {systemHealth && (
        <div className="bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900">État du système</h3>
              <div className="mt-4 flex justify-center items-center space-x-2">
                <div className="h-3 w-3 bg-green-400 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  Tous les services sont opérationnels
                </span>
              </div>
              {isAuthenticated && user && (
                <p className="mt-2 text-sm text-gray-500">
                  Connecté en tant que {user.firstName} {user.lastName}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}