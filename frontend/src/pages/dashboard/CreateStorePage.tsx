import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, FileText, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { useStore } from '../../contexts/StoreContext';
import storeService from '../../services/storeService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const CreateStorePage: React.FC = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [domaine, setDomaine] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDomainAvailable, setIsDomainAvailable] = useState<boolean | null>(null);
  const [isDomainChecking, setIsDomainChecking] = useState(false);
  const { createStore } = useStore();
  const navigate = useNavigate();
  
  // Vérifier la disponibilité du domaine lorsqu'il change
  useEffect(() => {
    const checkDomain = async () => {
      if (domaine && domaine.length >= 3) {
        setIsDomainChecking(true);
        try {
          const available = await storeService.checkDomainAvailability(domaine);
          setIsDomainAvailable(available);
        } catch (error) {
          console.error('Erreur lors de la vérification du domaine:', error);
          setIsDomainAvailable(null);
        } finally {
          setIsDomainChecking(false);
        }
      } else {
        setIsDomainAvailable(null);
      }
    };
    
    const timer = setTimeout(checkDomain, 500); // Délai pour éviter trop d'appels API
    return () => clearTimeout(timer);
  }, [domaine]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !description || !domaine) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    if (domaine.length < 3) {
      toast.error('Le nom de domaine doit contenir au moins 3 caractères');
      return;
    }

    // Vérifier si le domaine est disponible avant de créer la boutique
    if (isDomainAvailable === false) {
      toast.error('Ce nom de domaine est déjà utilisé. Veuillez en choisir un autre.');
      return;
    }
    
    try {
      setIsLoading(true);
      await createStore(name, description, domaine);
      toast.success('Votre boutique a été créée avec succès!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Erreur lors de la création de la boutique:', error);
      toast.error(error.response?.data?.message || 'Une erreur est survenue lors de la création de la boutique');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
      <div className="max-w-md w-full">
        <Card>
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                <Store className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Créer votre première boutique
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Configurez votre boutique en quelques étapes simples
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Nom de la boutique"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={Store}
              placeholder="Ma Super Boutique"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <div className="relative">
                <FileText className="absolute top-3 left-3 w-5 h-5 text-gray-400" />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez votre boutique et vos produits..."
                  rows={3}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="domaine" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nom de domaine *
              </label>
              <div className="flex items-center relative">
                <span className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-3 py-2 text-sm border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-md">
                  webrichesse.com/
                </span>
                <Input
                  id="domaine"
                  name="domaine"
                  type="text"
                  placeholder="ma-boutique"
                  value={domaine}
                  onChange={(e) => setDomaine(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  className={`w-full rounded-l-none ${isDomainAvailable === false ? 'border-red-500' : isDomainAvailable === true ? 'border-green-500' : ''}`}
                  required
                />
                {isDomainChecking && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                  </div>
                )}
                {!isDomainChecking && isDomainAvailable === true && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-green-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                {!isDomainChecking && isDomainAvailable === false && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-red-500">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                )}
              </div>
              <div className="mt-1 text-xs text-gray-500 flex items-start">
                <div className="flex-shrink-0 mr-1 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span>Entrez uniquement le sous-domaine sans espaces ni caractères spéciaux.</span>
              </div>
              {!isDomainChecking && isDomainAvailable === false && (
                <p className="text-xs text-red-500 mt-1 ml-4">Ce nom de domaine est déjà utilisé. Veuillez en choisir un autre.</p>
              )}
              {!isDomainChecking && isDomainAvailable === true && (
                <p className="text-xs text-green-500 mt-1 ml-4">Ce nom de domaine est disponible !</p>
              )}
            </div>

            {error && (
              <div className="text-red-600 dark:text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="mr-2 inline-block animate-spin">&#8635;</span>
                  Création en cours...
                </>
              ) : (
                'Créer ma boutique'
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};