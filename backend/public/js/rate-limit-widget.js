/**
 * Rate Limit Widget - Composant UI pour afficher les informations de rate limiting
 */

class RateLimitWidget {
  constructor(securityManager, options = {}) {
    this.securityManager = securityManager;
    this.position = options.position || 'bottom-right';
    this.minimized = options.minimized !== false;
    this.container = null;
    this.enabled = options.enabled !== undefined ? options.enabled : this.isDevelopment();
    
    // Ne pas initialiser si désactivé
    if (this.enabled) {
      this.init();
    }
  }

  /**
   * Vérifier si on est en mode développement
   */
  isDevelopment() {
    // Vérifier si on est sur localhost ou 127.0.0.1
    const hostname = window.location.hostname;
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0';
  }

  /**
   * Initialiser le widget
   */
  init() {
    this.createWidget();
    this.attachEventListeners();
    this.startUpdating();
  }

  /**
   * Créer le widget HTML
   */
  createWidget() {
    // Créer le conteneur
    this.container = document.createElement('div');
    this.container.id = 'rate-limit-widget';
    this.container.className = `rate-limit-widget rate-limit-widget-${this.position}`;
    
    this.container.innerHTML = `
      <div class="rate-limit-widget-header" id="widget-header">
        <span class="rate-limit-widget-title">🛡️ Sécurité</span>
        <button class="rate-limit-widget-toggle" id="widget-toggle">
          ${this.minimized ? '▲' : '▼'}
        </button>
      </div>
      <div class="rate-limit-widget-content ${this.minimized ? 'hidden' : ''}" id="widget-content">
        <div class="rate-limit-stat">
          <span class="rate-limit-label">Limite:</span>
          <span class="rate-limit-value" id="rate-limit">-</span>
        </div>
        <div class="rate-limit-stat">
          <span class="rate-limit-label">Restantes:</span>
          <span class="rate-limit-value" id="rate-remaining">-</span>
        </div>
        <div class="rate-limit-stat">
          <span class="rate-limit-label">Reset:</span>
          <span class="rate-limit-value" id="rate-reset">-</span>
        </div>
        <div class="rate-limit-progress">
          <div class="rate-limit-progress-bar" id="progress-bar"></div>
        </div>
        <div class="rate-limit-status" id="rate-status">
          <span class="status-indicator status-ok">●</span>
          <span>Normal</span>
        </div>
      </div>
    `;
    
    // Ajouter les styles
    this.addStyles();
    
    // Ajouter au DOM
    document.body.appendChild(this.container);
  }

