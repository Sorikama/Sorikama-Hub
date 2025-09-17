import React, { useState } from 'react';
import { X, Download, BookOpen, Briefcase, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Product } from '../../types';

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: Product;
  storeId: string;
  isSubmitting?: boolean;
}

const productTypes = [
  {
    value: 'downloadable',
    label: 'Téléchargeable',
    description: 'Vendez des fichiers numériques livrés instantanément après achat.',
    icon: Download
  },
  {
    value: 'course',
    label: 'Cours',
    description: 'Créez des formations structurées pour partager votre expertise.',
    icon: BookOpen
  },
  {
    value: 'service',
    label: 'Service',
    description: 'Proposez vos compétences sous forme de prestations personnalisées.',
    icon: Briefcase
  }
];

const categories = [
  { value: 'education', label: 'Éducation & Formation' },
  { value: 'business', label: 'Business & Entrepreneuriat' },
  { value: 'technology', label: 'Technologie & Développement' },
  { value: 'design', label: 'Design & Créativité' },
  { value: 'marketing', label: 'Marketing & Communication' },
  { value: 'health', label: 'Santé & Bien-être' },
  { value: 'lifestyle', label: 'Style de vie' },
  { value: 'other', label: 'Autre' }
];

const pricingModels = [
  { value: 'one-time', label: 'Paiement unique' },
  { value: 'subscription', label: 'Abonnement' },
  { value: 'free', label: 'Gratuit' }
];

