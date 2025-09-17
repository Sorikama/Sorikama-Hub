import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '../../ui/Button';

interface FAQModalProps {
  isOpen: boolean;
  onClose: () => void;
  faqItems: any[];
  onSave: (items: any[]) => void;
  editingIndex?: number;
}

export const FAQModal: React.FC<FAQModalProps> = ({
  isOpen,
  onClose,
  faqItems,
  onSave,
  editingIndex
}) => {
  const [items, setItems] = useState<any[]>([]);
  const [currentItem, setCurrentItem] = useState<any>(null);

  useEffect(() => {
    setItems([...faqItems]);
    if (editingIndex !== undefined && faqItems[editingIndex]) {
      setCurrentItem({ ...faqItems[editingIndex] });
    } else {
      setCurrentItem(null);
    }
  }, [faqItems, editingIndex, isOpen]);

  const addFAQItem = () => {
    const newItem = {
      id: Date.now().toString(),
      question: '',
      answer: ''
    };
    
    setItems([...items, newItem]);
    setCurrentItem(newItem);
  };

  const updateFAQItem = (field: string, value: string) => {
    if (!currentItem) return;
    
    const updatedItem = { ...currentItem, [field]: value };
    setCurrentItem(updatedItem);
    
    const updatedItems = items.map(item => 
      item.id === currentItem.id ? updatedItem : item
    );
    
    setItems(updatedItems);
  };

  const removeFAQItem = (id: string) => {
    const updatedItems = items.filter(item => item.id !== id);
    setItems(updatedItems);
    
    if (currentItem && currentItem.id === id) {
      setCurrentItem(updatedItems.length > 0 ? updatedItems[0] : null);
    }
  };

  const moveItem = (id: string, direction: 'up' | 'down') => {
    const index = items.findIndex(item => item.id === id);
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === items.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updatedItems = [...items];
    const [movedItem] = updatedItems.splice(index, 1);
    updatedItems.splice(newIndex, 0, movedItem);
    
    setItems(updatedItems);
  };

  const handleSave = () => {
    onSave(items);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Gestion des questions fréquentes (FAQ)
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Liste des questions */}
          <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 overflow-y-auto p-4">
            <Button
              onClick={addFAQItem}
              variant="secondary"
              icon={Plus}
              className="w-full mb-4"
            >
              Ajouter une question
            </Button>
            
            <div className="space-y-2">
              {items.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>Aucune question configurée</p>
                  <p className="text-sm">Cliquez sur "Ajouter une question" pour commencer</p>
                </div>
              ) : (
                items.map((item, index) => (
                  <div 
                    key={item.id} 
                    className={`p-3 rounded-lg cursor-pointer ${
                      currentItem && currentItem.id === item.id 
                        ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 border border-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div 
                        className="flex-1 font-medium text-gray-900 dark:text-white truncate"
                        onClick={() => setCurrentItem(item)}
                      >
                        {item.question || `Question ${index + 1}`}
                      </div>
                      <div className="flex space-x-1 ml-2">
                        <button
                          onClick={() => moveItem(item.id, 'up')}
                          disabled={index === 0}
                          className={`p-1 rounded ${index === 0 ? 'text-gray-300 dark:text-gray-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                          title="Déplacer vers le haut"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => moveItem(item.id, 'down')}
                          disabled={index === items.length - 1}
                          className={`p-1 rounded ${index === items.length - 1 ? 'text-gray-300 dark:text-gray-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                          title="Déplacer vers le bas"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeFAQItem(item.id)}
                          className="p-1 rounded text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <p 
                      className="text-xs text-gray-500 dark:text-gray-400 truncate"
                      onClick={() => setCurrentItem(item)}
                    >
                      {item.answer ? 
                        (item.answer.length > 60 ? item.answer.substring(0, 60) + '...' : item.answer) : 
                        'Aucune réponse'}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Édition de la question sélectionnée */}
          <div className="w-2/3 p-4 overflow-y-auto">
            {currentItem ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Question
                  </label>
                  <input
                    type="text"
                    value={currentItem.question}
                    onChange={(e) => updateFAQItem('question', e.target.value)}
                    placeholder="Ex: Comment puis-je accéder au contenu après l'achat ?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Réponse
                  </label>
                  <textarea
                    value={currentItem.answer}
                    onChange={(e) => updateFAQItem('answer', e.target.value)}
                    placeholder="Ex: Après votre achat, vous recevrez un email avec les instructions d'accès..."
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                {/* Aperçu de la FAQ */}
                <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Aperçu
                  </h4>
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="mb-2 font-medium text-gray-900 dark:text-white">
                      {currentItem.question || 'Votre question apparaîtra ici'}
                    </div>
                    <div className="text-gray-700 dark:text-gray-300 text-sm">
                      {currentItem.answer || 'Votre réponse apparaîtra ici'}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <p>Aucune question sélectionnée</p>
                  <p className="text-sm">Sélectionnez une question existante ou créez-en une nouvelle</p>
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
