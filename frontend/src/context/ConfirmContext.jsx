/**
 * Context pour gérer les confirmations modales
 * Remplace les alert() et confirm() natifs du navigateur
 */

import { createContext, useContext, useState } from 'react';
import ConfirmModal from '../components/common/ConfirmModal';

const ConfirmContext = createContext();

export function ConfirmProvider({ children }) {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info', // info, warning, danger, success
    confirmText: 'Confirmer',
    cancelText: 'Annuler',
    onConfirm: null,
    onCancel: null,
  });

  /**
   * Afficher une confirmation
   */
  const confirm = ({
    title = 'Confirmation',
    message,
    type = 'info',
    confirmText = 'Confirmer',
    cancelText = 'Annuler',
  }) => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        title,
        message,
        type,
        confirmText,
        cancelText,
        onConfirm: () => {
          setConfirmState(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setConfirmState(prev => ({ ...prev, isOpen: false }));
          resolve(false);
        },
      });
    });
  };

  /**
   * Afficher une alerte (juste OK)
   */
  const alert = ({
    title = 'Information',
    message,
    type = 'info',
    confirmText = 'OK',
  }) => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        title,
        message,
        type,
        confirmText,
        cancelText: null, // Pas de bouton annuler
        onConfirm: () => {
          setConfirmState(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: null,
      });
    });
  };

  const value = {
    confirm,
    alert,
  };

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        type={confirmState.type}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        onConfirm={confirmState.onConfirm}
        onCancel={confirmState.onCancel}
      />
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
}
