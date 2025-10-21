/**
 * Composant Toast individuel
 * Affiche un message avec une icône et une animation
 */

import { useEffect, useState } from 'react';
import { useToast } from '../context/ToastContext';

export default function Toast({ id, message, type, duration }) {
  const { removeToast } = useToast();
  const [isExiting, setIsExiting] = useState(false);

  // Gestion de la fermeture
  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      removeToast(id);
    }, 300); // Durée de l'animation de sortie
  };

  // Configuration par type
  const config = {
    success: {
      bgColor: 'bg-gradient-to-r from-green-500 to-emerald-500',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    error: {
      bgColor: 'bg-gradient-to-r from-red-500 to-rose-500',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    warning: {
      bgColor: 'bg-gradient-to-r from-yellow-500 to-orange-500',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    info: {
      bgColor: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  };

  const { bgColor, icon } = config[type] || config.info;

  return (
    <div
      className={`
        ${bgColor}
        min-w-[320px] max-w-md
        rounded-2xl shadow-2xl
        p-4 pr-12
        flex items-center gap-4
        pointer-events-auto
        transform transition-all duration-300 ease-out
        ${isExiting 
          ? 'translate-x-[400px] opacity-0' 
          : 'translate-x-0 opacity-100 animate-slide-in-up'
        }
      `}
    >
      {/* Icône */}
      <div className="flex-shrink-0 animate-float">
        {icon}
      </div>

      {/* Message */}
      <p className="text-white font-medium text-sm leading-relaxed flex-1">
        {message}
      </p>

      {/* Bouton de fermeture */}
      <button
        onClick={handleClose}
        className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors duration-200"
        aria-label="Fermer"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Barre de progression (si durée définie) */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 rounded-b-2xl overflow-hidden">
          <div
            className="h-full bg-white/40 animate-progress"
            style={{
              animation: `progress ${duration}ms linear forwards`,
            }}
          />
        </div>
      )}
    </div>
  );
}
