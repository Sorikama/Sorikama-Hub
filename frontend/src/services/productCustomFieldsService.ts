import api from './api';

export interface CustomField {
  id?: string;
  product_id: string;
  label: string;
  type: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  created_at?: string;
  updated_at?: string;
}

export const productCustomFieldsService = {
  // Récupérer les champs personnalisés d'un produit
  async getProductCustomFields(productId: string): Promise<CustomField[]> {
    try {
      const response = await api.get(`/product-custom-fields/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product custom fields:', error);
      return [];
    }
  },

  // Ajouter un champ personnalisé à un produit
  async addCustomField(field: CustomField): Promise<CustomField | null> {
    try {
      const response = await api.post('/product-custom-fields', field);
      return response.data;
    } catch (error) {
      console.error('Error adding custom field:', error);
      return null;
    }
  },

  // Mettre à jour un champ personnalisé
  async updateCustomField(fieldId: string, field: Partial<CustomField>): Promise<CustomField | null> {
    try {
      const response = await api.put(`/product-custom-fields/field/${fieldId}`, field);
      return response.data;
    } catch (error) {
      console.error('Error updating custom field:', error);
      return null;
    }
  },

  // Supprimer un champ personnalisé
  async deleteCustomField(fieldId: string): Promise<boolean> {
    try {
      const response = await api.delete(`/product-custom-fields/field/${fieldId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting custom field:', error);
      return false;
    }
  },

  // Mettre à jour tous les champs personnalisés d'un produit
  async updateProductCustomFields(productId: string, fields: Partial<CustomField>[]): Promise<CustomField[]> {
    try {
      const response = await api.put(`/product-custom-fields/batch/${productId}`, fields);
      return response.data;
    } catch (error) {
      console.error('Error updating product custom fields:', error);
      return [];
    }
  },

  // Supprimer tous les champs personnalisés d'un produit
  async deleteProductCustomFields(productId: string): Promise<number> {
    try {
      const response = await api.delete(`/product-custom-fields/all/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting product custom fields:', error);
      return 0;
    }
  }
};
