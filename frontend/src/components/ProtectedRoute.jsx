import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FadeInAnimation from './animations/FadeInAnimation';

const ProtectedRoute = ({ children }) => {
    // Récupère l'état d'authentification depuis le contexte
    const { isAuthenticated, user } = useAuth();
    const location = useLocation();

    // Si l'utilisateur n'est pas authentifié, le rediriger vers la page de connexion.
    // On sauvegarde l'URL actuelle (`location`) pour pouvoir y retourner après la connexion.
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Si l'utilisateur est authentifié, on affiche le composant enfant demandé (ex: Dashboard).
    return <FadeInAnimation>{children}</FadeInAnimation>;
};

export default ProtectedRoute;
