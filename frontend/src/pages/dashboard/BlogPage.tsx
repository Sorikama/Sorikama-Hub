import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, Search, Filter, PenTool, Calendar, Clock, BarChart3, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { DataGrid } from '../../components/ui/DataGrid';
import { Input } from '../../components/ui/Input';
import { useStore } from '../../contexts/StoreContext';
import { useBlog } from '../../contexts/BlogContext';
import { BlogArticle } from '../../types';

export const BlogPage: React.FC = () => {
  const navigate = useNavigate();
  const { stores } = useStore();
  const { articles, updateArticle, deleteArticle } = useBlog();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterStore, setFilterStore] = useState('all');

  // Filter articles based on search, status, and store
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || article.status === filterStatus;
    const matchesStore = filterStore === 'all' || article.storeId === filterStore;
    return matchesSearch && matchesStatus && matchesStore;
  });

  const handleCreateArticle = () => {
    navigate('/dashboard/blog/new/edit');
  };

  const handleEditArticle = (article: BlogArticle) => {
    navigate(`/dashboard/blog/${article.id}/edit`);
  };

  const handleDeleteArticle = (article: BlogArticle) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'article "${article.title}" ?`)) {
      deleteArticle(article.id);
    }
  };

  const handleToggleStatus = (article: BlogArticle) => {
    const newStatus = article.status === 'published' ? 'draft' : 'published';
    const updateData: Partial<BlogArticle> = { status: newStatus };
    
    if (newStatus === 'published' && !article.publishedAt) {
      updateData.publishedAt = new Date();
    }
    
    updateArticle(article.id, updateData);
  };

  const handleViewArticle = (article: BlogArticle) => {
    const store = stores.find(s => s.id === article.storeId);
    if (store) {
      window.open(`https://${store.domain}/blog/${article.slug}`, '_blank');
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published': return 'Publié';
      case 'draft': return 'Brouillon';
      case 'scheduled': return 'Programmé';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStoreName = (storeId: string) => {
    const store = stores.find(s => s.id === storeId);
    return store ? store.name : 'Boutique supprimée';
  };

  const columns = [
    { 
      key: 'title', 
      header: 'Titre de l\'article',
      render: (article: BlogArticle) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{article.title}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{article.excerpt}</p>
        </div>
      )
    },
    { 
      key: 'store', 
      header: 'Boutique',
      render: (article: BlogArticle) => (
        <span className="px-2 py-1 bg-theme-primary-50 text-theme-primary rounded-full text-xs">
          {getStoreName(article.storeId)}
        </span>
      )
    },
    { 
      key: 'category', 
      header: 'Catégorie',
      render: (article: BlogArticle) => (
        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-xs">
          {article.category}
        </span>
      )
    },
    { 
      key: 'status', 
      header: 'Status', 
      render: (article: BlogArticle) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(article.status)}`}>
          {getStatusLabel(article.status)}
        </span>
      )
    },
    { 
      key: 'readingTime', 
      header: 'Lecture',
      render: (article: BlogArticle) => (
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <Clock className="w-4 h-4 mr-1" />
          {article.readingTime} min
        </div>
      )
    },
    { 
      key: 'viewsCount', 
      header: 'Vues',
      render: (article: BlogArticle) => (
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <BarChart3 className="w-4 h-4 mr-1" />
          {article.viewsCount}
        </div>
      )
    },
    { 
      key: 'publishedAt', 
      header: 'Date de publication', 
      render: (article: BlogArticle) => (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('fr-FR') : '-'}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (article: BlogArticle) => (
        <div className="flex items-center space-x-1">
          {/* Publier/Dépublier */}
          <button 
            onClick={() => handleToggleStatus(article)}
            className={`p-1.5 rounded transition-colors ${
              article.status === 'published'
                ? 'text-gray-400 hover:text-orange-600 dark:hover:text-orange-400' 
                : 'text-gray-400 hover:text-green-600 dark:hover:text-green-400'
            }`}
            title={article.status === 'published' ? 'Dépublier' : 'Publier'}
          >
            {article.status === 'published' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          {/* Modifier */}
          <button 
            onClick={() => handleEditArticle(article)}
            className="p-1.5 text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 rounded transition-colors"
            title="Modifier"
          >
            <Edit className="w-4 h-4" />
          </button>

          {/* Voir */}
          <button 
            onClick={() => handleViewArticle(article)}
            className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded transition-colors"
            title="Voir"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Supprimer */}
          <button 
            onClick={() => handleDeleteArticle(article)}
            className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  // État vide - Aucun article
  if (articles.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Blog</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Créez et gérez vos articles de blog pour toutes vos boutiques
            </p>
          </div>
        </div>

        {/* Message d'encouragement */}
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="text-center max-w-md">
            <div className="mb-6">
              <div className="w-20 h-20 bg-theme-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <PenTool className="w-10 h-10 text-theme-primary" />
              </div>
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Partagez votre expertise avec le monde
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              Créez des articles de blog pour attirer plus de clients et établir votre autorité dans votre domaine.
            </p>
            
            <Button 
              size="lg"
              icon={Plus} 
              onClick={handleCreateArticle}
              className="px-8 py-3"
            >
              Écrire mon premier article
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // État avec articles - Affichage du tableau
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Blog</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Créez et gérez vos articles de blog pour toutes vos boutiques
          </p>
        </div>
        <Button 
          icon={Plus} 
          onClick={handleCreateArticle}
        >
          Nouvel article
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Rechercher des articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={Search}
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterStore}
            onChange={(e) => setFilterStore(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-theme-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="all">Toutes les boutiques</option>
            {stores.map(store => (
              <option key={store.id} value={store.id}>{store.name}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-theme-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="all">Tous les statuts</option>
            <option value="published">Publié</option>
            <option value="draft">Brouillon</option>
            <option value="scheduled">Programmé</option>
          </select>
          <Button variant="secondary" icon={Filter}>
            Filtres
          </Button>
        </div>
      </div>

      {/* Blog Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total articles</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{articles.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Articles publiés</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {articles.filter(a => a.status === 'published').length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Brouillons</p>
          <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
            {articles.filter(a => a.status === 'draft').length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Vues totales</p>
          <p className="text-2xl font-bold text-theme-primary">
            {articles.reduce((sum, a) => sum + a.viewsCount, 0)}
          </p>
        </div>
      </div>

      <DataGrid
        data={filteredArticles}
        columns={columns}
        emptyMessage="Aucun article trouvé avec les filtres actuels."
      />
    </div>
  );
};