export const ProductForm: React.FC<ProductFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  storeId,
  isSubmitting: externalSubmitting
}) => {
  const [internalSubmitting, setInternalSubmitting] = useState(false);
  // Utiliser soit l'état de soumission externe, soit l'état interne
  const isSubmitting = externalSubmitting !== undefined ? externalSubmitting : internalSubmitting;
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    type: initialData?.type || 'downloadable',
    category: initialData?.category || '',
    pricingModel: initialData?.pricingModel || 'one-time',
    price: initialData?.price ? Math.floor(initialData.price) : 0,
    promotionalPrice: initialData?.promotionalPrice ? Math.floor(initialData.promotionalPrice) : 0,
    isActive: initialData?.isActive ?? true
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    // Clear submit error when user makes changes
    if (submitError) {
      setSubmitError(null);
    }
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name.trim()) {
        newErrors.name = 'Le nom du produit est requis';
      }

      if (!formData.category) {
        newErrors.category = 'La catégorie est requise';
      }
    } else if (step === 2) {
      if (!formData.description.trim()) {
        newErrors.description = 'La description est requise';
      }

      if (formData.pricingModel !== 'free') {
        if (formData.price < 0 || !Number.isInteger(formData.price)) {
          newErrors.price = 'Le prix doit être un entier naturel (0 ou plus)';
        }
      }

      if (formData.promotionalPrice) {
        if (!Number.isInteger(formData.promotionalPrice) || formData.promotionalPrice < 0) {
          newErrors.promotionalPrice = 'Le prix promotionnel doit être un entier naturel (0 ou plus)';
        } else if (formData.promotionalPrice >= formData.price) {
          newErrors.promotionalPrice = 'Le prix promotionnel doit être inférieur au prix normal';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = () => {
    const step1Valid = validateStep(1);
    const step2Valid = validateStep(2);
    return step1Valid && step2Valid;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(2);
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep === 1) {
      handleNextStep();
      return;
    }
    
    if (!validateForm()) {
      return;
    }

    try {
      if (externalSubmitting === undefined) {
        setInternalSubmitting(true);
      }
      setSubmitError(null);
      
      // Préparation des données du produit
      const productData = {
        ...formData,
        storeId,
        // S'assurer que le prix est toujours un nombre, même pour les produits gratuits
        price: formData.pricingModel === 'free' ? 0 : (formData.price || 0),
        promotionalPrice: formData.promotionalPrice || undefined,
        // S'assurer que tous les champs obligatoires sont présents et correctement formatés
        name: formData.name?.trim(),
        description: formData.description?.trim(),
        type: formData.type,
        category: formData.category,
        isActive: formData.isActive !== undefined ? formData.isActive : true
      };
      
      // Vérifier que le prix est bien un nombre
      if (typeof productData.price !== 'number') {
        productData.price = Number(productData.price) || 0;
      }
      
      console.log('Données du produit avant soumission:', productData);

      // Appel à la fonction onSubmit
      onSubmit(productData);

      // Reset form
      setFormData({
        name: '',
        description: '',
        type: 'downloadable',
        category: '',
        pricingModel: 'one-time',
        price: 0,
        promotionalPrice: 0,
        isActive: true
      });
      setErrors({});
      setCurrentStep(1);
      onClose();
    } catch (error) {
      console.error('Error submitting product:', error);
      setSubmitError('Une erreur est survenue lors de la création du produit. Veuillez réessayer.');
    } finally {
      if (externalSubmitting === undefined) {
        setInternalSubmitting(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75"
          onClick={onClose}
        />

        <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {initialData ? 'Modifier le produit' : 'Créer un nouveau produit'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              disabled={isSubmitting}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {submitError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-md">
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Indicateur d'étape */}
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 1 ? 'bg-theme-primary text-white' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                  1
                </div>
                <div className="w-16 h-1 mx-1 bg-gray-200 dark:bg-gray-700">
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 2 ? 'bg-theme-primary text-white' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                  2
                </div>
              </div>
            </div>

            {currentStep === 1 && (
              <>
                {/* Nom du produit */}
                <Input
                  label="Nom du produit *"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Formation React.js"
                  error={errors.name}
                  required
                />

                {/* Type de produit - En flex inline */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Type de produit *
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {productTypes.map((type) => (
                      <div
                        key={type.value}
                        onClick={() => handleInputChange('type', type.value)}
                        className={`cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 flex-1 min-w-0 ${
                          formData.type === type.value
                            ? 'border-theme-primary bg-theme-primary-50'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className={`p-3 rounded-lg mb-3 ${
                            formData.type === type.value
                              ? 'bg-theme-primary-100'
                              : 'bg-gray-100 dark:bg-gray-700'
                          }`}>
                            <type.icon className={`w-6 h-6 ${
                              formData.type === type.value
                                ? 'text-theme-primary'
                                : 'text-gray-600 dark:text-gray-400'
                            }`} />
                          </div>
                          <h4 className={`font-medium mb-2 ${
                            formData.type === type.value
                              ? 'text-theme-primary'
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {type.label}
                          </h4>
                          <p className={`text-sm leading-relaxed ${
                            formData.type === type.value
                              ? 'text-theme-primary'
                              : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            {type.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Catégorie */}
                <Select
                  label="Catégorie *"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  options={[
                    { value: '', label: 'Sélectionner une catégorie' },
                    ...categories
                  ]}
                  error={errors.category}
                  required
                />

              </>
            )}

            {currentStep === 2 && (
              <>
                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Décrivez votre produit en détail..."
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-theme-primary dark:bg-gray-800 dark:text-white ${
                      errors.description 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    required
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
                  )}
                </div>

                {/* Modèle de tarification */}
                <Select
                  label="Modèle de tarification *"
                  value={formData.pricingModel}
                  onChange={(e) => handleInputChange('pricingModel', e.target.value)}
                  options={pricingModels}
                  required
                />

                {/* Prix */}
                {formData.pricingModel !== 'free' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Prix *
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={formData.price}
                          onChange={(e) => {
                            const value = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                            handleInputChange('price', isNaN(value) ? 0 : value);
                          }}
                          placeholder="99"
                          min="0"
                          step="1"
                          className={`w-full px-3 py-2 pr-16 border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-theme-primary dark:bg-gray-800 dark:text-white ${
                            errors.price 
                              ? 'border-red-500 focus:ring-red-500' 
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                          required
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                          F CFA
                        </span>
                      </div>
                      {errors.price && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.price}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Prix promotionnel
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={formData.promotionalPrice}
                          onChange={(e) => {
                            const value = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                            handleInputChange('promotionalPrice', isNaN(value) ? 0 : value);
                          }}
                          placeholder="79"
                          min="0"
                          step="1"
                          className={`w-full px-3 py-2 pr-16 border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-theme-primary dark:bg-gray-800 dark:text-white ${
                            errors.promotionalPrice 
                              ? 'border-red-500 focus:ring-red-500' 
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                          F CFA
                        </span>
                      </div>
                      {errors.promotionalPrice && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.promotionalPrice}</p>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Actions */}
            <div className="flex justify-between space-x-3 pt-6 border-t border-gray-200 dark:border-gray-600">
              <div>
                {currentStep === 2 && (
                  <Button 
                    type="button"
                    variant="secondary" 
                    onClick={handlePreviousStep}
                    className="flex items-center"
                    disabled={isSubmitting}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Précédent
                  </Button>
                )}
              </div>
              <div className="flex space-x-3">
                <Button 
                  type="button"
                  variant="secondary" 
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button type="submit" className="flex items-center" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {initialData ? 'Mise à jour...' : 'Création...'}
                    </>
                  ) : currentStep === 1 ? (
                    <>
                      Suivant
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    initialData ? 'Mettre à jour' : 'Créer le produit'
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};