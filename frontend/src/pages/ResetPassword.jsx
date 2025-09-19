import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { FiEye, FiEyeOff, FiLock } from "react-icons/fi";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation de base
    if (!password || !confirmPassword) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (password.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    // Simulation de réinitialisation avec chargement
    setLoading(true);
    
    // Simuler un délai de chargement
    setTimeout(() => {
      // Simulation de réinitialisation réussie
      toast.success("Mot de passe réinitialisé avec succès");
      console.log("Password reset completed");
      setLoading(false);
      setResetComplete(true);
      
      // Rediriger vers la page de connexion après 3 secondes
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    }, 2000);
  };

  return (
    <div className="container mx-auto px-4 py-20 min-h-screen flex flex-col justify-center">
      <div className="max-w-md mx-auto w-full">
        <h1 className="h2 text-center mb-8 dark:text-n-1 text-n-8">Réinitialiser le mot de passe</h1>
        <div className="p-0.5 rounded-[2rem] bg-conic-gradient">
          <div className="relative p-8 dark:bg-n-8 bg-white rounded-[1.9375rem] overflow-hidden">
            {!resetComplete ? (
              <>
                <p className="text-center dark:text-n-3 text-n-5 mb-8">
                  Créez un nouveau mot de passe pour votre compte.
                </p>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium dark:text-n-1 text-n-8">
                      Nouveau mot de passe
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiLock className="text-n-4" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-10 pr-10 py-3 border dark:border-n-6 border-n-3 rounded-xl dark:bg-n-7 bg-n-2/40 dark:text-n-1 text-n-8 focus:outline-none focus:ring-2 focus:ring-color-1"
                        placeholder="••••••••"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-n-4 hover:text-n-3 focus:outline-none"
                        >
                          {showPassword ? <FiEyeOff /> : <FiEye />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium dark:text-n-1 text-n-8">
                      Confirmer le mot de passe
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiLock className="text-n-4" />
                      </div>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="block w-full pl-10 pr-10 py-3 border dark:border-n-6 border-n-3 rounded-xl dark:bg-n-7 bg-n-2/40 dark:text-n-1 text-n-8 focus:outline-none focus:ring-2 focus:ring-color-1"
                        placeholder="••••••••"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="text-n-4 hover:text-n-3 focus:outline-none"
                        >
                          {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button 
                      className="w-full justify-center" 
                      loading={loading} 
                      disabled={loading || !password || !confirmPassword}
                    >
                      Réinitialiser le mot de passe
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 flex items-center justify-center bg-green-100 dark:bg-green-900/30 rounded-full">
                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-4 dark:text-n-1 text-n-8">Mot de passe réinitialisé</h3>
                <p className="dark:text-n-3 text-n-5 mb-8">
                  Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la page de connexion.
                </p>
                <div className="flex justify-center">
                  <div className="w-8 h-8 border-t-2 border-b-2 border-color-1 rounded-full animate-spin"></div>
                </div>
              </div>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm dark:text-n-3 text-n-5">
                Retourner à la{" "}
                <Link to="/login" className="font-medium text-color-1 hover:text-color-2">
                  page de connexion
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
