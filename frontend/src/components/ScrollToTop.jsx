import React, { useState, useEffect } from 'react';
import { FiArrowUp } from 'react-icons/fi';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Fonction pour vérifier si l'utilisateur a défilé suffisamment pour afficher le bouton
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Fonction pour défiler vers le haut de la page
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Ajouter un écouteur d'événement pour le défilement
  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    
    // Nettoyer l'écouteur d'événement lors du démontage du composant
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <div 
      className={`fixed bottom-8 right-8 z-50 transition-all duration-500 ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-12 pointer-events-none'
      }`}
    >
      <button
        onClick={scrollToTop}
        className="p-0.5 rounded-full bg-conic-gradient shadow-lg shadow-color-1/20 dark:shadow-color-1/10"
        aria-label="Retour en haut"
      >
        <div className="flex items-center justify-center w-12 h-12 rounded-full dark:bg-n-8 bg-white transition-all duration-300 hover:scale-110 active:scale-95">
          <FiArrowUp className="text-xl dark:text-color-1 text-color-1" />
        </div>
      </button>
    </div>
  );
};

export default ScrollToTop;
