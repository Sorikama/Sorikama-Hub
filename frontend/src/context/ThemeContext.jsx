/**
 * Contexte de thème - Gestion du mode sombre/clair/système
 * 
 * Permet de basculer entre les thèmes et de sauvegarder la préférence utilisateur
 */

import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Récupérer le thème sauvegardé ou utiliser 'system' par défaut
    return localStorage.getItem('sorikama_theme') || THEMES.SYSTEM;
  });

  // Appliquer le thème au document
  useEffect(() => {
    const applyTheme = () => {
      const root = document.documentElement;
      
      if (theme === THEMES.SYSTEM) {
        // Utiliser la préférence système
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.toggle('dark', systemPrefersDark);
      } else {
        // Utiliser le thème choisi
        root.classList.toggle('dark', theme === THEMES.DARK);
      }
    };

    applyTheme();

    // Écouter les changements de préférence système
    if (theme === THEMES.SYSTEM) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', applyTheme);
      
      return () => mediaQuery.removeEventListener('change', applyTheme);
    }
  }, [theme]);

  // Sauvegarder le thème
  useEffect(() => {
    localStorage.setItem('sorikama_theme', theme);
  }, [theme]);

  const setLightTheme = () => setTheme(THEMES.LIGHT);
  const setDarkTheme = () => setTheme(THEMES.DARK);
  const setSystemTheme = () => setTheme(THEMES.SYSTEM);

  const value = {
    theme,
    setTheme,
    setLightTheme,
    setDarkTheme,
    setSystemTheme,
    isLight: theme === THEMES.LIGHT,
    isDark: theme === THEMES.DARK,
    isSystem: theme === THEMES.SYSTEM
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme doit être utilisé dans un ThemeProvider');
  }
  return context;
}