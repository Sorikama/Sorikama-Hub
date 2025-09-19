import Section from "./Section";
import { smallSphere, stars } from "../assets";
import Heading from "./Heading";
import Button from "./Button";
import { contribute } from "../constants";
import { LeftLine, RightLine } from "./design/Pricing";
import { FiCode, FiDollarSign } from "react-icons/fi";
import FadeInAnimation from "./animations/FadeInAnimation";

const Contribute = () => {
  return (
    <Section className="overflow-hidden bg-gradient-to-b from-n-8/10 to-n-12/10 dark:from-n-8 dark:to-n-12" id="contribute">
      <div className="container relative z-2">
        <FadeInAnimation direction="scale" duration={1.2}>
          <div className="hidden relative justify-center mb-[6.5rem] lg:flex">
            <img
              src={smallSphere}
              className="relative z-1"
              width={255}
              height={255}
              alt="Sphere"
            />
            <div className="absolute top-1/2 left-1/2 w-[60rem] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <img
                src={stars}
                className="w-full"
                width={950}
                height={400}
                alt="Stars"
              />
            </div>
          </div>
        </FadeInAnimation>

        <FadeInAnimation>
          <Heading
            tag="Rejoignez l'aventure Sorikama"
            title="Comment contribuer au projet"
          />
        </FadeInAnimation>

        <div className="relative grid gap-6 md:grid-cols-2 lg:gap-8">
          {contribute.map((item, index) => (
            <FadeInAnimation key={item.id} delay={index * 0.2} direction={index % 2 === 0 ? 'left' : 'right'} threshold={0.1}>
              <div
                className="p-0.5 rounded-[2rem] bg-conic-gradient"
              >
                <div className="relative p-8 dark:bg-n-8 bg-white rounded-[1.9375rem] overflow-hidden h-full flex flex-col">
                  <div className="flex items-center gap-5 mb-5">
                    <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-color-1/20 to-color-2/20 rounded-xl">
                      {item.id === "0" ? 
                        <FiCode className="text-color-1 text-3xl" /> : 
                        <FiDollarSign className="text-color-1 text-3xl" />
                      }
                    </div>
                    <h5 className="h5 dark:text-n-1 text-n-8">{item.title}</h5>
                  </div>
                  <p className="body-2 dark:text-n-3 text-n-5 mb-8">{item.text}</p>
                  <div className="mt-auto">
                    <Button href={item.buttonUrl} white>
                      {item.buttonText}
                    </Button>
                  </div>
                </div>
              </div>
            </FadeInAnimation>
          ))}
        </div>

        <FadeInAnimation direction="up" delay={0.4}>
          <div className="flex justify-center mt-10">
            <a
              className="text-xs font-code font-bold tracking-wider uppercase border-b dark:text-n-1 text-n-8"
              href="mailto:contact@sorikama.com"
            >
              Nous contacter directement
            </a>
          </div>
        </FadeInAnimation>

        <LeftLine />
        <RightLine />
      </div>
    </Section>
  );
};

export default Contribute;
