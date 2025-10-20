import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSecureAuth } from '../hooks/useSecureAuth';
import api from '../services/api';

const SSOConnect = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [serviceInfo, setServiceInfo] = useState(null);
  
  const { user } = useAuth();
  const { isSecure, hasApiKey } = useSecureAuth();

  const serviceName = searchParams.get('service') || 'Service Externe';
  const redirectUrl = searchParams.get('redirect_url');
  const clientId = searchParams.get('client_id');
  const scope = searchParams.get('scope') || 'profile';

  useEffect(() => {
    if (!user || !isSecure) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.href));
      return;
    }

    // Vérifier les informations du service
    const verifyService = async () => {
      try {
        const response = await api.get(`/sso/verify-service?client_id=${clientId}`);
        setServiceInfo(response.data.service);
      } catch (err) {
        setError('Service non reconnu ou non autorisé');
      } finally {
        setLoading(false);
      }
    };

    if (clientId) {
      verifyService();
    } else {
      setServiceInfo({ name: serviceName, trusted: false });
      setLoading(false);
    }
  }, [user, isSecure, clientId, serviceName, navigate]);

  const handleAuthorize = async () => {
    if (!user || !hasApiKey) {
      setError('Authentification incomplète');
      return;
    }

    setLoading(true);
    
    try {
      // Générer un token SSO
      const response = await api.post('/sso/authorize', {
        clientId,
        redirectUrl,
        scope,
        userId: user.id || user._id
      });
      
      const { ssoToken, authUrl } = response.data;
      
      // Rediriger vers le service avec le token SSO
      if (authUrl) {
        window.location.href = authUrl;
      } else if (redirectUrl) {
        const params = new URLSearchParams({
          token: ssoToken,
          user_id: user.id || user._id,
          api_key: user.apiKey
        });
        window.location.href = `${redirectUrl}?${params.toString()}`;
      } else {
        navigate('/services');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'autorisation');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (redirectUrl) {
      window.location.href = `${redirectUrl}?error=access_denied`;
    } else {
      navigate('/services');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Vérification de la demande...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-card border border-border rounded-lg p-8 text-center">
          <div className="text-4xl mb-4">❌</div>
          <h1 className="text-xl font-bold mb-4">Erreur</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-card border border-border rounded-lg p-8">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xl">
              S
            </div>
            <div className="flex flex-col items-center">
              <div className="text-2xl text-muted-foreground mb-1">⟷</div>
              <div className="text-xs text-muted-foreground">Liaison sécurisée</div>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              {serviceInfo?.name?.charAt(0) || 'S'}
            </div>
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Autorisation de Liaison</h1>
          <p className="text-muted-foreground">
            <strong className="text-foreground">{serviceInfo?.name || serviceName}</strong> souhaite se connecter à votre compte Sorikama
          </p>
          
          {serviceInfo?.trusted && (
            <div className="inline-flex items-center mt-2 px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-xs">
              ✓ Service vérifié
            </div>
          )}
        </div>

        <div className="bg-muted/50 rounded-lg p-4 mb-6">
          <h3 className="font-medium mb-3 flex items-center">
            🔐 Données partagées :
          </h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Profil de base (nom, email)
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Clé API personnelle
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Statut d'authentification
            </li>
            {scope.includes('services') && (
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Accès aux autres services
              </li>
            )}
          </ul>
        </div>

        {user && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-6">
            <div className="flex items-center text-sm">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xs mr-3">
                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
              </div>
              <div>
                <p className="font-medium">{user.firstName} {user.lastName}</p>
                <p className="text-muted-foreground text-xs">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col space-y-3">
          <button
            onClick={handleAuthorize}
            disabled={loading || !hasApiKey}
            className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Autorisation...
              </div>
            ) : (
              '🔗 Autoriser la liaison'
            )}
          </button>
          
          <button
            onClick={handleCancel}
            disabled={loading}
            className="w-full py-3 border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
          >
            ❌ Refuser
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground mb-2">
            En autorisant, vous acceptez de partager vos données avec <strong>{serviceInfo?.name || serviceName}</strong>
          </p>
          <p className="text-xs text-muted-foreground">
            🔒 Connexion sécurisée via Sorikama Hub
          </p>
        </div>
      </div>
    </div>
  );
};

export default SSOConnect;