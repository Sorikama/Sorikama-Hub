import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Product } from '../../../types';
import { Button } from '../../ui/Button';
import { Save } from 'lucide-react';

interface ProductDescriptionTabProps {
  product: Product;
  formData: any;
  onChange: (data: any) => void;
  onSave?: () => Promise<void>;
}

export const ProductDescriptionTab: React.FC<ProductDescriptionTabProps> = ({
  formData,
  onChange,
  onSave
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [editorKey, setEditorKey] = useState<number>(0); // Clé pour forcer la réinitialisation de l'éditeur
  const [themeColor, setThemeColor] = useState<string>('#3B82F6'); // Couleur par défaut
  const editorRef = useRef<any>(null);
  
  // Détecter le mode sombre et la couleur du thème
  useEffect(() => {
    const checkTheme = () => {
      // Détecter le mode sombre
      const isDark = document.documentElement.classList.contains('dark');
      
      // Récupérer la couleur du thème depuis les variables CSS
      const computedStyle = getComputedStyle(document.documentElement);
      const themeColorVar = computedStyle.getPropertyValue('--color-theme-primary').trim() || '#3B82F6';
      
      // Mettre à jour les états si nécessaire
      if (isDark !== isDarkMode || themeColorVar !== themeColor) {
        setIsDarkMode(isDark);
        setThemeColor(themeColorVar);
        // Forcer la réinitialisation de l'éditeur lors du changement de thème
        setEditorKey(prevKey => prevKey + 1);
        
        // Mettre à jour les couleurs de l'éditeur si déjà initialisé
        if (editorRef.current) {
          try {
            const editor = editorRef.current;
            editor.dom.addStyle(
              `.tox-edit-area__iframe { background-color: ${isDark ? '#1f2937' : '#ffffff'}; }` +
              `.tox .tox-mbtn.tox-mbtn--active { background-color: ${themeColorVar}20; color: ${themeColorVar}; }` +
              `.tox .tox-tbtn--enabled, .tox .tox-tbtn--enabled:hover { background-color: ${themeColorVar}20; color: ${themeColorVar}; }`
            );
          } catch (e) {
            console.error('Erreur lors de la mise à jour des couleurs de l\'éditeur:', e);
          }
        }
      }
    };
    
    // Vérifier au chargement
    checkTheme();
    
    // Observer les changements de classe sur l'element HTML
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    // Observer les changements de variables CSS
    const styleObserver = new MutationObserver(checkTheme);
    styleObserver.observe(document.head, { childList: true, subtree: true });
    
    return () => {
      observer.disconnect();
      styleObserver.disconnect();
    };
  }, [isDarkMode, themeColor]);
  
  const handleInputChange = (field: string, value: any) => {
    onChange({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Description du produit
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description courte *
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Résumé accrocheur de votre produit en quelques lignes..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-theme-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              required
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Cette description apparaîtra sur la page de votre boutique et dans les aperçus.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description détaillée
            </label>
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <Editor
                key={editorKey} // Forcer la réinitialisation de l'éditeur lors du changement de thème
                apiKey="w9rpfpblzxyyoh46gdx8g93c4r3apzlw97r93c1su61u6ya7"
                value={formData.longDescription || ''}
                onEditorChange={(content: string) => handleInputChange('longDescription', content)}
                init={{
                  height: 400,
                  menubar: true, // Activer la barre de menu pour plus d'options
                  plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                    'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount',
                    'quickbars', 'emoticons', 'hr', 'pagebreak', 'nonbreaking', 'template'
                  ],
                  toolbar: 'undo redo | styles | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | forecolor backcolor | bullist numlist | outdent indent | link image media table | removeformat code fullscreen help',
                  formats: {
                    h1: { block: 'h1', classes: 'text-3xl font-bold my-4' },
                    h2: { block: 'h2', classes: 'text-2xl font-bold my-3' },
                    h3: { block: 'h3', classes: 'text-xl font-bold my-2' },
                    h4: { block: 'h4', classes: 'text-lg font-bold my-2' },
                    h5: { block: 'h5', classes: 'text-base font-bold my-1' },
                    h6: { block: 'h6', classes: 'text-sm font-bold my-1' }
                  },
                  style_formats: [
                    { title: 'En-têtes', items: [
                      { title: 'Titre 1', format: 'h1' },
                      { title: 'Titre 2', format: 'h2' },
                      { title: 'Titre 3', format: 'h3' },
                      { title: 'Titre 4', format: 'h4' },
                      { title: 'Titre 5', format: 'h5' },
                      { title: 'Titre 6', format: 'h6' }
                    ]},
                    { title: 'Blocs', items: [
                      { title: 'Paragraphe', format: 'p' },
                      { title: 'Citation', format: 'blockquote' },
                      { title: 'Code', format: 'pre' }
                    ]},
                    { title: 'Conteneurs', items: [
                      { title: 'Section', block: 'section', wrapper: true },
                      { title: 'Article', block: 'article', wrapper: true },
                      { title: 'Div', block: 'div', wrapper: true }
                    ]}
                  ],
                  content_style: `
                    body { font-family:Helvetica,Arial,sans-serif; font-size:14px; max-width:100%; }
                    a { color: ${themeColor}; }
                    button.tox-tbtn.tox-tbtn--enabled { background-color: ${themeColor}20; color: ${themeColor}; }
                    .mce-content-body [data-mce-selected="inline-boundary"] { background-color: ${themeColor}40; }
                  `,
                  skin: isDarkMode ? 'oxide-dark' : 'oxide',
                  content_css: isDarkMode ? 'dark' : 'default',
                  setup: (editor: any) => {
                    editorRef.current = editor;
                    editor.on('init', () => {
                      // Appliquer les couleurs du thème après l'initialisation
                      editor.dom.addStyle(
                        `.tox .tox-tbtn--enabled, .tox .tox-tbtn--enabled:hover { background-color: ${themeColor}20; color: ${themeColor}; }` +
                        `.tox .tox-mbtn.tox-mbtn--active { background-color: ${themeColor}20; color: ${themeColor}; }`
                      );
                    });
                  },
                  quickbars_selection_toolbar: 'bold italic | h1 h2 h3 | blockquote quicklink',
                  quickbars_insert_toolbar: 'quickimage quicktable',
                  resize: true,
                  branding: false,
                  promotion: false,
                  elementpath: true
                }}
              />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Description complète qui sera affichée sur la page produit.
            </p>
          </div>
        </div>
      </div>
      
      {/* Bouton d'enregistrement */}
      <div className="mt-8 flex justify-end">
        <Button
          onClick={async () => {
            if (onSave) {
              setIsSaving(true);
              try {
                await onSave();
              } finally {
                setIsSaving(false);
              }
            }
          }}
          icon={Save}
          disabled={isSaving}
        >
          {isSaving ? 'Sauvegarde en cours...' : 'Enregistrer la description'}
        </Button>
      </div>
    </div>
  );
};