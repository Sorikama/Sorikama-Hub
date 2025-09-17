import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Eye, Trash2, Info, FileText, Palette, FileArchive, Settings, HelpCircle, BookOpen } from 'lucide-react';
import { ConfirmationModal } from '../ui/ConfirmationModal';
import { Button } from '../ui/Button';
import { useProducts } from '../../contexts/ProductContext';
import { useStore } from '../../contexts/StoreContext';
import { Product } from '../../types';
import { productDetailsService } from '../../services/productDetailsService';
import { productAppearanceService } from '../../services/productAppearanceService';
import { productFilesService } from '../../services/productFilesService';
import { productCustomFieldsService } from '../../services/productCustomFieldsService';
import { productFAQService } from '../../services/productFAQService';
import { productCourseStructureService } from '../../services/productCourseStructureService';
import { ProductDetailsTab } from './tabs/ProductDetailsTab';
import { ProductDescriptionTab } from './tabs/ProductDescriptionTab';
import { ProductAppearanceTab } from './tabs/ProductAppearanceTab';
import { ProductFilesTab } from './tabs/ProductFilesTab';
import { ProductCustomFieldsTab } from './tabs/ProductCustomFieldsTab';
import { ProductFAQTab } from './tabs/ProductFAQTab';
import { ProductCourseStructureTab } from './tabs/ProductCourseStructureTab';

const baseTabs = [
  { id: 'details', label: 'Détails', component: ProductDetailsTab, icon: Info },
  { id: 'description', label: 'Description', component: ProductDescriptionTab, icon: FileText },
  { id: 'appearance', label: 'Apparence', component: ProductAppearanceTab, icon: Palette },
  { id: 'files', label: 'Fichiers', component: ProductFilesTab, icon: FileArchive, showFor: ['downloadable', 'course', 'service'] },
  { id: 'course-structure', label: 'Structure du cours', component: ProductCourseStructureTab, icon: BookOpen, showFor: ['course'] },
  { id: 'custom-fields', label: 'Champs personnalisés', component: ProductCustomFieldsTab, icon: Settings },
  { id: 'faq', label: 'FAQ', component: ProductFAQTab, icon: HelpCircle },
];

