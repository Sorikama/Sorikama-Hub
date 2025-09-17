import api from './api';

export interface CourseStructure {
  id?: string;
  product_id: string;
  modules: any[];
  show_progress: boolean;
  require_sequential: boolean;
  allow_comments: boolean;
  downloadable_resources: boolean;
  created_at?: string;
  updated_at?: string;
}

export const productCourseStructureService = {
  // Récupérer la structure de cours d'un produit
  async getCourseStructure(productId: string): Promise<CourseStructure | null> {
    try {
      const response = await api.get(`/product-course-structure/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course structure:', error);
      return null;
    }
  },

  // Créer la structure de cours d'un produit
  async createCourseStructure(structure: CourseStructure): Promise<CourseStructure | null> {
    try {
      const response = await api.post('/product-course-structure', structure);
      return response.data;
    } catch (error) {
      console.error('Error creating course structure:', error);
      return null;
    }
  },

  // Mettre à jour la structure de cours d'un produit
  async updateCourseStructure(productId: string, structure: Partial<CourseStructure>): Promise<CourseStructure | null> {
    try {
      const response = await api.put(`/product-course-structure/${productId}`, structure);
      return response.data;
    } catch (error) {
      console.error('Error updating course structure:', error);
      return null;
    }
  },

  // Supprimer la structure de cours d'un produit
  async deleteCourseStructure(productId: string): Promise<boolean> {
    try {
      const response = await api.delete(`/product-course-structure/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting course structure:', error);
      return false;
    }
  }
};
