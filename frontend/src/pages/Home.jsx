import Hero from "../components/Hero";
import Benefits from "../components/Benefits";
import Collaboration from "../components/Collaboration";
import Pricing from "../components/Pricing";
import Roadmap from "../components/Roadmap";

const Home = () => {
  return (
    <>
      <div className="pt-[4.75rem] lg:pt-[5.25rem] overflow-hidden">
        <Hero />
        <Benefits />
        <Collaboration />
        {/* Si vous avez un composant Services, vous pouvez le réactiver ici */}
        {/* <Services /> */}
        <Pricing />
        <Roadmap />
      </div>
    </>
  );
};

export default Home;
