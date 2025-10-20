import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login, loading, error, clearError, user } = useAuth();
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
    
    try {
      await login(formData.email, formData.password);
      navigate('/services');
    } catch (err) {
      // L'erreur est déjà gérée dans le contexte
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-lg p-8">
          <h1 className="text-2xl font-bold text-center mb-6">Connexion</h1>

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              Pas de compte ?{' '}
              <Link to="/signup" className="text-primary hover:underline">
                S'inscrire
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;