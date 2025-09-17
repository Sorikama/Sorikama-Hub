import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../../../contexts/StoreContext';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Card } from '../../../components/ui/Card';
import { ImageUploader } from '../../../components/ui/ImageUploader';
import { ColorPicker } from '../../../components/ui/ColorPicker';
import { ArrowLeft, Save, Store as StoreIcon, Globe, FileText, Settings, Image, Trash2 } from 'lucide-react';
import PageTransition from '../../../components/ui/PageTransition';
import { StoreTheme } from '../../../types';


// Interface pour les onglets de configuration
interface ConfigTab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

const StoreEditPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const storeId = id || 'new';
  const navigate = useNavigate();
  const location = useLocation();
  const { stores, getStores, updateStore, createStore, deleteStore } = useStore();
  
  // États pour le formulaire et le chargement
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // État pour le formulaire de la boutique
  const [storeForm, setStoreForm] = useState({
    name: '',
    description: '',
    domaine: '',
    isActive: false,
    logo_url: '',
    theme: {
      primary_color: '#3B82F6',
      secondary_color: '#1F2937',
      accent_color: '#10B981'
    } as StoreTheme
  });
  
  // État pour l'onglet actif
  const [activeTab, setActiveTab] = useState('general');
  
  // Définition des onglets de configuration
  const configTabs: ConfigTab[] = [
    {
      id: 'general',
      label: 'Général',
      icon: <StoreIcon className="w-4 h-4 mr-2" />
    },
    {
      id: 'domain',
      label: 'Domaine',
      icon: <Globe className="w-4 h-4 mr-2" />
    },
    {
      id: 'content',
      label: 'Contenu',
      icon: <FileText className="w-4 h-4 mr-2" />
    },
    {
      id: 'appearance',
      label: 'Apparence',
      icon: <Image className="w-4 h-4 mr-2" />
    },
    {
      id: 'advanced',
      label: 'Avancé',
      icon: <Settings className="w-4 h-4 mr-2" />
    }
  ];

  // Fonction pour charger les données de la boutique
  const loadStoreData = async (forceRefresh = false) => {
    if (storeId === 'new') {
      setIsLoading(false);
      return;
    }

    // Vérifier si l'ID est au format valide pour MongoDB (24 caractères hexadécimaux)
    const isValidMongoId = /^[0-9a-fA-F]{24}$/.test(storeId);
    if (!isValidMongoId) {
      console.error(`Format d'ID de boutique invalide: ${storeId}`);
      setSaveMessage({
        type: 'error',
        text: `Format d'ID de boutique invalide. Veuillez vérifier l'URL.`
      });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Forcer le rafraîchissement des données si demandé
      if (forceRefresh) {
        await getStores(true);
      }
      
      const existingStoreData = stores.find(store => store.id === storeId);
      
      if (existingStoreData) {
        console.log('Données de boutique trouvées:', existingStoreData);
        setStoreForm({
          name: existingStoreData.name || '',
          description: existingStoreData.description || '',
          domaine: existingStoreData.domaine || '',
          isActive: existingStoreData.isActive || false,
          logo_url: existingStoreData.logo_url || '',
          theme: existingStoreData.theme || {
            primary_color: '#3B82F6',
            secondary_color: '#1F2937',
            accent_color: '#10B981'
          }
        });
      } else {
        // Si la boutique n'est pas trouvée même après un rafraîchissement forcé
        if (forceRefresh) {
          console.error(`Boutique avec l'ID ${storeId} non trouvée après rafraîchissement`);
          setSaveMessage({
            type: 'error',
            text: `Boutique avec l'ID ${storeId} non trouvée. Veuillez vérifier que cette boutique existe.`
          });
          // Rediriger vers la liste des boutiques après un délai
          setTimeout(() => {
            navigate('/dashboard/settings/stores');
          }, 3000);
        } else {
          // Essayer un rafraîchissement forcé si ce n'est pas déjà fait
          await loadStoreData(true);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données de la boutique:', error);
      setSaveMessage({
        type: 'error',
        text: `Erreur lors du chargement des données: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les données de la boutique au chargement de la page
  useEffect(() => {
    loadStoreData(false);
  }, [storeId, stores, getStores, navigate]); // Dépendances nécessaires

  // Gérer les changements dans le formulaire
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setStoreForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  // Gérer les changements de couleur
  const handleColorChange = (colorType: keyof StoreTheme, value: string) => {
    setStoreForm(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        [colorType]: value
      }
    }));
  };

  // Gérer le changement de logo
  const handleLogoChange = (newLogo: string) => {
    setStoreForm(prev => ({
      ...prev,
      logo_url: newLogo
    }));
  };

  // Gérer la soumission du formulaire
  const handleSubmit = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      if (storeId === 'new') {
        const newStore = await createStore(storeForm.name, storeForm.description, storeForm.domaine);
        
        if (newStore) {
          try {
            await updateStore(newStore.id, {
              isActive: storeForm.isActive,
              logo_url: storeForm.logo_url,
              theme: storeForm.theme
            });
            
            setSaveMessage({
              type: 'success',
              text: 'Boutique créée avec succès!'
            });
            
            setTimeout(() => {
              navigate(`/dashboard/settings/stores/edit/${newStore.id}`);
            }, 1500);
          } catch (updateError) {
            console.error('Erreur lors de la mise à jour des détails supplémentaires:', updateError);
            setSaveMessage({
              type: 'error',
              text: 'Boutique créée, mais certains détails n\'ont pas pu être enregistrés.'
            });
          }
        }
      } else {
        try {
          // Vérifier si l'ID est au format valide pour MongoDB (24 caractères hexadécimaux)
          const isValidMongoId = /^[0-9a-fA-F]{24}$/.test(storeId);
          if (!isValidMongoId) {
            throw new Error(`Format d'ID de boutique invalide: ${storeId}`);
          }

          console.log('Mise à jour de la boutique avec ID:', storeId);
          console.log('Données envoyées:', {
            name: storeForm.name,
            description: storeForm.description,
            domaine: storeForm.domaine,
            isActive: storeForm.isActive,
            logo_url: storeForm.logo_url,
            theme: storeForm.theme
          });
          
          // Vérifier si la boutique existe avant de tenter la mise à jour
          const storeExists = stores.some(store => store.id === storeId);
          if (!storeExists) {
            throw new Error(`Boutique avec l'ID ${storeId} non trouvée. Veuillez vérifier que cette boutique existe.`);
          }
          
          await updateStore(storeId, {
            name: storeForm.name,
            description: storeForm.description,
            domaine: storeForm.domaine,
            isActive: storeForm.isActive,
            logo_url: storeForm.logo_url,
            theme: storeForm.theme
          });
          
          setSaveMessage({
            type: 'success',
            text: 'Boutique mise à jour avec succès!'
          });
        } catch (error: any) {
          console.error('Erreur détaillée lors de la mise à jour:', error);
          setSaveMessage({
            type: 'error',
            text: `Erreur lors de la mise à jour: ${error?.message || 'Boutique non trouvée ou problème de serveur'}`
          });
          
          // Si l'erreur est liée à une boutique non trouvée, rediriger vers la liste des boutiques après un délai
          if (error?.message?.includes('non trouvée')) {
            setTimeout(() => {
              navigate('/dashboard/settings/stores');
            }, 3000);
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la boutique:', error);
      setSaveMessage({
        type: 'error',
        text: 'Une erreur est survenue lors de la sauvegarde.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Afficher un loader pendant le chargement
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <PageTransition location={location.pathname}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard/settings/stores')} 
            icon={ArrowLeft}
            className="mr-4"
          >
            Retour
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {storeId === 'new' ? 'Créer une nouvelle boutique' : 'Modifier la boutique'}
          </h1>
          {storeId !== 'new' && (
            <Button
              variant="secondary"
              onClick={() => loadStoreData(true)}
              className="ml-auto"
              disabled={isLoading}
            >
              {isLoading ? 'Chargement...' : 'Rafraîchir'}
            </Button>
          )}
        </div>
        
        {saveMessage && (
          <div className={`mb-4 p-3 rounded-lg ${
            saveMessage.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
          }`}>
            {saveMessage.text}
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card className="overflow-hidden">
              <div className="p-0">
                <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                  {configTabs.map((tab) => (
                    <li key={tab.id}>
                      <button
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center px-4 py-3 text-left text-gray-800 dark:text-gray-200 ${
                          activeTab === tab.id
                            ? 'bg-theme-primary-50 text-theme-primary dark:bg-theme-primary-900 dark:text-theme-primary-200'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        {tab.icon}
                        {tab.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </div>
          
          <div className="lg:col-span-3">
            <Card className="p-6">
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nom de la boutique
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={storeForm.name}
                      onChange={handleInputChange}
                      placeholder="Nom de votre boutique"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <Textarea
                      id="description"
                      name="description"
                      value={storeForm.description}
                      onChange={handleInputChange}
                      placeholder="Description de votre boutique"
                      className="w-full"
                      rows={4}
                    />
                  </div>
                </div>
              )}
              
              {activeTab === 'domain' && (
                <div className="space-y-6">
                  <div>
                    <label htmlFor="domaine" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Domaine
                    </label>
                    <div className="flex items-center">
                      <span className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-3 py-2 text-sm border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-md">
                        webrichesse.com/
                      </span>
                      <Input
                        id="domaine"
                        name="domaine"
                        value={storeForm.domaine}
                        onChange={handleInputChange}
                        placeholder="ma-boutique"
                        className="w-full rounded-l-none"
                      />
                    </div>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
                      Le domaine sur lequel votre boutique sera accessible.
                    </p>
                  </div>
                </div>
              )}
              
              {activeTab === 'content' && (
                <div className="space-y-6">
                  <p className="text-gray-600 dark:text-gray-300">
                    Options de gestion du contenu à venir...
                  </p>
                </div>
              )}
              
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Apparence de la boutique
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Logo de la boutique
                        </label>
                        <ImageUploader
                          onImageSelect={(imageUrl) => {
                            try {
                              handleLogoChange(imageUrl);
                            } catch (error: any) {
                              console.error('Erreur lors du changement de logo:', error);
                              setSaveMessage({
                                type: 'error',
                                text: error?.message || 'Erreur lors du téléchargement du logo'
                              });
                            }
                          }}
                          onImageRemove={() => handleLogoChange('')}
                          currentImageUrl={storeForm.logo_url}
                          maxSizeInMB={2}
                          label="Télécharger un logo"
                          className="mb-4"
                          uploadType="store-logo"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <ColorPicker
                            color={storeForm.theme.primary_color}
                            onChange={(value) => handleColorChange('primary_color', value)}
                            label="Couleur principale"
                          />
                        </div>
                        <div>
                          <ColorPicker
                            color={storeForm.theme.secondary_color}
                            onChange={(value) => handleColorChange('secondary_color', value)}
                            label="Couleur secondaire"
                          />
                        </div>
                        <div>
                          <ColorPicker
                            color={storeForm.theme.accent_color}
                            onChange={(value) => handleColorChange('accent_color', value)}
                            label="Couleur d'accent"
                          />
                        </div>
                      </div>
                      <div className="mt-6">
                        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                          Aperçu
                        </h4>
                        <div 
                          className="p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                          style={{
                            backgroundColor: storeForm.theme.secondary_color,
                            borderColor: storeForm.theme.accent_color
                          }}
                        >
                          <div className="flex items-center space-x-4">
                            {storeForm.logo_url && (
                              <img
                                src={storeForm.logo_url}
                                alt="Logo preview"
                                className="h-16 w-16 object-contain rounded-md"
                              />
                            )}
                            <div>
                              <h5 
                                className="text-lg font-semibold"
                                style={{ color: storeForm.theme.primary_color }}
                              >
                                {storeForm.name || 'Nom de la boutique'}
                              </h5>
                              <p 
                                className="text-sm"
                                style={{ color: '#ffffff' }}
                              >
                                {storeForm.description || 'Description de la boutique'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'advanced' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Statut de la boutique
                    </label>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isActive"
                        name="isActive"
                        checked={storeForm.isActive}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-theme-primary focus:ring-theme-primary border-gray-300 rounded"
                      />
                      <label htmlFor="isActive" className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                        Boutique active
                      </label>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-red-600 dark:text-red-400 font-medium mb-2">Zone de danger</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                      Les actions ci-dessous sont irréversibles. Soyez prudent.
                    </p>
                    <Button
                      variant="danger"
                      onClick={async () => {
                        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette boutique ? Cette action est irréversible.')) {
                          try {
                            setIsSaving(true);
                            const success = await deleteStore(storeId);
                            if (success) {
                              setSaveMessage({
                                type: 'success',
                                text: 'Boutique supprimée avec succès!'
                              });
                              setTimeout(() => {
                                navigate('/dashboard/settings/stores');
                              }, 1500);
                            } else {
                              setSaveMessage({
                                type: 'error',
                                text: 'Erreur lors de la suppression de la boutique.'
                              });
                            }
                          } catch (error) {
                            console.error('Erreur lors de la suppression de la boutique:', error);
                            setSaveMessage({
                              type: 'error',
                              text: 'Une erreur est survenue lors de la suppression.'
                            });
                          } finally {
                            setIsSaving(false);
                          }
                        }
                      }}
                      className="flex items-center"
                      disabled={storeId === 'new' || isSaving}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer la boutique
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                <Button
                  variant="secondary"
                  onClick={() => navigate('/dashboard/settings/stores')}
                  className="mr-2 text-gray-800 dark:text-gray-200"
                >
                  Annuler
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={isSaving}
                  className="text-white dark:text-white"
                >
                  {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default StoreEditPage;