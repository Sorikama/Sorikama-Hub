import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Eye, Trash2, Calendar, Upload, Tag, Hash } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { useBlog } from '../../contexts/BlogContext';
import { useStore } from '../../contexts/StoreContext';
import { BlogArticle } from '../../types';

const blogCategories = [
  'Actualités',
  'Tutoriels',
  'Conseils',
  'Études de cas',
  'Tendances',
  'Interviews',
  'Analyses',
  'Guides',
  'Opinions',
  'Autre'
];

export const BlogEditPage: React.FC = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const navigate = useNavigate();
  const { articles, createArticle, updateArticle, deleteArticle } = useBlog();
  const { stores } = useStore();
  
  const [article, setArticle] = useState<BlogArticle | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isNewArticle, setIsNewArticle] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'Actualités',
    tags: '',
    status: 'draft' as 'draft' | 'published' | 'scheduled',
    featuredImage: '',
    seoTitle: '',
    seoDescription: '',
    scheduledAt: '',
    storeId: stores.length > 0 ? stores[0].id : ''
  });

  useEffect(() => {
    if (articleId && articleId !== 'new') {
      const foundArticle = articles.find(a => a.id === articleId);
      if (foundArticle) {
        setArticle(foundArticle);
        setFormData({
          title: foundArticle.title,
          content: foundArticle.content,
          excerpt: foundArticle.excerpt,
          category: foundArticle.category,
          tags: foundArticle.tags.join(', '),
          status: foundArticle.status,
          featuredImage: foundArticle.featuredImage || '',
          seoTitle: foundArticle.seoTitle || '',
          seoDescription: foundArticle.seoDescription || '',
          scheduledAt: foundArticle.scheduledAt ? new Date(foundArticle.scheduledAt).toISOString().slice(0, 16) : '',
          storeId: foundArticle.storeId
        });
      } else {
        navigate('/dashboard/blog');
      }
    } else {
      setIsNewArticle(true);
      // Définir la première boutique par défaut pour les nouveaux articles
      if (stores.length > 0) {
        setFormData(prev => ({ ...prev, storeId: stores[0].id }));
      }
    }
  }, [articleId, articles, navigate, stores]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    if (!formData.storeId) {
      alert('Veuillez sélectionner une boutique pour cet article.');
      return;
    }

    const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    const articleData = {
      title: formData.title,
      content: formData.content,
      excerpt: formData.excerpt || formData.content.substring(0, 150) + '...',
      category: formData.category,
      tags: tagsArray,
      status: formData.status,
      featuredImage: formData.featuredImage,
      seoTitle: formData.seoTitle || formData.title,
      seoDescription: formData.seoDescription || formData.excerpt,
      storeId: formData.storeId,
      ...(formData.status === 'scheduled' && formData.scheduledAt && {
        scheduledAt: new Date(formData.scheduledAt)
      }),
      ...(formData.status === 'published' && !article?.publishedAt && {
        publishedAt: new Date()
      })
    };

    if (isNewArticle) {
      createArticle(articleData);
      navigate('/dashboard/blog');
    } else if (article) {
      updateArticle(article.id, articleData);
      setHasChanges(false);
    }
  };

  const handleDelete = () => {
    if (article && window.confirm(`Êtes-vous sûr de vouloir supprimer l'article "${article.title}" ?`)) {
      deleteArticle(article.id);
      navigate('/dashboard/blog');
    }
  };

  const handlePreview = () => {
    const store = stores.find(s => s.id === formData.storeId);
    if (store && article) {
      window.open(`https://${store.domain}/blog/${article.slug}`, '_blank');
    }
  };

  // Vérifier s'il y a des boutiques disponibles
  if (stores.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Vous devez créer au moins une boutique avant de pouvoir écrire des articles de blog.
        </p>
        <Button onClick={() => navigate('/dashboard/create-store')}>
          Créer une boutique
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard/blog')}
            icon={ArrowLeft}
            className="mr-4"
          >
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isNewArticle ? 'Nouvel article' : 'Modifier l\'article'}
            </h1>
            {!isNewArticle && (
              <p className="text-gray-600 dark:text-gray-400">
                {article?.title}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {!isNewArticle && (
            <Button
              variant="secondary"
              onClick={handlePreview}
              icon={Eye}
            >
              Aperçu
            </Button>
          )}
          {!isNewArticle && (
            <Button
              variant="danger"
              onClick={handleDelete}
              icon={Trash2}
            >
              Supprimer
            </Button>
          )}
          <Button
            onClick={handleSave}
            icon={Save}
            disabled={!formData.title.trim() || !formData.content.trim() || !formData.storeId}
          >
            {isNewArticle ? 'Créer l\'article' : hasChanges ? 'Sauvegarder' : 'Sauvegardé'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Titre et contenu */}
          <Card>
            <div className="space-y-4">
              <Input
                label="Titre de l'article *"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Comment créer une boutique en ligne réussie"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contenu de l'article *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="Rédigez votre article ici..."
                  rows={20}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-theme-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Extrait (optionnel)
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => handleInputChange('excerpt', e.target.value)}
                  placeholder="Résumé de votre article qui apparaîtra dans les aperçus..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-theme-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white resize-none"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Si vide, les 150 premiers caractères du contenu seront utilisés.
                </p>
              </div>
            </div>
          </Card>

          {/* Image à la une */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Upload className="w-5 h-5 mr-2 text-theme-primary" />
              Image à la une
            </h3>
            
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-theme-primary transition-colors cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Cliquez pour télécharger une image
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  PNG, JPG jusqu'à 5MB - Recommandé: 1200x630px
                </p>
              </div>

              <Input
                label="URL de l'image (optionnel)"
                value={formData.featuredImage}
                onChange={(e) => handleInputChange('featuredImage', e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </Card>

          {/* SEO */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Optimisation SEO
            </h3>
            
            <div className="space-y-4">
              <Input
                label="Titre SEO"
                value={formData.seoTitle}
                onChange={(e) => handleInputChange('seoTitle', e.target.value)}
                placeholder="Titre optimisé pour les moteurs de recherche"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description SEO
                </label>
                <textarea
                  value={formData.seoDescription}
                  onChange={(e) => handleInputChange('seoDescription', e.target.value)}
                  placeholder="Description qui apparaîtra dans les résultats de recherche..."
                  rows={3}
                  maxLength={160}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-theme-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white resize-none"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {formData.seoDescription.length}/160 caractères
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Boutique */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Boutique associée
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sélectionner une boutique *
              </label>
              <select
                value={formData.storeId}
                onChange={(e) => handleInputChange('storeId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-theme-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                required
              >
                <option value="">Choisir une boutique</option>
                {stores.map(store => (
                  <option key={store.id} value={store.id}>{store.name}</option>
                ))}
              </select>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                L'article sera publié sur le blog de cette boutique.
              </p>
            </div>
          </Card>

          {/* Publication */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-theme-primary" />
              Publication
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Statut
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-theme-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                >
                  <option value="draft">Brouillon</option>
                  <option value="published">Publié</option>
                  <option value="scheduled">Programmé</option>
                </select>
              </div>

              {formData.status === 'scheduled' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date de publication
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) => handleInputChange('scheduledAt', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-theme-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              )}
            </div>
          </Card>

          {/* Catégorie et tags */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Hash className="w-5 h-5 mr-2 text-theme-primary" />
              Catégorie et tags
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Catégorie
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-theme-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                >
                  {blogCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                  <Tag className="w-4 h-4 mr-1" />
                  Tags
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => handleInputChange('tags', e.target.value)}
                  placeholder="marketing, business, conseils"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-theme-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Séparez les tags par des virgules
                </p>
              </div>
            </div>
          </Card>

          {/* Statistiques (pour les articles existants) */}
          {!isNewArticle && article && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Statistiques
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Temps de lecture</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {article.readingTime} min
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Vues</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {article.viewsCount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Créé le</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(article.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                {article.publishedAt && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Publié le</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(article.publishedAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Indicateur de modifications */}
      {hasChanges && !isNewArticle && (
        <div className="fixed bottom-6 right-6 bg-theme-primary text-white px-4 py-2 rounded-lg shadow-lg z-50">
          <p className="text-sm">Modifications non sauvegardées</p>
        </div>
      )}
    </div>
  );
};