import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Upload, Palette, Link as LinkIcon, Store, Plus } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import PageTransition from '../../../components/ui/PageTransition';
import { StoreModal } from '../../../components/ui/StoreModal';
import { Button } from '../../../components/ui/Button';
// import { Input } from '../../../components/ui/Input';
import { Card } from '../../../components/ui/Card';
import { useTheme } from '../../../contexts/ThemeContext';

const colorThemes = [
  {
    name: 'Bleu Océan',
    primary: '#3B82F6',
    secondary: '#1E40AF',
    accent: '#60A5FA',
    preview: 'bg-gradient-to-r from-blue-500 to-blue-700'
  },
  {
    name: 'Vert Émeraude',
    primary: '#10B981',
    secondary: '#047857',
    accent: '#34D399',
    preview: 'bg-gradient-to-r from-emerald-500 to-emerald-700'
  },
  {
    name: 'Violet Royal',
    primary: '#8B5CF6',
    secondary: '#5B21B6',
    accent: '#A78BFA',
    preview: 'bg-gradient-to-r from-violet-500 to-violet-700'
  },
  {
    name: 'Orange Sunset',
    primary: '#F59E0B',
    secondary: '#D97706',
    accent: '#FCD34D',
    preview: 'bg-gradient-to-r from-amber-500 to-amber-700'
  },
  {
    name: 'Rose Élégant',
    primary: '#EC4899',
    secondary: '#BE185D',
    accent: '#F472B6',
    preview: 'bg-gradient-to-r from-pink-500 to-pink-700'
  },
  {
    name: 'Gris Moderne',
    primary: '#6B7280',
    secondary: '#374151',
    accent: '#9CA3AF',
    preview: 'bg-gradient-to-r from-gray-500 to-gray-700'
  }
];

