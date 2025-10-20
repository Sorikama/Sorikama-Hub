import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const useTokenRefresh = () => {
  const { user, clearAuthData } = useAuth();
  const refreshTimeoutRef = useRef(null);

  useEffect(() => {
    if (!user?.token) return;

    const scheduleRefresh = () => {
      try {
        // Décoder le JWT pour obtenir l'expiration
        const payload = JSON.parse(atob(user.token.split('.')[1]));
        const expiresAt = payload.exp * 1000;
        const now = Date.now();
        
        // Programmer le refresh 5 minutes avant l'expiration
        const refreshTime = expiresAt - now - (5 * 60 * 1000);
        
        if (refreshTime > 0) {
          refreshTimeoutRef.current = setTimeout(async () => {
            try {
              const refreshToken = localStorage.getItem('refreshToken');
              if (!refreshToken) {
                clearAuthData();
                return;
              }

              const response = await api.post('/auth/refresh-token', { refreshToken });
              const { user: updatedUser, tokens } = response.data.data;
              
              // Mettre à jour les tokens
              localStorage.setItem('token', tokens.accessToken);
              localStorage.setItem('userApiKey', updatedUser.apiKey);
              localStorage.setItem('refreshToken', tokens.refreshToken);
              localStorage.setItem('user', JSON.stringify(updatedUser));
              
              // Programmer le prochain refresh
              scheduleRefresh();
              
            } catch (error) {
              console.error('Erreur refresh token:', error);
              clearAuthData();
            }
          }, refreshTime);
        } else {
          // Token déjà expiré
          clearAuthData();
        }
      } catch (error) {
        console.error('Erreur décodage token:', error);
        clearAuthData();
      }
    };

    scheduleRefresh();

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [user?.token, clearAuthData]);

  return null;
};