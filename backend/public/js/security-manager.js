/**
 * Security Manager - Gestion CSRF et Rate Limiting
 * 
 * Module pour gérer automatiquement la protection CSRF et le rate limiting
 * côté client pour toutes les requêtes API.
 */

class SecurityManager {
  constructor(config = {}) {
    this.apiBase = config.apiBase || 'http://localhost:7000/api/v1';
    this.csrfToken = null;
    this.rateLimitInfo = {
      limit: null,
      remaining: null,
      reset: null,
      blocked: false
    };
    // En production, désactiver les notifications par défaut sauf si explicitement activées
    const isDev = this.isDevelopment();
    this.notifications = config.notifications !== undefined ? config.notifications : isDev;
    this.autoRetry = config.autoRetry !== false;
    this.debug = config.debug !== undefined ? config.debug : isDev;
    
    // Initialisation automatique
    this.init();
  }

  /**
   * Vérifier si on est en mode développement
   */
  isDevelopment() {
    const hostname = window.location.hostname;
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0';
  }

  /**
   * Initialisation du Security Manager
   */
  async init() {
    this.log('🔐 Security Manager initialisé');
    
    // Récupérer le token CSRF au démarrage
    await this.fetchCsrfToken();
    
    // Vérifier périodiquement le token (toutes les 30 minutes)
    setInterval(() => this.refreshCsrfToken(), 30 * 60 * 1000);
  }

  /**
   * Logger pour le debug
   */
  log(message, type = 'info') {
    if (!this.debug) return;
    
    const styles = {
      info: 'color: #3b82f6',
      success: 'color: #10b981',
      error: 'color: #ef4444',
      warning: 'color: #f59e0b'
    };
    
    console.log(`%c[SecurityManager] ${message}`, styles[type] || styles.info);
  }

  /**
   * Afficher une notification à l'utilisateur
   */
  showNotification(message, type = 'info') {
    if (!this.notifications) return;
    
    // Créer une notification toast
    const toast = document.createElement('div');
    toast.className = `security-toast security-toast-${type}`;
    toast.innerHTML = `
      <div class="security-toast-content">
        <span class="security-toast-icon">${this.getIcon(type)}</span>
        <span class="security-toast-message">${message}</span>
      </div>
    `;
    
    // Ajouter les styles si pas déjà présents
    if (!document.getElementById('security-toast-styles')) {
      const styles = document.createElement('style');
      styles.id = 'security-toast-styles';
      styles.textContent = `
        .security-toast {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 16px 20px;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          z-index: 10000;
          animation: slideIn 0.3s ease-out;
          max-width: 400px;
        }
        .security-toast-info { background: #eff6ff; border-left: 4px solid #3b82f6; color: #1e40af; }
        .security-toast-success { background: #f0fdf4; border-left: 4px solid #10b981; color: #065f46; }
        .security-toast-error { background: #fef2f2; border-left: 4px solid #ef4444; color: #991b1b; }
        .security-toast-warning { background: #fffbeb; border-left: 4px solid #f59e0b; color: #92400e; }
        .security-toast-content { display: flex; align-items: center; gap: 12px; }
        .security-toast-icon { font-size: 20px; }
        .security-toast-message { flex: 1; font-size: 14px; }
        @keyframes slideIn {
          from { transform: translateX(400px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(400px); opacity: 0; }
        }
      `;
      document.head.appendChild(styles);
    }
    
    document.body.appendChild(toast);
    
    // Supprimer après 5 secondes
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }

  /**
   * Obtenir l'icône selon le type
   */
  getIcon(type) {
    const icons = {
      info: 'ℹ️',
      success: '✅',
      error: '❌',
      warning: '⚠️'
    };
    return icons[type] || icons.info;
  }

  /**
   * Récupérer un token CSRF
   */
  async fetchCsrfToken() {
    try {
      this.log('Récupération du token CSRF...', 'info');
      
      const response = await fetch(`${this.apiBase}/security/csrf-token`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'success' && data.data.csrfToken) {
        this.csrfToken = data.data.csrfToken;
        localStorage.setItem('csrf_token', this.csrfToken);
        this.log('✅ Token CSRF récupéré', 'success');
        return this.csrfToken;
      } else {
        throw new Error('Token CSRF non reçu');
      }
    } catch (error) {
      this.log(`❌ Erreur récupération CSRF: ${error.message}`, 'error');
      this.showNotification('Erreur de sécurité: impossible de récupérer le token CSRF', 'error');
      throw error;
    }
  }

  /**
   * Rafraîchir le token CSRF
   */
  async refreshCsrfToken() {
    this.log('Rafraîchissement du token CSRF...', 'info');
    return this.fetchCsrfToken();
  }

  /**
   * Obtenir le token CSRF actuel
   */
  getCsrfToken() {
    return this.csrfToken || localStorage.getItem('csrf_token');
  }

  /**
   * Mettre à jour les informations de rate limiting
   */
  updateRateLimitInfo(headers) {
    const limit = headers.get('X-RateLimit-Limit');
    const remaining = headers.get('X-RateLimit-Remaining');
    const reset = headers.get('X-RateLimit-Reset');
    const blocked = headers.get('X-RateLimit-Blocked');
    
    if (limit) this.rateLimitInfo.limit = parseInt(limit);
    if (remaining) this.rateLimitInfo.remaining = parseInt(remaining);
    if (reset) this.rateLimitInfo.reset = parseInt(reset);
    if (blocked) this.rateLimitInfo.blocked = blocked === 'true';
    
    // Avertir si proche de la limite
    if (this.rateLimitInfo.remaining !== null && this.rateLimitInfo.remaining < 10) {
      this.log(`⚠️ Attention: ${this.rateLimitInfo.remaining} requêtes restantes`, 'warning');
      this.showNotification(
        `Attention: seulement ${this.rateLimitInfo.remaining} requêtes restantes`,
        'warning'
      );
    }
    
    // Dispatcher un événement personnalisé
    window.dispatchEvent(new CustomEvent('ratelimit-update', {
      detail: this.rateLimitInfo
    }));
  }

