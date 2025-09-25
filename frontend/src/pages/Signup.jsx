import React, { useState } from "react";
import { Link, useLocation, useNavigate  } from "react-router-dom";
import Button from "../components/Button";
import { FiEye, FiEyeOff, FiMail, FiLock, FiUser } from "react-icons/fi";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  // C'est comme ça que Sorikama saura où renvoyer l'utilisateur.
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const redirectUrl = searchParams.get('redirectUrl');


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { firstName, lastName, email, password, confirmPassword } = formData;

    // Validation de base
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
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

    if (!termsAccepted) {
      toast.error("Veuillez accepter les conditions d'utilisation");
      return;
    }

    // Simulation d'inscription avec chargement
    setLoading(true);

    try {
      // La fonction signup retourne maintenant { verificationToken }
      const { verificationToken } = await signup(formData);

      // ======================= REDIRECTION VERS LA PAGE DE VÉRIFICATION =======================
      // On construit l'URL de la page de vérification en y ajoutant deux informations :
      // 1. Le token de vérification nécessaire pour l'appel API.
      // 2. L'URL de redirection finale pour que la page de vérification sache où renvoyer l'utilisateur.
      let verifyUrl = `/verify?token=${verificationToken}`;
      if (redirectUrl) {
        verifyUrl += `&redirectUrl=${encodeURIComponent(redirectUrl)}`;
      }
      navigate(verifyUrl);

    } catch (err) {
      console.log("erreur ici", err)
      // setError('Échec de l\'inscription.'); // Message de secours
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-20 min-h-screen flex flex-col justify-center">
      <div className="max-w-md mx-auto w-full">
        <h1 className="h2 text-center mb-8 dark:text-n-1 text-n-8">Créer un compte</h1>
        <div className="p-0.5 rounded-[2rem] bg-conic-gradient">
          <div className="relative p-8 dark:bg-n-8 bg-white rounded-[1.9375rem] overflow-hidden">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="block text-sm font-medium dark:text-n-1 text-n-8">
                    Prénom
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className="text-n-4" />
                    </div>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-3 border dark:border-n-6 border-n-3 rounded-xl dark:bg-n-7 bg-n-2/40 dark:text-n-1 text-n-8 focus:outline-none focus:ring-2 focus:ring-color-1"
                      placeholder="Jean"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="lastName" className="block text-sm font-medium dark:text-n-1 text-n-8">
                    Nom
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className="text-n-4" />
                    </div>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-3 border dark:border-n-6 border-n-3 rounded-xl dark:bg-n-7 bg-n-2/40 dark:text-n-1 text-n-8 focus:outline-none focus:ring-2 focus:ring-color-1"
                      placeholder="Dupont"
                    />
                  </div>
                </div>
              </div>

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
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border dark:border-n-6 border-n-3 rounded-xl dark:bg-n-7 bg-n-2/40 dark:text-n-1 text-n-8 focus:outline-none focus:ring-2 focus:ring-color-1"
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium dark:text-n-1 text-n-8">
                  Mot de passe
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
                    value={formData.password}
                    onChange={handleChange}
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
                    value={formData.confirmPassword}
                    onChange={handleChange}
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

              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="h-4 w-4 accent-color-1"
                />
                <label htmlFor="terms" className="ml-2 block text-sm dark:text-n-3 text-n-5">
                  J'accepte les{" "}
                  <a href="#" className="font-medium text-color-1 hover:text-color-2">
                    conditions d'utilisation
                  </a>{" "}
                  et la{" "}
                  <a href="#" className="font-medium text-color-1 hover:text-color-2">
                    politique de confidentialité
                  </a>
                </label>
              </div>

              <div className="pt-4">
                <Button
                  className="w-full justify-center"
                  loading={loading}
                  disabled={loading || !formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword || !termsAccepted}
                >
                  S'inscrire
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm dark:text-n-3 text-n-5">
                Vous avez déjà un compte ?{" "}
                <Link to="/login" className="font-medium text-color-1 hover:text-color-2">
                  Se connecter
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
