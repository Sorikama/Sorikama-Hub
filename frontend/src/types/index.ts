export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
}

export interface StoreTheme {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_family: string;
  logo_position: string;
  hero_layout: string;
  product_layout: string;
}

export interface Store {
  id: string;
  name: string;
  description: string;
  domaine: string;
  logo?: string;
  logo_url?: string;
  cover_image_url?: string;
  theme?: StoreTheme;
  social_links?: Record<string, string>;
  contact_email?: string;
  contact_phone?: string;
  custom_domain?: string;
  userId: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;  // Dans le frontend, on utilise name
  title?: string; // Dans le backend, on utilise title
  description: string;
  price: number;
  promotionalPrice?: number; // Format frontend
  promotional_price?: number; // Format backend
  type: 'downloadable' | 'course' | 'service';
  category: string;
  pricingModel: 'one-time' | 'subscription' | 'free';
  pricing_model?: string; // Format backend
  image?: string;
  images?: string[]; // Format backend
  public_id?: string;
  private_id?: string;
  storeId: string;
  isActive: boolean;
  is_published?: boolean; // Format backend
  is_featured?: boolean; // Format backend
  createdAt: Date;
  updatedAt: Date;
  created_at?: string; // Format backend
  updated_at?: string; // Format backend
  
  // Nouveaux champs pour les détails du produit
  custom_url?: string;
  visibility?: 'public' | 'private' | 'password_protected';

  limited_quantity?: boolean;

  price_validity_start?: string;
  price_validity_end?: string;

  physical_address?: string;
  hide_purchases_count?: boolean;
  collect_shipping_address?: boolean;
  password_protection?: boolean;
  add_watermarks?: boolean;
  post_purchase_instructions?: string;
  sku?: string;
  tags?: string;
  
  // Champs pour l'apparence
  primary_color?: string;
  secondary_color?: string;
  button_style?: string;
  layout_style?: string;
  font_family?: string;
  custom_css?: string;
  
  // Champs pour les fichiers
  file_url?: string;
  file_type?: string;
  file_size?: number;
  download_limit?: string;
  link_expiry?: string;
  require_login?: boolean;
  watermark?: boolean;
  download_instructions?: string;
  
  // Champs pour les champs personnalisés
  customFields?: any[];
  
  // Champs pour la FAQ
  faq?: any[];
  showFAQOnProductPage?: boolean;
  expandFirstFAQ?: boolean;
  faqPosition?: string;
  
  // Champs pour la structure de cours
  courseStructure?: {
    modules: any[];
    show_progress?: boolean;
    require_sequential?: boolean;
    allow_comments?: boolean;
    downloadable_resources?: boolean;
  };
  showProgress?: boolean;
  requireSequential?: boolean;
  allowComments?: boolean;
  downloadableResources?: boolean;
}

export interface BlogArticle {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  featuredImage?: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'scheduled';
  publishedAt?: Date;
  scheduledAt?: Date;
  storeId: string;
  authorId: string;
  seoTitle?: string;
  seoDescription?: string;
  readingTime: number;
  viewsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  storeId: string;
  totalSpent: number;
  ordersCount: number;
  createdAt: Date;
}

export interface Sale {
  id: string;
  productId: string;
  customerId: string;
  storeId: string;
  amount: number;
  status: 'pending' | 'completed' | 'refunded';
  createdAt: Date;
}

export interface Review {
  id: string;
  productId: string;
  customerId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface Analytics {
  totalRevenue: number;
  totalSales: number;
  totalCustomers: number;
  totalProducts: number;
  monthlyRevenue: number[];
  topProducts: Array<{ product: Product; sales: number }>;
}