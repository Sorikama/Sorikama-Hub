/**
 * Page de profil utilisateur - Design moderne et responsive
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Profile() {
  const { user, updateProfile, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteStep, setDeleteStep] = useState(1);
  const [deleteError, setDeleteError] = useState('');
  const [connectedServices, setConnectedServices] = useState([]);
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || ''
  });
  
  const [deleteData, setDeleteData] = useState({
    email: '',
    fullName: '',
    reason: ''
  });

  // Charger les services connectés et vérifier le statut du compte
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Vérifier si le compte est en attente de suppression
        if (user?.accountStatus === 'pending_deletion') {
          toast.warning('Votre compte est en attente de suppression');
        }

        // Charger les services connectés
        const response = await api.get('/sso/my-sessions');
        if (response.data.success) {
          setConnectedServices(response.data.data.sessions);
        }
      } catch (error) {
        console.error('Erreur chargement services:', error);
      }
    };

    fetchData();
  }, [user, toast]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDeleteInputChange = (e) => {
    const { name, value } = e.target;
    setDeleteData(prev => ({
      ...prev,
      [name]: value
    }));
    // Réinitialiser l'erreur quand l'utilisateur modifie un champ
    if (deleteError) {
      setDeleteError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await updateProfile(formData);
      toast.success('Profil mis à jour avec succès');
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || ''
    });
    setIsEditing(false);
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      setDeleteError(''); // Réinitialiser l'erreur
      
      const response = await api.post('/account/schedule-deletion', deleteData);
      
      toast.success('Votre compte sera supprimé dans 15 jours. Vous allez être déconnecté.');
      setShowDeleteModal(false);
      setDeleteStep(1);
      setDeleteData({ email: '', fullName: '', reason: '' });
      
      // Nettoyer le sessionStorage
      sessionStorage.clear();
      
      // Rediriger immédiatement vers la page de connexion
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
      
    } catch (error) {
      console.error('Erreur suppression compte:', error);
      const errorMessage = error.response?.data?.message || 'Erreur lors de la suppression';
      
      // Afficher l'erreur dans le modal au lieu d'un toast
      setDeleteError(errorMessage);
      
      // Si le compte est déjà en attente, afficher aussi un toast
      if (errorMessage.includes('déjà en attente')) {
        toast.warning('Votre compte est déjà en attente de suppression.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      try {
        await logout();
        navigate('/');
      } catch (error) {
        console.error('Erreur déconnexion:', error);
      }
    }
  };

  const canProceedStep1 = deleteData.email.toLowerCase() === user?.email?.toLowerCase();
  const canProceedStep2 = deleteData.fullName.toLowerCase() === `${user?.firstName} ${user?.lastName}`.toLowerCase();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        
        {/* En-tête de la page */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour au tableau de bord
          </button>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Mon profil</h1>
          <p className="text-gray-600 mt-2">Gérez vos informations personnelles et vos paramètres</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Colonne gauche - Carte profil */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
              {/* Avatar */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center shadow-lg mx-auto">
                    <span className="text-3xl font-bold text-white">
                      {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                    </span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full border-4 border-white"></div>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mt-4">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-sm text-gray-600 mt-1">{user.email}</p>
              </div>

              {/* Statistiques */}
              <div className="space-y-3 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Statut</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Actif
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Services connectés</span>
                  <span className="text-sm font-semibold text-gray-900">{connectedServices.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Membre depuis</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {new Date(user?.createdAt).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Actions rapides */}
              <div className="mt-6 pt-6 border-t border-gray-100 space-y-2">
                <button
                  onClick={() => navigate('/connected-services')}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    Services connectés
                  </span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Se déconnecter
                  </span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Colonne droite - Contenu principal */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Informations personnelles */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Informations personnelles</h3>
                    <p className="text-sm text-gray-600 mt-1">Mettez à jour vos informations de profil</p>
                  </div>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Modifier
                    </button>
                  )}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                      Prénom
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      id="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                      Nom
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      id="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Adresse email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        disabled
                        className="w-full px-4 py-3 pl-10 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">L'adresse email ne peut pas être modifiée</p>
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 inline-flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Enregistrement...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Enregistrer
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Services connectés */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Services connectés</h3>
                    <p className="text-sm text-gray-600 mt-1">Gérez vos connexions aux services externes</p>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                    {connectedServices.length} {connectedServices.length > 1 ? 'services' : 'service'}
                  </span>
                </div>
              </div>

              <div className="p-6">
                {connectedServices.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </div>
                    <p className="text-gray-600 font-medium">Aucun service connecté</p>
                    <p className="text-sm text-gray-500 mt-1">Connectez-vous à des services pour les voir ici</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {connectedServices.slice(0, 5).map((service) => (
                      <div key={service.sessionId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{service.serviceName}</p>
                            <p className="text-xs text-gray-500">
                              Connecté le {new Date(service.createdAt).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    ))}
                    {connectedServices.length > 5 && (
                      <p className="text-sm text-gray-500 text-center pt-2">
                        Et {connectedServices.length - 5} autre(s) service(s)...
                      </p>
                    )}
                    <button
                      onClick={() => navigate('/connected-services')}
                      className="w-full mt-4 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Voir tous les services
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Zone de danger */}
            <div className="bg-white rounded-xl shadow-sm border border-red-200">
              <div className="p-6 border-b border-red-100">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-red-900">Zone de danger</h3>
                    <p className="text-sm text-red-700 mt-1">
                      Actions irréversibles concernant votre compte
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="p-4 bg-red-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-red-900 mb-2">Supprimer mon compte</h4>
                  <p className="text-sm text-red-700 mb-4">
                    La suppression de votre compte est définitive. Toutes vos données seront perdues après 15 jours.
                  </p>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
                  >
                    Supprimer mon compte
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>



        {/* Modal de suppression */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    Supprimer mon compte - Étape {deleteStep}/2
                  </h3>
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteStep(1);
                      setDeleteData({ email: '', fullName: '', reason: '' });
                      setDeleteError('');
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {deleteStep === 1 && (
                  <div>
                    {/* Message d'erreur */}
                    {deleteError && (
                      <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded-lg">
                        <div className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-sm text-red-800 font-medium">{deleteError}</p>
                        </div>
                      </div>
                    )}

                    <div className="mb-4 p-4 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-800 font-medium mb-2">Services qui seront déconnectés :</p>
                      {connectedServices.length === 0 ? (
                        <p className="text-sm text-red-700">Aucun service connecté</p>
                      ) : (
                        <ul className="text-sm text-red-700 space-y-1">
                          {connectedServices.map((service) => (
                            <li key={service.sessionId}>• {service.serviceName}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">
                      Pour confirmer, saisissez votre adresse email complète :
                    </p>
                    
                    <input
                      type="email"
                      name="email"
                      value={deleteData.email}
                      onChange={handleDeleteInputChange}
                      placeholder={user?.email}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
                    />
                    
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setShowDeleteModal(false)}
                        className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={() => {
                          setDeleteStep(2);
                          setDeleteError('');
                        }}
                        disabled={!canProceedStep1}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Continuer
                      </button>
                    </div>
                  </div>
                )}

                {deleteStep === 2 && (
                  <div>
                    {/* Message d'erreur */}
                    {deleteError && (
                      <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded-lg">
                        <div className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-sm text-red-800 font-medium">{deleteError}</p>
                        </div>
                      </div>
                    )}

                    <p className="text-sm text-gray-600 mb-4">
                      Saisissez votre nom complet pour confirmer définitivement :
                    </p>
                    
                    <input
                      type="text"
                      name="fullName"
                      value={deleteData.fullName}
                      onChange={handleDeleteInputChange}
                      placeholder={`${user?.firstName} ${user?.lastName}`}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
                    />
                    
                    <textarea
                      name="reason"
                      value={deleteData.reason}
                      onChange={handleDeleteInputChange}
                      placeholder="Raison de la suppression (optionnel)"
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
                    />
                    
                    <div className="mb-4 p-4 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-yellow-800 font-medium">
                        ⚠️ La suppression prendra effet dans 15 jours. Vous pourrez annuler cette action en vous reconnectant.
                      </p>
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => {
                          setDeleteStep(1);
                          setDeleteError('');
                        }}
                        className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Retour
                      </button>
                      <button
                        onClick={handleDeleteAccount}
                        disabled={!canProceedStep2 || loading}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Suppression...' : 'Supprimer définitivement'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
