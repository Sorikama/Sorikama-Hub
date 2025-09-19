import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { toast } from "react-toastify";

const VerifyCode = () => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  // Initialiser les références pour les champs de saisie
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  // Gérer la saisie dans les champs de code
  const handleChange = (index, value) => {
    // Autoriser uniquement les chiffres
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Passer au champ suivant si un chiffre est entré
    if (value !== "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Gérer la touche Backspace
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (code[index] === "" && index > 0) {
        // Si le champ actuel est vide et qu'on appuie sur Backspace, aller au champ précédent
        inputRefs.current[index - 1].focus();
      }
    }
  };

  // Gérer le collage d'un code
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();
    
    // Vérifier si le texte collé contient exactement 6 chiffres
    if (/^\d{6}$/.test(pastedData)) {
      const newCode = pastedData.split("");
      setCode(newCode);
      
      // Mettre le focus sur le dernier champ
      inputRefs.current[5].focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Vérifier que tous les champs sont remplis
    if (code.some(digit => digit === "")) {
      toast.error("Veuillez entrer le code complet à 6 chiffres");
      return;
    }

    // Simulation de vérification avec chargement
    setLoading(true);
    
    // Simuler un délai de chargement
    setTimeout(() => {
      const enteredCode = code.join("");
      
      // Pour la démo, considérons que 123456 est un code valide
      if (enteredCode === "123456") {
        toast.success("Code vérifié avec succès");
        navigate("/reset-password");
      } else {
        toast.error("Code invalide. Veuillez réessayer.");
        // Réinitialiser le code
        setCode(["", "", "", "", "", ""]);
        // Mettre le focus sur le premier champ
        inputRefs.current[0].focus();
      }
      
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="container mx-auto px-4 py-20 min-h-screen flex flex-col justify-center">
      <div className="max-w-md mx-auto w-full">
        <h1 className="h2 text-center mb-8 dark:text-n-1 text-n-8">Vérification du code</h1>
        <div className="p-0.5 rounded-[2rem] bg-conic-gradient">
          <div className="relative p-8 dark:bg-n-8 bg-white rounded-[1.9375rem] overflow-hidden">
            <p className="text-center dark:text-n-3 text-n-5 mb-8">
              Entrez le code à 6 chiffres que nous avons envoyé à votre adresse e-mail.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-center gap-2">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => inputRefs.current[index] = el}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : null}
                    className="w-12 h-14 text-center text-xl font-bold border dark:border-n-6 border-n-3 rounded-xl dark:bg-n-7 bg-n-2/40 dark:text-n-1 text-n-8 focus:outline-none focus:ring-2 focus:ring-color-1"
                    autoComplete="one-time-code"
                  />
                ))}
              </div>

              <div className="pt-4">
                <Button 
                  className="w-full justify-center" 
                  loading={loading} 
                  disabled={loading || code.some(digit => digit === "")}
                >
                  Vérifier le code
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm dark:text-n-3 text-n-5 mb-4">
                Vous n'avez pas reçu de code ?{" "}
                <Link to="/forgot-password" className="font-medium text-color-1 hover:text-color-2">
                  Renvoyer le code
                </Link>
              </p>
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

export default VerifyCode;
