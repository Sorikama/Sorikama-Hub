import { curve } from "../assets";
import Button from "./Button";
import Section from "./Section";
import { BackgroundCircles, BottomLine, Gradient } from "./design/Hero";
import { heroIcons } from "../constants";
import { ScrollParallax } from "react-just-parallax";
import { useRef, useEffect } from "react";
import gsap from "gsap";

const Hero = () => {
  const parallaxRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const africaRef = useRef(null);
  const discoverRef = useRef(null);
  
  // Animation GSAP au chargement
  useEffect(() => {
    // Timeline pour séquencer les animations
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    
    // Animation du titre principal
    tl.fromTo(titleRef.current, 
      { y: 50, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 1 }
    );
    
    // Animation du mot "l'Afrique" avec un délai
    tl.fromTo(africaRef.current,
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.7 },
      "-=0.5" // Légèrement avant la fin de l'animation précédente
    );
    
    // Animation du sous-titre
    tl.fromTo(subtitleRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8 },
      "-=0.3"
    );
    
    // Animation du bouton Découvrir
    tl.fromTo(discoverRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6 },
      "-=0.2"
    );
  }, []);
  
  // Fonction pour le défilement fluide
  const handleSmoothScroll = (e) => {
    e.preventDefault();
    const targetId = e.currentTarget.getAttribute("href");
    const targetElement = document.querySelector(targetId);
    
    if (targetElement) {
      window.scrollTo({
        top: targetElement.offsetTop - 80, // Ajustement pour le header fixe
        behavior: "smooth"
      });
    }
  };

  return (
    <Section
      className="pt-[5.25rem] -mt-[5.25rem] bg-gradient-to-b from-n-8/10 to-n-12/10 dark:from-n-8 dark:to-n-12 min-h-screen flex flex-col justify-center"
      crosses
      crossesOffset="lg:translate-y-[5.25rem]"
      customPaddings
      id="hero"
    >
      <div className="container relative flex flex-col justify-center items-center h-full py-20 md:py-24 lg:py-28" ref={parallaxRef}>
        <div className="relative z-1 max-w-[80rem] w-full mx-auto text-center mb-[2rem] md:mb-10 lg:mb-[4rem] mt-10 flex-grow flex flex-col justify-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-8 md:mb-10 lg:mb-12 leading-tight" ref={titleRef}>
            Un écosystème numérique intégré pour {` `}
            <span className="inline-block relative" ref={africaRef}>
              l'Afrique{" "}
              <img
                src={curve}
                className="absolute top-full left-0 w-full xl:-mt-2"
                width={624}
                height={28}
                alt="Curve"
              />
            </span>
          </h1>
          <p className="text-4xl md:text-4xl xl:text-5xl lg:text-4xl max-w-4xl mx-auto mb-8 md:mb-10 lg:mb-12 dark:text-n-2 text-n-5 leading-relaxed px-4" ref={subtitleRef}>
            Des solutions utiles et inclusives.
            <br />
            Centrées sur l'humain.
          </p>
        
          
          <div className="flex justify-center mt-4 md:mt-6 lg:mt-8" ref={discoverRef}>
            <a 
              href="#ecosystem" 
              className="flex flex-col items-center cursor-pointer transition-transform hover:translate-y-1"
              aria-label="Découvrir plus"
              onClick={handleSmoothScroll}
            >
              <span className="text-base md:text-lg dark:text-n-1 text-n-8 mb-2">Découvrir</span>
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="animate-bounce"
              >
                <path 
                  d="M12 5V19M12 19L5 12M12 19L19 12" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </div>
        </div>
        <div className="relative w-full mx-auto md:max-w-5xl mb-12 md:mb-16 lg:mb-20 flex items-center justify-center">
          <div className="absolute bottom-0 left-0 right-0 flex justify-center">
            <div className="relative">
              <BackgroundCircles />
            </div>
          </div>
        </div>
      </div>

      <BottomLine />
    </Section>
  );
};

export default Hero;
