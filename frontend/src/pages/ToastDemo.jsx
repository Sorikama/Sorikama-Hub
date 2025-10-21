/**
 * Page de démonstration des toasts
 * Utilisez cette page pour tester tous les types de toasts
 */

import { useToast } from '../context/ToastContext';

export default function ToastDemo() {
  const toast = useToast();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* En-tête */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Démonstration des Toasts
          </h1>
          <p className="text-xl text-gray-600">
            Testez tous les types de notifications
          </p>
        </div>

        {/* Grille de boutons */}
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Success */}
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="text-3xl mr-3">✅</span>
              Success
            </h2>
            <p className="text-gray-600 mb-6">
              Utilisé pour confirmer une action réussie
            </p>
            <div className="space-y-3">
              <button
                onClick={() => toast.success('Opération réussie !')}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-300"
              >
                Toast Success Simple
              </button>
              <button
                onClick={() => toast.success('Profil mis à jour avec succès !', 3000)}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-300"
              >
                Success (3 secondes)
              </button>
              <button
                onClick={() => toast.success('🎉 Félicitations ! Votre compte a été créé.')}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-300"
              >
                Success avec Emoji
              </button>
            </div>
          </div>

          {/* Error */}
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="text-3xl mr-3">❌</span>
              Error
            </h2>
            <p className="text-gray-600 mb-6">
              Utilisé pour signaler une erreur
            </p>
            <div className="space-y-3">
              <button
                onClick={() => toast.error('Une erreur est survenue')}
                className="w-full bg-gradient-to-r from-red-500 to-rose-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-300"
              >
                Toast Error Simple
              </button>
              <button
                onClick={() => toast.error('Connexion échouée. Vérifiez vos identifiants.', 7000)}
                className="w-full bg-gradient-to-r from-red-500 to-rose-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-300"
              >
                Error (7 secondes)
              </button>
              <button
                onClick={() => toast.error('⚠️ Impossible de charger les données')}
                className="w-full bg-gradient-to-r from-red-500 to-rose-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-300"
              >
                Error avec Emoji
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="text-3xl mr-3">ℹ️</span>
              Info
            </h2>
            <p className="text-gray-600 mb-6">
              Utilisé pour donner une information
            </p>
            <div className="space-y-3">
              <button
                onClick={() => toast.info('Nouvelle fonctionnalité disponible')}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-300"
              >
                Toast Info Simple
              </button>
              <button
                onClick={() => toast.info('Chargement en cours...', 0)}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-300"
              >
                Info Permanent (fermeture manuelle)
              </button>
              <button
                onClick={() => toast.info('💡 Astuce : Utilisez Ctrl+S pour sauvegarder')}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-300"
              >
                Info avec Emoji
              </button>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="text-3xl mr-3">⚠️</span>
              Warning
            </h2>
            <p className="text-gray-600 mb-6">
              Utilisé pour avertir l'utilisateur
            </p>
            <div className="space-y-3">
              <button
                onClick={() => toast.warning('Attention : action irréversible')}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-300"
              >
                Toast Warning Simple
              </button>
              <button
                onClick={() => toast.warning('Votre session expire dans 5 minutes', 10000)}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-300"
              >
                Warning (10 secondes)
              </button>
              <button
                onClick={() => toast.warning('🔔 Veuillez vérifier votre email')}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-300"
              >
                Warning avec Emoji
              </button>
            </div>
          </div>
        </div>

        {/* Section test multiple */}
        <div className="mt-12 bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Tests Avancés
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <button
              onClick={() => {
                toast.success('Premier toast');
                setTimeout(() => toast.info('Deuxième toast'), 500);
                setTimeout(() => toast.warning('Troisième toast'), 1000);
              }}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-300"
            >
              Toasts Multiples
            </button>
            <button
              onClick={() => {
                toast.success('Toast court', 1000);
              }}
              className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-300"
            >
              Toast Rapide (1s)
            </button>
            <button
              onClick={() => {
                toast.info('Toast très long avec beaucoup de texte pour tester le comportement du composant avec des messages longs', 8000);
              }}
              className="bg-gradient-to-r from-teal-500 to-green-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-300"
            >
              Toast Long Texte
            </button>
          </div>
        </div>

        {/* Retour */}
        <div className="mt-12 text-center">
          <a
            href="/"
            className="inline-block bg-gray-200 text-gray-700 px-8 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all duration-300"
          >
            ← Retour à l'accueil
          </a>
        </div>
      </div>
    </div>
  );
}
