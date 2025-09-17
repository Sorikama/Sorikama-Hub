import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BlogArticle } from '../types';
import { useAuth } from './AuthContext';

interface BlogContextType {
  articles: BlogArticle[];
  createArticle: (articleData: Omit<BlogArticle, 'id' | 'createdAt' | 'updatedAt' | 'authorId' | 'viewsCount' | 'readingTime'>) => void;
  updateArticle: (id: string, articleData: Partial<BlogArticle>) => void;
  deleteArticle: (id: string) => void;
  getArticlesByStore: (storeId: string) => BlogArticle[];
  getArticleBySlug: (slug: string, storeId: string) => BlogArticle | undefined;
  isLoading: boolean;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

export const useBlog = () => {
  const context = useContext(BlogContext);
  if (context === undefined) {
    throw new Error('useBlog must be used within a BlogProvider');
  }
  return context;
};

interface BlogProviderProps {
  children: ReactNode;
}

// Fonction pour calculer le temps de lecture
const calculateReadingTime = (content: string): number => {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
};

// Fonction pour générer un slug
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^a-z0-9\s-]/g, '') // Supprimer les caractères spéciaux
    .replace(/\s+/g, '-') // Remplacer les espaces par des tirets
    .replace(/-+/g, '-') // Supprimer les tirets multiples
    .replace(/^-+|-+$/g, ''); // Supprimer les tirets en début/fin
};

export const BlogProvider: React.FC<BlogProviderProps> = ({ children }) => {
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const storedArticles = localStorage.getItem('WebRichesse_blog_articles');
      if (storedArticles) {
        const parsedArticles = JSON.parse(storedArticles);
        setArticles(parsedArticles);
      }
    }
    setIsLoading(false);
  }, [user]);

  const saveToStorage = (updatedArticles: BlogArticle[]) => {
    localStorage.setItem('WebRichesse_blog_articles', JSON.stringify(updatedArticles));
  };

  const createArticle = (articleData: Omit<BlogArticle, 'id' | 'createdAt' | 'updatedAt' | 'authorId' | 'viewsCount' | 'readingTime'>) => {
    if (!user) return;

    const slug = generateSlug(articleData.title);
    const readingTime = calculateReadingTime(articleData.content);

    const newArticle: BlogArticle = {
      ...articleData,
      id: Date.now().toString(),
      slug,
      authorId: user.id,
      readingTime,
      viewsCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedArticles = [...articles, newArticle];
    setArticles(updatedArticles);
    saveToStorage(updatedArticles);
  };

  const updateArticle = (id: string, articleData: Partial<BlogArticle>) => {
    const updatedArticles = articles.map(article => {
      if (article.id === id) {
        const updatedArticle = { ...article, ...articleData, updatedAt: new Date() };
        
        // Recalculer le slug si le titre a changé
        if (articleData.title && articleData.title !== article.title) {
          updatedArticle.slug = generateSlug(articleData.title);
        }
        
        // Recalculer le temps de lecture si le contenu a changé
        if (articleData.content && articleData.content !== article.content) {
          updatedArticle.readingTime = calculateReadingTime(articleData.content);
        }
        
        return updatedArticle;
      }
      return article;
    });
    
    setArticles(updatedArticles);
    saveToStorage(updatedArticles);
  };

  const deleteArticle = (id: string) => {
    const updatedArticles = articles.filter(article => article.id !== id);
    setArticles(updatedArticles);
    saveToStorage(updatedArticles);
  };

  const getArticlesByStore = (storeId: string) => {
    return articles.filter(article => article.storeId === storeId);
  };

  const getArticleBySlug = (slug: string, storeId: string) => {
    return articles.find(article => article.slug === slug && article.storeId === storeId);
  };

  return (
    <BlogContext.Provider value={{
      articles,
      createArticle,
      updateArticle,
      deleteArticle,
      getArticlesByStore,
      getArticleBySlug,
      isLoading
    }}>
      {children}
    </BlogContext.Provider>
  );
};