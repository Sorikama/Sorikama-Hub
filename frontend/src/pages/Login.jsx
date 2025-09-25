import React, { useState } from "react";
import { Link, useLocation, useNavigate  } from "react-router-dom";
import Button from "../components/Button";
import { FiEye, FiEyeOff, FiMail, FiLock } from "react-icons/fi";
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  // ======================= AJOUT IMPORTANT =======================
  // On utilise 'URLSearchParams' pour lire les paramètres dans l'URL.
  // C'est comme ça que Sorikama saura où renvoyer l'utilisateur.
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const redirectUrl = searchParams.get('redirectUrl'); // ex: 'http://localhost:3000'


  const handleSubmit = async (e) => {
    e.preventDefault();
    // setError('');
    try {
      // ======================= INSCRIPTION ET CONNEXION AUTOMATIQUE =======================
      // La fonction signup du contexte doit maintenant gérer l'inscription ET la connexion.
      // Elle doit retourner les mêmes informations que la fonction login (user et tokens).
      const { user, tokens } = await login({email, password});

      if (redirectUrl) {
        // Si une URL de redirection est fournie, on y va en ajoutant le token et l'utilisateur.
        console.log(`Redirection vers ${redirectUrl}`);

        // On prend le token d'accès
        const token = tokens.access.token;
        // On encode l'objet utilisateur en base64 pour le passer dans l'URL sans risque
        const encodedUser = btoa(JSON.stringify(user));

        // On redirige le navigateur de l'utilisateur
        window.location.href = `${redirectUrl}?token=${token}&user=${encodedUser}`;
      } else {
        // Comportement par défaut si personne ne nous a redirigé ici.
        // On redirige vers le dashboard de Sorikama lui-même.
        console.log("Aucune URL de redirection, on va vers le dashboard local.");
        navigate('/dashboard');
      }
    } catch (err) {
      // setError('Échec de l\'inscription. L\'email est peut-être déjà utilisé.');
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-20 min-h-screen flex flex-col justify-center">
      <div className="max-w-md mx-auto w-full">
        <h1 className="h2 text-center mb-8 dark:text-n-1 text-n-8">Connexion</h1>
        <div className="p-0.5 rounded-[2rem] bg-conic-gradient">
          <div className="relative p-8 dark:bg-n-8 bg-white rounded-[1.9375rem] overflow-hidden">
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
                    autoComplete="current-password"
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

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 accent-color-1"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm dark:text-n-3 text-n-5">
                    Se souvenir de moi
                  </label>
                </div>

                <div className="text-sm">
                  <Link to="/forgot-password" className="font-medium text-color-1 hover:text-color-2">
                    Mot de passe oublié ?
                  </Link>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  className="w-full justify-center"
                  loading={loading}
                  disabled={loading || !email || !password}
                >
                  Se connecter
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm dark:text-n-3 text-n-5">
                Pas encore de compte ?{" "}
                <Link to="/signup" className="font-medium text-color-1 hover:text-color-2">
                  S'inscrire
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
