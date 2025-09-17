import React, { useState } from 'react';
import { Plus, Edit, ChevronDown, ChevronUp, Save } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Product } from '../../../types';
import { FAQModal } from '../modals/FAQModal';

interface ProductFAQTabProps {
  product: Product;
  formData: any;
  onChange: (data: any) => void;
  onSave?: () => Promise<void>;
}

export const ProductFAQTab: React.FC<ProductFAQTabProps> = ({
  formData,
  onChange,
  onSave
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const faqItems = formData.faq || [];
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
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

  const handleSaveFAQ = (items: any[]) => {
    onChange({ faq: items });
  };

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Questions fréquemment posées (FAQ)
          </h3>
          <Button
            onClick={() => handleOpenModal()}
            variant="secondary"
            icon={Edit}
            size="sm"
          >
            Gérer les questions
          </Button>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Anticipez les questions de vos clients pour réduire les demandes de support.
        </p>

        {/* Résumé des FAQ */}
        <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 mb-4">
          {faqItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>Aucune question fréquente configurée</p>
              <p className="text-sm">Ajoutez des questions pour aider vos clients</p>
            </div>
          ) : (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Questions configurées ({faqItems.length})
              </h4>
              <div className="space-y-2">
                {faqItems.map((item: any, index: number) => (
                  <div 
                    key={item.id} 
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer"
                    onClick={() => handleOpenModal(index)}
                  >
                    <div className="flex-1 mr-2">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {item.question || `Question ${index + 1}`}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {item.answer ? 
                          (item.answer.length > 60 ? item.answer.substring(0, 60) + '...' : item.answer) : 
                          'Aucune réponse'}
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
                  Ajouter une question
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Aperçu de la FAQ
        </h3>
        
        <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 bg-gray-50 dark:bg-gray-700">
          <h4 className="font-medium text-gray-900 dark:text-white mb-4">
            Questions fréquemment posées
          </h4>
          
          {faqItems.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Les questions fréquentes apparaîtront ici
            </p>
          ) : (
            <div className="space-y-3">
              {faqItems.map((item: any, index: number) => (
                <div key={item.id} className="border border-gray-200 dark:border-gray-600 rounded-lg">
                  <button
                    onClick={() => toggleExpanded(item.id)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <span className="font-medium text-gray-900 dark:text-white">
                      {item.question || `Question ${index + 1}`}
                    </span>
                    {expandedItems.includes(item.id) ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                  
                  {expandedItems.includes(item.id) && (
                    <div className="px-4 pb-4">
                      <p className="text-gray-600 dark:text-gray-400">
                        {item.answer || 'Réponse à la question...'}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Paramètres d'affichage
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showFAQOnProductPage"
              checked={formData.showFAQOnProductPage !== false}
              onChange={(e) => onChange({ showFAQOnProductPage: e.target.checked })}
              className="h-4 w-4 text-theme-primary focus:ring-theme-primary border-gray-300 rounded"
            />
            <label htmlFor="showFAQOnProductPage" className="ml-2 block text-sm text-gray-900 dark:text-white">
              Afficher la FAQ sur la page produit
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="expandFirstFAQ"
              checked={formData.expandFirstFAQ || false}
              onChange={(e) => onChange({ expandFirstFAQ: e.target.checked })}
              className="h-4 w-4 text-theme-primary focus:ring-theme-primary border-gray-300 rounded"
            />
            <label htmlFor="expandFirstFAQ" className="ml-2 block text-sm text-gray-900 dark:text-white">
              Développer automatiquement la première question
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Position de la FAQ sur la page
            </label>
            <select
              value={formData.faqPosition || 'bottom'}
              onChange={(e) => onChange({ faqPosition: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-theme-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="top">En haut de la page</option>
              <option value="middle">Au milieu de la page</option>
              <option value="bottom">En bas de la page</option>
            </select>
          </div>
        </div>
      </div>
      {/* Modal pour la gestion des FAQ */}
      <FAQModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        faqItems={faqItems}
        onSave={handleSaveFAQ}
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
          {isSaving ? 'Sauvegarde en cours...' : 'Enregistrer la FAQ'}
        </Button>
      </div>
    </div>
  );
};