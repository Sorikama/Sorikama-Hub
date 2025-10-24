import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useSecureAuth } from '../hooks/useSecureAuth';
import api from '../services/api';

const AuthTest = () => {
  const { user, login, signup, logout } = useAuth();
  const { isSecure, hasValidToken } = useSecureAuth();

  const testLogin = async () => {
    try {
      await login('test@example.com', 'password123');
      console.log('✅ Login successful');
    } catch (error) {
      console.error('❌ Login failed:', error.message);
    }
  };

  const testApiCall = async () => {
    try {
      const response = await api.get('/auth/me');
      console.log('✅ API call successful:', response.data);
    } catch (error) {
      console.error('❌ API call failed:', error.message);
    }
  };

  const testSystemCall = async () => {
    try {
      const response = await api.get('/system/health');
      console.log('✅ System call successful:', response.data);
    } catch (error) {
      console.error('❌ System call failed:', error.message);
    }
  };

  if (!import.meta.env.DEV) {
    return null; // Ne pas afficher en production
  }

  return (
    <div className="fixed bottom-4 right-4 bg-card border border-border rounded-lg p-4 max-w-sm">
      <h3 className="font-bold mb-2">🧪 Tests d'Authentification</h3>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Utilisateur connecté:</span>
          <span className={user ? 'text-green-600' : 'text-red-600'}>
            {user ? '✅' : '❌'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Token valide:</span>
          <span className={hasValidToken ? 'text-green-600' : 'text-red-600'}>
            {hasValidToken ? '✅' : '❌'}
          </span>
        </div>
        

        
        <div className="flex justify-between">
          <span>Sécurisé:</span>
          <span className={isSecure ? 'text-green-600' : 'text-red-600'}>
            {isSecure ? '✅' : '❌'}
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <button
          onClick={testLogin}
          className="w-full text-xs py-1 px-2 bg-blue-500 text-white rounded"
        >
          Test Login
        </button>
        
        <button
          onClick={testApiCall}
          className="w-full text-xs py-1 px-2 bg-green-500 text-white rounded"
        >
          Test API Call
        </button>
        
        <button
          onClick={testSystemCall}
          className="w-full text-xs py-1 px-2 bg-purple-500 text-white rounded"
        >
          Test System Call
        </button>
        
        {user && (
          <button
            onClick={logout}
            className="w-full text-xs py-1 px-2 bg-red-500 text-white rounded"
          >
            Logout
          </button>
        )}
      </div>

      {user && (
        <div className="mt-2 text-xs">
          <p><strong>User ID:</strong> {user.id || user._id}</p>
        </div>
      )}
    </div>
  );
};

export default AuthTest;