/**
 * Modal de confirmation moderne et réutilisable
 */

import { FiAlertCircle, FiAlertTriangle, FiCheckCircle, FiInfo, FiX } from 'react-icons/fi';

const typeConfig = {
  info: {
    icon: FiInfo,
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    textColor: 'text-blue-600 dark:text-blue-400',
    buttonColor: 'bg-blue-600 hover:bg-blue-700',
  },
  success: {
    icon: FiCheckCircle,
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    textColor: 'text-green-600 dark:text-green-400',
    buttonColor: 'bg-green-600 hover:bg-green-700',
  },
  warning: {
    icon: FiAlertTriangle,
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    textColor: 'text-yellow-600 dark:text-yellow-400',
    buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
  },
  danger: {
    icon: FiAlertCircle,
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    textColor: 'text-red-600 dark:text-red-400',
    buttonColor: 'bg-red-600 hover:bg-red-700',
  },
};

export default function ConfirmModal({
  isOpen,
  title,
  message,
  type = 'info',
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  const config = typeConfig[type] || typeConfig.info;
  const Icon = config.icon;
  const isAlert = !cancelText; // Si pas de texte d'annulation, c'est une alerte

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && onCancel) {
      onCancel();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700 animate-scale-in">
        {/* Icon */}
        <div className={`w-12 h-12 ${config.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
          <Icon className={`w-6 h-6 ${config.textColor}`} />
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
          {title}
        </h3>

        {/* Message */}
        <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
          {message}
        </p>

        {/* Actions */}
        <div className={`flex gap-3 ${isAlert ? 'justify-center' : ''}`}>
          {!isAlert && onCancel && (
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2.5 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={onConfirm}
            className={`${isAlert ? 'px-8' : 'flex-1'} ${config.buttonColor} text-white py-2.5 px-4 rounded-lg transition-colors font-medium`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
