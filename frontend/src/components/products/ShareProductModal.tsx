import React from 'react';
import { X, Copy, MessageCircle, Send, Facebook, Twitter, Mail, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { Product } from '../../types';

interface ShareProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  storeDomain: string;
}

export const ShareProductModal: React.FC<ShareProductModalProps> = ({
  isOpen,
  onClose,
  product,
  storeDomain
}) => {
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  // Déterminer l'URL à utiliser en fonction des disponibilités
  const getProductUrl = () => {
    if (product.custom_url) {
      // URL personnalisée
      return `${window.location.origin}/${storeDomain}/${product.custom_url}`;
    } else if (product.public_id) {
      // URL générée avec public_id
      return `${window.location.origin}/${storeDomain}/product/${product.public_id}`;
    } else {
      // URL par défaut avec ID
      return `${window.location.origin}/${storeDomain}/product/${product.id}`;
    }
  };

  const productUrl = getProductUrl();
  const checkoutUrl = `${productUrl}/checkout`;

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
    }
  };

  const shareOnWhatsApp = () => {
    const message = encodeURIComponent(`Découvrez ce produit : ${product.name}\n${productUrl}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const shareOnTelegram = () => {
    const message = encodeURIComponent(`Découvrez ce produit : ${product.name}`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(productUrl)}&text=${message}`, '_blank');
  };

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`, '_blank');
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(`Découvrez ce produit : ${product.name}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(productUrl)}`, '_blank');
  };

  const shareByEmail = () => {
    const subject = encodeURIComponent(`Découvrez ce produit : ${product.name}`);
    const body = encodeURIComponent(`Bonjour,\n\nJe voulais partager avec vous ce produit qui pourrait vous intéresser :\n\n${product.name}\n${product.description}\n\nVoir le produit : ${productUrl}\n\nCordialement`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Arrière-plan grisé */}
      <div 
        className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal qui glisse de droite vers la gauche */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Partager ce produit
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Contenu */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Nom du produit */}
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                {product.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {product.description}
              </p>
            </div>

            {/* Liens */}
            <div className="space-y-4">
              {/* Lien du produit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Lien du produit
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={productUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(productUrl, 'product')}
                    className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    title="Copier"
                  >
                    {copiedField === 'product' ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Lien de paiement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Lien de paiement
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={checkoutUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(checkoutUrl, 'checkout')}
                    className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    title="Copier"
                  >
                    {copiedField === 'checkout' ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Boutons de partage */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Partager sur les réseaux sociaux
              </h4>
              
              <div className="space-y-2">
                {/* WhatsApp */}
                <button
                  onClick={shareOnWhatsApp}
                  className="w-full flex items-center px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                >
                  <MessageCircle className="w-5 h-5 mr-3" />
                  Partager sur WhatsApp
                </button>

                {/* Telegram */}
                <button
                  onClick={shareOnTelegram}
                  className="w-full flex items-center px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  <Send className="w-5 h-5 mr-3" />
                  Partager sur Telegram
                </button>

                {/* Facebook */}
                <button
                  onClick={shareOnFacebook}
                  className="w-full flex items-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Facebook className="w-5 h-5 mr-3" />
                  Partager sur Facebook
                </button>

                {/* X (Twitter) */}
                <button
                  onClick={shareOnTwitter}
                  className="w-full flex items-center px-4 py-3 bg-black hover:bg-gray-800 text-white rounded-lg transition-colors"
                >
                  <Twitter className="w-5 h-5 mr-3" />
                  Partager sur X
                </button>

                {/* Email */}
                <button
                  onClick={shareByEmail}
                  className="w-full flex items-center px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  <Mail className="w-5 h-5 mr-3" />
                  Partager par email
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={onClose}
              variant="secondary"
              className="w-full"
            >
              Fermer
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};