export const ProductEditPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, updateProduct, deleteProduct } = useProducts();
  const { selectedStore } = useStore();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    onConfirm: () => void;
  }>({isOpen: false, title: '', message: '', confirmText: '', onConfirm: () => {}});
  
  // Filtrer les onglets en fonction du type de produit
  const tabs = useMemo(() => {
    if (!product) return baseTabs;
    
    return baseTabs.filter(tab => 
      !tab.showFor || tab.showFor.includes(product.type)
    );
  }, [product]);
  
  // Récupérer l'onglet actif depuis l'URL ou utiliser 'details' par défaut
  const [activeTab, setActiveTab] = useState(() => {
    const tabFromUrl = searchParams.get('tab');
    return tabFromUrl && baseTabs.some(tab => tab.id === tabFromUrl) ? tabFromUrl : 'details';
  });

  useEffect(() => {
    const loadProductData = async () => {
      if (productId) {
        const foundProduct = products.find(p => p.id === productId);
        if (foundProduct) {
          setProduct(foundProduct);
          
          // Charger les détails du produit depuis l'API
          try {
            const productDetails = await productDetailsService.getProductDetails(productId);
            console.log('Loaded product details:', productDetails);
            
            // Fusionner les données du produit avec les détails
            console.log('Produit chargé:', foundProduct);
            console.log('Prix promotionnel du produit:', foundProduct.promotionalPrice || foundProduct.promotional_price);
            
            if (productDetails) {
              console.log('Détails du produit chargés:', productDetails);
              setFormData({
                ...foundProduct,
                // Paramètres de visibilité
                visibility: productDetails.visibility || 'public',

                hide_purchases_count: productDetails.hide_purchases_count,
                
                // URL personnalisée
                custom_url: productDetails.custom_url,
                
                // Prix et validité
                promotionalPrice: foundProduct.promotionalPrice || foundProduct.promotional_price,
                limited_quantity: productDetails.limited_quantity,

                price_validity_start: productDetails.price_validity_start,
                price_validity_end: productDetails.price_validity_end,
                
                // Localisation

                physical_address: productDetails.physical_address,
                collect_shipping_address: productDetails.collect_shipping_address,
                
                // Protection des fichiers
                password_protection: productDetails.password_protection,
                add_watermarks: productDetails.add_watermarks,
                
                // Guide après-achat
                post_purchase_instructions: productDetails.post_purchase_instructions,
                
                // Métadonnées
                sku: productDetails.sku,
                tags: productDetails.tags
              });
            } else {
              setFormData(foundProduct);
            }
          } catch (error) {
            console.error('Error loading product details:', error);
            setFormData(foundProduct);
          }
        } else {
          navigate('/dashboard/products');
        }
      }
    };
    
    loadProductData();
  }, [productId, products, navigate]);

  const handleDataChange = (tabData: any) => {
    setFormData((prev: any) => ({ ...prev, ...tabData }));
  };
  
  // Mettre à jour l'URL lorsque l'onglet actif change
  const handleTabChange = (tabId: string) => {
    // Vérifier si l'onglet est disponible pour ce type de produit
    if (tabs.some(tab => tab.id === tabId)) {
      setActiveTab(tabId);
      setSearchParams({ tab: tabId });
    } else {
      // Si l'onglet n'est pas disponible, rediriger vers l'onglet détails
      setActiveTab('details');
      setSearchParams({ tab: 'details' });
    }
  };

  
  const handleDelete = () => {
    if (product) {
      setConfirmationModal({
        isOpen: true,
        title: 'Supprimer le produit',
        message: `Êtes-vous sûr de vouloir supprimer "${product.name}" ? Cette action est irréversible.`,
        confirmText: 'Supprimer',
        onConfirm: async () => {
          setIsDeleting(true);
          try {
            await deleteProduct(product.id);
            toast.success('Produit supprimé avec succès !');
            navigate('/dashboard/products');
          } catch (error) {
            console.error('Erreur lors de la suppression du produit:', error);
            toast.error('Erreur lors de la suppression du produit. Veuillez réessayer.');
            setIsDeleting(false);
          } finally {
            // Fermer la modale
            setConfirmationModal(prev => ({ ...prev, isOpen: false }));
          }
        }
      });
    }
  };

  const handlePreview = () => {
    if (selectedStore && product) {
      // Déterminer l'URL à utiliser en fonction de l'état de publication
      let productUrl;
      
      // Pour les produits non publiés, utiliser le private_id
      if (!product.is_published) {
        // Utiliser private_id pour les produits non publiés
        const id = product.private_id || product.id;
        productUrl = `${window.location.origin}/${selectedStore.domaine}/product/${product.private_id}?preview=true`;
      }
      // Pour les produits publiés, utiliser l'URL normale
      else {
        // Si une URL personnalisée existe, l'utiliser
        if (product.custom_url) {
          productUrl = `${window.location.origin}/${selectedStore.domaine}/${product.custom_url}`;
        } 
        // Sinon, utiliser public_id si disponible
        else if (product.public_id) {
          productUrl = `${window.location.origin}/${selectedStore.domaine}/product/${product.public_id}`;
        }
        // Fallback sur l'ID du produit si aucune URL spécifique n'est disponible
        else {
          productUrl = `${window.location.origin}/${selectedStore.domaine}/product/${product.id}`;
        }
      }
      
      // Ouvrir l'aperçu du produit dans un nouvel onglet
      window.open(productUrl, '_blank');
    }
  };

  if (!product) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const ActiveTabComponent = tabs.find(tab => tab.id === activeTab)?.component || ProductDetailsTab;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard/products')}
            icon={ArrowLeft}
            className="mr-4"
          >
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Modifier le produit
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {product.name}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="secondary"
            onClick={handlePreview}
            icon={Eye}
          >
            Aperçu
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            icon={Trash2}
            disabled={isDeleting}
          >
            {isDeleting ? 'Suppression...' : 'Supprimer'}
          </Button>
        </div>
      </div>

      {/* Tabs Navigation and Content - Vertical Layout with Fixed Menu */}
      <div className="flex flex-col md:flex-row md:space-x-6">
        {/* Fixed Vertical Tabs Navigation */}
        <div className="w-full md:w-64 mb-6 md:mb-0">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 md:sticky md:top-4">
            {/* Mobile Tabs Selector */}
            <div className="md:hidden p-4 border-b border-gray-200 dark:border-gray-700">
              <select 
                value={activeTab}
                onChange={(e) => handleTabChange(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-theme-primary"
              >
                {tabs.map((tab) => (
                  <option key={tab.id} value={tab.id}>
                    {tab.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Desktop Vertical Navigation */}
            <nav className="hidden md:flex flex-col p-4 space-y-1" aria-label="Tabs">
              {tabs.map((tab) => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`py-2 px-4 rounded-lg font-medium text-sm transition-colors flex items-center ${
                      activeTab === tab.id
                      ? 'bg-theme-primary-50 text-theme-primary border border-theme-primary border-opacity-20'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100'
                  }`}
                  >
                    <TabIcon className="w-5 h-5 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
            <ActiveTabComponent
              product={product}
              formData={formData}
              onChange={handleDataChange}
              onSave={async () => {
                setIsSaving(true);
                try {
                  // Déterminer quel type de données sauvegarder en fonction de l'onglet actif
                  switch (activeTab) {
                    case 'details':
                      // Mettre à jour les informations de base du produit
                      await updateProduct(product.id, {
                        name: formData.name,
                        description: formData.description,
                        price: formData.price,
                        promotionalPrice: formData.promotionalPrice,
                        type: formData.type,
                        category: formData.category,
                        pricingModel: formData.pricingModel
                      });
                      
                      // Mettre à jour les détails spécifiques dans la table product_details
                      await productDetailsService.updateProductDetails(product.id, {
                        product_id: product.id,
                        // Paramètres de visibilité
                        visibility: formData.visibility || 'public',

                        hide_purchases_count: formData.hide_purchases_count || false,
                        
                        // URL personnalisée
                        custom_url: formData.custom_url,
                        
                        // Prix et validité
                        limited_quantity: formData.limited_quantity || false,

                        price_validity_start: formData.price_validity_start,
                        price_validity_end: formData.price_validity_end,
                        
                        // Localisation

                        physical_address: formData.physical_address,
                        collect_shipping_address: formData.collect_shipping_address || false,
                        
                        // Protection des fichiers
                        password_protection: formData.password_protection || false,
                        add_watermarks: formData.add_watermarks || false,
                        
                        // Guide après-achat
                        post_purchase_instructions: formData.post_purchase_instructions,
                        
                        // Métadonnées
                        sku: formData.sku,
                        tags: formData.tags
                      });
                      break;
                      
                    case 'description':
                      // Mettre à jour uniquement la description du produit
                      await updateProduct(product.id, {
                        description: formData.description
                      });
                      break;
                      
                    case 'appearance':
                      // Mettre à jour l'apparence du produit
                      await productAppearanceService.updateProductAppearance(product.id, {
                        product_id: product.id,
                        primary_color: formData.primary_color,
                        secondary_color: formData.secondary_color,
                        button_style: formData.button_style,
                        layout_style: formData.layout_style,
                        font_family: formData.font_family,
                        custom_css: formData.custom_css
                      });
                      break;
                      
                    case 'files':
                      // Mettre à jour les paramètres des fichiers
                      await productFilesService.updateProductFileSettings(product.id, {
                        product_id: product.id,
                        download_limit: formData.download_limit,
                        link_expiry: formData.link_expiry,
                        require_login: formData.require_login,
                        watermark: formData.watermark,
                        download_instructions: formData.download_instructions
                      });
                      break;
                      
                    case 'custom-fields':
                      // Mettre à jour les champs personnalisés
                      if (formData.customFields) {
                        await productCustomFieldsService.updateProductCustomFields(product.id, formData.customFields);
                      }
                      break;
                      
                    case 'faq':
                      // Mettre à jour les éléments FAQ
                      if (formData.faq) {
                        await productFAQService.updateProductFAQItems(product.id, formData.faq);
                      }
                      
                      // Mettre à jour les paramètres FAQ
                      await productFAQService.updateFAQSettings(product.id, {
                        product_id: product.id,
                        show_on_product_page: formData.showFAQOnProductPage !== false,
                        expand_first_faq: formData.expandFirstFAQ || false,
                        faq_position: formData.faqPosition || 'bottom'
                      });
                      break;
                      
                    case 'course-structure':
                      // Mettre à jour la structure du cours
                      await productCourseStructureService.updateCourseStructure(product.id, {
                        product_id: product.id,
                        modules: formData.courseStructure?.modules || [],
                        show_progress: formData.showProgress !== false,
                        require_sequential: formData.requireSequential || false,
                        allow_comments: formData.allowComments !== false,
                        downloadable_resources: formData.downloadableResources || false
                      });
                      break;
                      
                    default:
                      // Pour tout autre onglet, mettre à jour le produit complet
                      await updateProduct(product.id, formData);
                  }
                  
                  toast.success('Produit mis à jour avec succès !');
                } catch (error) {
                  console.error('Erreur lors de la mise à jour du produit:', error);
                  toast.error('Erreur lors de la mise à jour du produit. Veuillez réessayer.');
                } finally {
                  setIsSaving(false);
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Modale de confirmation pour la suppression */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        title={confirmationModal.title}
        message={confirmationModal.message}
        confirmText={confirmationModal.confirmText}
        onConfirm={confirmationModal.onConfirm}
        onCancel={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};