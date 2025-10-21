/**
 * Composant ThemeToggle - Sélecteur de thème
 * 
 * Permet de basculer entre les modes clair, sombre et système
 */

import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, setLightTheme, setDarkTheme, setSystemTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themes = [
    {
      key: 'light',
      label: 'Clair',
      icon: '☀️',
      action: setLightTheme
    },
    {
      key: 'dark', 
      label: 'Sombre',
      icon: '🌙',
      action: setDarkTheme
    },
    {
      key: 'system',
      label: 'Système',
      icon: '💻',
      action: setSystemTheme
    }
  ];

  const currentTheme = themes.find(t => t.key === theme);

  return (
    <div className="relative">
      {/* Bouton principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
        title="Changer le thème"
      >
        <span className="text-lg">{currentTheme?.icon}</span>
      </button>

      {/* Menu déroulant */}
      {isOpen && (
        <>
          {/* Overlay pour fermer */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
            {themes.map((themeOption) => (
              <button
                key={themeOption.key}
                onClick={() => {
                  themeOption.action();
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 text-left flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg ${
                  theme === themeOption.key ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                <span className="text-lg">{themeOption.icon}</span>
                <span className="text-sm font-medium">{themeOption.label}</span>
                {theme === themeOption.key && (
                  <span className="ml-auto text-indigo-600 dark:text-indigo-400">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}