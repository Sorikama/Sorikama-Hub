import api from './api';

export interface ProductAppearance {
  id?: string;
  product_id: string;
  primary_color?: string;
  secondary_color?: string;
  button_style?: string;
  layout_style?: string;
  font_family?: string;
  custom_css?: string;
  created_at?: string;
  updated_at?: string;
}

export const productAppearanceService = {
  // Récupérer l'apparence d'un produit
  async getProductAppearance(productId: string): Promise<ProductAppearance | null> {
    try {
      const response = await api.get(`/product-appearance/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product appearance:', error);
      return null;
    }
  },

  // Créer l'apparence d'un produit
  async createProductAppearance(appearance: ProductAppearance): Promise<ProductAppearance | null> {
    try {
      const response = await api.post('/product-appearance', appearance);
      return response.data;
    } catch (error) {
      console.error('Error creating product appearance:', error);
      return null;
    }
  },

  // Mettre à jour l'apparence d'un produit
  async updateProductAppearance(productId: string, appearance: Partial<ProductAppearance>): Promise<ProductAppearance | null> {
    try {
      const response = await api.put(`/product-appearance/${productId}`, appearance);
      return response.data;
    } catch (error) {
      console.error('Error updating product appearance:', error);
      return null;
    }
  },

  // Supprimer l'apparence d'un produit
  async deleteProductAppearance(productId: string): Promise<boolean> {
    try {
      const response = await api.delete(`/product-appearance/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting product appearance:', error);
      return false;
    }
  }
};
