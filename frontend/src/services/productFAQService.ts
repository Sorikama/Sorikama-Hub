import api from './api';

export interface FAQItem {
  id?: string;
  product_id: string;
  question: string;
  answer: string;
  created_at?: string;
  updated_at?: string;
}

export interface FAQSettings {
  id?: string;
  product_id: string;
  show_on_product_page: boolean;
  expand_first_faq: boolean;
  faq_position: string;
  created_at?: string;
  updated_at?: string;
}

export const productFAQService = {
  // Récupérer les éléments FAQ d'un produit
  async getProductFAQItems(productId: string): Promise<FAQItem[]> {
    try {
      const response = await apiClient.get(`/product-faq/items/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product FAQ items:', error);
      return [];
    }
  },

  // Ajouter un élément FAQ à un produit
  async addFAQItem(item: FAQItem): Promise<FAQItem | null> {
    try {
      const response = await apiClient.post('/product-faq/items', item);
      return response.data;
    } catch (error) {
      console.error('Error adding FAQ item:', error);
      return null;
    }
  },

  // Mettre à jour un élément FAQ
  async updateFAQItem(itemId: string, item: Partial<FAQItem>): Promise<FAQItem | null> {
    try {
      const response = await apiClient.put(`/product-faq/item/${itemId}`, item);
      return response.data;
    } catch (error) {
      console.error('Error updating FAQ item:', error);
      return null;
    }
  },

  // Supprimer un élément FAQ
  async deleteFAQItem(itemId: string): Promise<boolean> {
    try {
      const response = await apiClient.delete(`/product-faq/item/${itemId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting FAQ item:', error);
      return false;
    }
  },

  // Mettre à jour tous les éléments FAQ d'un produit
  async updateProductFAQItems(productId: string, items: Partial<FAQItem>[]): Promise<FAQItem[]> {
    try {
      const response = await apiClient.put(`/product-faq/batch/${productId}`, items);
      return response.data;
    } catch (error) {
      console.error('Error updating product FAQ items:', error);
      return [];
    }
  },

  // Supprimer tous les éléments FAQ d'un produit
  async deleteProductFAQItems(productId: string): Promise<number> {
    try {
      const response = await apiClient.delete(`/product-faq/all/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting product FAQ items:', error);
      return 0;
    }
  },

  // Récupérer les paramètres FAQ d'un produit
  async getFAQSettings(productId: string): Promise<FAQSettings | null> {
    try {
      const response = await apiClient.get(`/product-faq/settings/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching FAQ settings:', error);
      return null;
    }
  },

  // Créer les paramètres FAQ d'un produit
  async createFAQSettings(settings: FAQSettings): Promise<FAQSettings | null> {
    try {
      const response = await apiClient.post('/product-faq/settings', settings);
      return response.data;
    } catch (error) {
      console.error('Error creating FAQ settings:', error);
      return null;
    }
  },

  // Mettre à jour les paramètres FAQ d'un produit
  async updateFAQSettings(productId: string, settings: Partial<FAQSettings>): Promise<FAQSettings | null> {
    try {
      const response = await apiClient.put(`/product-faq/settings/${productId}`, settings);
      return response.data;
    } catch (error) {
      console.error('Error updating FAQ settings:', error);
      return null;
    }
  },

  // Supprimer les paramètres FAQ d'un produit
  async deleteFAQSettings(productId: string): Promise<boolean> {
    try {
      const response = await apiClient.delete(`/product-faq/settings/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting FAQ settings:', error);
      return false;
    }
  }
};
