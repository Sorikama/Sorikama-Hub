import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Button } from '../../ui/Button';

interface CustomFieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  customFields: any[];
  onSave: (fields: any[]) => void;
  editingIndex?: number;
}

export const CustomFieldModal: React.FC<CustomFieldModalProps> = ({
  isOpen,
  onClose,
  customFields,
  onSave,
  editingIndex
}) => {
  const [fields, setFields] = useState<any[]>([]);
  const [currentField, setCurrentField] = useState<any>(null);

  useEffect(() => {
    setFields([...customFields]);
    if (editingIndex !== undefined && customFields[editingIndex]) {
      setCurrentField({ ...customFields[editingIndex] });
    } else {
      setCurrentField(null);
    }
  }, [customFields, editingIndex, isOpen]);

  const fieldTypes = [
    { value: 'text', label: 'Texte court' },
    { value: 'textarea', label: 'Texte long' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Téléphone' },
    { value: 'select', label: 'Liste déroulante' },
    { value: 'radio', label: 'Choix unique' },
    { value: 'checkbox', label: 'Cases à cocher' },
    { value: 'date', label: 'Date' },
    { value: 'number', label: 'Nombre' }
  ];

  const addField = () => {
    const newField = {
      id: Date.now().toString(),
      type: 'text',
      label: '',
      placeholder: '',
      required: false,
      options: []
    };
    
    setFields([...fields, newField]);
    setCurrentField(newField);
  };

  const updateField = (field: any) => {
    if (!currentField) return;
    
    setCurrentField({ ...currentField, ...field });
    
    const updatedFields = fields.map(f => 
      f.id === currentField.id ? { ...currentField, ...field } : f
    );
    
    setFields(updatedFields);
  };

  const removeField = (id: string) => {
    const updatedFields = fields.filter(f => f.id !== id);
    setFields(updatedFields);
    
    if (currentField && currentField.id === id) {
      setCurrentField(updatedFields.length > 0 ? updatedFields[0] : null);
    }
  };

  const handleSave = () => {
    onSave(fields);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Gestion des champs personnalisés
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Liste des champs */}
          <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 overflow-y-auto p-4">
            <Button
              onClick={addField}
              variant="secondary"
              icon={Plus}
              className="w-full mb-4"
            >
              Ajouter un champ
            </Button>
            
            <div className="space-y-2">
              {fields.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>Aucun champ personnalisé</p>
                  <p className="text-sm">Cliquez sur "Ajouter un champ" pour commencer</p>
                </div>
              ) : (
                fields.map((field) => (
                  <div 
                    key={field.id} 
                    className={`p-3 rounded-lg cursor-pointer flex items-center justify-between ${
                      currentField && currentField.id === field.id 
                        ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 border border-transparent'
                    }`}
                    onClick={() => setCurrentField(field)}
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {field.label || 'Champ sans titre'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {fieldTypes.find(t => t.value === field.type)?.label || field.type}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeField(field.id);
                      }}
                      className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Édition du champ sélectionné */}
          <div className="w-2/3 p-4 overflow-y-auto">
            {currentField ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type de champ
                  </label>
                  <select
                    value={currentField.type}
                    onChange={(e) => updateField({ type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  >
                    {fieldTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Libellé du champ
                  </label>
                  <input
                    type="text"
                    value={currentField.label}
                    onChange={(e) => updateField({ label: e.target.value })}
                    placeholder="Ex: Nom complet, Adresse email..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Texte d'aide (placeholder)
                  </label>
                  <input
                    type="text"
                    value={currentField.placeholder}
                    onChange={(e) => updateField({ placeholder: e.target.value })}
                    placeholder="Ex: Entrez votre nom complet..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="required-field"
                    checked={currentField.required}
                    onChange={(e) => updateField({ required: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="required-field" className="ml-2 block text-sm text-gray-900 dark:text-white">
                    Champ obligatoire
                  </label>
                </div>

                {/* Options pour select, radio, checkbox */}
                {['select', 'radio', 'checkbox'].includes(currentField.type) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Options (une par ligne)
                    </label>
                    <textarea
                      value={(currentField.options || []).join('\n')}
                      onChange={(e) => updateField({ 
                        options: e.target.value.split('\n').filter(opt => opt.trim()) 
                      })}
                      placeholder="Option 1&#10;Option 2&#10;Option 3"
                      rows={5}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Entrez chaque option sur une nouvelle ligne
                    </p>
                  </div>
                )}

                {/* Aperçu du champ */}
                <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Aperçu du champ
                  </h4>
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {currentField.label || 'Libellé du champ'} {currentField.required && <span className="text-red-500">*</span>}
                    </label>
                    
                    {currentField.type === 'textarea' ? (
                      <textarea
                        placeholder={currentField.placeholder}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled
                      />
                    ) : currentField.type === 'select' ? (
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" disabled>
                        <option>{currentField.placeholder || 'Sélectionner une option'}</option>
                        {currentField.options?.map((option: string, i: number) => (
                          <option key={i} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : currentField.type === 'checkbox' ? (
                      <div className="space-y-2">
                        {(currentField.options || []).length > 0 ? (
                          currentField.options.map((option: string, i: number) => (
                            <div key={i} className="flex items-center">
                              <input
                                type="checkbox"
                                disabled
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                {option}
                              </label>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Ajoutez des options pour voir l'aperçu
                          </div>
                        )}
                      </div>
                    ) : currentField.type === 'radio' ? (
                      <div className="space-y-2">
                        {(currentField.options || []).length > 0 ? (
                          currentField.options.map((option: string, i: number) => (
                            <div key={i} className="flex items-center">
                              <input
                                type="radio"
                                disabled
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              />
                              <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                {option}
                              </label>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Ajoutez des options pour voir l'aperçu
                          </div>
                        )}
                      </div>
                    ) : (
                      <input
                        type={currentField.type}
                        placeholder={currentField.placeholder}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled
                      />
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <p>Aucun champ sélectionné</p>
                  <p className="text-sm">Sélectionnez un champ existant ou créez-en un nouveau</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={onClose}
            variant="secondary"
            className="mr-2"
          >
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            variant="primary"
          >
            Enregistrer
          </Button>
        </div>
      </div>
    </div>
  );
};
