import NavBar from "./components/NavBar";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Solutions from "./pages/Solutions";
import Partners from "./pages/Partners";
import Account from "./pages/Account";
import About from "./pages/About";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import FooterSection from "./sections/FooterSection";

const App = () => {
  const location = useLocation();
  return (
    <main>
      <NavBar />
      <div className="pt-16 md:pt-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/solutions" element={<Solutions />} />
          <Route path="/partners" element={<Partners />} />
          <Route path="/account" element={<Account />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
        {location.pathname !== "/" && <FooterSection />}
      </div>
    </main>
  );
};

export default App;
