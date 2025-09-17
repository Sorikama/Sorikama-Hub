import api from './api';

export interface ProductDetails {
  id?: string;
  product_id: string;
  
  // Paramètres de visibilité
  visibility?: string;

  hide_purchases_count?: boolean;
  
  // URL personnalisée
  custom_url?: string;
  
  // Prix et validité
  promotional_price?: number;
  limited_quantity?: boolean;

  price_validity_start?: string;
  price_validity_end?: string;
  
  // Localisation

  physical_address?: string;
  collect_shipping_address?: boolean;
  
  // Protection des fichiers
  password_protection?: boolean;
  add_watermarks?: boolean;
  
  // Guide après-achat
  post_purchase_instructions?: string;
  
  // Métadonnées
  sku?: string;
  tags?: string;
  
  created_at?: string;
  updated_at?: string;
}

export const productDetailsService = {
  // Récupérer les détails d'un produit
  async getProductDetails(productId: string): Promise<ProductDetails | null> {
    try {
      const response = await api.get(`/product-details/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product details:', error);
      return null;
    }
  },

  // Créer les détails d'un produit
  async createProductDetails(details: ProductDetails): Promise<ProductDetails | null> {
    try {
      const response = await api.post('/product-details', details);
      return response.data;
    } catch (error) {
      console.error('Error creating product details:', error);
      return null;
    }
  },

  // Mettre à jour les détails d'un produit
  async updateProductDetails(productId: string, details: Partial<ProductDetails>): Promise<ProductDetails | null> {
    try {
      const response = await api.put(`/product-details/${productId}`, details);
      return response.data;
    } catch (error) {
      console.error('Error updating product details:', error);
      return null;
    }
  },

  // Supprimer les détails d'un produit
  async deleteProductDetails(productId: string): Promise<boolean> {
    try {
      const response = await api.delete(`/product-details/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting product details:', error);
      return false;
    }
  }
};
