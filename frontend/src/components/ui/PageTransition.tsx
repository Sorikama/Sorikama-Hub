import React, { useState, useEffect } from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
  location?: string; // Optionnel, pour forcer une transition lors des changements de route
}

const PageTransition: React.FC<PageTransitionProps> = ({ children, location }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  // Effet pour gérer la transition d'entrée
  useEffect(() => {
    // Petit délai pour permettre au DOM de se stabiliser
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);
    
    return () => clearTimeout(timer);
  }, [location]); // Re-exécuter l'effet si la location change
  
  return (
    <div 
      className={`transition-opacity duration-300 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      {children}
    </div>
  );
};

export default PageTransition;
