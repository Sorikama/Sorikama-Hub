import Section from "./Section";
import { sorikama } from "../constants";
import Heading from "./Heading";
import { GradientLight } from "./design/Benefits";
import { Gradient } from "./design/Gradients";
import { FiShoppingBag, FiBriefcase, FiBarChart2, FiCreditCard, FiMessageSquare, FiUsers, FiArrowRight } from "react-icons/fi";
import FadeInAnimation from "./animations/FadeInAnimation";

// Fonction pour obtenir l'icône en fonction du titre
const getAppIcon = (title) => {
  switch (title) {
    case "Masebuy":
      return <FiShoppingBag className="text-color-1 text-2xl" />;
    case "Jobowo":
      return <FiBriefcase className="text-color-1 text-2xl" />;
    case "SoriLead":
      return <FiBarChart2 className="text-color-1 text-2xl" />;
    case "SoriPay":
      return <FiCreditCard className="text-color-1 text-2xl" />;
    case "SoriChat":
      return <FiMessageSquare className="text-color-1 text-2xl" />;
    case "SoriSocial":
      return <FiUsers className="text-color-1 text-2xl" />;
    default:
      return <FiBarChart2 className="text-color-1 text-2xl" />;
  }
};

const Ecosystem = () => {
  return (
    <Section id="ecosystem">
      <div className="container ">
        <FadeInAnimation>
          <Heading
            title="Nos solutions numériques"
            text="Applications en développement et planifiées pour répondre aux besoins africains"
          />
        </FadeInAnimation>

        <div className="relative">
          <div className="relative z-1 grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {sorikama.apps.map((app, index) => (
              <FadeInAnimation key={index} delay={index * 0.1} threshold={0.1}>
                <div 
                  className={`p-0.5 rounded-[2rem] ${app.status === "development" ? "bg-conic-gradient" : "dark:bg-n-6 bg-n-3/30"}`}
                >
                  <div className="relative p-8 dark:bg-n-8 bg-white rounded-[1.9375rem] overflow-hidden h-full flex flex-col">
                    <div className="flex items-center gap-5 mb-5">
                      <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-color-1/20 to-color-2/20 rounded-xl">
                        {getAppIcon(app.title)}
                      </div>
                      <div>
                        <h5 className="h5 dark:text-n-1 text-n-8">{app.title}</h5>
                        <div className={`text-xs font-code mt-1 ${app.status === "development" ? "text-color-1" : "dark:text-n-3 text-n-5"}`}>
                          {app.status === "development" ? "EN DÉVELOPPEMENT" : "PLANIFIÉ"}
                        </div>
                      </div>
                    </div>
                    <p className="body-2 dark:text-n-3 text-n-5 mb-8">{app.text}</p>
                    <div className="flex justify-between items-center">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${app.status === "development" ? "dark:bg-n-7 dark:hover:bg-n-6 bg-n-3/30 hover:bg-n-3/50" : "dark:bg-n-7/50 bg-n-3/20"}`}>
                        <FiArrowRight className="dark:text-white text-n-8" />
                      </div>
                      <p className={`ml-auto font-code text-xs font-bold uppercase tracking-wider ${app.status === "development" ? "dark:text-n-1 text-n-8" : "dark:text-n-3 text-n-5"}`}>
                        {app.status === "development" ? "Découvrir" : "À venir"}
                      </p>
                    </div>
                  </div>
                </div>
              </FadeInAnimation>
            ))}
          </div>

          <Gradient />
        </div>
      </div>
    </Section>
  );
};

export default Ecosystem;
