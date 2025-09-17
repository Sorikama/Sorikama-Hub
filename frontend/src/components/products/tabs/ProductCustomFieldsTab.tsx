import React, { useState } from 'react';
import { Plus, Edit, Save } from 'lucide-react';
import { Button } from '../../ui/Button';
import { CustomFieldModal } from '../modals/CustomFieldModal';

interface ProductCustomFieldsTabProps {
  formData: any;
  onChange: (data: any) => void;
  onSave?: () => Promise<void>;
}

export const ProductCustomFieldsTab: React.FC<ProductCustomFieldsTabProps> = ({
  formData,
  onChange,
  onSave
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const customFields = formData.customFields || [];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | undefined>(undefined);

  const handleOpenModal = (index?: number) => {
    setEditingIndex(index);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingIndex(undefined);
  };

  const handleSaveFields = (fields: any[]) => {
    onChange({ customFields: fields });
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Champs personnalisés
          </h3>
          <Button
            onClick={() => handleOpenModal()}
            variant="secondary"
            icon={Edit}
            size="sm"
          >
            Gérer les champs
          </Button>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Collectez des informations supplémentaires de vos clients lors de l'achat.
        </p>

        {/* Résumé des champs personnalisés */}
        <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 mb-4">
          {customFields.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>Aucun champ personnalisé configuré</p>
              <p className="text-sm">Ajoutez des champs pour collecter des informations supplémentaires</p>
            </div>
          ) : (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Champs configurés ({customFields.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {customFields.map((field: any, index: number) => (
                  <div 
                    key={field.id} 
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer"
                    onClick={() => handleOpenModal(index)}
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {field.label || 'Champ sans titre'} {field.required && <span className="text-red-500">*</span>}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Type: {field.type === 'text' ? 'Texte court' : 
                              field.type === 'textarea' ? 'Texte long' : 
                              field.type === 'email' ? 'Email' : 
                              field.type === 'select' ? 'Liste déroulante' : 
                              field.type === 'checkbox' ? 'Cases à cocher' : 
                              field.type === 'radio' ? 'Choix unique' : 
                              field.type === 'date' ? 'Date' : 
                              field.type === 'number' ? 'Nombre' : 
                              field.type}
                      </p>
                    </div>
                    <Edit className="w-4 h-4 text-gray-400" />
                  </div>
                ))}
              </div>
              <div className="flex justify-center mt-4">
                <Button
                  onClick={() => handleOpenModal()}
                  variant="secondary"
                  icon={Plus}
                  size="sm"
                >
                  Ajouter un champ
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Aperçu du formulaire
        </h3>
        
        <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 bg-gray-50 dark:bg-gray-700">
          <h4 className="font-medium text-gray-900 dark:text-white mb-4">
            Informations supplémentaires
          </h4>
          
          {customFields.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Les champs personnalisés apparaîtront ici
            </p>
          ) : (
            <div className="space-y-4">
              {customFields.map((field: any) => (
                <div key={field.id}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  
                  {field.type === 'textarea' ? (
                    <textarea
                      placeholder={field.placeholder}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-theme-primary"
                      disabled
                    />
                  ) : field.type === 'select' ? (
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-theme-primary" disabled>
                      <option>{field.placeholder || 'Sélectionner une option'}</option>
                      {field.options?.map((option: string, i: number) => (
                        <option key={i} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : field.type === 'checkbox' ? (
                    <div className="space-y-2">
                      {(field.options || []).length > 0 ? (
                        field.options.map((option: string, i: number) => (
                          <div key={i} className="flex items-center">
                            <input
                              type="checkbox"
                              disabled
                              className="h-4 w-4 text-theme-primary focus:ring-theme-primary border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                              {option}
                            </label>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Aucune option définie
                        </div>
                      )}
                    </div>
                  ) : field.type === 'radio' ? (
                    <div className="space-y-2">
                      {(field.options || []).length > 0 ? (
                        field.options.map((option: string, i: number) => (
                          <div key={i} className="flex items-center">
                            <input
                              type="radio"
                              disabled
                              className="h-4 w-4 text-theme-primary focus:ring-theme-primary border-gray-300"
                            />
                            <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                              {option}
                            </label>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Aucune option définie
                        </div>
                      )}
                    </div>
                  ) : (
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-theme-primary"
                      disabled
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal pour la gestion des champs personnalisés */}
      <CustomFieldModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        customFields={customFields}
        onSave={handleSaveFields}
        editingIndex={editingIndex}
      />

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
          {isSaving ? 'Sauvegarde en cours...' : 'Enregistrer les champs personnalisés'}
        </Button>
      </div>
    </div>
  );
};