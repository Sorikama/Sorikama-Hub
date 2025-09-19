import React from "react";
import Section from "../components/Section";
import Heading from "../components/Heading";
import { gradient, aboutImage } from "../assets";
import { FiTarget, FiTrendingUp, FiUsers, FiGlobe, FiAward, FiHeart } from "react-icons/fi";
import FadeInAnimation from "../components/animations/FadeInAnimation";

const About = () => {
  // Données pour la section Vision
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

  // Données pour la section Valeurs
  const valuesItems = [
    {
      icon: <FiAward className="text-color-1 text-4xl" />,
      title: "Excellence",
      text: "Nous nous engageons à fournir des produits et services de la plus haute qualité, en repoussant constamment les limites de l'innovation."
    },
    {
      icon: <FiHeart className="text-color-1 text-4xl" />,
      title: "Inclusion",
      text: "Nous créons des solutions accessibles à tous, indépendamment du niveau d'éducation, de la localisation ou du statut socio-économique."
    },
    {
      icon: <FiUsers className="text-color-1 text-4xl" />,
      title: "Collaboration",
      text: "Nous croyons en la puissance du travail d'équipe et des partenariats stratégiques pour maximiser notre impact positif."
    },
    {
      icon: <FiTarget className="text-color-1 text-4xl" />,
      title: "Responsabilité",
      text: "Nous assumons la responsabilité de nos actions et nous nous efforçons de créer un impact durable et positif sur les communautés que nous servons."
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <Section className="pt-10 md:pt-20">
        <div className="container">
          <FadeInAnimation>
            <div className="max-w-[50rem] mx-auto text-center mb-12 md:mb-20">
              <h1 className="h1 mb-6 dark:text-n-1 text-n-8">À propos de Sorikama</h1>
              <p className="body-1 dark:text-n-3 text-n-5 mb-6">
                Sorikama est un écosystème numérique innovant conçu pour transformer la façon dont les Africains interagissent avec la technologie. Notre mission est de créer des solutions numériques accessibles, intuitives et adaptées aux besoins spécifiques du continent africain.
              </p>
            </div>
          </FadeInAnimation>
        </div>
      </Section>

      {/* Notre Histoire */}
      <Section className="py-10">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <FadeInAnimation direction="left">
              <div>
                <h2 className="h2 mb-6 dark:text-n-1 text-n-8">Notre Histoire</h2>
                <p className="body-2 dark:text-n-3 text-n-5 mb-6">
                  Fondée en 2025, Sorikama est née d'une vision simple mais puissante : créer un pont entre la technologie moderne et les besoins quotidiens des populations africaines. Nos fondateurs, ayant travaillé dans divers secteurs technologiques à travers le continent, ont identifié un besoin crucial de solutions numériques véritablement adaptées au contexte africain.
                </p>
                <p className="body-2 dark:text-n-3 text-n-5">
                  Le nom "Sorikama" reflète notre engagement envers l'innovation et le progrès, tout en restant profondément enraciné dans les valeurs et les cultures africaines. Depuis notre création, nous avons travaillé sans relâche pour développer un écosystème d'applications et de services qui répondent aux défis uniques auxquels sont confrontés les entrepreneurs et les consommateurs africains.
                </p>
              </div>
            </FadeInAnimation>
            <FadeInAnimation direction="right" delay={0.2}>
              <div className="rounded-2xl overflow-hidden">
                <img 
                  src={aboutImage} 
                  alt="L'équipe Sorikama" 
                  className="w-full h-auto object-cover"
                />
              </div>
            </FadeInAnimation>
          </div>
        </div>
      </Section>

      {/* Notre Vision */}
      <Section className="py-10 overflow-hidden">
        <div className="container">
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
        </div>
      </Section>

      {/* Nos Valeurs */}
      <Section className="py-10 bg-gradient-to-b from-n-8/10 to-n-12/10 dark:from-n-8 dark:to-n-12">
        <div className="container">
          <FadeInAnimation>
            <Heading tag="Nos valeurs" title="Les valeurs qui nous guident" />
          </FadeInAnimation>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 md:gap-4 mt-10">
            {valuesItems.map((item, index) => (
              <FadeInAnimation key={index} delay={index * 0.15} direction="up" threshold={0.1}>
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
      </Section>

      {/* Notre Équipe */}
      <Section className="py-10">
        <div className="container">
          <FadeInAnimation>
            <Heading tag="Notre équipe" title="Les visionnaires derrière Sorikama" />
          </FadeInAnimation>
          
          <div className="mt-10 text-center">
            <FadeInAnimation direction="up">
              <p className="body-1 dark:text-n-3 text-n-5 max-w-3xl mx-auto">
                Notre équipe est composée de professionnels passionnés et talentueux, déterminés à révolutionner le paysage numérique africain. Avec une expertise diversifiée en développement logiciel, design UX/UI, marketing digital et gestion de projet, nous travaillons ensemble pour concrétiser notre vision commune.
              </p>
            </FadeInAnimation>
          </div>
        </div>
      </Section>
    </>
  );
};

export default About;
