import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import Button from '../components/Button';
import { Link } from 'react-router-dom'; // Importer Link pour la navigation

const Profile = () => {
  const { user, updateProfile, updatePassword } = useAuth();

  // État pour le formulaire d'informations personnelles
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  // État pour le formulaire de mot de passe
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  // Utiliser useEffect pour remplir le formulaire une fois que `user` est chargé
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsProfileLoading(true);
    try {
      // On envoie firstName et lastName comme attendu par le backend
      await updateProfile({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
      });
    } catch (error) {
      // Le toast est déjà géré dans le contexte
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      toast.error("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }
    setIsPasswordLoading(true);
    try {
      await updatePassword({
        password: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      // Vider les champs après succès
      setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (error) {
      // Le toast est déjà géré dans le contexte
    } finally {
      setIsPasswordLoading(false);
    }
  };

  return (
    <div className="pt-20 pb-10 min-h-screen bg-n-8 text-white">
      <div className="container mx-auto px-4">

        {/* En-tête de la page avec titre et bouton de retour */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="h1">Gestion du Profil</h1>
          <Link to="/dashboard" className="hidden lg:flex">
            <Button>Retour au Dashboard</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Section Informations Personnelles */}
          <div className="bg-n-7 border border-n-6 rounded-lg p-6">
            <h2 className="h4 mb-6">Informations Personnelles</h2>
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              {/* Champ Prénom */}
              <div>
                <label className="block text-sm font-medium text-n-3">Prénom</label>
                <input
                  type="text"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleProfileChange}
                  required
                  className="w-full px-3 py-2 mt-1 text-white bg-n-9/40 border border-n-5 rounded-md focus:outline-none focus:ring focus:ring-color-1"
                />
              </div>

              {/* Champ Nom */}
              <div>
                <label className="block text-sm font-medium text-n-3">Nom</label>
                <input
                  type="text"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleProfileChange}
                  required
                  className="w-full px-3 py-2 mt-1 text-white bg-n-9/40 border border-n-5 rounded-md focus:outline-none focus:ring focus:ring-color-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-n-3">Email</label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  disabled // L'email ne peut pas être modifié
                  className="w-full px-3 py-2 mt-1 text-n-4 bg-n-9/20 border border-n-5 rounded-md cursor-not-allowed"
                />
              </div>
              <Button type="submit" disabled={isProfileLoading}>
                {isProfileLoading ? 'Sauvegarde...' : 'Sauvegarder les changements'}
              </Button>
            </form>
          </div>

          {/* Section Changer le Mot de Passe */}
          <div className="bg-n-7 border border-n-6 rounded-lg p-6">
            <h2 className="h4 mb-6">Changer le mot de passe</h2>
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-n-3">Mot de passe actuel</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full px-3 py-2 mt-1 text-white bg-n-9/40 border border-n-5 rounded-md focus:outline-none focus:ring focus:ring-color-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-n-3">Nouveau mot de passe</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full px-3 py-2 mt-1 text-white bg-n-9/40 border border-n-5 rounded-md focus:outline-none focus:ring focus:ring-color-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-n-3">Confirmer le nouveau mot de passe</label>
                <input
                  type="password"
                  name="confirmNewPassword"
                  value={passwordData.confirmNewPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full px-3 py-2 mt-1 text-white bg-n-9/40 border border-n-5 rounded-md focus:outline-none focus:ring focus:ring-color-1"
                />
              </div>
              <Button type="submit" disabled={isPasswordLoading}>
                {isPasswordLoading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

