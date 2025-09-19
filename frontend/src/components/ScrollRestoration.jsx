import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Ce composant réinitialise la position de défilement à chaque changement de route
 * Il doit être placé à l'intérieur du Router mais en dehors des Routes
 */
const ScrollRestoration = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Remonte automatiquement en haut de la page lors d'un changement de route
    window.scrollTo(0, 0);
  }, [pathname]);

  return null; // Ce composant ne rend rien visuellement
};

export default ScrollRestoration;
