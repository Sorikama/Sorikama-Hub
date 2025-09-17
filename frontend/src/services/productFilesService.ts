import api from './api';

export interface ProductFile {
  id?: string;
  product_id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: number;
  is_preview: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProductFileSettings {
  id?: string;
  product_id: string;
  download_limit?: string;
  link_expiry?: string;
  require_login?: boolean;
  watermark?: boolean;
  download_instructions?: string;
  created_at?: string;
  updated_at?: string;
}

export const productFilesService = {
  // Récupérer les fichiers d'un produit
  async getProductFiles(productId: string): Promise<ProductFile[]> {
    try {
      const response = await api.get(`/product-files/files/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product files:', error);
      return [];
    }
  },

  // Ajouter un fichier à un produit
  async addProductFile(file: ProductFile): Promise<ProductFile | null> {
    try {
      const response = await api.post('/product-files/files', file);
      return response.data;
    } catch (error) {
      console.error('Error adding product file:', error);
      return null;
    }
  },

  // Mettre à jour un fichier
  async updateProductFile(fileId: string, file: Partial<ProductFile>): Promise<ProductFile | null> {
    try {
      const response = await api.put(`/product-files/file/${fileId}`, file);
      return response.data;
    } catch (error) {
      console.error('Error updating product file:', error);
      return null;
    }
  },

  // Supprimer un fichier
  async deleteProductFile(fileId: string): Promise<boolean> {
    try {
      const response = await api.delete(`/product-files/file/${fileId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting product file:', error);
      return false;
    }
  },

  // Récupérer les paramètres des fichiers d'un produit
  async getProductFileSettings(productId: string): Promise<ProductFileSettings | null> {
    try {
      const response = await api.get(`/product-files/settings/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product file settings:', error);
      return null;
    }
  },

  // Créer les paramètres des fichiers d'un produit
  async createProductFileSettings(settings: ProductFileSettings): Promise<ProductFileSettings | null> {
    try {
      const response = await api.post('/product-files/settings', settings);
      return response.data;
    } catch (error) {
      console.error('Error creating product file settings:', error);
      return null;
    }
  },

  // Mettre à jour les paramètres des fichiers d'un produit
  async updateProductFileSettings(productId: string, settings: Partial<ProductFileSettings>): Promise<ProductFileSettings | null> {
    try {
      const response = await api.put(`/product-files/settings/${productId}`, settings);
      return response.data;
    } catch (error) {
      console.error('Error updating product file settings:', error);
      return null;
    }
  },

  // Supprimer les paramètres des fichiers d'un produit
  async deleteProductFileSettings(productId: string): Promise<boolean> {
    try {
      const response = await api.delete(`/product-files/settings/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting product file settings:', error);
      return false;
    }
  }
};