const socialPlatforms = [
  { key: 'telegram', label: 'Telegram', placeholder: 'https://t.me/votre-canal' },
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/votre-compte' },
  { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/votre-page' },
  { key: 'twitter', label: 'X (Twitter)', placeholder: 'https://x.com/votre-compte' },
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/votre-profil' },
  { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@votre-compte' },
  { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/c/votre-chaine' },
  { key: 'discord', label: 'Discord', placeholder: 'https://discord.gg/votre-serveur' }
];

export const AppearancePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { colors, updateColors } = useTheme();
  
  const [formData, setFormData] = useState({
    // Logo et nom
    logo: '',
    brandName: 'WebRichesse',
    
    // Couleurs
    primaryColor: colors.primary,
    secondaryColor: colors.secondary,
    accentColor: colors.accent,
    
    // À propos
    brandDescription: 'Plateforme SaaS pour créer, gérer et vendre vos produits numériques via des boutiques personnalisées.',
    
    // Réseaux sociaux
    socialLinks: {
      telegram: '',
      instagram: '',
      facebook: '',
      twitter: '',
      linkedin: '',
      tiktok: '',
      youtube: '',
      discord: ''
    }
  });

  const [selectedTheme, setSelectedTheme] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  console.log('AppearancePage - Initial isStoreModalOpen:', false);

  // Synchroniser les couleurs du contexte avec le formulaire
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      primaryColor: colors.primary,
      secondaryColor: colors.secondary,
      accentColor: colors.accent
    }));
  }, [colors]);

  // Charger les paramètres sauvegardés
  useEffect(() => {
    const savedSettings = localStorage.getItem('WebRichesse_global_appearance_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error);
      }
    }
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }));
    setHasChanges(true);
  };

  const handleThemeSelect = (index: number) => {
    const theme = colorThemes[index];
    setSelectedTheme(index);
    const newColors = {
      primary: theme.primary,
      secondary: theme.secondary,
      accent: theme.accent
    };
    
    setFormData(prev => ({
      ...prev,
      primaryColor: theme.primary,
      secondaryColor: theme.secondary,
      accentColor: theme.accent
    }));
    
    // Appliquer immédiatement les couleurs
    updateColors(newColors);
    setHasChanges(true);
  };

  const handleColorChange = (colorType: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [colorType]: value
    }));
    
    // Appliquer immédiatement les couleurs
    const newColors = {
      primary: colorType === 'primaryColor' ? value : formData.primaryColor,
      secondary: colorType === 'secondaryColor' ? value : formData.secondaryColor,
      accent: colorType === 'accentColor' ? value : formData.accentColor
    };
    
    updateColors(newColors);
    setHasChanges(true);
  };

  const handleSave = () => {
    // Sauvegarder les paramètres d'apparence globaux
    const globalSettings = {
      logo: formData.logo,
      brandName: formData.brandName,
      brandDescription: formData.brandDescription,
      socialLinks: formData.socialLinks,
      colors: {
        primary: formData.primaryColor,
        secondary: formData.secondaryColor,
        accent: formData.accentColor
      }
    };
    
    localStorage.setItem('WebRichesse_global_appearance_settings', JSON.stringify(globalSettings));
    
    // Les couleurs sont déjà appliquées via updateColors
    setHasChanges(false);
    alert('Paramètres d\'apparence sauvegardés avec succès !');
  };

  const descriptionLength = formData.brandDescription.length;
  const maxLength = 300;

  return (
    <PageTransition location={location.pathname}>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard/settings')}
            icon={ArrowLeft}
            className="mr-4"
          >
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Apparence générale
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Personnalisez l'aspect visuel global de votre plateforme et de toutes vos boutiques.
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button 
            onClick={() => {
              console.log('AppearancePage - Bouton Nouvelle boutique cliqué');
              setIsStoreModalOpen(true);
              console.log('AppearancePage - isStoreModalOpen mis à true:', true);
            }} 
            icon={Plus}
            variant="secondary"
            className="mr-2"
          >
            Nouvelle boutique
          </Button>
          <Button 
            onClick={handleSave} 
            icon={Save}
            disabled={!hasChanges}
            className="bg-theme-primary hover:bg-theme-primary text-white"
          >
            {hasChanges ? 'Sauvegarder' : 'Sauvegardé'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Logo et marque */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Store className="w-5 h-5 mr-2 text-theme-primary" />
              Logo et marque
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Télécharger votre logo
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-theme-primary transition-colors cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Cliquez pour télécharger votre logo
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    PNG, JPG, SVG jusqu'à 2MB - Recommandé: 200x200px
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nom de la marque
                </label>
                <input
                  type="text"
                  value={formData.brandName}
                  onChange={(e) => handleInputChange('brandName', e.target.value)}
                  placeholder="WebRichesse"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-theme-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>
          </Card>

          {/* Couleurs */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Palette className="w-5 h-5 mr-2 text-theme-primary" />
              Couleurs du thème
            </h2>
            
            {/* Thèmes prédéfinis */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Thèmes prédéfinis
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {colorThemes.map((theme, index) => (
                  <div
                    key={index}
                    onClick={() => handleThemeSelect(index)}
                    className={`cursor-pointer rounded-lg border-2 transition-all duration-200 ${
                      selectedTheme === index
                        ? 'border-theme-primary ring-2 ring-theme-primary ring-opacity-20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className={`h-12 rounded-t-md ${theme.preview}`} />
                    <div className="p-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {theme.name}
                      </p>
                      <div className="flex space-x-1 mt-2">
                        <div 
                          className="w-3 h-3 rounded-full border border-gray-200 dark:border-gray-600"
                          style={{ backgroundColor: theme.primary }}
                        />
                        <div 
                          className="w-3 h-3 rounded-full border border-gray-200 dark:border-gray-600"
                          style={{ backgroundColor: theme.secondary }}
                        />
                        <div 
                          className="w-3 h-3 rounded-full border border-gray-200 dark:border-gray-600"
                          style={{ backgroundColor: theme.accent }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Couleurs personnalisées */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Couleurs personnalisées
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Couleur primaire
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                      className="w-12 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.primaryColor}
                      onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-theme-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Couleur secondaire
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={formData.secondaryColor}
                      onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                      className="w-12 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.secondaryColor}
                      onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-theme-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Couleur d'accent
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={formData.accentColor}
                      onChange={(e) => handleColorChange('accentColor', e.target.value)}
                      className="w-12 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.accentColor}
                      onChange={(e) => handleColorChange('accentColor', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-theme-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* À propos de votre marque */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              À propos de votre marque
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description de votre marque *
              </label>
              <div className="relative">
                <textarea
                  value={formData.brandDescription}
                  onChange={(e) => handleInputChange('brandDescription', e.target.value)}
                  placeholder="Décrivez votre marque et votre mission..."
                  rows={4}
                  maxLength={maxLength}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-theme-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white resize-none"
                />
                <div className="absolute bottom-2 right-2 text-xs text-gray-500 dark:text-gray-400">
                  {descriptionLength} / {maxLength}
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Cette description représente votre marque globale et peut être utilisée sur toutes vos boutiques.
              </p>
            </div>
          </Card>

          {/* Profils de réseaux sociaux */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <LinkIcon className="w-5 h-5 mr-2 text-theme-primary" />
              Profils de réseaux sociaux
            </h2>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ajoutez vos liens vers les réseaux sociaux pour votre marque globale.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {socialPlatforms.map((platform) => (
                  <div key={platform.key}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {platform.label}
                    </label>
                    <input
                      type="url"
                      value={formData.socialLinks[platform.key as keyof typeof formData.socialLinks]}
                      onChange={(e) => handleSocialLinkChange(platform.key, e.target.value)}
                      placeholder={platform.placeholder}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-theme-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Colonne d'aperçu */}
        <div className="space-y-6">
          {/* Aperçu en temps réel */}
          <Card className="sticky top-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Aperçu en temps réel
            </h2>
            
            <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
              {/* Header de la plateforme */}
              <div 
                className="h-24 flex items-center justify-center text-white font-bold text-lg relative"
                style={{ backgroundColor: formData.primaryColor }}
              >
                <div className="absolute top-2 left-2 w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Store className="w-4 h-4" />
                </div>
                {formData.brandName || 'Nom de la marque'}
              </div>
              
              {/* Contenu de la plateforme */}
              <div className="p-4 bg-white dark:bg-gray-800">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                  {formData.brandDescription || 'Description de la marque...'}
                </p>
                
                {/* Exemple de bouton */}
                <div className="mb-4">
                  <button 
                    className="px-4 py-2 text-white text-sm rounded transition-colors hover:opacity-90"
                    style={{ backgroundColor: formData.primaryColor }}
                  >
                    Bouton principal
                  </button>
                </div>
                
                {/* Exemple de lien */}
                <div className="mb-4">
                  <a 
                    href="#" 
                    className="text-sm font-medium hover:underline"
                    style={{ color: formData.primaryColor }}
                  >
                    Lien de navigation
                  </a>
                </div>
                
                {/* Réseaux sociaux */}
                <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Suivez-nous :</p>
                  <div className="flex space-x-2">
                    {Object.entries(formData.socialLinks).map(([platform, url]) => (
                      url && (
                        <div 
                          key={platform}
                          className="w-6 h-6 rounded text-white text-xs flex items-center justify-center"
                          style={{ backgroundColor: formData.accentColor }}
                        >
                          {platform.charAt(0).toUpperCase()}
                        </div>
                      )
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Conseils */}
          <Card>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              💡 Conseils de personnalisation
            </h3>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-start">
                <div className="w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0 bg-theme-primary" />
                <p>Ces paramètres s'appliquent à toute votre plateforme et toutes vos boutiques.</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0 bg-theme-primary" />
                <p>Choisissez des couleurs qui reflètent votre marque et créent une identité forte.</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0 bg-theme-primary" />
                <p>Votre logo doit être en haute résolution et sur fond transparent.</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0 bg-theme-primary" />
                <p>Une description claire renforce la confiance de vos visiteurs.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Indicateur de modifications */}
      {hasChanges && (
        <div className="fixed bottom-6 right-6 bg-theme-primary text-white px-4 py-2 rounded-lg shadow-lg z-50">
          <p className="text-sm">Modifications non sauvegardées</p>
        </div>
      )}
      
      {/* Modale de création de boutique */}
      <StoreModal
        isOpen={isStoreModalOpen}
        onClose={() => setIsStoreModalOpen(false)}
        onSuccess={(storeId) => {
          // Rediriger vers la page d'édition de la boutique après création
          navigate(`/dashboard/settings/stores/edit/${storeId}`);
        }}
      />
    </div>
    </PageTransition>
  );
};