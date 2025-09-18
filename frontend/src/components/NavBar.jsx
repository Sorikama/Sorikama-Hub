import { Link, NavLink } from "react-router-dom";

const NavBar = () => {
  return (
    <nav className="fixed top-0 left-0 z-50 w-full bg-milk/80 backdrop-blur-md border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto md:px-9 px-5">
        <div className="h-16 md:h-20 grid grid-cols-3 items-center">
          {/* Left: Logo */}
          <div className="flex items-center">
            <Link to="/" className="inline-flex items-center gap-2">
              <img src="/logo.png" alt="Sorikama Logo" className="h-10 w-auto" />
            </Link>
          </div>

          {/* Center: Menu */}
          <div className="flex justify-center">
            <ul className="flex items-center gap-6 md:gap-10 uppercase font-bold tracking-tight text-dark-brown">
              <li>
                <NavLink
                  to="/solutions"
                  className={({ isActive }) =>
                    `hover:opacity-80 transition-opacity ${isActive ? 'underline decoration-2 underline-offset-4 text-[var(--color-primary)]' : ''}`
                  }
                >
                  Solutions
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/partners"
                  className={({ isActive }) =>
                    `hover:opacity-80 transition-opacity ${isActive ? 'underline decoration-2 underline-offset-4 text-[var(--color-primary)]' : ''}`
                  }
                >
                  Partenaires
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/account"
                  className={({ isActive }) =>
                    `hover:opacity-80 transition-opacity ${isActive ? 'underline decoration-2 underline-offset-4 text-[var(--color-primary)]' : ''}`
                  }
                >
                  Compte
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/about"
                  className={({ isActive }) =>
                    `hover:opacity-80 transition-opacity ${isActive ? 'underline decoration-2 underline-offset-4 text-[var(--color-primary)]' : ''}`
                  }
                >
                  À propos de nous
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Right: Actions */}
          <div className="flex justify-end items-center gap-3 md:gap-4">
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `uppercase font-bold hover:opacity-80 transition-opacity ${isActive ? 'text-[var(--color-primary)]' : 'text-dark-brown'}`
              }
            >
              Connexion
            </NavLink>
            <Link
              to="/signup"
              className="uppercase font-bold text-white bg-[var(--color-primary)] rounded-full md:py-3 py-2 md:px-6 px-4 hover:opacity-90 transition-colors"
            >
              Inscription
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