  /**
   * Ajouter les styles CSS
   */
  addStyles() {
    if (document.getElementById('rate-limit-widget-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'rate-limit-widget-styles';
    styles.textContent = `
      .rate-limit-widget {
        position: fixed;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        padding: 16px;
        min-width: 250px;
        z-index: 9999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
      }
      
      .rate-limit-widget-bottom-right {
        bottom: 20px;
        right: 20px;
      }
      
      .rate-limit-widget-bottom-left {
        bottom: 20px;
        left: 20px;
      }
      
      .rate-limit-widget-top-right {
        top: 20px;
        right: 20px;
      }
      
      .rate-limit-widget-top-left {
        top: 20px;
        left: 20px;
      }
      
      .rate-limit-widget-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        cursor: pointer;
        user-select: none;
      }
      
      .rate-limit-widget-title {
        font-weight: 600;
        color: #1f2937;
      }
      
      .rate-limit-widget-toggle {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 12px;
        padding: 4px 8px;
        border-radius: 4px;
        transition: background 0.2s;
      }
      
      .rate-limit-widget-toggle:hover {
        background: #f3f4f6;
      }
      
      .rate-limit-widget-content {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      
      .rate-limit-widget-content.hidden {
        display: none;
      }
      
      .rate-limit-stat {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .rate-limit-label {
        color: #6b7280;
        font-size: 13px;
      }
      
      .rate-limit-value {
        font-weight: 600;
        color: #1f2937;
      }
      
      .rate-limit-progress {
        height: 8px;
        background: #e5e7eb;
        border-radius: 4px;
        overflow: hidden;
        margin-top: 4px;
      }
      
      .rate-limit-progress-bar {
        height: 100%;
        background: #10b981;
        transition: width 0.3s ease, background 0.3s ease;
      }
      
      .rate-limit-progress-bar.warning {
        background: #f59e0b;
      }
      
      .rate-limit-progress-bar.danger {
        background: #ef4444;
      }
      
      .rate-limit-status {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px;
        background: #f9fafb;
        border-radius: 6px;
        margin-top: 4px;
        font-size: 13px;
      }
      
      .status-indicator {
        font-size: 10px;
      }
      
      .status-ok {
        color: #10b981;
      }
      
      .status-warning {
        color: #f59e0b;
      }
      
      .status-danger {
        color: #ef4444;
      }
      
      .status-blocked {
        color: #dc2626;
      }
    `;
    
    document.head.appendChild(styles);
  }

  /**
   * Attacher les event listeners
   */
  attachEventListeners() {
    // Toggle minimized/maximized
    const header = this.container.querySelector('#widget-header');
    const toggle = this.container.querySelector('#widget-toggle');
    
    header.addEventListener('click', () => {
      this.minimized = !this.minimized;
      const content = this.container.querySelector('#widget-content');
      content.classList.toggle('hidden');
      toggle.textContent = this.minimized ? '▲' : '▼';
    });
    
    // Écouter les mises à jour de rate limiting
    window.addEventListener('ratelimit-update', (event) => {
      this.updateDisplay(event.detail);
    });
  }

  /**
   * Démarrer les mises à jour périodiques
   */
  startUpdating() {
    // Mise à jour initiale
    this.updateDisplay(this.securityManager.getRateLimitInfo());
    
    // Mise à jour toutes les secondes
    setInterval(() => {
      this.updateDisplay(this.securityManager.getRateLimitInfo());
    }, 1000);
  }

  /**
   * Mettre à jour l'affichage
   */
  updateDisplay(info) {
    const limitEl = this.container.querySelector('#rate-limit');
    const remainingEl = this.container.querySelector('#rate-remaining');
    const resetEl = this.container.querySelector('#rate-reset');
    const progressBar = this.container.querySelector('#progress-bar');
    const statusEl = this.container.querySelector('#rate-status');
    
    // Mettre à jour les valeurs
    limitEl.textContent = info.limit !== null ? info.limit : '-';
    remainingEl.textContent = info.remaining !== null ? info.remaining : '-';
    
    // Mettre à jour le temps de reset
    if (info.reset) {
      const timeUntil = this.securityManager.getTimeUntilReset();
      if (timeUntil) {
        const minutes = timeUntil.minutes;
        const seconds = timeUntil.seconds % 60;
        resetEl.textContent = `${minutes}m ${seconds}s`;
      }
    } else {
      resetEl.textContent = '-';
    }
    
    // Mettre à jour la barre de progression
    if (info.limit && info.remaining !== null) {
      const percentage = (info.remaining / info.limit) * 100;
      progressBar.style.width = `${percentage}%`;
      
      // Changer la couleur selon le pourcentage
      progressBar.className = 'rate-limit-progress-bar';
      if (percentage < 10) {
        progressBar.classList.add('danger');
      } else if (percentage < 30) {
        progressBar.classList.add('warning');
      }
    }
    
    // Mettre à jour le statut
    if (info.blocked) {
      statusEl.innerHTML = `
        <span class="status-indicator status-blocked">●</span>
        <span>Bloqué</span>
      `;
    } else if (info.remaining !== null) {
      if (info.remaining < 5) {
        statusEl.innerHTML = `
          <span class="status-indicator status-danger">●</span>
          <span>Critique</span>
        `;
      } else if (info.remaining < 20) {
        statusEl.innerHTML = `
          <span class="status-indicator status-warning">●</span>
          <span>Attention</span>
        `;
      } else {
        statusEl.innerHTML = `
          <span class="status-indicator status-ok">●</span>
          <span>Normal</span>
        `;
      }
    }
  }

  /**
   * Détruire le widget
   */
  destroy() {
    if (this.container) {
      this.container.remove();
    }
  }

  /**
   * Vérifier si le widget est activé
   */
  isEnabled() {
    return this.enabled;
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RateLimitWidget;
}

window.RateLimitWidget = RateLimitWidget;
