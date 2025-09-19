import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Enregistrer le plugin ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

const FadeInAnimation = ({ 
  children, 
  direction = 'up', 
  delay = 0, 
  duration = 0.8,
  threshold = 0.2,
  className = ''
}) => {
  const elementRef = useRef(null);
  
  useEffect(() => {
    const element = elementRef.current;
    
    // Définir les valeurs initiales et finales en fonction de la direction
    let fromVars = { opacity: 0 };
    
    // Ajouter la translation en fonction de la direction
    switch (direction) {
      case 'up':
        fromVars.y = 50;
        break;
      case 'down':
        fromVars.y = -50;
        break;
      case 'left':
        fromVars.x = 50;
        break;
      case 'right':
        fromVars.x = -50;
        break;
      case 'scale':
        fromVars.scale = 0.9;
        break;
      default:
        fromVars.y = 50;
    }
    
    // Créer l'animation
    gsap.fromTo(
      element,
      fromVars,
      {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        duration: duration,
        delay: delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: element,
          start: `top bottom-=${threshold * 100}%`,
          toggleActions: 'play none none none'
        }
      }
    );
    
    // Nettoyer l'animation lors du démontage du composant
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [direction, delay, duration, threshold]);
  
  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
};

export default FadeInAnimation;
