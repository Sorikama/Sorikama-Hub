import React from 'react';
import { useAuth } from '../context/AuthContext';
import Heading from '../components/Heading';
import Section from '../components/Section';
import Button from '../components/Button'; // On importe le composant Bouton
import { Link } from 'react-router-dom'; // On importe Link pour la navigation

const Dashboard = () => {
  // On récupère l'utilisateur et la fonction de déconnexion depuis le contexte
  const { user, logout } = useAuth();

  return (
    <Section className="pt-[12rem] -mt-[5.25rem]">
      <div className="container relative z-2">
        <Heading
          className="md:max-w-md lg:max-w-2xl mx-auto text-center"
          title="Tableau de Bord"
        />
        <div className="bg-n-8 border border-n-6 rounded-[2rem] p-8 mt-10 max-w-4xl mx-auto">

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            {/* Section de bienvenue */}
            <div className="flex-1">
              <h2 className="h2 mb-4">
                {/* On utilise user.fullName qui correspond à la structure de votre backend */}
                Bienvenue, {user ? user.fullName : 'Utilisateur'} !
              </h2>
              <p className="body-1 text-n-4">
                C'est ici que vous gérerez vos services et informations.
            </p>
              <p className="body-2 mt-6 text-n-5">
                Connecté en tant que : {user?.email}
              </p>
            </div>

            {/* Section des actions avec les boutons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4 md:mt-0">
              <Link to="/profile" className="hidden lg:flex">
                <Button>Profil</Button>
              </Link>
              <Button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 border-red-500" // Style distinctif pour la déconnexion
              >
                Se déconnecter
              </Button>
            </div>
          </div>

        </div>
      </div>
    </Section>
  );
};

export default Dashboard;
