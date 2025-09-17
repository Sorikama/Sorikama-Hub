import React, { useState, useEffect } from 'react';
import { X, Trash2, Video, FileText, Link, HelpCircle, Clock } from 'lucide-react';
import { Button } from '../../ui/Button';

interface CourseStructureModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'module' | 'chapter' | 'lesson';
  item: any;
  path: {
    moduleIndex?: number;
    chapterIndex?: number;
    lessonIndex?: number;
  };
  courseStructure: any;
  onSave: (updatedStructure: any) => void;
}

export const CourseStructureModal: React.FC<CourseStructureModalProps> = ({
  isOpen,
  onClose,
  type,
  item,
  path,
  courseStructure,
  onSave
}) => {
  console.log('CourseStructureModal rendered with props:', { isOpen, type, path, courseStructure });
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (item) {
      setFormData({ ...item });
    } else {
      // Initialiser avec des valeurs par défaut selon le type
      if (type === 'module') {
        setFormData({
          id: Date.now().toString(),
          title: '',
          description: '',
          chapters: []
        });
      } else if (type === 'chapter') {
        setFormData({
          id: Date.now().toString(),
          title: '',
          description: '',
          lessons: []
        });
      } else if (type === 'lesson') {
        setFormData({
          id: Date.now().toString(),
          title: '',
          type: 'video',
          content: '',
          duration: 0,
          isPreview: false
        });
      }
    }
    setErrors({});
  }, [isOpen, type, item]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
    
    // Effacer l'erreur lorsque l'utilisateur commence à taper
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis';
    }

    if (type === 'lesson') {
      if (formData.type === 'video' && !formData.content.trim()) {
        newErrors.content = 'Le lien de la vidéo est requis';
      }
      
      if (formData.type === 'link' && !formData.content.trim()) {
        newErrors.content = 'L\'URL est requise';
      }
      
      if (formData.duration < 0) {
        newErrors.duration = 'La durée doit être positive';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const updatedStructure = { ...courseStructure };
    const { moduleIndex, chapterIndex, lessonIndex } = path;

    if (type === 'module') {
      if (moduleIndex !== undefined) {
        // Mise à jour d'un module existant
        updatedStructure.modules[moduleIndex] = {
          ...updatedStructure.modules[moduleIndex],
          title: formData.title,
          description: formData.description
        };
      } else {
        // Ajout d'un nouveau module
        updatedStructure.modules.push({
          ...formData,
          chapters: []
        });
      }
    } else if (type === 'chapter' && moduleIndex !== undefined) {
      if (chapterIndex !== undefined) {
        // Mise à jour d'un chapitre existant
        updatedStructure.modules[moduleIndex].chapters[chapterIndex] = {
          ...updatedStructure.modules[moduleIndex].chapters[chapterIndex],
          title: formData.title,
          description: formData.description
        };
      } else {
        // Ajout d'un nouveau chapitre
        updatedStructure.modules[moduleIndex].chapters.push({
          ...formData,
          lessons: []
        });
      }
    } else if (type === 'lesson' && moduleIndex !== undefined && chapterIndex !== undefined) {
      if (lessonIndex !== undefined) {
        // Mise à jour d'une leçon existante
        updatedStructure.modules[moduleIndex].chapters[chapterIndex].lessons[lessonIndex] = {
          ...formData
        };
      } else {
        // Ajout d'une nouvelle leçon
        updatedStructure.modules[moduleIndex].chapters[chapterIndex].lessons.push({
          ...formData
        });
      }
    }

    onSave(updatedStructure);
    onClose();
  };

  const handleDelete = () => {
    const updatedStructure = { ...courseStructure };
    const { moduleIndex, chapterIndex, lessonIndex } = path;

    if (type === 'module' && moduleIndex !== undefined) {
      updatedStructure.modules.splice(moduleIndex, 1);
    } else if (type === 'chapter' && moduleIndex !== undefined && chapterIndex !== undefined) {
      updatedStructure.modules[moduleIndex].chapters.splice(chapterIndex, 1);
    } else if (type === 'lesson' && moduleIndex !== undefined && chapterIndex !== undefined && lessonIndex !== undefined) {
      updatedStructure.modules[moduleIndex].chapters[chapterIndex].lessons.splice(lessonIndex, 1);
    }

    onSave(updatedStructure);
    onClose();
  };

  const getModalTitle = () => {
    const action = item ? 'Modifier' : 'Ajouter';
    
    if (type === 'module') {
      return `${action} un module`;
    } else if (type === 'chapter') {
      return `${action} un chapitre`;
    } else {
      return `${action} une leçon`;
    }
  };

  console.log('Modal rendering decision:', { isOpen });
  if (!isOpen) {
    console.log('Modal not rendering because isOpen is false');
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {getModalTitle()}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {/* Titre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Titre *
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder={`Titre du ${type === 'module' ? 'module' : type === 'chapter' ? 'chapitre' : 'leçon'}`}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white ${
                  errors.title 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
              )}
            </div>

            {/* Description (pour module et chapitre) */}
            {(type === 'module' || type === 'chapter') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder={`Description du ${type === 'module' ? 'module' : 'chapitre'}`}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>
            )}

            {/* Champs spécifiques pour les leçons */}
            {type === 'lesson' && (
              <>
                {/* Type de leçon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type de leçon *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {[
                      { value: 'video', label: 'Vidéo', icon: Video },
                      { value: 'text', label: 'Texte', icon: FileText },
                      { value: 'link', label: 'Lien', icon: Link },
                      { value: 'quiz', label: 'Quiz', icon: HelpCircle },
                      { value: 'assignment', label: 'Devoir', icon: FileText }
                    ].map((lessonType) => {
                      const Icon = lessonType.icon;
                      return (
                        <div
                          key={lessonType.value}
                          onClick={() => handleInputChange('type', lessonType.value)}
                          className={`cursor-pointer rounded-lg border-2 p-3 transition-all duration-200 flex flex-col items-center ${
                            formData.type === lessonType.value
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                          }`}
                        >
                          <Icon className={`w-5 h-5 mb-1 ${
                            formData.type === lessonType.value
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-gray-600 dark:text-gray-400'
                          }`} />
                          <span className={`text-xs font-medium ${
                            formData.type === lessonType.value
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {lessonType.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Contenu de la leçon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {formData.type === 'video' ? 'URL de la vidéo *' : 
                     formData.type === 'link' ? 'URL externe *' :
                     formData.type === 'text' ? 'Contenu textuel *' :
                     formData.type === 'quiz' ? 'Questions du quiz *' :
                     'Instructions du devoir *'}
                  </label>
                  {formData.type === 'text' || formData.type === 'quiz' || formData.type === 'assignment' ? (
                    <textarea
                      value={formData.content || ''}
                      onChange={(e) => handleInputChange('content', e.target.value)}
                      placeholder={formData.type === 'text' ? 'Contenu de la leçon...' : 
                                   formData.type === 'quiz' ? 'Questions du quiz...' : 
                                   'Instructions du devoir...'}
                      rows={6}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white ${
                        errors.content 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                  ) : (
                    <input
                      type="text"
                      value={formData.content || ''}
                      onChange={(e) => handleInputChange('content', e.target.value)}
                      placeholder={formData.type === 'video' ? 'https://www.youtube.com/watch?v=...' : 'https://...'}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white ${
                        errors.content 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                  )}
                  {errors.content && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.content}</p>
                  )}
                </div>

                {/* Durée de la leçon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Durée (en minutes)
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={formData.duration || 0}
                      onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
                      min="0"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white ${
                        errors.duration 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                    <Clock className="w-5 h-5 text-gray-400 ml-2" />
                  </div>
                  {errors.duration && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.duration}</p>
                  )}
                </div>

                {/* Option d'aperçu */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPreview"
                    checked={formData.isPreview || false}
                    onChange={(e) => handleInputChange('isPreview', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPreview" className="ml-2 block text-sm text-gray-900 dark:text-white">
                    Disponible en aperçu gratuit
                  </label>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex justify-between p-4 border-t border-gray-200 dark:border-gray-700">
          {item && (
            <Button
              onClick={handleDelete}
              variant="danger"
              icon={Trash2}
            >
              Supprimer
            </Button>
          )}
          <div className="flex space-x-3 ml-auto">
            <Button
              onClick={onClose}
              variant="secondary"
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
    </div>
  );
};
