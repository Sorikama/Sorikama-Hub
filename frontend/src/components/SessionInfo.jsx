import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const SessionInfo = () => {
  const { user } = useAuth();
  const [sessionData, setSessionData] = useState(null);

  useEffect(() => {
    if (user?.token) {
      try {
        const payload = JSON.parse(atob(user.token.split('.')[1]));
        const expiresAt = new Date(payload.exp * 1000);
        const issuedAt = new Date(payload.iat * 1000);
        const timeLeft = Math.max(0, payload.exp * 1000 - Date.now());
        
        setSessionData({
          userId: payload.id,
          roles: payload.roles || [],
          permissions: payload.permissions || [],
          expiresAt,
          issuedAt,
          timeLeft,
          isExpired: timeLeft <= 0
        });
      } catch (error) {
        console.error('Erreur décodage token:', error);
      }
    }
  }, [user?.token]);

  const formatTime = (ms) => {
    if (ms <= 0) return 'Expiré';
    
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (!user || !sessionData) return null;

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">📊 Informations de Session</h3>
      
      <div className="space-y-4">
        {/* Utilisateur */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Utilisateur</label>
            <p className="font-mono text-sm">{sessionData.userId}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">API Key</label>
            <p className="font-mono text-sm">{user.apiKey?.substring(0, 12)}...</p>
          </div>
        </div>

        {/* Tokens */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Token JWT</label>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${sessionData.isExpired ? 'bg-red-500' : 'bg-green-500'}`}></div>
              <span className="text-sm">{sessionData.isExpired ? 'Expiré' : 'Valide'}</span>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Refresh Token</label>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${localStorage.getItem('refreshToken') ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm">{localStorage.getItem('refreshToken') ? 'Disponible' : 'Manquant'}</span>
            </div>
          </div>
        </div>

        {/* Temps */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Expire dans</label>
            <p className={`text-sm ${sessionData.timeLeft < 300000 ? 'text-orange-600' : 'text-foreground'}`}>
              {formatTime(sessionData.timeLeft)}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Créé le</label>
            <p className="text-sm">{sessionData.issuedAt.toLocaleString()}</p>
          </div>
        </div>

        {/* Rôles et Permissions */}
        <div>
          <label className="text-sm font-medium text-muted-foreground">Rôles</label>
          <div className="flex flex-wrap gap-1 mt-1">
            {sessionData.roles.map(role => (
              <span key={role} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                {role}
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground">Permissions ({sessionData.permissions.length})</label>
          <div className="flex flex-wrap gap-1 mt-1 max-h-20 overflow-y-auto">
            {sessionData.permissions.slice(0, 6).map(permission => (
              <span key={permission} className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded">
                {permission}
              </span>
            ))}
            {sessionData.permissions.length > 6 && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded">
                +{sessionData.permissions.length - 6} autres
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Alerte expiration */}
      {sessionData.timeLeft < 300000 && sessionData.timeLeft > 0 && (
        <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
          <p className="text-sm text-orange-800 dark:text-orange-200">
            ⚠️ Token expire bientôt - Renouvellement automatique programmé
          </p>
        </div>
      )}
    </div>
  );
};

export default SessionInfo;