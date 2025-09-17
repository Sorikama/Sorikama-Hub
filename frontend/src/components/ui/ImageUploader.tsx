import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import uploadService from '../../services/uploadService';

interface ImageUploaderProps {
  onImageSelect: (imageUrl: string) => void;
  onImageRemove?: () => void;
  currentImageUrl?: string;
  maxSizeInMB?: number;
  acceptedFormats?: string[];
  className?: string;
  label?: string;
  uploadType?: 'store-logo' | 'store-cover' | 'product-image' | 'base64';
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelect,
  onImageRemove,
  currentImageUrl,
  maxSizeInMB = 2,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  className = '',
  label = 'Télécharger une image',
  uploadType = 'base64'
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialiser la prévisualisation avec l'URL actuelle
  useEffect(() => {
    if (currentImageUrl) {
      // Si c'est une URL de base64, l'utiliser directement
      if (uploadService.isBase64Image(currentImageUrl)) {
        setPreviewUrl(currentImageUrl);
      } else {
        // Sinon, c'est une URL relative ou absolue
        setPreviewUrl(uploadService.getFullUrl(currentImageUrl));
      }
    } else {
      setPreviewUrl(null);
    }
  }, [currentImageUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier la taille du fichier
    if (file.size > maxSizeInMB * 1024 * 1024) {
      setError(`La taille du fichier dépasse ${maxSizeInMB}MB`);
      return;
    }

    // Vérifier le format du fichier
    if (!acceptedFormats.includes(file.type)) {
      setError(`Format non supporté. Formats acceptés: ${acceptedFormats.map(format => format.split('/')[1]).join(', ')}`);
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      // Créer une URL pour la prévisualisation immédiate
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Selon le type de téléchargement, utiliser différentes méthodes
      let imageUrl: string;
      
      switch (uploadType) {
        case 'store-logo':
          imageUrl = await uploadService.uploadStoreLogo(file);
          break;
        case 'store-cover':
          imageUrl = await uploadService.uploadStoreCover(file);
          break;
        case 'product-image':
          imageUrl = await uploadService.uploadProductImage(file);
          break;
        case 'base64':
        default:
          // Convertir en base64
          imageUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
          break;
      }

      // Appeler le callback avec l'URL de l'image
      onImageSelect(imageUrl);
    } catch (err: any) {
      console.error('Erreur lors du téléchargement de l\'image:', err);
      setError(err.message || 'Erreur lors du téléchargement');
      // Réinitialiser la prévisualisation en cas d'erreur
      if (currentImageUrl) {
        setPreviewUrl(uploadService.isBase64Image(currentImageUrl) ? 
          currentImageUrl : uploadService.getFullUrl(currentImageUrl));
      } else {
        setPreviewUrl(null);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onImageRemove) {
      onImageRemove();
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex flex-col items-center">
        {previewUrl ? (
          <div className="relative w-full max-w-xs">
            <img 
              src={previewUrl} 
              alt="Aperçu" 
              className="w-full h-auto rounded-lg object-cover shadow-sm border border-gray-200 dark:border-gray-700"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              title="Supprimer l'image"
            >
              <X size={16} />
            </button>
            {isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                <div className="flex flex-col items-center text-white">
                  <RefreshCw className="w-6 h-6 animate-spin mb-2" />
                  <div>Téléchargement...</div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div 
            onClick={triggerFileInput}
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 w-full max-w-xs flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 transition-colors"
          >
            <Upload className="w-10 h-10 text-gray-400 dark:text-gray-500 mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-300">{label}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Max: {maxSizeInMB}MB. Formats: {acceptedFormats.map(format => format.split('/')[1]).join(', ')}
            </p>
            {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
          </div>
        )}
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={acceptedFormats.join(',')}
          className="hidden"
        />
        
        {!previewUrl && (
          <Button
            type="button"
            variant="secondary"
            onClick={triggerFileInput}
            className="mt-3"
          >
            Parcourir
          </Button>
        )}
        {previewUrl && (
          <Button
            type="button"
            variant="secondary"
            onClick={triggerFileInput}
            className="mt-3"
          >
            Changer l'image
          </Button>
        )}
      </div>
    </div>
  );
};
