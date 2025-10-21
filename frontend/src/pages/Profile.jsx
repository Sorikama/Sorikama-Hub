/**
 * Page de profil utilisateur - Design moderne et animé
 */

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import LogoutModal from '../components/LogoutModal';

export default function Profile() {
  const { user, updateProfile, logout, isLoading, error } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || ''
  });

  const handleInputChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(profileData);
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur mise à jour:', error);
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    try {
      const result = await logout();

      // Si la déconnexion a réussi, fermer le modal et rediriger
      setShowLogoutModal(false);
      setIsLoggingOut(false);

      // Afficher un message si c'était une déconnexion locale forcée
      if (result?.warning) {
        console.warn(result.warning);
      }

      // La redirection sera gérée automatiquement par le router
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
      setIsLoggingOut(false);
      // Ne pas fermer le modal pour que l'utilisateur voie l'erreur
      // L'erreur sera affichée via le contexte d'authentification
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loader-ring mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">

      {/* Formes décoratives animées */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full opacity-20 animate-blob"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="max-w-5xl mx-auto">

        {/* En-tête du profil */}
        <div className="text-center mb-12 animate-fade-in-scale">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mb-6 shadow-2xl animate-float">
            <span className="text-4xl font-bold text-white">
              {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
            </span>
          </div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            {user.firstName} {user.lastName}
          </h1>
          <p className="text-gray-600 text-lg">{user.email}</p>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg shadow-lg animate-slide-in-up">
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Carte Informations personnelles */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-8 animate-fade-in-scale border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <svg className="w-7 h-7 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Informations personnelles
              </h2>
            </div>

            {!isEditing ? (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-2xl">
                  <label className="block text-sm font-semibold text-gray-600 mb-2">Prénom</label>
                  <p className="text-lg font-medium text-gray-900">{user.firstName}</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-2xl">
                  <label className="block text-sm font-semibold text-gray-600 mb-2">Nom</label>
                  <p className="text-lg font-medium text-gray-900">{user.lastName}</p>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-5 rounded-2xl">
                  <label className="block text-sm font-semibold text-gray-600 mb-2">Email</label>
                  <p className="text-lg font-medium text-gray-900">{user.email}</p>
                </div>

                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  ✏️ Modifier mes informations
                </button>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                    Prénom
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    placeholder="Votre prénom"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                    placeholder="Votre nom"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? '💾 Sauvegarde...' : '✅ Sauvegarder'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all duration-300"
                  >
                    ❌ Annuler
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Section Services connectés */}
          <div className="mt-8 bg-white rounded-3xl shadow-xl p-8 animate-fade-in-scale animation-delay-200 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <svg className="w-7 h-7 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Services connectés
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {['SoriStore', 'SoriPay', 'SoriWallet', 'SoriLearn', 'SoriHealth', 'SoriAccess'].map((service, index) => (
                <div
                  key={service}
                  className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-2xl text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="font-semibold text-gray-800">{service}</p>
                  <p className="text-xs text-green-600 mt-1">Actif</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex justify-center animate-fade-in-scale animation-delay-400">
            <button
              onClick={handleLogoutClick}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-10 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center"
            >
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Se déconnecter
            </button>
          </div>
        </div>
      </div>

      {/* Modal de confirmation de déconnexion */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
        isLoading={isLoggingOut}
        error={error}
      />
    </div>
  );
}
