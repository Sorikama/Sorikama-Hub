/**
 * Dashboard utilisateur - Page d'accueil après connexion
 * Affiche un aperçu des services et informations de l'utilisateur
 */

import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Dashboard() {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mise à jour de l'heure toutes les secondes
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Obtenir le message de salutation selon l'heure
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  // Services Sorikama
  const services = [
    {
      name: 'SoriStore',
      icon: '🛍️',
      description: 'Marketplace e-commerce',
      color: 'from-blue-500 to-cyan-500',
      status: 'Actif',
      link: '#'
    },
    {
      name: 'SoriPay',
      icon: '💳',
      description: 'Solution de paiement',
      color: 'from-purple-500 to-pink-500',
      status: 'Actif',
      link: '#'
    },
    {
      name: 'SoriWallet',
      icon: '💰',
      description: 'Portefeuille numérique',
      color: 'from-pink-500 to-rose-500',
      status: 'Actif',
      link: '#'
    },
    {
      name: 'SoriLearn',
      icon: '📚',
      description: 'Plateforme d\'apprentissage',
      color: 'from-yellow-500 to-orange-500',
      status: 'Actif',
      link: '#'
    },
    {
      name: 'SoriHealth',
      icon: '🏥',
      description: 'Gestion de santé',
      color: 'from-green-500 to-emerald-500',
      status: 'Actif',
      link: '#'
    },
    {
      name: 'SoriAccess',
      icon: '♿',
      description: 'Solutions d\'accessibilité',
      color: 'from-indigo-500 to-blue-500',
      status: 'Actif',
      link: '#'
    }
  ];

  // Statistiques rapides
  const stats = [
    { label: 'Services actifs', value: '6', icon: '🎯', color: 'from-blue-500 to-cyan-500' },
    { label: 'Compte vérifié', value: '✓', icon: '✅', color: 'from-green-500 to-emerald-500' },
    { label: 'Membre depuis', value: new Date(user?.createdAt || Date.now()).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }), icon: '📅', color: 'from-purple-500 to-pink-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      
      {/* Formes décoratives animées */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full opacity-20 animate-blob"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="max-w-7xl mx-auto">
        
        {/* En-tête de bienvenue */}
        <div className="mb-12 animate-fade-in-scale">
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              
              {/* Avatar et salutation */}
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-2xl animate-float">
                  <span className="text-3xl font-bold text-white">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </span>
                </div>
                
                <div>
                  <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
                    {getGreeting()}, <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{user?.firstName}</span> !
                  </h1>
                  <p className="text-gray-600 text-lg">
                    Bienvenue sur votre tableau de bord Sorikama
                  </p>
                </div>
              </div>

              {/* Heure actuelle */}
              <div className="text-center md:text-right">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-gray-600 text-sm mt-1">
                  {currentTime.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300 animate-fade-in-scale"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold mb-2">{stat.label}</p>
                  <p className="text-3xl font-black text-gray-900">{stat.value}</p>
                </div>
                <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                  <span className="text-3xl">{stat.icon}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions rapides */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Actions rapides</h2>
          <div className="grid md:grid-cols-3 gap-6">
            
            <Link
              to="/profile"
              className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Mon Profil</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Gérer vos informations personnelles et paramètres
              </p>
            </Link>

            <button
              className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group text-left"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">API Key</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Gérer votre clé API personnelle
              </p>
            </button>

            <button
              className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group text-left"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Documentation</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Consulter la documentation des services
              </p>
            </button>
          </div>
        </div>

        {/* Services Sorikama */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Vos Services</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <a
                key={service.name}
                href={service.link}
                className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group animate-fade-in-scale"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-3xl">{service.icon}</span>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                    {service.status}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">{service.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                
                <div className="flex items-center text-blue-600 font-semibold text-sm group-hover:gap-2 transition-all duration-300">
                  Accéder
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Section d'aide */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-2xl p-8 md:p-12 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl font-bold mb-3">Besoin d'aide ?</h2>
              <p className="text-blue-100 text-lg">
                Notre équipe support est disponible 24/7 pour vous accompagner
              </p>
            </div>
            <button className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 whitespace-nowrap">
              Contacter le support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
