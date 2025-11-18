/**
 * Dashboard utilisateur - Page d'accueil minimaliste
 */

import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        
        {/* Avatar avec initiales */}
        <div className="mb-8">
          <div className="relative inline-block">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center shadow-2xl mx-auto animate-fade-in">
              <span className="text-4xl sm:text-5xl font-bold text-white">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </span>
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-full border-4 border-white shadow-lg"></div>
          </div>
        </div>

        {/* Message de bienvenue */}
        <div className="mb-12 animate-slide-up">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-4">
            Bienvenue, {user?.firstName} ! 👋
          </h1>
          <p className="text-lg sm:text-xl text-gray-600">
            Ravi de vous revoir sur Sorikama
          </p>
        </div>

        {/* Bouton vers le profil */}
        <div className="animate-fade-in-delay">
          <Link
            to="/profile"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl hover:scale-105 hover:bg-gray-800 transition-all duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Voir mon profil
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>

        {/* Informations supplémentaires */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.email}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">Statut</p>
            <p className="text-sm font-semibold text-green-600">Actif</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">Membre depuis</p>
            <p className="text-sm font-semibold text-gray-900">
              {new Date(user?.createdAt).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Styles d'animation */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-delay {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out 0.2s both;
        }

        .animate-fade-in-delay {
          animation: fade-in-delay 0.6s ease-out 0.4s both;
        }
      `}</style>
    </div>
  );
}
