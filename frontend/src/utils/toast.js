import { toast } from 'react-toastify';

// Configuration des options par défaut
const defaultOptions = {
  position: 'bottom-right',
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

// Toast de succès
export const showSuccess = (message, options = {}) => {
  toast.success(message, { ...defaultOptions, ...options });
};

// Toast d'erreur
export const showError = (message, options = {}) => {
  toast.error(message, { ...defaultOptions, ...options });
};

// Toast d'information
export const showInfo = (message, options = {}) => {
  toast.info(message, { ...defaultOptions, ...options });
};

// Toast d'avertissement
export const showWarning = (message, options = {}) => {
  toast.warning(message, { ...defaultOptions, ...options });
};

// Toast personnalisé
export const showToast = (message, options = {}) => {
  toast(message, { ...defaultOptions, ...options });
};
