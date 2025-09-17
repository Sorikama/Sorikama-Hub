import React, { useState } from 'react';
import { Upload, File, Trash2, Download, Save } from 'lucide-react';
import { Button } from '../../ui/Button';

interface ProductFilesTabProps {
  formData: any;
  onChange: (data: any) => void;
  onSave?: () => Promise<void>;
}

export const ProductFilesTab: React.FC<ProductFilesTabProps> = ({
  formData,
  onChange,
  onSave
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const handleInputChange = (field: string, value: any) => {
    onChange({ [field]: value });
  };

  const mockFiles = [
    { id: '1', name: 'Formation-React-Module-1.pdf', size: '2.5 MB', type: 'PDF' },
    { id: '2', name: 'Code-Source-Projet.zip', size: '15.2 MB', type: 'ZIP' },
    { id: '3', name: 'Bonus-Checklist.docx', size: '1.1 MB', type: 'DOCX' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Fichiers du produit
        </h3>
        
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-theme-primary transition-colors cursor-pointer mb-6">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Glissez-déposez vos fichiers ici
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            ou cliquez pour sélectionner des fichiers
          </p>
          <div className="text-xs text-gray-500 dark:text-gray-500">
            <p>Formats supportés: PDF, ZIP, DOCX, MP4, MP3, EPUB</p>
            <p>Taille maximale par fichier: 100 MB</p>
          </div>
        </div>

        {/* Liste des fichiers */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 dark:text-white">
            Fichiers téléchargés ({mockFiles.length})
          </h4>
          
          {mockFiles.map((file) => (
            <div key={file.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center">
                <File className="w-8 h-8 text-theme-primary mr-3" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {file.type} • {file.size}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-theme-primary transition-colors">
                  <Download className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Paramètres de téléchargement
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Limite de téléchargements par achat
            </label>
            <select
              value={formData.downloadLimit || 'unlimited'}
              onChange={(e) => handleInputChange('downloadLimit', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-theme-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="unlimited">Illimité</option>
              <option value="1">1 téléchargement</option>
              <option value="3">3 téléchargements</option>
              <option value="5">5 téléchargements</option>
              <option value="10">10 téléchargements</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Durée de validité du lien (en jours)
            </label>
            <select
              value={formData.linkExpiry || '30'}
              onChange={(e) => handleInputChange('linkExpiry', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-theme-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="1">1 jour</option>
              <option value="7">7 jours</option>
              <option value="30">30 jours</option>
              <option value="90">90 jours</option>
              <option value="365">1 an</option>
              <option value="unlimited">Permanent</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="requireLogin"
              checked={formData.requireLogin || false}
              onChange={(e) => handleInputChange('requireLogin', e.target.checked)}
              className="h-4 w-4 text-theme-primary focus:ring-theme-primary border-gray-300 rounded"
            />
            <label htmlFor="requireLogin" className="ml-2 block text-sm text-gray-900 dark:text-white">
              Exiger une connexion pour télécharger
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="watermark"
              checked={formData.watermark || false}
              onChange={(e) => handleInputChange('watermark', e.target.checked)}
              className="h-4 w-4 text-theme-primary focus:ring-theme-primary border-gray-300 rounded"
            />
            <label htmlFor="watermark" className="ml-2 block text-sm text-gray-900 dark:text-white">
              Ajouter un filigrane avec l'email de l'acheteur
            </label>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Instructions de téléchargement
        </h3>
        
        <textarea
          value={formData.downloadInstructions || ''}
          onChange={(e) => handleInputChange('downloadInstructions', e.target.value)}
          placeholder="Instructions spéciales pour vos clients concernant l'utilisation des fichiers..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-theme-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Ces instructions seront affichées sur la page de téléchargement.
        </p>
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
          {isSaving ? 'Sauvegarde en cours...' : 'Enregistrer les fichiers'}
        </Button>
      </div>
    </div>
  );
};