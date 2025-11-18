/**
 * Page d'annulation de suppression de compte - Sans authentification
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export default function CancelDeletion() {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Saisie email, 2: Saisie code, 3: Succès
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const requestCode = async () => {
    if (!email) {
      setError('Veuillez saisir votre adresse email');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      console.log('📧 Demande de code pour:', email);
      
      // Demander un code d'annulation (endpoint public)
      const response = await api.post('/account/request-cancellation-code-public', { email });
      
      console.log('✅ Réponse reçue:', response.data);
      
      // Vérifier que la réponse est bien un succès
      if (response.data && response.data.success) {
        toast.success('Un code a été envoyé à votre email. Vérifiez votre boîte de réception.');
        setStep(2);
      } else {
        setError('Erreur lors de l\'envoi du code');
      }
    } catch (error) {
      console.error('❌ Erreur demande code:', error);
      console.error('Détails erreur:', error.response?.data);
      setError(error.response?.data?.message || 'Erreur lors de l\'envoi du code');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCode = async (e) => {
    e.preventDefault();
    await requestCode();
  };

  const handleCancelDeletion = async (e) => {
    e.preventDefault();
    
    if (!code || code.length !== 6) {
      setError('Veuillez saisir un code à 6 chiffres');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Annuler la suppression avec le code (endpoint public)
      const response = await api.post('/account/cancel-deletion-public', { email, code });
      
      console.log('✅ Annulation réussie:', response.data);
      
      // Afficher l'écran de succès
      setStep(3);
      
      // Rediriger vers la page de connexion après 5 secondes
      setTimeout(() => {
        navigate('/login');
      }, 5000);
      
    } catch (error) {
      console.error('❌ Erreur annulation:', error);
      setError(error.response?.data?.message || 'Code invalide ou expiré');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-md">
        
        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">
            Annuler la suppression
          </h1>
          <p className="text-gray-600">
            Récupérez votre compte en quelques étapes
          </p>
        </div>

        {/* Contenu */}
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-gray-100">
          
          {/* Message d'erreur */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-800 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Étape 1 : Saisie email */}
          {step === 1 && (
            <form onSubmit={handleRequestCode}>
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-4">
                  Saisissez l'adresse email de votre compte pour recevoir un code d'annulation.
                </p>
                
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Adresse email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="votre@email.com"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:ring-2 focus:ring-gray-100 transition-all duration-200 outline-none"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Envoi en cours...' : 'Recevoir le code par email'}
              </button>
            </form>
          )}

          {/* Étape 2 : Saisie du code */}
          {step === 2 && (
            <form onSubmit={handleCancelDeletion}>
              <div className="mb-6 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-green-800 font-medium">
                    Un code a été envoyé à {email}
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Consultez votre boîte email et saisissez le code à 6 chiffres ci-dessous.
              </p>

              <div className="mb-6">
                <label htmlFor="code" className="block text-sm font-semibold text-gray-700 mb-2">
                  Code de vérification
                </label>
                <input
                  type="text"
                  id="code"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                    if (error) setError('');
                  }}
                  placeholder="000000"
                  maxLength={6}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:ring-2 focus:ring-gray-100 transition-all duration-200 outline-none text-center text-2xl tracking-widest font-mono"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Le code est valide pendant 15 minutes
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Annulation en cours...' : 'Annuler la suppression'}
              </button>

              <button
                type="button"
                onClick={requestCode}
                disabled={loading}
                className="w-full mt-3 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Renvoyer le code
              </button>
            </form>
          )}

          {/* Étape 3 : Succès */}
          {step === 3 && (
            <div className="text-center py-8">
              {/* Icône de succès animée */}
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6 animate-bounce">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              {/* Message de succès */}
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Annulation réussie ! 🎉
              </h2>
              
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
                <p className="text-green-800 font-medium mb-2">
                  La suppression de votre compte a été annulée avec succès.
                </p>
                <p className="text-green-700 text-sm">
                  Votre compte est maintenant actif et vous pouvez vous connecter.
                </p>
              </div>

              {/* Information de redirection */}
              <div className="flex items-center justify-center gap-2 text-gray-600 mb-6">
                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <p className="text-sm">
                  Redirection vers la page de connexion dans quelques secondes...
                </p>
              </div>

              {/* Bouton de connexion immédiate */}
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Se connecter maintenant
              </button>
            </div>
          )}

          {/* Lien retour */}
          {step !== 3 && (
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/login')}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Retour à la connexion
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
