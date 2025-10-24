import React from 'react';
import { useAuth } from '../context/AuthContext';

const SecurityInfo = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="bg-card border border-border rounded-lg p-6 mt-6">
      <h3 className="text-lg font-semibold mb-4">🔐 Informations de Sécurité</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div>
            <p className="font-medium">Authentification JWT</p>
            <p className="text-sm text-muted-foreground">Token sécurisé pour l'accès aux services</p>
          </div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>

        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div>
            <p className="font-medium">Clé API personnelle</p>
            <p className="text-sm text-muted-foreground">Clé unique générée à l'inscription</p>
          </div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>

        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div>
            <p className="font-medium">Chiffrement des données</p>
            <p className="text-sm text-muted-foreground">Communications sécurisées HTTPS</p>
          </div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Sécurité renforcée :</strong> Votre compte utilise une authentification à double niveau 
          (API Key + JWT) pour garantir la sécurité de vos données et l'accès aux services Sorikama.
        </p>
      </div>
    </div>
  );
};

export default SecurityInfo;