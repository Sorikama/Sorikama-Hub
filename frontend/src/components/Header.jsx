import { useLocation, Link, useNavigate } from "react-router-dom";
import { disablePageScroll, enablePageScroll } from "scroll-lock";

import { logoImage } from "../assets";
import { navigation } from "../constants";
import Button from "./Button";
import MenuSvg from "../assets/svg/MenuSvg";
import { HamburgerMenu } from "./design/Header";
import { useState, useContext } from "react";
import ThemeToggle from "./ThemeToggle";
import { ThemeContext } from "../context/ThemeContext";
import "../styles/Header.css";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [openNavigation, setOpenNavigation] = useState(false);
  const { darkMode } = useContext(ThemeContext);

  const toggleNavigation = () => {
    if (openNavigation) {
      setOpenNavigation(false);
      enablePageScroll();
    } else {
      setOpenNavigation(true);
      disablePageScroll();
    }
  };

  const handleClick = () => {
    if (!openNavigation) return;

    enablePageScroll();
    setOpenNavigation(false);
  };

  return (
    <div
      className={`fixed top-0 left-0 w-full z-50 border-b dark:border-n-6 border-n-3/10 lg:dark:bg-n-8/90 lg:bg-white/90 lg:backdrop-blur-sm ${
        openNavigation
          ? darkMode ? "bg-n-8" : "bg-white"
          : "dark:bg-n-8/90 bg-white/90 backdrop-blur-sm"
      }`}
    >
      <div className="flex items-center justify-between  px-5 lg:px-7.5 xl:px-10 max-lg:py-4">
        <Link className="block w-[12rem] xl:mr-8" to="/">
          <div className="flex items-center">
            <img src={logoImage} alt="Sorikama Logo" className="h-10 mr-3" />
            <span className="dark:text-n-1 text-n-8 font-bold text-2xl">
              sorikama
            </span>
          </div>
        </Link>

        <nav
          className={`${
            openNavigation ? "flex" : "hidden"
          } fixed top-[5rem] left-0 right-0 bottom-0 ${darkMode ? 'bg-n-8' : 'bg-white'} lg:static lg:flex lg:mx-auto lg:bg-transparent`}
        >
          <div className="relative z-2 flex flex-col items-center justify-center m-auto lg:flex-row">
            {navigation.map((item, index) => {
              if (item.url.startsWith("#")) {
                return (
                  <a
                    key={item.id}
                    href={item.url}
                    onClick={handleClick}
                    style={{ "--index": index }}
                    className={`nav-link block relative font-sans text-2xl uppercase ${darkMode ? 'text-n-1' : 'text-n-8'} transition-colors hover:text-color-1 ${
                      item.onlyMobile ? "lg:hidden" : ""
                    } px-6 py-6 md:py-8 lg:-mr-0.25 lg:text-xs lg:font-semibold ${
                      location.hash === item.url
                        ? "active z-2 lg:dark:text-n-1 lg:text-n-8"
                        : "lg:dark:text-n-1/50 lg:text-n-8/70"
                    } lg:leading-5 lg:hover:dark:text-n-1 lg:hover:text-n-8 xl:px-12`}
                  >
                    {item.title}
                  </a>
                );
              } else {
                return (
                  <Link
                    key={item.id}
                    to={item.url}
                    onClick={handleClick}
                    style={{ "--index": index }}
                    className={`nav-link block relative font-sans text-2xl uppercase ${darkMode ? 'text-n-1' : 'text-n-8'} transition-colors hover:text-color-1 ${
                      item.onlyMobile ? "lg:hidden" : ""
                    } px-6 py-6 md:py-8 lg:-mr-0.25 lg:text-xs lg:font-semibold ${
                      location.pathname === item.url
                        ? "active z-2 lg:dark:text-n-1 lg:text-n-8"
                        : "lg:dark:text-n-1/50 lg:text-n-8/70"
                    } lg:leading-5 lg:hover:dark:text-n-1 lg:hover:text-n-8 xl:px-12`}
                  >
                    {item.title}
                  </Link>
                );
              }
            })}
          </div>

          <HamburgerMenu />
        </nav>

        <div className="flex items-center ml-auto">
          <ThemeToggle />
          <Link
            to="/login"
            className={`nav-link hidden mx-4 ${darkMode ? 'text-n-1/50 hover:text-n-1' : 'text-n-8/70 hover:text-n-8'} transition-colors lg:block font-sans text-xs font-semibold uppercase`}
          >
            Se connecter
          </Link>
          <Link to="/signup" className="hidden lg:flex">
            <Button>S'inscrire</Button>
          </Link>
          <button
            className="ml-4 lg:hidden outline-none"
            onClick={toggleNavigation}
          >
            <MenuSvg openNavigation={openNavigation} darkMode={darkMode} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
