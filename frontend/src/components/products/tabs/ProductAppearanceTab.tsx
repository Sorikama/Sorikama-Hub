import React, { useState } from 'react';
import { Upload, Image as ImageIcon, Video, Trash2, Plus, Save } from 'lucide-react';
import { Product } from '../../../types';
import { Button } from '../../ui/Button';

interface ProductAppearanceTabProps {
  product: Product;
  formData: any;
  onChange: (data: any) => void;
  onSave?: () => Promise<void>;
}

export const ProductAppearanceTab: React.FC<ProductAppearanceTabProps> = ({
  formData,
  onChange,
  onSave
}) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    onChange({ [field]: value });
  };

  const mockImages = formData.images || [];

  const addImage = () => {
    const newImages = [...mockImages, {
      id: Date.now().toString(),
      url: '',
      alt: '',
      isCover: mockImages.length === 0
    }];
    handleInputChange('images', newImages);
  };

  const removeImage = (index: number) => {
    const newImages = mockImages.filter((_: any, i: number) => i !== index);
    // Si on supprime l'image de couverture, faire de la première image la nouvelle couverture
    if (newImages.length > 0 && mockImages[index]?.isCover) {
      newImages[0].isCover = true;
    }
    handleInputChange('images', newImages);
  };

  const setCoverImage = (index: number) => {
    const newImages = mockImages.map((img: any, i: number) => ({
      ...img,
      isCover: i === index
    }));
    handleInputChange('images', newImages);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Personnaliser la page produit
        </h3>
        
        <div className="space-y-6">
          {/* Image de couverture */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ajouter une vignette *
            </label>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Créez une vignette mémorable qui représente votre produit. Utilisez une image carrée (minimum 600x600px) au format JPG ou PNG pour de meilleurs résultats.
            </p>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-theme-primary transition-colors cursor-pointer">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Cliquez pour télécharger une vignette
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                PNG, JPG jusqu'à 5MB - Recommandé: 600x600px (carré)
              </p>
            </div>
          </div>

          {/* Bannière */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ajouter une bannière
            </label>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Créez une bannière attrayante qui met en valeur votre produit. Utilisez une image rectangulaire de haute qualité (minimum 702x260px) au format JPG ou PNG pour de meilleurs résultats.
            </p>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-theme-primary transition-colors cursor-pointer">
              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Cliquez pour télécharger une bannière
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                PNG, JPG jusqu'à 5MB - Recommandé: 702x260px (rectangulaire)
              </p>
            </div>
          </div>

          {/* Galerie d'images */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Galerie d'images du produit
              </label>
              <button
                onClick={addImage}
                className="flex items-center text-sm text-theme-primary hover:text-theme-secondary"
              >
                <Plus className="w-4 h-4 mr-1" />
                Ajouter une image
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Ajoutez jusqu'à 10 images pour présenter votre produit sous différents angles.
            </p>

            {mockImages.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Aucune image ajoutée
                </p>
                <button
                  onClick={addImage}
                  className="text-theme-primary hover:text-theme-secondary text-sm font-medium"
                >
                  Ajouter votre première image
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {mockImages.map((image: any, index: number) => (
                  <div key={image.id} className="relative group">
                    <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    
                    {/* Badge image de couverture */}
                    {image.isCover && (
                      <div className="absolute top-2 left-2 bg-theme-primary text-white text-xs px-2 py-1 rounded">
                        Couverture
                      </div>
                    )}
                    
                    {/* Actions */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex space-x-1">
                        {!image.isCover && (
                          <button
                            onClick={() => setCoverImage(index)}
                            className="bg-white dark:bg-gray-800 p-1 rounded shadow text-xs text-theme-primary hover:text-theme-secondary"
                            title="Définir comme couverture"
                          >
                            ★
                          </button>
                        )}
                        <button
                          onClick={() => removeImage(index)}
                          className="bg-white dark:bg-gray-800 p-1 rounded shadow text-red-600 hover:text-red-700"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <input
                        type="text"
                        placeholder="Texte alternatif"
                        value={image.alt || ''}
                        onChange={(e) => {
                          const newImages = [...mockImages];
                          newImages[index].alt = e.target.value;
                          handleInputChange('images', newImages);
                        }}
                        className="w-full text-xs px-2 py-1 border border-gray-300 rounded dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-theme-primary focus:border-theme-primary"
                      />
                    </div>
                  </div>
                ))}
                
                {/* Bouton d'ajout */}
                {mockImages.length < 10 && (
                  <div
                    onClick={addImage}
                    className="aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-theme-primary transition-colors"
                  >
                    <div className="text-center">
                      <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-xs text-gray-500 dark:text-gray-400">Ajouter</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Vidéo de présentation */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
          <Video className="w-5 h-5 mr-2 text-theme-primary" />
          Vidéo de présentation
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              URL de la vidéo (YouTube, Vimeo)
            </label>
            <input
              type="url"
              value={formData.videoUrl || ''}
              onChange={(e) => handleInputChange('videoUrl', e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-theme-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Une vidéo de présentation augmente significativement les conversions.
            </p>
          </div>
        </div>
      </div>

      {/* Couleurs et style */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Couleurs et style
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Couleur principale
            </label>
            <div className="mb-2">
              <div className="grid grid-cols-8 gap-2 mb-3">
                {[
                  '#3B82F6', // Bleu
                  '#EF4444', // Rouge
                  '#10B981', // Vert
                  '#F59E0B', // Orange
                  '#8B5CF6', // Violet
                  '#EC4899', // Rose
                  '#06B6D4', // Cyan
                  '#6366F1', // Indigo
                  '#000000', // Noir
                  '#4B5563', // Gris foncé
                  '#9CA3AF', // Gris moyen
                  '#E5E7EB', // Gris clair
                  '#FFFFFF', // Blanc
                  '#F472B6', // Rose clair
                  '#34D399', // Vert clair
                  '#FBBF24'  // Jaune
                ].map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 ${formData.primaryColor === color ? 'border-gray-900 dark:border-white ring-2 ring-offset-2 ring-gray-300' : 'border-gray-200 dark:border-gray-700'}`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleInputChange('primaryColor', color)}
                    aria-label={`Couleur ${color}`}
                  />
                ))}
              </div>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-10 h-10 rounded border border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: formData.primaryColor || '#3B82F6' }}
                />
                <input
                  type="text"
                  value={formData.primaryColor || '#3B82F6'}
                  onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-theme-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
                <input
                  type="color"
                  value={formData.primaryColor || '#3B82F6'}
                  onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                  className="w-10 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                  title="Sélectionner une couleur personnalisée"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Couleur secondaire
            </label>
            <div className="mb-2">
              <div className="grid grid-cols-8 gap-2 mb-3">
                {[
                  '#1E40AF', // Bleu foncé
                  '#991B1B', // Rouge foncé
                  '#065F46', // Vert foncé
                  '#B45309', // Orange foncé
                  '#5B21B6', // Violet foncé
                  '#9D174D', // Rose foncé
                  '#0E7490', // Cyan foncé
                  '#4338CA', // Indigo foncé
                  '#1F2937', // Gris très foncé
                  '#374151', // Gris foncé
                  '#6B7280', // Gris moyen
                  '#D1D5DB', // Gris clair
                  '#F3F4F6', // Gris très clair
                  '#BE185D', // Rose moyen
                  '#047857', // Vert moyen
                  '#D97706'  // Jaune foncé
                ].map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 ${formData.secondaryColor === color ? 'border-gray-900 dark:border-white ring-2 ring-offset-2 ring-gray-300' : 'border-gray-200 dark:border-gray-700'}`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleInputChange('secondaryColor', color)}
                    aria-label={`Couleur ${color}`}
                  />
                ))}
              </div>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-10 h-10 rounded border border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: formData.secondaryColor || '#1E40AF' }}
                />
                <input
                  type="text"
                  value={formData.secondaryColor || '#1E40AF'}
                  onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-theme-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
                <input
                  type="color"
                  value={formData.secondaryColor || '#1E40AF'}
                  onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                  className="w-10 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                  title="Sélectionner une couleur personnalisée"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Style de bouton
            </label>
            <select
              value={formData.buttonStyle || 'rounded'}
              onChange={(e) => handleInputChange('buttonStyle', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-theme-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="rounded">Arrondi</option>
              <option value="square">Carré</option>
              <option value="pill">Pilule</option>
            </select>
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
          {isSaving ? 'Sauvegarde en cours...' : 'Enregistrer l\'apparence'}
        </Button>
      </div>
    </div>
  );
};