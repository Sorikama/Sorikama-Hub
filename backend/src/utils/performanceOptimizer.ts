// src/utils/performanceOptimizer.ts
import { logger } from './logger';

/**
 * Optimiseur de performance pour éviter la surcharge système
 */
export class PerformanceOptimizer {
  private static memoryCheckInterval: NodeJS.Timeout | null = null;
  private static lastGC = Date.now();

  /**
   * Démarre le monitoring des performances
   */
  static startMonitoring() {
    // Vérification mémoire toutes les 30 secondes
    this.memoryCheckInterval = setInterval(() => {
      this.checkMemoryUsage();
    }, 30000);

    // Nettoyage automatique du garbage collector
    setInterval(() => {
      this.forceGarbageCollection();
    }, 300000); // 5 minutes

    logger.info('🔧 Optimiseur de performance démarré');
  }

  /**
   * Arrête le monitoring
   */
  static stopMonitoring() {
    if (this.memoryCheckInterval) {
      clearInterval(this.memoryCheckInterval);
      this.memoryCheckInterval = null;
    }
  }

  /**
   * Vérifie l'utilisation mémoire et alerte si nécessaire
   */
  private static checkMemoryUsage() {
    const memUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
    const externalMB = Math.round(memUsage.external / 1024 / 1024);

    // Alerte si utilisation mémoire > 200MB
    if (heapUsedMB > 200) {
      logger.warn('⚠️ Utilisation mémoire élevée', {
        heapUsed: `${heapUsedMB}MB`,
        heapTotal: `${heapTotalMB}MB`,
        external: `${externalMB}MB`
      });

      // Force garbage collection si > 300MB
      if (heapUsedMB > 300) {
        this.forceGarbageCollection();
      }
    }
  }

  /**
   * Force le garbage collection si disponible
   */
  private static forceGarbageCollection() {
    const now = Date.now();
    
    // Éviter de faire du GC trop souvent (max 1 fois par minute)
    if (now - this.lastGC < 60000) {
      return;
    }

    if (global.gc) {
      const beforeMem = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
      global.gc();
      const afterMem = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
      
      logger.info('🧹 Garbage collection effectué', {
        before: `${beforeMem}MB`,
        after: `${afterMem}MB`,
        freed: `${beforeMem - afterMem}MB`
      });
      
      this.lastGC = now;
    }
  }

  /**
   * Optimise les paramètres Node.js
   */
  static optimizeNodeJS() {
    // Augmenter la limite de mémoire si nécessaire
    if (process.env.NODE_ENV === 'production') {
      process.env.NODE_OPTIONS = '--max-old-space-size=512'; // 512MB max
    }

    // Optimiser les événements
    process.setMaxListeners(20);

    logger.info('⚡ Optimisations Node.js appliquées');
  }

  /**
   * Nettoie les ressources inutilisées
   */
  static cleanup() {
    // Nettoyer les timers et intervals
    this.stopMonitoring();
    
    // Force un dernier GC
    if (global.gc) {
      global.gc();
    }

    logger.info('🧽 Nettoyage des ressources effectué');
  }
}

// Démarrage automatique en développement
if (process.env.NODE_ENV !== 'test') {
  PerformanceOptimizer.startMonitoring();
  PerformanceOptimizer.optimizeNodeJS();
}

// Nettoyage à la fermeture
process.on('SIGINT', () => {
  PerformanceOptimizer.cleanup();
});

process.on('SIGTERM', () => {
  PerformanceOptimizer.cleanup();
});