/**
 * Configuration de sécurité
 * 
 * Ce fichier permet de configurer facilement le Security Manager
 * et le Rate Limit Widget selon l'environnement
 */

const SecurityConfig = {
  /**
   * Déterminer l'environnement actuel
   */
  getEnvironment() {
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0') {
      return 'development';
    }
    
    // Vous pouvez ajouter d'autres conditions pour staging, etc.
    if (hostname.includes('staging') || hostname.includes('preprod')) {
      return 'staging';
    }
    
    return 'production';
  },

  /**
   * Vérifier si on est en développement
   */
  isDevelopment() {
    return this.getEnvironment() === 'development';
  },

  /**
   * Vérifier si on est en production
   */
  isProduction() {
    return this.getEnvironment() === 'production';
  },

  /**
   * Configuration par défaut pour le Security Manager
   */
  getSecurityManagerConfig() {
    const env = this.getEnvironment();
    
    return {
      apiBase: window.location.origin + '/api/v1',
      
      // Notifications : activées en dev, désactivées en prod
      notifications: env === 'development',
      
      // Auto-retry : toujours activé
      autoRetry: true,
      
      // Debug : activé en dev uniquement
      debug: env === 'development'
    };
  },

  /**
   * Configuration par défaut pour le Rate Limit Widget
   */
  getRateLimitWidgetConfig() {
    const env = this.getEnvironment();
    
    return {
      // Position du widget
      position: 'bottom-right',
      
      // Démarrer minimisé
      minimized: false,
      
      // Activé uniquement en développement
      enabled: env === 'development'
    };
  },

  /**
   * Créer une instance du Security Manager avec la config par défaut
   */
  createSecurityManager(customConfig = {}) {
    const defaultConfig = this.getSecurityManagerConfig();
    const config = { ...defaultConfig, ...customConfig };
    
    if (typeof SecurityManager === 'undefined') {
      console.error('SecurityManager non chargé. Incluez /js/security-manager.js');
      return null;
    }
    
    return new SecurityManager(config);
  },

  /**
   * Créer une instance du Rate Limit Widget avec la config par défaut
   */
  createRateLimitWidget(securityManager, customConfig = {}) {
    const defaultConfig = this.getRateLimitWidgetConfig();
    const config = { ...defaultConfig, ...customConfig };
    
    if (typeof RateLimitWidget === 'undefined') {
      console.error('RateLimitWidget non chargé. Incluez /js/rate-limit-widget.js');
      return null;
    }
    
    // Ne créer le widget que si activé
    if (config.enabled) {
      return new RateLimitWidget(securityManager, config);
    }
    
    return null;
  },

  /**
   * Initialisation rapide avec configuration automatique
   */
  quickSetup() {
    const api = this.createSecurityManager();
    const widget = this.createRateLimitWidget(api);
    
    return { api, widget };
  }
};

// Export pour utilisation en module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SecurityConfig;
}

// Instance globale
window.SecurityConfig = SecurityConfig;
