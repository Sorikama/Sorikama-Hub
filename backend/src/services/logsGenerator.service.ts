// src/services/logsGenerator.service.ts
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';

export class LogsGenerator {
  private static logsDir = path.join(process.cwd(), 'logs');

  /**
   * Initialiser le répertoire des logs
   */
  static initLogsDirectory() {
    try {
      if (!fs.existsSync(this.logsDir)) {
        fs.mkdirSync(this.logsDir, { recursive: true });
        logger.info('📁 Répertoire logs créé');
      }
    } catch (error) {
      console.error('Erreur lors de la création du répertoire logs:', error);
    }
  }

  /**
   * Générer des logs de test réalistes pour tous les fichiers
   */
  static generateTestLogs() {
    this.initLogsDirectory();

    const now = new Date();
    const timestamps = [];
    
    // Générer plusieurs timestamps sur les dernières heures
    for (let i = 5; i >= 0; i--) {
      const time = new Date(now.getTime() - (i * 60 * 60 * 1000));
      timestamps.push(time.toISOString().replace('T', ' ').substring(0, 19));
    }

    // Logs d'application variés
    const appLogs = [
      `[${timestamps[0]}] INFO: 🚀 Sorikama Hub démarré avec succès`,
      `[${timestamps[1]}] INFO: 📊 Connexion à MongoDB établie`,
      `[${timestamps[2]}] INFO: 🔴 Connexion à Redis établie`,
      `[${timestamps[3]}] INFO: 🔐 Système d'authentification initialisé`,
      `[${timestamps[4]}] INFO: 📡 API Gateway opérationnel sur le port 7000`,
      `[${timestamps[5]}] INFO: ✅ Tous les services sont opérationnels`
    ];

    // Logs de sécurité réalistes
    const securityLogs = [
      `[${timestamps[0]}] INFO: 🔐 Système de sécurité initialisé`,
      `[${timestamps[1]}] INFO: 🔑 Nouvelle session créée pour utilisateur: admin`,
      `[${timestamps[2]}] WARN: ⚠️ Tentative de connexion avec token expiré`,
      `[${timestamps[3]}] INFO: 🛡️ Validation API Key réussie`,
      `[${timestamps[4]}] WARN: 🚨 Accès refusé - Token manquant`,
      `[${timestamps[5]}] INFO: 🔐 Session utilisateur renouvelée`
    ];

    // Logs de performance
    const performanceLogs = [
      `[${timestamps[0]}] INFO: ⚡ Monitoring des performances activé`,
      `[${timestamps[1]}] INFO: 📈 Temps de réponse moyen: 145ms`,
      `[${timestamps[2]}] INFO: 💾 Utilisation mémoire: 68%`,
      `[${timestamps[3]}] WARN: 🐌 Requête lente détectée: 1250ms`,
      `[${timestamps[4]}] INFO: 🔄 Nettoyage automatique du cache`,
      `[${timestamps[5]}] INFO: 📊 CPU: 45%, RAM: 72%, Disque: 23%`
    ];

    // Écrire tous les logs
    this.appendToLogFile('application.log', appLogs);
    this.appendToLogFile('security.log', securityLogs);
    this.appendToLogFile('performance.log', performanceLogs);

    logger.info('📝 Logs de test générés pour tous les fichiers');
  }

  /**
   * Ajouter des logs à un fichier
   */
  private static appendToLogFile(filename: string, logs: string[]) {
    const filePath = path.join(this.logsDir, filename);
    const content = logs.join('\n') + '\n';
    
    try {
      fs.appendFileSync(filePath, content);
    } catch (error) {
      logger.error(`Erreur lors de l'écriture dans ${filename}:`, error);
    }
  }

