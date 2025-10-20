import React from 'react';
import { useSecureAuth } from '../hooks/useSecureAuth';

const SecurityStatus = () => {
  const { user, isSecure, hasApiKey, hasValidToken } = useSecureAuth();

  if (!user) return null;

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Statut de Sécurité</h3>
        <div className={`w-3 h-3 rounded-full ${isSecure ? 'bg-green-500' : 'bg-red-500'}`}></div>
      </div>
      
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>Token JWT</span>
          <span className={hasValidToken ? 'text-green-600' : 'text-red-600'}>
            {hasValidToken ? '✓ Valide' : '✗ Invalide'}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span>Clé API</span>
          <span className={hasApiKey ? 'text-green-600' : 'text-red-600'}>
            {hasApiKey ? '✓ Configurée' : '✗ Manquante'}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span>Connexion sécurisée</span>
          <span className={isSecure ? 'text-green-600' : 'text-red-600'}>
            {isSecure ? '✓ Active' : '✗ Inactive'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SecurityStatus;