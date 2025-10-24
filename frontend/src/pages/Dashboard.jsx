/**
 * Dashboard utilisateur - Design moderne et fun
 */

import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function Dashboard() {
  const { user } = useAuth();
  const [hoveredService, setHoveredService] = useState(null);

  // Services Sorikama
  const services = [
    {
      name: 'SoriStore',
      icon: '🛍️',
      description: 'Marketplace e-commerce',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50',
      link: '#',
      stats: '2.5k produits'
    },
    {
      name: 'SoriPay',
      icon: '💳',
      description: 'Solution de paiement',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-50 to-pink-50',
      link: '#',
      stats: 'Sécurisé'
    },
    {
      name: 'SoriWallet',
      icon: '💰',
      description: 'Portefeuille numérique',
      color: 'from-pink-500 to-rose-500',
      bgColor: 'from-pink-50 to-rose-50',
      link: '#',
      stats: 'Multi-devises'
    },
    {
      name: 'SoriLearn',
      icon: '📚',
      description: 'Plateforme d\'apprentissage',
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'from-yellow-50 to-orange-50',
      link: '#',
      stats: '150+ cours'
    },
    {
      name: 'SoriHealth',
      icon: '🏥',
      description: 'Gestion de santé',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-50 to-emerald-50',
      link: '#',
      stats: '24/7 disponible'
    },
    {
      name: 'SoriAccess',
      icon: '♿',
      description: 'Solutions d\'accessibilité',
      color: 'from-indigo-500 to-blue-500',
      bgColor: 'from-indigo-50 to-blue-50',
      link: '#',
      stats: 'Inclusif'
    }
  ];

  const quickActions = [
    {
      name: 'Mon Profil',
      icon: '👤',
      color: 'from-blue-500 to-cyan-500',
      link: '/profile'
    },
    {
      name: 'Paramètres',
      icon: '⚙️',
      color: 'from-purple-500 to-pink-500',
      link: '#'
    },
    {
      name: 'Notifications',
      icon: '🔔',
      color: 'from-green-500 to-emerald-500',
      link: '#',
      badge: '3'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* En-tête avec avatar */}
        <div className="mb-8 bg-white rounded-3xl shadow-lg border border-gray-200 p-8 relative overflow-hidden">
          {/* Décoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -mr-32 -mt-32 opacity-50"></div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-white">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  Bonjour, {user?.firstName} 👋
                </h1>
                <p className="text-gray-600">
                  Bienvenue sur votre espace Sorikama
                </p>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="hidden md:flex items-center gap-3">
              {quickActions.map((action) => (
                <Link
                  key={action.name}
                  to={action.link}
                  className="relative group"
                  title={action.name}
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center shadow-md hover:shadow-lg transform hover:scale-110 transition-all`}>
                    <span className="text-xl">{action.icon}</span>
                  </div>
                  {action.badge && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {action.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Section Services */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="text-3xl">🚀</span>
            Vos Services
          </h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <a
                key={service.name}
                href={service.link}
                onMouseEnter={() => setHoveredService(index)}
                onMouseLeave={() => setHoveredService(null)}
                className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group relative overflow-hidden"
              >
                {/* Fond coloré au hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${service.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                      <span className="text-3xl">{service.icon}</span>
                    </div>
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full group-hover:bg-white transition-colors">
                      {service.stats}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-blue-600 group-hover:to-purple-600 transition-all">
                    {service.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">{service.description}</p>
                  
                  <div className="flex items-center text-blue-600 font-semibold text-sm group-hover:gap-2 transition-all">
                    Ouvrir
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Actions rapides mobile */}
        <div className="md:hidden mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Actions rapides</h2>
          <div className="grid grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.name}
                to={action.link}
                className="relative bg-white rounded-2xl shadow-md border border-gray-200 p-4 hover:shadow-lg transition-all"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                  <span className="text-2xl">{action.icon}</span>
                </div>
                <p className="text-xs font-semibold text-gray-900 text-center">{action.name}</p>
                {action.badge && (
                  <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {action.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* Carte d'aide */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-xl p-8 text-white relative overflow-hidden">
          {/* Décoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -mr-32 -mt-32 opacity-10"></div>
          
          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
                <span>💬</span>
                Besoin d'aide ?
              </h2>
              <p className="text-blue-100 text-lg">
                Notre équipe support est disponible 24/7
              </p>
            </div>
            <button className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-2xl hover:scale-105 transition-all whitespace-nowrap">
              Contacter le support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
