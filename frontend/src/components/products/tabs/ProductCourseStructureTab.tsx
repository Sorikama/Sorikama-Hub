import React, { useState } from 'react';
import { Plus, Edit, ChevronDown, ChevronUp, GripVertical, Video, FileText, Link, Clock, Settings, Trash2, Save } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Product } from '../../../types';
import { CourseStructureModal } from '../modals/CourseStructureModal';

interface ProductCourseStructureTabProps {
  product: Product;
  formData: any;
  onChange: (data: any) => void;
  onSave?: () => Promise<void>;
}

interface Module {
  id: string;
  title: string;
  description?: string;
  chapters: Chapter[];
}

interface Chapter {
  id: string;
  title: string;
  description?: string;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'text' | 'quiz' | 'assignment' | 'link';
  content: string;
  duration?: number;
  isPreview?: boolean;
}

export const ProductCourseStructureTab: React.FC<ProductCourseStructureTabProps> = ({
  formData,
  onChange,
  onSave
}) => {
  const [isSaving, setIsSaving] = useState(false);
  // S'assurer que courseStructure et modules sont correctement initialisés
  const courseStructure = formData.courseStructure ? 
    { ...formData.courseStructure, modules: formData.courseStructure.modules || [] } : 
    { modules: [] };
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [expandedChapters, setExpandedChapters] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<'module' | 'chapter' | 'lesson'>('module');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingPath, setEditingPath] = useState<{moduleIndex?: number, chapterIndex?: number, lessonIndex?: number}>({});

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => 
      prev.includes(chapterId) 
        ? prev.filter(id => id !== chapterId)
        : [...prev, chapterId]
    );
  };

  const handleOpenModal = (
    type: 'module' | 'chapter' | 'lesson', 
    item?: any, 
    path?: {moduleIndex?: number, chapterIndex?: number, lessonIndex?: number}
  ) => {
    setEditingType(type);
    setEditingItem(item || null);
    setEditingPath(path || {});
    setIsModalOpen(true);
  };
  
  // Fonction directe pour ajouter un module sans passer par la modale
  const addModule = () => {
    const newModule = {
      id: Date.now().toString(),
      title: `Nouveau module ${courseStructure.modules.length + 1}`,
      description: '',
      chapters: []
    };
    
    const updatedStructure = { 
      ...courseStructure,
      modules: [...courseStructure.modules, newModule]
    };
    
    handleSaveStructure(updatedStructure);
  };
  
  // Fonction pour supprimer un module
  const deleteModule = (moduleIndex: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce module et tout son contenu ?')) {
      const updatedStructure = { ...courseStructure };
      updatedStructure.modules.splice(moduleIndex, 1);
      handleSaveStructure(updatedStructure);
    }
  };
  
  // Fonction pour supprimer un chapitre
  const deleteChapter = (moduleIndex: number, chapterIndex: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce chapitre et toutes ses leçons ?')) {
      const updatedStructure = { ...courseStructure };
      updatedStructure.modules[moduleIndex].chapters.splice(chapterIndex, 1);
      handleSaveStructure(updatedStructure);
    }
  };
  
  // Fonction pour supprimer une leçon
  const deleteLesson = (moduleIndex: number, chapterIndex: number, lessonIndex: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette leçon ?')) {
      const updatedStructure = { ...courseStructure };
      updatedStructure.modules[moduleIndex].chapters[chapterIndex].lessons.splice(lessonIndex, 1);
      handleSaveStructure(updatedStructure);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setEditingPath({});
  };

  const handleSaveStructure = (updatedStructure: any) => {
    // S'assurer que la structure est correctement mise à jour dans le formData
    console.log('Saving structure:', updatedStructure);
    onChange({ courseStructure: updatedStructure });
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video':
        return Video;
      case 'text':
        return FileText;
      case 'link':
        return Link;
      case 'quiz':
      case 'assignment':
        return Settings;
      default:
        return FileText;
    }
  };

  const calculateCourseDuration = () => {
    let totalMinutes = 0;
    
    courseStructure.modules.forEach((module: Module) => {
      module.chapters.forEach((chapter: Chapter) => {
        chapter.lessons.forEach((lesson: Lesson) => {
          if (lesson.duration) {
            totalMinutes += lesson.duration;
          }
        });
      });
    });
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return `${hours}h ${minutes}min`;
  };

  const countLessons = () => {
    let count = 0;
    courseStructure.modules.forEach((module: Module) => {
      module.chapters.forEach((chapter: Chapter) => {
        count += chapter.lessons.length;
      });
    });
    return count;
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Structure du cours
          </h3>
          <Button
            onClick={addModule}
            variant="secondary"
            icon={Plus}
            size="sm"
          >
            Ajouter un module
          </Button>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Organisez votre cours en modules, chapitres et leçons pour une expérience d'apprentissage structurée.
        </p>

        {/* Statistiques du cours */}
        {courseStructure.modules.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 flex items-center">
              <div className="bg-blue-100 dark:bg-blue-800 p-3 rounded-full mr-3">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Modules</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">{courseStructure.modules.length}</p>
              </div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 flex items-center">
              <div className="bg-green-100 dark:bg-green-800 p-3 rounded-full mr-3">
                <Video className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Leçons</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">{countLessons()}</p>
              </div>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 flex items-center">
              <div className="bg-purple-100 dark:bg-purple-800 p-3 rounded-full mr-3">
                <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Durée totale</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">{calculateCourseDuration()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Structure du cours */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
          {courseStructure.modules.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full inline-flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-gray-500 dark:text-gray-400" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucun contenu de cours</h4>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
                Commencez à structurer votre cours en ajoutant des modules, des chapitres et des leçons.
              </p>
              <Button
                onClick={() => handleOpenModal('module')}
                variant="primary"
                icon={Plus}
              >
                Créer votre premier module
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {courseStructure.modules.map((module: Module, moduleIndex: number) => (
                <div key={module.id} className="bg-white dark:bg-gray-800">
                  <div 
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750"
                    onClick={() => toggleModule(module.id)}
                  >
                    <div className="flex items-center">
                      <div className="mr-2 text-gray-400">
                        <GripVertical className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          Module {moduleIndex + 1}: {module.title}
                        </h4>
                        {module.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {module.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {module.chapters.length} chapitre(s)
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenModal('module', module, { moduleIndex });
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteModule(moduleIndex);
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {expandedModules.includes(module.id) ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                  </div>

                  {expandedModules.includes(module.id) && (
                    <div className="pl-10 pr-4 pb-4">
                      <div className="space-y-3">
                        {module.chapters.map((chapter: Chapter, chapterIndex: number) => (
                          <div key={chapter.id} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div 
                              className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750"
                              onClick={() => toggleChapter(chapter.id)}
                            >
                              <div className="flex items-center">
                                <div className="mr-2 text-gray-400">
                                  <GripVertical className="w-4 h-4" />
                                </div>
                                <div>
                                  <h5 className="font-medium text-gray-800 dark:text-gray-200">
                                    Chapitre {chapterIndex + 1}: {chapter.title}
                                  </h5>
                                  {chapter.description && (
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                      {chapter.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {chapter.lessons.length} leçon(s)
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenModal('chapter', chapter, { moduleIndex, chapterIndex });
                                  }}
                                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                  title="Modifier"
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteChapter(moduleIndex, chapterIndex);
                                  }}
                                  className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                                {expandedChapters.includes(chapter.id) ? (
                                  <ChevronUp className="w-4 h-4 text-gray-500" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-gray-500" />
                                )}
                              </div>
                            </div>

                            {expandedChapters.includes(chapter.id) && (
                              <div className="pl-8 pr-3 pb-3">
                                <div className="space-y-2">
                                  {chapter.lessons.map((lesson: Lesson, lessonIndex: number) => {
                                    const LessonIcon = getLessonIcon(lesson.type);
                                    return (
                                      <div 
                                        key={lesson.id}
                                        className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                                      >
                                        <div className="flex items-center">
                                          <div className="mr-2 text-gray-400">
                                            <GripVertical className="w-4 h-4" />
                                          </div>
                                          <div className="mr-2">
                                            <LessonIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                          </div>
                                          <div>
                                            <p className="text-sm text-gray-800 dark:text-gray-200">
                                              {lesson.title}
                                              {lesson.isPreview && (
                                                <span className="ml-2 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-2 py-0.5 rounded">
                                                  Aperçu
                                                </span>
                                              )}
                                            </p>
                                            {lesson.duration && (
                                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {lesson.duration} min
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                          <button
                                            onClick={() => handleOpenModal('lesson', lesson, { moduleIndex, chapterIndex, lessonIndex })}
                                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                            title="Modifier"
                                          >
                                            <Edit className="w-3 h-3" />
                                          </button>
                                          <button
                                            onClick={() => deleteLesson(moduleIndex, chapterIndex, lessonIndex)}
                                            className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                                            title="Supprimer"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                  <div className="pt-1">
                                    <Button
                                      onClick={() => handleOpenModal('lesson', null, { moduleIndex, chapterIndex })}
                                      variant="ghost"
                                      size="sm"
                                      icon={Plus}
                                      className="w-full border border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400"
                                    >
                                      Ajouter une leçon
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                        <div>
                          <Button
                            onClick={() => handleOpenModal('chapter', null, { moduleIndex })}
                            variant="ghost"
                            size="sm"
                            icon={Plus}
                            className="w-full border border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400"
                          >
                            Ajouter un chapitre
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Paramètres du cours */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Paramètres du cours
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showProgress"
              checked={formData.showProgress !== false}
              onChange={(e) => onChange({ showProgress: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="showProgress" className="ml-2 block text-sm text-gray-900 dark:text-white">
              Afficher la progression de l'étudiant
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="requireSequential"
              checked={formData.requireSequential || false}
              onChange={(e) => onChange({ requireSequential: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="requireSequential" className="ml-2 block text-sm text-gray-900 dark:text-white">
              Progression séquentielle requise (les étudiants doivent terminer les leçons dans l'ordre)
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="allowComments"
              checked={formData.allowComments !== false}
              onChange={(e) => onChange({ allowComments: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="allowComments" className="ml-2 block text-sm text-gray-900 dark:text-white">
              Autoriser les commentaires sur les leçons
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="downloadableResources"
              checked={formData.downloadableResources || false}
              onChange={(e) => onChange({ downloadableResources: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="downloadableResources" className="ml-2 block text-sm text-gray-900 dark:text-white">
              Inclure une section de ressources téléchargeables
            </label>
          </div>
        </div>
      </div>

      {/* Modal pour la gestion de la structure du cours */}
      <CourseStructureModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        type={editingType}
        item={editingItem}
        path={editingPath}
        courseStructure={courseStructure}
        onSave={handleSaveStructure}
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
          {isSaving ? 'Sauvegarde en cours...' : 'Enregistrer la structure du cours'}
        </Button>
      </div>
    </div>
  );
};
