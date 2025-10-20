import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Sorikama Hub
        </h1>
        
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Votre passerelle vers l'écosystème Sorikama. 
          Connectez-vous une fois, accédez à tous nos services.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {user ? (
            <>
              <Link
                to="/services"
                className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Mes Services
              </Link>
              <Link
                to="/profile"
                className="px-8 py-3 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Mon Profil
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Se connecter
              </Link>
              <Link
                to="/signup"
                className="px-8 py-3 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                S'inscrire
              </Link>
            </>
          )}
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-card border border-border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">🛍️ SoriStore</h3>
            <p className="text-muted-foreground">Marketplace e-commerce</p>
          </div>
          <div className="p-6 bg-card border border-border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">💳 SoriPay</h3>
            <p className="text-muted-foreground">Système de paiement</p>
          </div>
          <div className="p-6 bg-card border border-border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">💰 SoriWallet</h3>
            <p className="text-muted-foreground">Portefeuille numérique</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;