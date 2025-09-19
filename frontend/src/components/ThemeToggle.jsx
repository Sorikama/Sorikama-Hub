import { useContext, useState, useEffect } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { FiSun, FiMoon } from "react-icons/fi";
import "../styles/ThemeToggle.css";

const ThemeToggle = () => {
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const [animate, setAnimate] = useState(false);

  // Déclencher l'animation à chaque changement de thème
  const handleToggle = () => {
    setAnimate(true);
    toggleTheme();
  };

  // Réinitialiser l'animation après qu'elle soit terminée
  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => {
        setAnimate(false);
      }, 500); // Durée de l'animation
      return () => clearTimeout(timer);
    }
  }, [animate]);

  return (
    <button
      onClick={handleToggle}
      className="theme-toggle-btn"
      aria-label={darkMode ? "Passer au mode clair" : "Passer au mode sombre"}
    >
      <div className={`theme-toggle-icon ${animate ? 'animate-theme' : ''}`}>
        {darkMode ? (
          <FiSun className="text-white text-xl" />
        ) : (
          <FiMoon className="text-n-8 text-xl" />
        )}
      </div>
    </button>
  );
};

export default ThemeToggle;
