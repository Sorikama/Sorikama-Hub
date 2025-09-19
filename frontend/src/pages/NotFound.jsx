import React from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button";
import { FiArrowLeft } from "react-icons/fi";

const NotFound = () => {
  return (
    <div className="container mx-auto px-4 py-20 min-h-screen flex flex-col justify-center items-center">
      <div className="max-w-lg mx-auto w-full text-center">
        <div className="mb-8">
          <div className="relative inline-block">
            <div className="text-[10rem] font-bold bg-clip-text text-transparent bg-gradient-to-r from-color-1 to-color-2 leading-none">
              404
            </div>
            <div className="absolute -bottom-4 left-0 right-0 h-2 bg-gradient-to-r from-color-1 to-color-2 blur-xl opacity-50"></div>
          </div>
        </div>
        
        <h1 className="h2 mb-6 dark:text-n-1 text-n-8">Page non trouvée</h1>
        
        <p className="body-2 mb-8 dark:text-n-3 text-n-5 max-w-md mx-auto">
          La page que vous recherchez n'existe pas ou a été déplacée. 
          Veuillez vérifier l'URL ou retourner à la page d'accueil.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button className="flex items-center gap-2">
              <FiArrowLeft />
              Retour à l'accueil
            </Button>
          </Link>
        </div>
        
        <div className="mt-16 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-color-1/20 rounded-full blur-3xl"></div>
          <div className="relative z-10 dark:text-n-1 text-n-8 text-lg font-medium">
            <span className="text-color-1">Sorikama</span> - Un écosystème numérique intégré pour l'Afrique
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
