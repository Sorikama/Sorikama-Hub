/**
 * Exemple de page callback pour Masebuy
 * À placer dans : masebuy/src/pages/auth/Callback.jsx
 * 
 * Cette page reçoit les données de Sorikama après autorisation
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import jwt from 'jsonwebtoken';

export default function SorikamaCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, error

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      console.log('🔄 Traitement du callback Sorikama...');

      // ============================================
      // 1. VÉRIFIER LES ERREURS
      // ============================================
      const error = searchParams.get('error');
      if (error) {
        const errorDescription = searchParams.get('error_description');
        console.error('❌ Erreur d\'autorisation:', error);
        console.error('Description:', errorDescription);
        
        setStatus('error');
        
        // Afficher un message et rediriger après 3 secondes
        setTimeout(() => {
          navigate('/login');
        }, 3000);
        return;
      }

      // ============================================
      // 2. RÉCUPÉRER LES PARAMÈTRES
      // ============================================
      const token = searchParams.get('token');
      const userString = searchParams.get('user');

      if (!token || !userString) {
        console.error('❌ Paramètres manquants dans le callback');
        setStatus('error');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      // ============================================
      // 3. PARSER ET VALIDER LES DONNÉES
      // ============================================
      
      // Parser l'objet user
      const user = JSON.parse(decodeURIComponent(userString));
      console.log('👤 Utilisateur:', user);

      // Décoder le token JWT (sans vérifier la signature)
      const decoded = jwt.decode(token);
      console.log('🔑 Token décodé:', decoded);

      // Vérifier que le token est pour Masebuy
      if (decoded.service !== 'masebuy') {
        console.error('❌ Token non valide pour Masebuy');
        setStatus('error');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      // Vérifier que le token n'est pas expiré
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp < now) {
        console.error('❌ Token expiré');
        setStatus('error');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      // ============================================
      // 4. SAUVEGARDER DANS LOCALSTORAGE
      // ============================================
      localStorage.setItem('sorikama_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('permissions', JSON.stringify(decoded.permissions));

      console.log('✅ Authentification réussie via Sorikama');
      console.log('📋 Permissions:', decoded.permissions);

      // ============================================
      // 5. OPTIONNEL : ENVOYER AU BACKEND MASEBUY
      // ============================================
      // Si Masebuy a un backend, vous pouvez envoyer le token
      // pour créer une session côté serveur
      /*
      try {
        await fetch('http://localhost:3001/api/auth/sorikama-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, user })
        });
      } catch (err) {
        console.error('Erreur lors de la création de session:', err);
      }
      */

      // ============================================
      // 6. REDIRIGER VERS LE DASHBOARD
      // ============================================
      setStatus('success');
      
      // Attendre 1 seconde pour montrer le succès
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);

    } catch (error) {
      console.error('❌ Erreur lors du traitement du callback:', error);
      setStatus('error');
      setTimeout(() => navigate('/login'), 3000);
    }
  };

  // ============================================
  // AFFICHAGE SELON L'ÉTAT
  // ============================================

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-xl mb-6">
            <svg className="animate-spin h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Connexion en cours...</h2>
          <p className="text-gray-600">Vérification de votre identité Sorikama</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-3xl shadow-xl mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Connexion réussie !</h2>
          <p className="text-gray-600">Redirection vers votre espace...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-3xl shadow-xl mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur d'authentification</h2>
          <p className="text-gray-600 mb-4">Impossible de se connecter via Sorikama</p>
          <p className="text-sm text-gray-500">Redirection vers la page de connexion...</p>
        </div>
      </div>
    );
  }

  return null;
}
