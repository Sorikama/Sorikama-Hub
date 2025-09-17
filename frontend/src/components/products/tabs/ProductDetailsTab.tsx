import React, { useState } from 'react';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { Download, BookOpen, Briefcase, Link, Shield, Eye, Save } from 'lucide-react';
import { Product } from '../../../types';
import { Button } from '../../ui/Button';
import { Checkbox } from '../../ui/Checkbox';
import { useStore } from '../../../contexts/StoreContext';

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

interface ProductDetailsTabProps {
  product: Product;
  formData: any;
  onChange: (data: any) => void;
  onSave?: () => Promise<void>;
}

export const ProductDetailsTab: React.FC<ProductDetailsTabProps> = ({
  formData,
  onChange,
  onSave
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const { selectedStore } = useStore();
  const handleInputChange = (field: string, value: any) => {
    onChange({ [field]: value });
  };

  return (
    <div className="space-y-8">
      {/* Informations générales */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Informations générales
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <Input
              label="Nom du produit *"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Comment perdre du poids en 30 jours sans faire de régime alimentaire."
              required
            />
          </div>

          <div className="md:col-span-2">
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

          <Select
            label="Catégorie *"
            value={formData.category || ''}
            onChange={(e) => handleInputChange('category', e.target.value)}
            options={[
              { value: '', label: 'Sélectionner une catégorie' },
              ...categories
            ]}
            required
          />

          <Select
            label="Modèle de tarification *"
            value={formData.pricingModel || 'one-time'}
            onChange={(e) => handleInputChange('pricingModel', e.target.value)}
            options={pricingModels}
            required
          />

          {formData.pricingModel !== 'free' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Prix *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.price || 0}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                    placeholder="15000"
                    min="0"
                    step="1"
                    className="w-full px-3 py-2 pr-16 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-theme-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    required
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    F CFA
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Prix promotionnel
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.promotionalPrice || 0}
                    onChange={(e) => handleInputChange('promotionalPrice', parseFloat(e.target.value) || 0)}
                    placeholder="10000"
                    min="0"
                    step="1"
                    className="w-full px-3 py-2 pr-16 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-theme-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    F CFA
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Prix réduit affiché en permanence sur la page produit.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* URL du produit */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
          <Link className="w-5 h-5 mr-2 text-theme-primary" />
          URL du produit
        </h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Personnalisez l'URL de votre produit
          </label>
          <div className="flex items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
              {window.location.origin}/{selectedStore ? selectedStore.domaine : 'votre-boutique'}/
            </span>
            <input
              type="text"
              value={formData.custom_url || ''}
              onChange={(e) => handleInputChange('custom_url', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              placeholder="perdre-du-poids-30-jours"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-theme-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Laissez vide pour utiliser l'URL automatique basée sur le nom du produit
          </p>
        </div>
      </div>

      {/* Guide après-achat */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Guide après-achat
        </h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Instructions utiles que les clients verront après l'achat
          </label>
          <textarea
            value={formData.post_purchase_instructions || ''}
            onChange={(e) => handleInputChange('post_purchase_instructions', e.target.value)}
            placeholder="Félicitations pour votre achat ! Voici comment commencer :&#10;1. Téléchargez tous les fichiers&#10;2. Commencez par le guide de démarrage rapide&#10;3. Rejoignez notre groupe privé Facebook pour le support"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-theme-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      {/* Protection des fichiers */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2 text-theme-primary" />
          Protection des fichiers
        </h3>
        
        <div className="space-y-4">
          <Checkbox
            id="watermarkFiles"
            label="Ajoutez des filigranes à vos fichiers"
            description="Ajoutez automatiquement des filigranes avec les détails du client pour décourager le partage non autorisé (Nous nous en chargeons pour vous)"
            checked={formData.add_watermarks || false}
            onChange={(e) => handleInputChange('add_watermarks', e.target.checked)}
          />
        </div>
      </div>



      {/* Paramètres de visibilité */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
          <Eye className="w-5 h-5 mr-2 text-theme-primary" />
          Paramètres de visibilité
        </h3>
        
        <div className="space-y-4">
          <Checkbox
            id="isActive"
            label="Produit publié et visible dans la boutique"
            checked={formData.isActive !== false}
            onChange={(e) => handleInputChange('isActive', e.target.checked)}
          />

          <Checkbox
            id="hidePurchaseCount"
            label="Masquer le nombre d'achats"
            description="Ne pas afficher le nombre d'achats sur la page produit"
            checked={formData.hide_purchases_count || false}
            onChange={(e) => handleInputChange('hide_purchases_count', e.target.checked)}
          />
        </div>
      </div>

      {/* Métadonnées */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Métadonnées
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              SKU (Référence produit)
            </label>
            <Input
              value={formData.sku || ''}
              onChange={(e) => handleInputChange('sku', e.target.value)}
              placeholder="PERTE-POIDS-30J"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tags (séparés par des virgules)
            </label>
            <Input
              value={formData.tags || ''}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              placeholder="perte de poids, santé, bien-être, nutrition"
            />
          </div>
        </div>
      </div>

      {/* Bouton d'enregistrement */}
      <div className="mt-8 flex justify-end">
        <Button
          onClick={async () => {
            if (onSave) {
              setIsSaving(true);
              try {
                await onSave();
              } finally {
                setIsSaving(false);
              }
            }
          }}
          icon={Save}
          disabled={isSaving}
        >
          {isSaving ? 'Sauvegarde en cours...' : 'Enregistrer les détails'}
        </Button>
      </div>
    </div>
  );
};