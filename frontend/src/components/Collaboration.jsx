import { logoImage, dashedLineBlack, dashedLineGray } from "../assets";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { collabApps, collabContent, collabText } from "../constants";
import Button from "./Button";
import Section from "./Section";
import { LeftCurve, RightCurve } from "./design/Collaboration";
import { FiCheck } from "react-icons/fi";
import FadeInAnimation from "./animations/FadeInAnimation";
import "../styles/Collaboration.css";

const Collaboration = () => {
  const { darkMode } = useContext(ThemeContext);
  return (
    <Section crosses>
      <div className="container lg:flex">
        <div className="max-w-[25rem]">
          <FadeInAnimation direction="left">
            <h2 className="h2 mb-4 md:mb-8">
              Un écosystème interconnecté
            </h2>
          </FadeInAnimation>

          <ul className="max-w-[22rem] mb-10 md:mb-14">
            {collabContent.map((item, index) => (
              <FadeInAnimation key={item.id} delay={index * 0.2} direction="left">
                <li className="mb-3 py-3">
                  <div className="flex items-center">
                    <FiCheck className="text-color-1 text-xl flex-shrink-0" />
                    <h6 className="body-2 ml-5">{item.title}</h6>
                  </div>
                  {item.text && (
                    <p className="body-2 mt-3 text-n-4">{item.text}</p>
                  )}
                </li>
              </FadeInAnimation>
            ))}
          </ul>

          <FadeInAnimation delay={0.4} direction="left">
            <Button>Découvrir</Button>
          </FadeInAnimation>
        </div>

        <div className="lg:ml-auto xl:w-[38rem] mt-4">
          <FadeInAnimation direction="right">
            <p className="body-2 mb-8 text-n-4 md:mb-16 lg:mb-32 lg:w-[22rem] lg:mx-auto">
              {collabText}
            </p>
          </FadeInAnimation>

          <FadeInAnimation direction="scale" threshold={0.1}>
            <div className="relative left-1/2 flex w-[22rem] aspect-square -translate-x-1/2 scale:75 md:scale-100">
              {/* Cercle central avec logo Sorikama */}
              <div className="w-[6rem] aspect-square m-auto p-[0.2rem] bg-conic-gradient rounded-full">
                <div className="flex flex-col items-center justify-center w-full h-full dark:bg-n-8 bg-white rounded-full">
                  <img src={logoImage} alt="Sorikama Logo" className="h-15 mb-1" />
                </div>
              </div>
              
              {/* Lignes en tirets qui partent du centre vers les extrémités avec animation */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                <div 
                  key={angle}
                  className="absolute top-1/2 left-1/2 w-[11rem] h-[2px] origin-left"
                  style={{ transform: `rotate(${angle}deg)` }}
                >
                  <div className="w-full h-full flex items-center">
                    <div className="w-[3rem]"></div> {/* Espace vide au centre */}
                    <div 
                      className="flex-1 h-[2px] dash-animation" 
                      style={{ 
                        backgroundImage: `url(${darkMode ? dashedLineGray : dashedLineBlack})`, 
                        backgroundSize: 'contain', 
                        backgroundRepeat: 'repeat-x'
                      }}
                    ></div>
                  </div>
                </div>
              ))}

              {/* Applications autour du cercle */}
              <ul>
                {collabApps.map((app, index) => (
                  <li
                    key={app.id}
                    className={`absolute top-0 left-1/2 h-1/2 -ml-[1.6rem] origin-bottom rotate-${index * 45}`}
                  >
                    <FadeInAnimation delay={0.5 + index * 0.1} direction="scale">
                      <div
                        className={`relative -top-[1.6rem] flex w-[3.2rem] h-[3.2rem] dark:bg-n-7 bg-n-2/40 border border-n-1/15 rounded-xl -rotate-${index * 45}`}
                        style={{ backgroundColor: app.color + '20' }}
                      >
                        <img
                          className="m-auto h-10"
                          alt={app.title}
                          src={app.icon}
                        />
                      </div>
                    </FadeInAnimation>
                  </li>
                ))}
              </ul>

              <LeftCurve />
              <RightCurve />
            </div>
          </FadeInAnimation>
        </div>
      </div>
    </Section>
  );
};

export default Collaboration;
