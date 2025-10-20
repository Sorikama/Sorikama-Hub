import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireApiKey = true }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Vérification des autorisations...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireApiKey && !user.apiKey) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-4xl mb-4">🔑</div>
          <h1 className="text-2xl font-bold mb-4">Clé API manquante</h1>
          <p className="text-muted-foreground mb-6">
            Votre compte ne possède pas de clé API. Veuillez contacter le support.
          </p>
          <Navigate to="/profile" replace />
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;