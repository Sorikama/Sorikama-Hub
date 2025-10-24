import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const TokenStatus = () => {
  const { user } = useAuth();
  const [tokenInfo, setTokenInfo] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.token) {
      try {
        const payload = JSON.parse(atob(user.token.split('.')[1]));
        const expiresAt = new Date(payload.exp * 1000);
        const isExpired = payload.exp * 1000 < Date.now();
        const timeLeft = Math.max(0, payload.exp * 1000 - Date.now());
        
        setTokenInfo({
          expiresAt,
          isExpired,
          timeLeft,
          userId: payload.sub || payload.userId
        });
      } catch (error) {
        console.error('Erreur lors du décodage du token:', error);
      }
    }
  }, [user?.token]);

  useEffect(() => {
    // Écouter les événements de refresh token
    const handleTokenRefresh = () => {
      setRefreshing(true);
      setTimeout(() => setRefreshing(false), 2000);
    };

    window.addEventListener('token-refreshed', handleTokenRefresh);
    return () => window.removeEventListener('token-refreshed', handleTokenRefresh);
  }, []);

  const formatTimeLeft = (ms) => {
    if (ms <= 0) return 'Expiré';
    
    const minutes = Math.floor(ms / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}j ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  if (!user || !tokenInfo) return null;

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">🔑 Session Token</h3>
        {refreshing && (
          <div className="flex items-center text-xs text-blue-600">
            <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin mr-1"></div>
            Actualisation...
          </div>
        )}
      </div>
      
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Statut:</span>
          <span className={tokenInfo.isExpired ? 'text-red-600' : 'text-green-600'}>
            {tokenInfo.isExpired ? '❌ Expiré' : '✅ Valide'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">Expire dans:</span>
          <span className={tokenInfo.timeLeft < 300000 ? 'text-orange-600' : 'text-foreground'}>
            {formatTimeLeft(tokenInfo.timeLeft)}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">Refresh Token:</span>
          <span className={localStorage.getItem('refreshToken') ? 'text-green-600' : 'text-red-600'}>
            {localStorage.getItem('refreshToken') ? '✅ Disponible' : '❌ Manquant'}
          </span>
        </div>
      </div>
      
      {tokenInfo.timeLeft < 300000 && tokenInfo.timeLeft > 0 && (
        <div className="mt-3 p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded text-xs text-orange-800 dark:text-orange-200">
          ⚠️ Token expire bientôt - Renouvellement automatique activé
        </div>
      )}
    </div>
  );
};

export default TokenStatus;