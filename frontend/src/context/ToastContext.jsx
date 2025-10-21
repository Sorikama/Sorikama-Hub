/**
 * Contexte de gestion des toasts (notifications)
 * Permet d'afficher des messages de succès, erreur, info ou warning
 */

import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  /**
   * Ajouter un nouveau toast
   * @param {string} message - Message à afficher
   * @param {string} type - Type de toast (success, error, info, warning)
   * @param {number} duration - Durée d'affichage en ms (0 = permanent)
   */
  const addToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    // Auto-suppression après la durée spécifiée
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  /**
   * Supprimer un toast
   */
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  /**
   * Méthodes raccourcies pour chaque type
   */
  const success = useCallback((message, duration) => {
    addToast(message, 'success', duration);
  }, [addToast]);

  const error = useCallback((message, duration) => {
    addToast(message, 'error', duration);
  }, [addToast]);

  const info = useCallback((message, duration) => {
    addToast(message, 'info', duration);
  }, [addToast]);

  const warning = useCallback((message, duration) => {
    addToast(message, 'warning', duration);
  }, [addToast]);

  const value = {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
    warning,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
}

/**
 * Hook pour utiliser les toasts
 */
export function useToast() {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToast doit être utilisé à l\'intérieur d\'un ToastProvider');
  }
  
  return context;
}
