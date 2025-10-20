import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSecureAuth } from '../hooks/useSecureAuth';

const Navbar = () => {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { user, isSecure, hasApiKey } = useSecureAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return '☀️';
      case 'dark': return '🌙';
      case 'system': return '💻';
      default: return '☀️';
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold text-primary">
            Sorikama Hub
          </Link>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              title={`Mode: ${theme}`}
            >
              {getThemeIcon()}
            </button>

            {user ? (
              <>
                <div className="flex items-center space-x-2">
                  {isSecure && hasApiKey && (
                    <div className="w-2 h-2 bg-green-500 rounded-full" title="Connexion sécurisée"></div>
                  )}
                  <Link
                    to="/services"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Services
                  </Link>
                </div>
                <Link
                  to="/profile"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Profil
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Inscription
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;