  /**
   * Gérer les erreurs CSRF
   */
  async handleCsrfError(error, originalRequest) {
    this.log('❌ Erreur CSRF détectée', 'error');
    
    if (this.autoRetry) {
      this.log('Tentative de récupération...', 'info');
      this.showNotification('Token de sécurité expiré, récupération en cours...', 'warning');
      
      try {
        // Récupérer un nouveau token
        await this.fetchCsrfToken();
        
        // Réessayer la requête originale
        this.log('Nouvelle tentative de la requête...', 'info');
        return this.fetch(originalRequest.url, originalRequest.options);
      } catch (retryError) {
        this.log(`❌ Échec de la récupération: ${retryError.message}`, 'error');
        this.showNotification('Erreur de sécurité persistante. Veuillez recharger la page.', 'error');
        throw retryError;
      }
    } else {
      this.showNotification('Token de sécurité invalide. Veuillez recharger la page.', 'error');
      throw error;
    }
  }

  /**
   * Gérer les erreurs de rate limiting
   */
  async handleRateLimitError(response, originalRequest) {
    const retryAfter = response.headers.get('Retry-After');
    const seconds = parseInt(retryAfter) || 60;
    
    this.log(`❌ Rate limit atteint. Retry-After: ${seconds}s`, 'error');
    this.showNotification(
      `Trop de requêtes. Veuillez patienter ${seconds} secondes.`,
      'error'
    );
    
    if (this.autoRetry && seconds <= 60) {
      this.log(`Attente de ${seconds} secondes avant nouvelle tentative...`, 'warning');
      
      return new Promise((resolve) => {
        setTimeout(async () => {
          this.log('Nouvelle tentative après rate limit...', 'info');
          resolve(this.fetch(originalRequest.url, originalRequest.options));
        }, seconds * 1000);
      });
    }
    
    throw new Error(`Rate limit exceeded. Retry after ${seconds} seconds.`);
  }

  /**
   * Fetch sécurisé avec gestion CSRF et rate limiting
   */
  async fetch(url, options = {}) {
    // Préparer les headers
    const headers = new Headers(options.headers || {});
    
    // Ajouter le token CSRF pour les requêtes non-GET
    const method = (options.method || 'GET').toUpperCase();
    if (method !== 'GET' && method !== 'OPTIONS') {
      const token = this.getCsrfToken();
      
      if (!token) {
        this.log('⚠️ Pas de token CSRF, récupération...', 'warning');
        await this.fetchCsrfToken();
      }
      
      headers.set('X-CSRF-Token', this.getCsrfToken());
    }
    
    // Ajouter Content-Type si pas présent
    if (!headers.has('Content-Type') && options.body) {
      headers.set('Content-Type', 'application/json');
    }
    
    // Construire l'URL complète si nécessaire
    const fullUrl = url.startsWith('http') ? url : `${this.apiBase}${url}`;
    
    // Préparer les options de la requête
    const fetchOptions = {
      ...options,
      headers,
      credentials: 'include'
    };
    
    try {
      this.log(`📤 ${method} ${fullUrl}`, 'info');
      
      const response = await fetch(fullUrl, fetchOptions);
      
      // Mettre à jour les infos de rate limiting
      this.updateRateLimitInfo(response.headers);
      
      // Gérer les erreurs CSRF (403)
      if (response.status === 403) {
        const data = await response.json().catch(() => ({}));
        if (data.message && data.message.toLowerCase().includes('csrf')) {
          return this.handleCsrfError(
            new Error('CSRF token invalid'),
            { url, options: fetchOptions }
          );
        }
      }
      
      // Gérer les erreurs de rate limiting (429)
      if (response.status === 429) {
        return this.handleRateLimitError(response, { url, options: fetchOptions });
      }
      
      this.log(`✅ ${method} ${fullUrl} - ${response.status}`, 'success');
      
      return response;
    } catch (error) {
      this.log(`❌ Erreur réseau: ${error.message}`, 'error');
      this.showNotification(`Erreur de connexion: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Méthodes raccourcies
   */
  async get(url, options = {}) {
    return this.fetch(url, { ...options, method: 'GET' });
  }

  async post(url, data, options = {}) {
    return this.fetch(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async put(url, data, options = {}) {
    return this.fetch(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async patch(url, data, options = {}) {
    return this.fetch(url, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async delete(url, options = {}) {
    return this.fetch(url, { ...options, method: 'DELETE' });
  }

  /**
   * Obtenir les informations de rate limiting
   */
  getRateLimitInfo() {
    return { ...this.rateLimitInfo };
  }

  /**
   * Vérifier si le client est bloqué
   */
  isBlocked() {
    return this.rateLimitInfo.blocked;
  }

  /**
   * Obtenir le temps restant avant reset
   */
  getTimeUntilReset() {
    if (!this.rateLimitInfo.reset) return null;
    
    const now = Date.now();
    const reset = this.rateLimitInfo.reset;
    const remaining = Math.max(0, reset - now);
    
    return {
      milliseconds: remaining,
      seconds: Math.ceil(remaining / 1000),
      minutes: Math.ceil(remaining / 60000)
    };
  }
}

// Export pour utilisation en module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SecurityManager;
}

// Instance globale pour utilisation directe
window.SecurityManager = SecurityManager;
