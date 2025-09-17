import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Store } from '../../types';
import { StorePreview } from '../../components/store/StorePreview';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { AlertCircle } from 'lucide-react';
// URL de base de l'API
const API_BASE_URL = 'http://localhost:8000/api';

export const StorePreviewPage: React.FC = () => {
  const { storeDomain } = useParams<{ storeDomain: string }>();
  
  if (!storeDomain) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="text-center p-6 sm:p-8 max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex justify-center mb-4">
            <AlertCircle className="w-16 h-16 text-red-500" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            URL invalide
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            L'URL que vous avez saisie est incorrecte ou incomplète.
          </p>
          <Link 
            to="/"
            className="inline-block px-6 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow border border-primary-dark/20"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchStoreByDomain = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/stores/domain/${storeDomain}`);
        setStore(response.data);
        setError(null);
      } catch (err) {
        console.error('Erreur lors de la récupération de la boutique:', err);
        setError('Boutique introuvable. Veuillez vérifier l\'URL.');
        toast.error('Boutique introuvable. Veuillez vérifier l\'URL.');
      } finally {
        setLoading(false);
      }
    };
    
    if (storeDomain) {
      fetchStoreByDomain();
    }
  }, [storeDomain]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mb-4 border-opacity-80"></div>
        <p className="text-gray-600 dark:text-gray-300 font-medium animate-pulse">Chargement de la boutique...</p>
      </div>
    );
  }
  
  if (error || !store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="text-center p-6 sm:p-8 max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex justify-center mb-4">
            <AlertCircle className="w-16 h-16 text-amber-500" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Boutique introuvable
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            La boutique que vous recherchez n'existe pas ou n'est plus disponible.
          </p>
          <Link 
            to="/"
            className="inline-block px-6 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow border border-primary-dark/20"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <StorePreview store={store} />
    </div>
  );
};
