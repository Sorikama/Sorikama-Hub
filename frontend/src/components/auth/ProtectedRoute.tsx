import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useStore } from '../../contexts/StoreContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireStore?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireStore = false 
}) => {
  const { user, loading: authLoading } = useAuth();
  const { stores, isLoading: storeLoading } = useStore();
  const location = useLocation();

  if (authLoading || storeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Ajouter des logs pour déboguer la redirection
  console.log('ProtectedRoute - requireStore:', requireStore);
  console.log('ProtectedRoute - stores:', stores);
  console.log('ProtectedRoute - stores.length:', stores.length);
  console.log('ProtectedRoute - location.pathname:', location.pathname);
  
  // Vérifier si les boutiques sont chargées et si la redirection est nécessaire
  if (requireStore && (!stores || stores.length === 0) && location.pathname !== '/dashboard/create-store') {
    console.log('Redirection vers /dashboard/create-store car aucune boutique trouvée');
    return <Navigate to="/dashboard/create-store" replace />;
  }

  return <>{children}</>;
};