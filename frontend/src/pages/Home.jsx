import HeroSection from "../sections/HeroSection";
import MessageSection from "../sections/MessageSection";
import FlavorSection from "../sections/FlavorSection";
import NutritionSection from "../sections/NutritionSection";
import BenefitSection from "../sections/BenefitSection";
import TestimonialSection from "../sections/TestimonialSection";
import FooterSection from "../sections/FooterSection";
import gsap from "gsap";
import { ScrollSmoother, ScrollTrigger } from "gsap/all";
import { useGSAP } from "@gsap/react";

// Register GSAP plugins only for the Home page where we use them
gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

const Home = () => {
  useGSAP(() => {
    // Create smoother only on Home page
    ScrollSmoother.create({
      smooth: 3,
      effects: true,
    });
    return () => {
      // Cleanup smoother on unmount to avoid duplicates between route changes
      const smoother = ScrollSmoother.get();
      if (smoother) smoother.kill();
    };
  });

  return (
    <div id="smooth-wrapper">
      <div id="smooth-content">
        <HeroSection />
        <MessageSection />
        <FlavorSection />
        <NutritionSection />
        <div>
          <BenefitSection />
          <TestimonialSection />
        </div>
        <FooterSection />
      </div>
    </div>
  );
};

export default Home;
