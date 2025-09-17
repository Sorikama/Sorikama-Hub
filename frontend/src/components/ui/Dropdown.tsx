import React, { useState, useRef, useEffect } from 'react';

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
}

export const Dropdown: React.FC<DropdownProps> = ({ 
  trigger, 
  children, 
  align = 'right' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [shouldShowAbove, setShouldShowAbove] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  
  // Fonction pour fermer le dropdown
  const closeDropdown = () => {
    setIsOpen(false);
  };

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Vérifier si le dropdown doit s'afficher vers le haut et gérer le redimensionnement
  useEffect(() => {
    const checkPosition = () => {
      if (isOpen && dropdownRef.current) {
        const rect = dropdownRef.current.getBoundingClientRect();
        const bottomSpace = window.innerHeight - rect.bottom;
        setShouldShowAbove(bottomSpace < 300);
      }
    };
    
    // Vérifier la position initiale
    checkPosition();
    
    // Vérifier à nouveau lors du redimensionnement
    window.addEventListener('resize', checkPosition);
    return () => {
      window.removeEventListener('resize', checkPosition);
    };
  }, [isOpen]);

  // Calculer la position du menu déroulant
  const getDropdownPosition = () => {
    if (!dropdownRef.current) return {};
    
    const rect = dropdownRef.current.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    
    if (shouldShowAbove) {
      // Afficher au-dessus du trigger
      return {
        bottom: `${windowHeight - rect.top + 5}px`, // +5px pour un petit espace
        left: align === 'right' 
          ? `${rect.right - 192}px` 
          : `${rect.left}px`,
        top: 'auto'
      };
    } else {
      // Afficher en dessous du trigger (comportement par défaut)
      return {
        top: `${rect.bottom + scrollTop}px`,
        left: align === 'right' 
          ? `${rect.right - 192}px` 
          : `${rect.left}px`,
        bottom: 'auto'
      };
    }
  };
  
  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={toggleDropdown} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div 
          className={`fixed w-48 rounded-lg shadow-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none z-[9999] ${
            shouldShowAbove 
              ? 'animate-dropdown-up' 
              : 'animate-dropdown-in'
          }`}
          style={getDropdownPosition()}
        >
          <div 
            className="py-0.5 overflow-hidden" 
            role="menu" 
            aria-orientation="vertical" 
            aria-labelledby="options-menu"
          >
            <DropdownContext.Provider value={{ closeDropdown }}>
              {children}
            </DropdownContext.Provider>
          </div>
        </div>
      )}
    </div>
  );
};

interface DropdownItemProps {
  onClick?: () => void;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

// Contexte pour partager l'état du dropdown avec les items
const DropdownContext = React.createContext<{ closeDropdown: () => void }>({ 
  closeDropdown: () => {} 
});

export const DropdownItem: React.FC<DropdownItemProps> = ({ 
  onClick, 
  icon, 
  children, 
  className = '',
  disabled = false
}) => {
  // Utiliser le contexte pour accéder à la fonction de fermeture
  const { closeDropdown } = React.useContext(DropdownContext);
  
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
      // Fermer le dropdown après le clic
      closeDropdown();
    }
  };

  return (
    <button
      className={`flex items-center w-full px-4 py-2.5 text-sm text-left border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
        disabled 
          ? 'text-gray-400 cursor-not-allowed' 
          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150'
      } ${className}`}
      onClick={handleClick}
      disabled={disabled}
      role="menuitem"
    >
      {icon && <span className="mr-2.5 flex-shrink-0">{icon}</span>}
      <span className="truncate">{children}</span>
    </button>
  );
};
