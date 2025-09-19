import { benefitCard1, benefitCard2, benefitCard3, benefitCard4, benefitCard5, benefitCard6 } from "../assets";
import Heading from "./Heading";
import Section from "./Section";
import { GradientLight } from "./design/Benefits";
import ClipPath from "../assets/svg/ClipPath";
import { FiActivity, FiAward, FiBox, FiCpu, FiDatabase, FiGlobe, FiUser, FiLayers, FiZap, FiLink, FiTrendingUp, FiHome } from "react-icons/fi";
import FadeInAnimation from "./animations/FadeInAnimation";

// Fonction pour obtenir l'icône en fonction du titre
const getIconByTitle = (title) => {
  switch (title) {
    case "Compte Unique":
      return <FiUser className="text-color-1 text-4xl" />;
    case "Applications Spécialisées":
      return <FiLayers className="text-color-1 text-4xl" />;
    case "Simplicité":
      return <FiZap className="text-color-1 text-4xl" />;
    case "Interconnectivité":
      return <FiLink className="text-color-1 text-4xl" />;
    case "Évolutivité":
      return <FiTrendingUp className="text-color-1 text-4xl" />;
    case "Proximité":
      return <FiHome className="text-color-1 text-4xl" />;
    default:
      return <FiAward className="text-color-1 text-4xl" />;
  }
};

const Benefits = () => {
  return (
    <Section id="features" className="bg-gradient-to-b from-n-8/10 to-n-12/10 dark:from-n-8 dark:to-n-12">
      <div className="container relative z-2">
        <FadeInAnimation>
          <Heading
            className="md:max-w-md lg:max-w-2xl"
            title="Les avantages de nos solutions"
          />
        </FadeInAnimation>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10 justify-items-center">
          {[
            {
              id: "1",
              title: "Compte Unique",
              text: "Avec un seul compte Sorikama, l'utilisateur peut accéder à toutes ses applications et services.",
              backgroundUrl: benefitCard1,
              light: true
            },
            {
              id: "2",
              title: "Applications Spécialisées",
              text: "Chaque application répond à un besoin concret : commerce, finance, éducation, santé ou accessibilité.",
              backgroundUrl: benefitCard2,
              light: false
            },
            {
              id: "3",
              title: "Simplicité",
              text: "Les services sont conçus pour être simples, rapides et utilisables par tout le monde.",
              backgroundUrl: benefitCard3,
              light: true
            },
            {
              id: "4",
              title: "Interconnectivité",
              text: "Tout est connecté : paiements, gestion des données et navigation entre les applications.",
              backgroundUrl: benefitCard4,
              light: false
            },
            {
              id: "5",
              title: "Évolutivité",
              text: "L'écosystème évolue constamment pour offrir de nouvelles opportunités aux utilisateurs et aux entreprises.",
              backgroundUrl: benefitCard5,
              light: true
            },
            {
              id: "6",
              title: "Proximité",
              text: "Sorikama rapproche la technologie de la vie réelle pour simplifier le quotidien de chacun.",
              backgroundUrl: benefitCard6,
              light: false
            }
          ].map((item, index) => (
            <FadeInAnimation key={item.id} delay={index * 0.1} direction={index % 2 === 0 ? 'left' : 'right'} threshold={0.1}>
              <div
                className="block relative p-0.5 bg-no-repeat bg-[length:100%_100%] w-full max-w-[24rem]"
                style={{
                  backgroundImage: `url(${item.backgroundUrl})`,
                }}
              >
                <div className="relative z-2 flex flex-col min-h-[22rem] p-[2.4rem] pointer-events-none">
                  <h5 className="h5 mb-5 dark:text-n-1 text-n-8">{item.title}</h5>
                  <p className="body-2 mb-6 dark:text-n-3 text-n-5">{item.text}</p>
                  <div className="flex items-center justify-center mt-auto">
                    <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-color-1/20 to-color-2/20 rounded-full p-3">
                      {getIconByTitle(item.title)}
                    </div>
                  </div>
                </div>

                {item.light && <GradientLight />}

                <div
                  className="absolute inset-0.5 dark:bg-n-8 bg-white border border-n-3/30 dark:border-none"
                  style={{ clipPath: "url(#benefits)" }}
                >
                  <div className="absolute inset-0 opacity-0 transition-opacity hover:opacity-10">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        width={380}
                        height={362}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </div>
              </div>
            </FadeInAnimation>
          ))}
        </div>

        <ClipPath />
      </div>
    </Section>
  );
};

export default Benefits;
