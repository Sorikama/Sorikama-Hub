/**
 * Composant Loader - Indicateur de chargement
 * 
 * Affiche un spinner animé pendant les opérations asynchrones
 * Utilisé pendant l'authentification, les requêtes API, etc.
 */

import React from 'react';

export default function Loader({ message = 'Chargement...' }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        {/* Spinner animé */}
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        
        {/* Message de chargement */}
        <p className="mt-4 text-gray-600 text-sm">{message}</p>
      </div>
    </div>
  );
}