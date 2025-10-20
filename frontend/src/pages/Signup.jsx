import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToastContext } from '../context/ToastContext';
import api from '../services/api';

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [localError, setLocalError] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const { signup, verify, loading, error, clearError, user } = useAuth();
  const { success, error: showError } = useToastContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/services');
    }
  }, [user, navigate]);

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      setLocalError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      const { confirmPassword, ...signupData } = formData;
      const result = await signup(signupData);
      
      console.log('Résultat signup:', result); // Debug
      
      // Toujours afficher la page de vérification après inscription
      if (result && result.verificationToken) {
        setVerificationToken(result.verificationToken);
        setNeedsVerification(true);
        success(result.message || 'Code de vérification envoyé !');
      } else {
        // Si pas de token, forcer quand même la vérification
        setNeedsVerification(true);
        success('Code de vérification envoyé !');
      }
    } catch (err) {
      setLocalError(err.message || 'Erreur lors de l\'inscription');
    }
  };

  const handleVerification = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (verificationCode.length !== 6) {
      setLocalError('Le code doit contenir 6 chiffres');
      return;
    }

    try {
      await verify({ 
        verificationToken: verificationToken,
        code: verificationCode 
      });
      navigate('/services');
    } catch (err) {
      setLocalError(err.message || 'Code de vérification invalide');
    }
  };

  const handleResendCode = async () => {
    try {
      setLocalError('');
      const response = await api.post('/auth/resend-verification', { 
        verificationToken: verificationToken 
      });
      
      // Mettre à jour le token si un nouveau est retourné
      if (response.data.data?.verificationToken) {
        setVerificationToken(response.data.data.verificationToken);
      }
      
      success('Code de vérification renvoyé !');
      
      // Démarrer le cooldown
      setResendCooldown(60);
      const interval = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Erreur lors du renvoi';
      setLocalError(errorMsg);
      showError(errorMsg);
    }
  };

  // Effet pour le cooldown
  useEffect(() => {
    return () => {
      // Nettoyer les intervalles
    };
  }, []);

  if (needsVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-lg p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📬</span>
              </div>
              <h1 className="text-2xl font-bold mb-2">Vérifiez votre email</h1>
              <p className="text-muted-foreground">
                Un code de vérification a été envoyé à
              </p>
              <p className="font-medium">{formData.email}</p>
              
              {/* Affichage du code pour le développement */}
              {import.meta.env.DEV && verificationToken && (
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-xs text-yellow-800 dark:text-yellow-200 mb-1">
                    👨‍💻 Mode développement - Code dans le token :
                  </p>
                  <code className="text-sm font-mono bg-yellow-100 dark:bg-yellow-900 px-2 py-1 rounded">
                    {(() => {
                      try {
                        const payload = JSON.parse(atob(verificationToken.split('.')[1]));
                        return payload.code || 'Code non trouvé';
                      } catch (e) {
                        return 'Token invalide';
                      }
                    })()}
                  </code>
                </div>
              )}
            </div>

            {(error || localError) && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                {error || localError}
              </div>
            )}

            <form onSubmit={handleVerification} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Code de vérification (6 chiffres)</label>
                <input
                  type="text"
                  required
                  value={verificationCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setVerificationCode(value);
                  }}
                  className="w-full px-3 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 text-center text-xl tracking-widest font-mono"
                  placeholder="000000"
                  maxLength={6}
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading || verificationCode.length !== 6}
                className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Vérification...
                  </div>
                ) : (
                  'Vérifier le code'
                )}
              </button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Vous n'avez pas reçu le code ?
              </p>
              <button
                onClick={handleResendCode}
                disabled={loading || resendCooldown > 0}
                className="text-primary hover:underline text-sm disabled:opacity-50"
              >
                {resendCooldown > 0 ? `Renvoyer dans ${resendCooldown}s` : 'Renvoyer le code'}
              </button>
              <br />
              <button
                onClick={() => setNeedsVerification(false)}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                Modifier l'email
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-lg p-8">
          <h1 className="text-2xl font-bold text-center mb-6">Inscription</h1>

          {(error || localError) && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
              {error || localError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Prénom</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Nom</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Mot de passe</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Confirmer le mot de passe</label>
              <input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Inscription...' : 'S\'inscrire'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              Déjà un compte ?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;