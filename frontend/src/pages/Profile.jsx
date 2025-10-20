import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import SecurityInfo from '../components/SecurityInfo';
import TokenStatus from '../components/TokenStatus';
import SessionInfo from '../components/SessionInfo';

const Profile = () => {
  const { user, updateProfile, regenerateApiKey, loading } = useAuth();
  const [editing, setEditing] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await updateProfile(formData);
      setEditing(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      bio: user?.bio || ''
    });
    setEditing(false);
  };

  const handleRegenerateApiKey = async () => {
    if (!confirm('Êtes-vous sûr de vouloir régénérer votre clé API ? L\'ancienne clé ne fonctionnera plus.')) {
      return;
    }

    setRegenerating(true);
    try {
      await regenerateApiKey();
      alert('Nouvelle clé API générée avec succès !');
    } catch (error) {
      console.error('Erreur lors de la régénération:', error);
    } finally {
      setRegenerating(false);
    }
  };

  const copyApiKey = () => {
    if (user?.apiKey) {
      navigator.clipboard.writeText(user.apiKey);
      alert('Clé API copiée dans le presse-papiers !');
    }
  };

  const maskApiKey = (key) => {
    if (!key) return 'Non disponible';
    return key.substring(0, 8) + '...' + key.substring(key.length - 8);
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-card border border-border rounded-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold">Mon Profil</h1>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Modifier
              </button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Prénom</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Nom</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Téléphone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Bio</label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2"
                  placeholder="Parlez-nous de vous..."
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Prénom</label>
                  <p className="text-lg">{user?.firstName || 'Non renseigné'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Nom</label>
                  <p className="text-lg">{user?.lastName || 'Non renseigné'}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Email</label>
                <p className="text-lg">{user?.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Téléphone</label>
                <p className="text-lg">{user?.phone || 'Non renseigné'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Bio</label>
                <p className="text-lg">{user?.bio || 'Aucune bio renseignée'}</p>
              </div>

              <div className="pt-6 border-t border-border space-y-6">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Membre depuis</label>
                  <p className="text-lg">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : 'Non disponible'}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-muted-foreground">Clé API personnelle</label>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="text-xs text-primary hover:underline"
                      >
                        {showApiKey ? 'Masquer' : 'Afficher'}
                      </button>
                      <button
                        onClick={copyApiKey}
                        className="text-xs text-primary hover:underline"
                        disabled={!user?.apiKey}
                      >
                        Copier
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 px-3 py-2 bg-muted rounded text-sm font-mono">
                      {showApiKey ? user?.apiKey || 'Non disponible' : maskApiKey(user?.apiKey)}
                    </code>
                    <button
                      onClick={handleRegenerateApiKey}
                      disabled={regenerating}
                      className="px-3 py-2 text-xs bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 transition-colors disabled:opacity-50"
                    >
                      {regenerating ? 'Génération...' : 'Régénérer'}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Cette clé vous permet d'accéder aux services Sorikama. Ne la partagez jamais.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SecurityInfo />
            <TokenStatus />
          </div>
          <SessionInfo />
        </div>
      </div>
    </div>
  );
};

export default Profile;