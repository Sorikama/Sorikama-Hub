// === SORIKAMA SWAGGER CUSTOM JAVASCRIPT ===

(function() {
    'use strict';

    // Configuration
    const SORIKAMA_CONFIG = {
        theme: 'professional',
        animations: true,
        autoRefresh: true,
        refreshInterval: 30000, // 30 secondes
        showNotifications: true
    };

    // Utilitaires
    const utils = {
        // Créer un élément avec classes et contenu
        createElement: (tag, classes = [], content = '') => {
            const element = document.createElement(tag);
            if (classes.length) element.className = classes.join(' ');
            if (content) element.innerHTML = content;
            return element;
        },

        // Ajouter des styles CSS dynamiquement
        addStyles: (css) => {
            const style = document.createElement('style');
            style.textContent = css;
            document.head.appendChild(style);
        },

        // Afficher une notification
        showNotification: (message, type = 'info', duration = 5000) => {
            if (!SORIKAMA_CONFIG.showNotifications) return;

            const notification = utils.createElement('div', 
                ['sorikama-notification', `sorikama-notification--${type}`], 
                `<span class="sorikama-notification__icon">${getNotificationIcon(type)}</span>
                 <span class="sorikama-notification__message">${message}</span>
                 <button class="sorikama-notification__close">×</button>`
            );

            document.body.appendChild(notification);

            // Auto-remove
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, duration);

            // Close button
            notification.querySelector('.sorikama-notification__close').onclick = () => {
                notification.remove();
            };
        },

        // Formater le temps
        formatTime: (timestamp) => {
            return new Date(timestamp).toLocaleString('fr-FR');
        },

        // Copier dans le presse-papiers
        copyToClipboard: async (text) => {
            try {
                await navigator.clipboard.writeText(text);
                utils.showNotification('Copié dans le presse-papiers !', 'success');
            } catch (err) {
                console.error('Erreur de copie:', err);
                utils.showNotification('Erreur lors de la copie', 'error');
            }
        }
    };

    // Icônes pour les notifications
    function getNotificationIcon(type) {
        const icons = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌'
        };
        return icons[type] || icons.info;
    }

    // Améliorer l'interface Swagger
    function enhanceSwaggerUI() {
        // Attendre que Swagger UI soit chargé
        const checkSwaggerLoaded = setInterval(() => {
            const swaggerContainer = document.querySelector('.swagger-ui');
            if (swaggerContainer) {
                clearInterval(checkSwaggerLoaded);
                initializeEnhancements();
            }
        }, 100);
    }

    // Initialiser les améliorations
    function initializeEnhancements() {
        console.log('🌟 Initialisation des améliorations Sorikama...');

        // Ajouter les styles pour les notifications
        addNotificationStyles();
        
        // Ajouter le header personnalisé
        addCustomHeader();
        
        // Ajouter les badges de statut
        addStatusBadges();
        
        // Améliorer les boutons
        enhanceButtons();
        
        // Ajouter les fonctionnalités de copie
        addCopyFeatures();
        
        // Ajouter le monitoring en temps réel
        if (SORIKAMA_CONFIG.autoRefresh) {
            startHealthMonitoring();
        }
        
        // Ajouter les raccourcis clavier
        addKeyboardShortcuts();
        
        // Ajouter les tooltips
        addTooltips();

        utils.showNotification('Interface Sorikama chargée avec succès !', 'success');
    }

    // Ajouter les styles pour les notifications
    function addNotificationStyles() {
        const css = `
            .sorikama-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border-radius: 12px;
                padding: 16px 20px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
                border-left: 4px solid #3b82f6;
                display: flex;
                align-items: center;
                gap: 12px;
                z-index: 10000;
                animation: slideInRight 0.3s ease-out;
                max-width: 400px;
                font-family: 'Inter', sans-serif;
            }

            .sorikama-notification--success { border-left-color: #10b981; }
            .sorikama-notification--warning { border-left-color: #f59e0b; }
            .sorikama-notification--error { border-left-color: #ef4444; }

            .sorikama-notification__icon {
                font-size: 18px;
                flex-shrink: 0;
            }

            .sorikama-notification__message {
                flex: 1;
                font-size: 14px;
                color: #374151;
                font-weight: 500;
            }

            .sorikama-notification__close {
                background: none;
                border: none;
                font-size: 18px;
                cursor: pointer;
                color: #9ca3af;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.2s;
            }

            .sorikama-notification__close:hover {
                background: #f3f4f6;
                color: #374151;
            }

            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            .sorikama-header-stats {
                display: flex;
                gap: 16px;
                margin-top: 20px;
                flex-wrap: wrap;
            }

            .sorikama-stat-card {
                background: linear-gradient(135deg, #ffffff, #f8fafc);
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                padding: 16px 20px;
                text-align: center;
                min-width: 120px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                transition: all 0.3s ease;
            }

            .sorikama-stat-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
            }

            .sorikama-stat-value {
                font-size: 24px;
                font-weight: 700;
                color: #1e293b;
                margin-bottom: 4px;
            }

            .sorikama-stat-label {
                font-size: 12px;
                color: #64748b;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                font-weight: 600;
            }

            .sorikama-copy-btn {
                background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                color: white;
                border: none;
                border-radius: 6px;
                padding: 4px 8px;
                font-size: 12px;
                cursor: pointer;
                margin-left: 8px;
                transition: all 0.2s;
            }

            .sorikama-copy-btn:hover {
                background: linear-gradient(135deg, #1d4ed8, #1e40af);
                transform: scale(1.05);
            }
        `;
        utils.addStyles(css);
    }

    // Ajouter le header personnalisé avec statistiques
    function addCustomHeader() {
        const infoSection = document.querySelector('.swagger-ui .info');
        if (!infoSection) return;

        const statsContainer = utils.createElement('div', ['sorikama-header-stats']);
        
        // Statistiques factices (à remplacer par de vraies données)
        const stats = [
            { value: '6', label: 'Services' },
            { value: '99.9%', label: 'Uptime' },
            { value: '< 150ms', label: 'Latence' },
            { value: '24/7', label: 'Support' }
        ];

        stats.forEach(stat => {
            const card = utils.createElement('div', ['sorikama-stat-card'], 
                `<div class="sorikama-stat-value">${stat.value}</div>
                 <div class="sorikama-stat-label">${stat.label}</div>`
            );
            statsContainer.appendChild(card);
        });

        infoSection.appendChild(statsContainer);
    }

    // Ajouter les badges de statut
    function addStatusBadges() {
        const infoSection = document.querySelector('.swagger-ui .info');
        if (!infoSection) return;

        const badgeContainer = utils.createElement('div', ['sorikama-status-badges']);
        
        const badges = [
            { text: '🟢 Système Opérationnel', class: 'operational' },
            { text: '🔒 Sécurisé SSL/TLS', class: 'operational' },
            { text: '⚡ Performance Optimisée', class: 'operational' }
        ];

        badges.forEach(badge => {
            const badgeEl = utils.createElement('span', 
                ['sorikama-status-badge', badge.class], 
                badge.text
            );
            badgeContainer.appendChild(badgeEl);
        });

        infoSection.appendChild(badgeContainer);
    }

    // Améliorer les boutons
    function enhanceButtons() {
        // Ajouter des effets aux boutons existants
        const buttons = document.querySelectorAll('.swagger-ui .btn');
        buttons.forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                if (SORIKAMA_CONFIG.animations) {
                    btn.style.transform = 'translateY(-1px)';
                }
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translateY(0)';
            });
        });
    }

    // Ajouter les fonctionnalités de copie
    function addCopyFeatures() {
        // Ajouter des boutons de copie pour les URLs et exemples
        const codeBlocks = document.querySelectorAll('.swagger-ui .highlight-code');
        codeBlocks.forEach(block => {
            const copyBtn = utils.createElement('button', ['sorikama-copy-btn'], '📋 Copier');
            copyBtn.onclick = () => {
                utils.copyToClipboard(block.textContent);
            };
            block.parentNode.insertBefore(copyBtn, block.nextSibling);
        });
    }

    // Démarrer le monitoring de santé
    function startHealthMonitoring() {
        const checkHealth = async () => {
            try {
                const response = await fetch('/api/v1/system/health');
                const data = await response.json();
                
                if (data.success && data.data.status === 'healthy') {
                    updateHealthStatus('healthy');
                } else {
                    updateHealthStatus('unhealthy');
                    utils.showNotification('Problème détecté sur le système', 'warning');
                }
            } catch (error) {
                console.error('Erreur health check:', error);
                updateHealthStatus('unknown');
            }
        };

        // Check initial
        checkHealth();
        
        // Check périodique
        setInterval(checkHealth, SORIKAMA_CONFIG.refreshInterval);
    }

    // Mettre à jour le statut de santé
    function updateHealthStatus(status) {
        const statusBadges = document.querySelectorAll('.sorikama-status-badge');
        statusBadges.forEach(badge => {
            if (badge.textContent.includes('Système')) {
                const icons = {
                    healthy: '🟢',
                    unhealthy: '🔴',
                    unknown: '🟡'
                };
                const texts = {
                    healthy: 'Système Opérationnel',
                    unhealthy: 'Système en Maintenance',
                    unknown: 'Statut Inconnu'
                };
                badge.textContent = `${icons[status]} ${texts[status]}`;
            }
        });
    }

    // Ajouter les raccourcis clavier
    function addKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K : Focus sur la recherche
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.querySelector('.swagger-ui .filter input');
                if (searchInput) {
                    searchInput.focus();
                    utils.showNotification('Mode recherche activé', 'info', 2000);
                }
            }
            
            // Ctrl/Cmd + R : Rafraîchir les données
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                location.reload();
            }
        });
    }

    // Ajouter les tooltips
    function addTooltips() {
        const elementsWithTooltips = [
            { selector: '.swagger-ui .btn.authorize', tooltip: 'Configurer l\'authentification' },
            { selector: '.swagger-ui .btn.execute', tooltip: 'Exécuter la requête' },
            { selector: '.swagger-ui .opblock-summary', tooltip: 'Cliquer pour voir les détails' }
        ];

        elementsWithTooltips.forEach(({ selector, tooltip }) => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                el.setAttribute('data-tooltip', tooltip);
                el.classList.add('sorikama-tooltip');
            });
        });
    }

    // Initialisation au chargement de la page
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', enhanceSwaggerUI);
    } else {
        enhanceSwaggerUI();
    }

    // Exposer l'API Sorikama globalement
    window.SorikamaSwagger = {
        config: SORIKAMA_CONFIG,
        utils: utils,
        showNotification: utils.showNotification,
        version: '1.0.0'
    };

    console.log('🌟 Sorikama Swagger Enhancement loaded successfully!');
})();