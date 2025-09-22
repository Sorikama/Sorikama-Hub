import React, { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button";
import { FiMail } from "react-icons/fi";
import { toast } from "react-toastify";

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Veuillez entrer votre adresse e-mail");
      return;
    }

    // Simulation d'envoi d'email avec chargement
    setLoading(true);

    try {
      await forgotPassword(email);
      setIsSubmitted(true);
    } catch (error) {
      // Le toast est géré par le contexte
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-20 min-h-screen flex flex-col justify-center">
      <div className="max-w-md mx-auto w-full">
        <h1 className="h2 text-center mb-8 dark:text-n-1 text-n-8">Mot de passe oublié</h1>
        <div className="p-0.5 rounded-[2rem] bg-conic-gradient">
          <div className="relative p-8 dark:bg-n-8 bg-white rounded-[1.9375rem] overflow-hidden">
            {!emailSent ? (
              <>
                <p className="text-center dark:text-n-3 text-n-5 mb-8">
                  Entrez votre adresse e-mail et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                </p>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium dark:text-n-1 text-n-8">
                      Adresse e-mail
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMail className="text-n-4" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border dark:border-n-6 border-n-3 rounded-xl dark:bg-n-7 bg-n-2/40 dark:text-n-1 text-n-8 focus:outline-none focus:ring-2 focus:ring-color-1"
                        placeholder="votre@email.com"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      className="w-full justify-center"
                      loading={loading}
                      disabled={loading || !email}
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
                <h3 className="text-xl font-bold mb-4 dark:text-n-1 text-n-8">E-mail envoyé</h3>
                <p className="dark:text-n-3 text-n-5 mb-8">
                  Nous avons envoyé un code de vérification à {email}. Veuillez vérifier votre boîte de réception et suivre les instructions.
                </p>
                <Button
                  className="w-full justify-center mb-4"
                  onClick={() => setEmailSent(false)}
                >
                  Renvoyer le code
                </Button>
                <Link to="/verify-code" className="text-color-1 hover:text-color-2">
                  J'ai déjà un code
                </Link>
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

export default ForgotPassword;
