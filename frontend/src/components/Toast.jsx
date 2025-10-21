/**
 * Composant Toast - Notifications utilisateur
 * 
 * Affiche des messages de notification (succès, erreur, info, warning)
 * avec animation d'apparition/disparition automatique
 */

import React, { useState, useEffect } from 'react';

/**
 * Types de toast disponibles
 */
const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning'
};

/**
 * Styles pour chaque type de toast
 */
const TOAST_STYLES = {
  [TOAST_TYPES.SUCCESS]: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    icon: '✅'
  },
  [TOAST_TYPES.ERROR]: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    icon: '❌'
  },
  [TOAST_TYPES.INFO]: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    icon: 'ℹ️'
  },
  [TOAST_TYPES.WARNING]: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
    icon: '⚠️'
  }
};

/**
 * Composant Toast
 * 
 * @param {Object} props - Props du composant
 * @param {string} props.message - Message à afficher
 * @param {string} props.type - Type de toast (success, error, info, warning)
 * @param {number} props.duration - Durée d'affichage en ms (défaut: 5000)
 * @param {Function} props.onClose - Callback appelé à la fermeture
 * @returns {React.ReactElement|null} Composant toast ou null
 */
export default function Toast({ 
  message, 
  type = TOAST_TYPES.INFO, 
  duration = 5000, 
  onClose 
}) {
  const [isVisible, setIsVisible] = useState(true);

  // Fermeture automatique après la durée spécifiée
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  /**
   * Gérer la fermeture du toast
   */
  const handleClose = () => {
    setIsVisible(false);
    // Délai pour l'animation de sortie
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };

  // Ne pas afficher si pas visible
  if (!isVisible) return null;

  const styles = TOAST_STYLES[type] || TOAST_STYLES[TOAST_TYPES.INFO];

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div className={`
        ${styles.bg} ${styles.border} ${styles.text}
        border rounded-lg p-4 shadow-lg
        transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}>
        <div className="flex items-start">
          {/* Icône du type de toast */}
          <div className="flex-shrink-0 mr-3">
            <span className="text-lg">{styles.icon}</span>
          </div>
          
          {/* Message */}
          <div className="flex-1">
            <p className="text-sm font-medium">{message}</p>
          </div>
          
          {/* Bouton de fermeture */}
          <button
            onClick={handleClose}
            className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <span className="sr-only">Fermer</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook personnalisé pour gérer les toasts
 * 
 * @returns {Object} Fonctions pour afficher différents types de toasts
 */
export function useToast() {
  const [toasts, setToasts] = useState([]);

  /**
   * Ajouter un nouveau toast
   */
  const addToast = (message, type = TOAST_TYPES.INFO, duration = 5000) => {
    const id = Date.now();
    const newToast = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);
    
    // Supprimer automatiquement après la durée
    setTimeout(() => {
      removeToast(id);
    }, duration + 300); // +300ms pour l'animation
  };

  /**
   * Supprimer un toast
   */
  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return {
    toasts,
    success: (message, duration) => addToast(message, TOAST_TYPES.SUCCESS, duration),
    error: (message, duration) => addToast(message, TOAST_TYPES.ERROR, duration),
    info: (message, duration) => addToast(message, TOAST_TYPES.INFO, duration),
    warning: (message, duration) => addToast(message, TOAST_TYPES.WARNING, duration),
    removeToast
  };
}

/**
 * Conteneur pour afficher tous les toasts actifs
 */
export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={0} // Géré par le hook
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}