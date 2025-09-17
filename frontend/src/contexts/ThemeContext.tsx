import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
}

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  colors: ThemeColors;
  updateColors: (colors: ThemeColors) => void;
  applyTheme: () => void;
}

const defaultColors: ThemeColors = {
  primary: '#3B82F6',
  secondary: '#1E40AF',
  accent: '#60A5FA'
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [colors, setColors] = useState<ThemeColors>(defaultColors);

  useEffect(() => {
    // Charger le thème depuis le localStorage
    const storedTheme = localStorage.getItem('WebRichesse_theme');
    const storedColors = localStorage.getItem('WebRichesse_theme_colors');
    
    if (storedTheme) {
      setIsDark(storedTheme === 'dark');
    } else {
      setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }

    if (storedColors) {
      try {
        const parsedColors = JSON.parse(storedColors);
        setColors(parsedColors);
      } catch (error) {
        console.error('Erreur lors du parsing des couleurs:', error);
      }
    }
  }, []);

  useEffect(() => {
    applyTheme();
  }, [isDark, colors]);

  const applyTheme = () => {
    const root = document.documentElement;
    
    // Appliquer le mode sombre/clair
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Appliquer les couleurs personnalisées
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-secondary', colors.secondary);
    root.style.setProperty('--color-accent', colors.accent);

    // Générer des variantes de couleurs
    const primaryRgb = hexToRgb(colors.primary);
    const secondaryRgb = hexToRgb(colors.secondary);
    const accentRgb = hexToRgb(colors.accent);

    if (primaryRgb) {
      root.style.setProperty('--color-primary-rgb', `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`);
      root.style.setProperty('--color-primary-50', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.05)`);
      root.style.setProperty('--color-primary-100', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.1)`);
      root.style.setProperty('--color-primary-200', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.2)`);
      root.style.setProperty('--color-primary-500', colors.primary);
      root.style.setProperty('--color-primary-600', darkenColor(colors.primary, 10));
      root.style.setProperty('--color-primary-700', darkenColor(colors.primary, 20));
    }

    if (secondaryRgb) {
      root.style.setProperty('--color-secondary-rgb', `${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}`);
      root.style.setProperty('--color-secondary-50', `rgba(${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}, 0.05)`);
      root.style.setProperty('--color-secondary-100', `rgba(${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}, 0.1)`);
    }

    if (accentRgb) {
      root.style.setProperty('--color-accent-rgb', `${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}`);
      root.style.setProperty('--color-accent-50', `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.05)`);
      root.style.setProperty('--color-accent-100', `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.1)`);
    }
  };

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('WebRichesse_theme', newTheme ? 'dark' : 'light');
  };

  const updateColors = (newColors: ThemeColors) => {
    setColors(newColors);
    localStorage.setItem('WebRichesse_theme_colors', JSON.stringify(newColors));
  };

  return (
    <ThemeContext.Provider value={{ 
      isDark, 
      toggleTheme, 
      colors, 
      updateColors, 
      applyTheme 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Fonctions utilitaires
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function darkenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const factor = (100 - percent) / 100;
  const r = Math.round(rgb.r * factor);
  const g = Math.round(rgb.g * factor);
  const b = Math.round(rgb.b * factor);
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}