  /**
   * Générer des logs en continu pour simulation temps réel
   */
  static startContinuousLogging() {
    this.initLogsDirectory();

    const interval = setInterval(() => {
      const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const services = ['Masebuy'];
      const users = ['user123', 'admin', 'guest', 'john.doe', 'jane.smith'];
      
      // Générer un log aléatoire
      const logTypes = [
        {
          file: 'application.log',
          logs: [
            `[${timestamp}] INFO: 🔄 Health check automatique - Tous les services opérationnels`,
            `[${timestamp}] INFO: 📊 ${Math.floor(Math.random() * 100)} nouvelles requêtes traitées`,
            `[${timestamp}] DEBUG: 🔍 Nettoyage automatique des sessions expirées`
          ]
        },
        {
          file: 'security.log',
          logs: [
            `[${timestamp}] INFO: 🔐 Nouvelle connexion utilisateur: ${users[Math.floor(Math.random() * users.length)]}`,
            `[${timestamp}] WARN: ⚠️ Tentative de connexion suspecte détectée`
          ]
        },
        {
          file: 'performance.log',
          logs: [
            `[${timestamp}] INFO: ⚡ Temps de réponse: ${Math.floor(Math.random() * 200 + 50)}ms`,
            `[${timestamp}] DEBUG: 📈 Collecte des métriques système`
          ]
        }
      ];

      const randomType = logTypes[Math.floor(Math.random() * logTypes.length)];
      const randomLog = randomType.logs[Math.floor(Math.random() * randomType.logs.length)];
      
      this.appendToLogFile(randomType.file, [randomLog]);
    }, 5000); // Nouveau log toutes les 5 secondes

    // Arrêter après 10 minutes pour éviter de remplir le disque
    setTimeout(() => {
      clearInterval(interval);
      logger.info('🛑 Génération continue de logs arrêtée');
    }, 10 * 60 * 1000);

    logger.info('🔄 Génération continue de logs démarrée');
    return interval;
  }

  /**
   * Nettoyer les anciens logs
   */
  static cleanOldLogs(daysToKeep: number = 7) {
    this.initLogsDirectory();

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    try {
      const files = fs.readdirSync(this.logsDir);
      let deletedCount = 0;

      files.forEach(file => {
        const filePath = path.join(this.logsDir, file);
        const stats = fs.statSync(filePath);

        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(filePath);
          deletedCount++;
          logger.info(`🗑️ Fichier log supprimé: ${file}`);
        }
      });

      logger.info(`🧹 Nettoyage terminé: ${deletedCount} fichiers supprimés`);
      return deletedCount;
    } catch (error) {
      logger.error('Erreur lors du nettoyage des logs:', error);
      return 0;
    }
  }

  /**
   * Initialiser le système de logs
   */
  static initialize() {
    this.initLogsDirectory();
    this.cleanEmptyLogs();
    this.generateTestLogs();
  }

  /**
   * Nettoyer les fichiers de logs vides ou inutilisés
   */
  static cleanEmptyLogs() {
    this.initLogsDirectory();
    
    try {
      const files = fs.readdirSync(this.logsDir).filter(file => file.endsWith('.log'));
      let cleanedCount = 0;
      
      // Liste des fichiers de logs inutilisés
      const unusedFiles = [
        'redis-connections.log',
        'redis-errors.log', 
        'redis-metrics.log',
        'errors.log' // Doublon de error.log
      ];
      
      files.forEach(file => {
        const filePath = path.join(this.logsDir, file);
        const stats = fs.statSync(filePath);
        
        // Supprimer les fichiers inutilisés ou vides
        if (unusedFiles.includes(file) || stats.size === 0) {
          fs.unlinkSync(filePath);
          cleanedCount++;
          logger.info(`🗑️ Fichier log supprimé: ${file}`);
        }
      });
      
      logger.info(`🧹 Nettoyage terminé: ${cleanedCount} fichiers supprimés`);
      return cleanedCount;
    } catch (error) {
      logger.error('Erreur lors du nettoyage:', error);
      return 0;
    }
  }

  /**
   * Obtenir les statistiques des logs
   */
  static getLogsStats() {
    this.initLogsDirectory();

    try {
      const files = fs.readdirSync(this.logsDir).filter(file => file.endsWith('.log'));
      const stats = {
        totalFiles: files.length,
        totalSize: 0,
        files: []
      };

      files.forEach(file => {
        const filePath = path.join(this.logsDir, file);
        const fileStats = fs.statSync(filePath);
        
        stats.totalSize += fileStats.size;
        stats.files.push({
          name: file,
          size: fileStats.size,
          modified: fileStats.mtime,
          lines: this.countLines(filePath)
        });
      });

      return stats;
    } catch (error) {
      logger.error('Erreur lors du calcul des statistiques:', error);
      return null;
    }
  }

  /**
   * Compter les lignes dans un fichier
   */
  private static countLines(filePath: string): number {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return content.split('\n').filter(line => line.trim()).length;
    } catch (error) {
      return 0;
    }
  }
}