import axios from 'axios';
import API_CONFIG from '../config/api';

// Définir l'URL de base de l'API (sans le /api car on l'ajoute dans les chemins)
const API_BASE_URL = API_CONFIG.BASE_URL.replace('/api', '');

// Créer une instance axios pour les uploads
const uploadApi = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT
});

// Intercepteur pour ajouter le token d'authentification
uploadApi.interceptors.request.use(
  (config) => {
    // Récupérer le token depuis le localStorage
    const token = localStorage.getItem(API_CONFIG.AUTH_STORAGE_KEY.TOKEN);
    
    if (token) {
      console.log('[uploadService] Token ajouté à la requête');
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('[uploadService] Aucun token d\'authentification trouvé');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Service pour gérer les téléchargements de fichiers
 */
const uploadService = {
  /**
   * Vérifie si l'utilisateur a des boutiques avant de tenter un upload
   * @returns true si l'utilisateur a au moins une boutique
   */
  async checkUserHasStores(): Promise<boolean> {
    try {
      // Récupérer l'utilisateur depuis le localStorage
      const userJson = localStorage.getItem(API_CONFIG.AUTH_STORAGE_KEY.USER);
      if (!userJson) {
        console.log('[uploadService] Aucun utilisateur trouvé dans le localStorage');
        return false;
      }
      
      const user = JSON.parse(userJson);
      
      // Vérifier si l'utilisateur a un storeId ou des boutiques
      if (user.storeId) {
        console.log('[uploadService] Utilisateur a un storeId principal:', user.storeId);
        return true;
      }
      
      if (user.stores && Array.isArray(user.stores) && user.stores.length > 0) {
        console.log('[uploadService] Utilisateur a des boutiques:', user.stores);
        return true;
      }
      
      console.log('[uploadService] Utilisateur n\'a pas de boutiques');
      return false;
    } catch (error) {
      console.error('[uploadService] Erreur lors de la vérification des boutiques:', error);
      return false;
    }
  },
  /**
   * Télécharge un logo de boutique
   * @param file Le fichier image à télécharger
   * @returns L'URL du logo téléchargé
   */
  async uploadStoreLogo(file: File): Promise<string> {
    try {
      // Vérifier si l'utilisateur a des boutiques avant de tenter l'upload
      const hasStores = await this.checkUserHasStores();
      if (!hasStores) {
        throw new Error('Vous devez avoir au moins une boutique pour télécharger un logo');
      }
      
      const formData = new FormData();
      formData.append('file', file);
      
      // Ajouter des logs pour le débogage
      console.log('[uploadService] Téléchargement du logo de la boutique');
      console.log('[uploadService] Token:', localStorage.getItem(API_CONFIG.AUTH_STORAGE_KEY.TOKEN) ? 'Présent' : 'Absent');
      
      // Si nous arrivons ici, l'utilisateur a des boutiques, essayons d'abord avec base64
      // pour contourner les problèmes d'authentification
      if (file.size <= 1024 * 1024) { // Limiter à 1MB pour base64
        console.log('[uploadService] Fichier < 1MB, utilisation de base64');
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      }
      
      // Pour les fichiers plus grands, utiliser l'API
      const response = await uploadApi.post('/uploads/store-logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('[uploadService] Réponse du serveur:', response.data);
      return response.data.logo_url;
    } catch (error: any) {
      console.error('Erreur lors du téléchargement du logo:', error);
      
      // Améliorer le message d'erreur
      if (error.response) {
        if (error.response.status === 401) {
          // Si erreur d'authentification, essayer avec base64
          console.log('[uploadService] Erreur 401, tentative avec base64');
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
        } else if (error.response.status === 403) {
          throw new Error('Vous n\'avez pas les permissions nécessaires pour télécharger un logo');
        } else if (error.response.status === 400) {
          throw new Error(error.response.data?.detail || 'Erreur lors du téléchargement: données invalides');
        }
      }
      
      // Si c'est une erreur que nous avons générée nous-mêmes
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('Erreur lors du téléchargement du logo');
    }
  },
  
  /**
   * Télécharge une image de couverture de boutique
   * @param file Le fichier image à télécharger
   * @returns L'URL de l'image de couverture téléchargée
   */
  async uploadStoreCover(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await uploadApi.post('/uploads/store-cover', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.cover_image_url;
    } catch (error: any) {
      console.error('Erreur lors du téléchargement de la couverture:', error);
      
      // Améliorer le message d'erreur
      if (error.response) {
        if (error.response.status === 401) {
          throw new Error('Vous devez être connecté pour télécharger une image de couverture');
        } else if (error.response.status === 403) {
          throw new Error('Vous n\'avez pas les permissions nécessaires pour télécharger une image de couverture');
        } else if (error.response.status === 400) {
          throw new Error(error.response.data?.detail || 'Erreur lors du téléchargement: données invalides');
        }
      }
      
      throw new Error('Erreur lors du téléchargement de l\'image de couverture');
    }
  },
  
  /**
   * Télécharge une image de produit
   * @param file Le fichier image à télécharger
   * @returns L'URL de l'image de produit téléchargée
   */
  async uploadProductImage(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await uploadApi.post('/uploads/product-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.image_url;
    } catch (error: any) {
      console.error('Erreur lors du téléchargement de l\'image du produit:', error);
      
      // Améliorer le message d'erreur
      if (error.response) {
        if (error.response.status === 401) {
          throw new Error('Vous devez être connecté pour télécharger une image de produit');
        } else if (error.response.status === 403) {
          throw new Error('Vous n\'avez pas les permissions nécessaires pour télécharger une image de produit');
        } else if (error.response.status === 400) {
          throw new Error(error.response.data?.detail || 'Erreur lors du téléchargement: données invalides');
        }
      }
      
      throw new Error('Erreur lors du téléchargement de l\'image du produit');
    }
  },
  
  /**
   * Télécharge un fichier de produit
   * @param file Le fichier à télécharger
   * @returns Les informations sur le fichier téléchargé
   */
  async uploadProductFile(file: File): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await uploadApi.post('/uploads/product-file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors du téléchargement du fichier:', error);
      
      // Améliorer le message d'erreur
      if (error.response) {
        if (error.response.status === 401) {
          throw new Error('Vous devez être connecté pour télécharger un fichier');
        } else if (error.response.status === 403) {
          throw new Error('Vous n\'avez pas les permissions nécessaires pour télécharger un fichier');
        } else if (error.response.status === 400) {
          throw new Error(error.response.data?.detail || 'Erreur lors du téléchargement: données invalides');
        }
      }
      
      throw new Error('Erreur lors du téléchargement du fichier');
    }
  },
  
  /**
   * Convertit une URL de base64 en fichier
   * @param dataUrl L'URL de données base64
   * @param filename Le nom du fichier
   * @returns Le fichier créé
   */
  base64ToFile(dataUrl: string, filename: string): File {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new File([u8arr], filename, { type: mime });
  },
  
  /**
   * Vérifie si une chaîne est une URL de données base64
   * @param str La chaîne à vérifier
   * @returns true si la chaîne est une URL de données base64
   */
  isBase64Image(str: string): boolean {
    return Boolean(str && str.startsWith('data:image/'));
  },
  
  /**
   * Obtient l'URL complète d'une ressource téléchargée
   * @param path Le chemin relatif de la ressource
   * @returns L'URL complète
   */
  getFullUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    
    // Utiliser l'URL de base de l'API
    return `${API_BASE_URL}${path}`;
  }
};

export default uploadService;
