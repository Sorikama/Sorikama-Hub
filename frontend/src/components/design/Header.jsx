import { background } from "../../assets";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";

export const Rings = () => {
  return (
    <div className="absolute top-1/2 left-1/2 w-[51.375rem] aspect-square border border-n-2/10 rounded-full -translate-x-1/2 -translate-y-1/2">
      <div className="absolute top-1/2 left-1/2 w-[36.125rem] aspect-square border border-n-2/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute top-1/2 left-1/2 w-[23.125rem] aspect-square border border-n-2/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
    </div>
  );
};

export const SideLines = () => {
  return (
    <>
      <div className="absolute top-0 left-5 w-0.25 h-full bg-n-6"></div>
      <div className="absolute top-0 right-5 w-0.25 h-full bg-n-6"></div>
    </>
  );
};

export const BackgroundCircles = () => {
  return (
    <>
      <div className="absolute top-[4.4rem] left-16 w-3 h-3 bg-gradient-to-b from-[#DD734F] to-[#1A1A32] rounded-full"></div>
      <div className="absolute top-[12.6rem] right-16 w-3 h-3 bg-gradient-to-b from-[#B9AEDF] to-[#1A1A32] rounded-full"></div>
      <div className="absolute top-[26.8rem] left-12 w-6 h-6 bg-gradient-to-b from-[#88E5BE] to-[#1A1A32] rounded-full"></div>
    </>
  );
};

export const HamburgerMenu = () => {
  const { darkMode } = useContext(ThemeContext);
  return (
    <div className={`fixed left-0 bottom-0 right-0 top-[5rem] ${darkMode ? 'bg-n-8/95' : 'bg-white/95'} lg:hidden`}>
      <div className={`absolute inset-0 ${darkMode ? 'bg-n-8' : 'bg-white'} pointer-events-none`}>
        <div className={`absolute inset-0 bg-[url('/src/assets/bg/stars.svg')] bg-no-repeat bg-cover bg-center ${darkMode ? 'opacity-50' : 'opacity-10'}`} />
      </div>
      {/* Le contenu du menu est géré par le composant parent */}

      <SideLines />

      <BackgroundCircles />
    </div>
  );
};
