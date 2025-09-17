import React, { useState, useEffect } from 'react';
import { X, Store as StoreIcon, AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { useStore } from '../../contexts/StoreContext';
import storeService from '../../services/storeService';

interface StoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeId?: string;
  onSuccess?: (storeId: string) => void;
}

export const StoreModal: React.FC<StoreModalProps> = ({
  isOpen,
  onClose,
  storeId,
  onSuccess
}) => {
  const { stores, createStore, updateStore } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDomainChecking, setIsDomainChecking] = useState(false);
  const [isDomainAvailable, setIsDomainAvailable] = useState<boolean | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    domaine: ''
  });

  const isEditMode = storeId && storeId !== 'new';
  const title = isEditMode ? 'Modifier la boutique' : 'Créer une nouvelle boutique';

  // Charger les données de la boutique si on est en mode édition
  useEffect(() => {
    if (isOpen && isEditMode && stores.length > 0) {
      const storeData = stores.find(store => store.id === storeId);
      if (storeData) {
        setFormData({
          name: storeData.name || '',
          description: storeData.description || '',
          domaine: storeData.domaine || ''
        });
      }
    } else if (isOpen && !isEditMode) {
      // Réinitialiser le formulaire en mode création
      setFormData({
        name: '',
        description: '',
        domaine: ''
      });
    }
  }, [isOpen, storeId, stores, isEditMode]);

  // Gérer la fermeture de la modale
  useEffect(() => {
    console.log('StoreModal - isOpen changed:', isOpen);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Vérifier la disponibilité du domaine lorsqu'il change
  useEffect(() => {
    // Ne pas vérifier en mode édition ou si le domaine est vide
    if (isEditMode || !formData.domaine || formData.domaine.length < 3) {
      setIsDomainAvailable(null);
      return;
    }

    const checkDomain = async () => {
      setIsDomainChecking(true);
      try {
        const available = await storeService.checkDomainAvailability(formData.domaine);
        setIsDomainAvailable(available);
      } catch (error) {
        console.error('Erreur lors de la vérification du domaine:', error);
        setIsDomainAvailable(null);
      } finally {
        setIsDomainChecking(false);
      }
    };
    
    const timer = setTimeout(checkDomain, 500); // Délai pour éviter trop d'appels API
    return () => clearTimeout(timer);
  }, [formData.domaine, isEditMode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'domaine') {
      // Nettoyer le domaine (minuscules, pas d'espaces ni caractères spéciaux)
      const cleanedValue = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: cleanedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Vérifier si les champs obligatoires sont remplis
    if (!formData.name || !formData.description || !formData.domaine) {
      setError('Veuillez remplir tous les champs obligatoires');
      setIsSubmitting(false);
      return;
    }

    // Vérifier la longueur minimale du domaine
    if (formData.domaine.length < 3) {
      setError('Le nom de domaine doit contenir au moins 3 caractères');
      setIsSubmitting(false);
      return;
    }

    // En mode création, vérifier si le domaine est disponible
    if (!isEditMode && isDomainAvailable === false) {
      setError('Ce nom de domaine est déjà utilisé. Veuillez en choisir un autre.');
      setIsSubmitting(false);
      return;
    }

    try {
      if (isEditMode) {
        // Mode édition
        await updateStore(storeId, {
          name: formData.name,
          description: formData.description,
          domaine: formData.domaine
        });
      } else {
        const newStore = await createStore(formData.name, formData.description, formData.domaine);
        if (newStore && onSuccess) {
          onSuccess(newStore.id);
          onClose();
          return;
        }
      }
      onClose();
    } catch (error: any) {
      console.error('Erreur lors de la création/modification de la boutique:', error);
      setError(error.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  console.log('StoreModal - Rendering with isOpen:', isOpen);
  if (!isOpen) {
    console.log('StoreModal - Not rendering because isOpen is false');
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 text-center">
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75"
          onClick={onClose}
        />

        <div className="inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
              <StoreIcon className="w-5 h-5 mr-2 text-theme-primary" />
              {title}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nom de la boutique *
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Nom de votre boutique"
                className="w-full"
                required
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Description de votre boutique"
                className="w-full"
                rows={3}
              />
            </div>
            
            <div>
              <label htmlFor="domaine" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Domaine *
              </label>
              <div className="flex items-center relative">
                <span className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-3 py-2 text-sm border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-md">
                  webrichesse.com/
                </span>
                <Input
                  id="domaine"
                  name="domaine"
                  value={formData.domaine}
                  onChange={handleInputChange}
                  placeholder="ma-boutique"
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
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                <span>Entrez uniquement le sous-domaine sans espaces ni caractères spéciaux.</span>
              </div>
              {!isDomainChecking && isDomainAvailable === false && (
                <p className="text-xs text-red-500 mt-1">Ce nom de domaine est déjà utilisé. Veuillez en choisir un autre.</p>
              )}
              {!isDomainChecking && isDomainAvailable === true && (
                <p className="text-xs text-green-500 mt-1">Ce nom de domaine est disponible !</p>
              )}
            </div>
            
            
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                className="bg-theme-primary hover:bg-theme-primary text-white"
              >
                {isSubmitting ? 'Enregistrement...' : isEditMode ? 'Mettre à jour' : 'Créer'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
