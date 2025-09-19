import React from "react";
import Button from "./Button";
import Heading from "./Heading";
import Section from "./Section";
import { FiTarget, FiTrendingUp, FiUsers, FiGlobe } from "react-icons/fi";
import { gradient } from "../assets";
import FadeInAnimation from "./animations/FadeInAnimation";

const Roadmap = () => {
  const visionItems = [
    {
      icon: <FiTarget className="text-color-1 text-4xl" />,
      title: "Notre Mission",
      text: "Créer un écosystème numérique intégré qui répond aux besoins spécifiques des entrepreneurs et consommateurs africains, en facilitant l'accès aux services numériques essentiels."
    },
    {
      icon: <FiTrendingUp className="text-color-1 text-4xl" />,
      title: "Objectifs 2025-2026",
      text: "Lancer nos trois applications principales - Masebuy, Jobowo et SoriLead - et établir une base solide d'utilisateurs dans 5 pays africains clés."
    },
    {
      icon: <FiUsers className="text-color-1 text-4xl" />,
      title: "Impact Social",
      text: "Permettre à 100 000 entrepreneurs africains de digitaliser leur activité et créer 10 000 emplois directs et indirects dans le secteur numérique."
    },
    {
      icon: <FiGlobe className="text-color-1 text-4xl" />,
      title: "Vision à Long Terme",
      text: "Devenir la plateforme de référence pour la transformation numérique en Afrique, en connectant les talents, les entreprises et les opportunités à travers le continent."
    }
  ];

  return (
    <Section className="overflow-hidden" id="roadmap">
      <div className="container md:pb-10">
        <FadeInAnimation>
          <Heading tag="Notre vision" title="Notre vision pour l'Afrique" />
        </FadeInAnimation>
        
        <div className="relative">
          <div className="absolute top-0 -left-[10rem] w-[56.625rem] h-[56.625rem] opacity-30 mix-blend-color-dodge pointer-events-none">
            <img
              className="absolute top-1/2 left-1/2 w-[79.5625rem] max-w-[79.5625rem] h-[88.5625rem] -translate-x-1/2 -translate-y-1/2"
              src={gradient}
              width={1417}
              height={1417}
              alt="Gradient"
            />
          </div>
          
          <div className="relative z-1 grid gap-6 md:grid-cols-2 lg:grid-cols-4 md:gap-4 mt-10 mb-10">
            {visionItems.map((item, index) => (
              <FadeInAnimation key={index} delay={index * 0.15} direction={index % 2 === 0 ? 'up' : 'down'} threshold={0.1}>
                <div 
                  className="p-0.5 rounded-[2rem] bg-conic-gradient"
                >
                  <div className="relative p-8 dark:bg-n-8 bg-white rounded-[1.9375rem] overflow-hidden h-full flex flex-col">
                    <div className="flex items-center justify-center mb-6">
                      <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-color-1/20 to-color-2/20 rounded-full">
                        {item.icon}
                      </div>
                    </div>
                    <h4 className="h5 mb-4 dark:text-n-1 text-n-8 text-center">{item.title}</h4>
                    <p className="body-2 dark:text-n-3 text-n-5 text-center">{item.text}</p>
                  </div>
                </div>
              </FadeInAnimation>
            ))}
          </div>
        </div>

        <FadeInAnimation delay={0.6}>
          <div className="flex justify-center mt-12 md:mt-15 xl:mt-20">
            <Button href="/about">En savoir plus</Button>
          </div>
        </FadeInAnimation>
      </div>
    </Section>
  );
};

export default Roadmap;
