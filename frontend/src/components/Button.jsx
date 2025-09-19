import ButtonSvg from "../assets/svg/ButtonSvg";
import "../styles/Button.css";
import { FiLoader } from "react-icons/fi";

const Button = ({ className, href, onClick, children, px, white, loading = false, disabled = false }) => {
  const classes = `button relative inline-flex items-center justify-center h-11 transition-colors ${!disabled ? 'hover:text-color-1' : ''} ${
    px || "px-7"
  } ${white ? "text-n-8" : "dark:text-white text-n-8"} ${className || ""} ${
    disabled ? "opacity-60 cursor-not-allowed" : ""
  } ${loading ? "pointer-events-none" : ""}`;
  const spanClasses = "relative z-10 flex items-center";

  const renderButton = () => (
    <button className={classes} onClick={onClick} disabled={disabled || loading}>
      <span className={spanClasses}>
        {loading && <FiLoader className="animate-spin mr-2" />}
        {children}
      </span>
      {ButtonSvg(white)}
    </button>
  );

  const renderLink = () => (
    <a 
      href={!disabled && !loading ? href : "#"} 
      className={classes}
      onClick={(e) => {
        if (disabled || loading) {
          e.preventDefault();
          return;
        }
      }}
    >
      <span className={spanClasses}>
        {loading && <FiLoader className="animate-spin mr-2" />}
        {children}
      </span>
      {ButtonSvg(white)}
    </a>
  );

  return href ? renderLink() : renderButton();
};

export default Button;
