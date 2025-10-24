// src/utils/portManager.ts
import { exec } from 'child_process';
import { promisify } from 'util';
import { logger } from './logger';

const execAsync = promisify(exec);

export class PortManager {
  /**
   * Vérifier si un port est occupé
   */
  static async isPortInUse(port: number): Promise<boolean> {
    try {
      const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
      return stdout.trim().length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtenir le PID du processus utilisant le port
   */
  static async getProcessOnPort(port: number): Promise<string | null> {
    try {
      const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
      const lines = stdout.trim().split('\n');
      
      for (const line of lines) {
        if (line.includes('LISTENING')) {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          return pid;
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Obtenir le nom du processus par PID
   */
  static async getProcessName(pid: string): Promise<string | null> {
    try {
      const { stdout } = await execAsync(`tasklist /FI "PID eq ${pid}" /FO CSV /NH`);
      const line = stdout.trim().split('\n')[0];
      if (line && line !== 'INFO: No tasks are running which match the specified criteria.') {
        const processName = line.split(',')[0].replace(/"/g, '');
        return processName;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Tuer un processus par PID
   */
  static async killProcess(pid: string): Promise<boolean> {
    try {
      await execAsync(`taskkill /PID ${pid} /F`);
      return true;
    } catch (error) {
      logger.error(`Erreur lors de l'arrêt du processus ${pid}:`, error);
      return false;
    }
  }

  /**
   * Libérer un port en tuant le processus qui l'utilise
   */
  static async freePort(port: number): Promise<boolean> {
    try {
      logger.info(`🔍 Vérification du port ${port}...`);
      
      const isInUse = await this.isPortInUse(port);
      if (!isInUse) {
        logger.info(`✅ Port ${port} disponible`);
        return true;
      }

      logger.warn(`⚠️ Port ${port} occupé, recherche du processus...`);
      
      const pid = await this.getProcessOnPort(port);
      if (!pid) {
        logger.error(`❌ Impossible de trouver le processus sur le port ${port}`);
        return false;
      }

      const processName = await this.getProcessName(pid);
      logger.warn(`🔍 Processus trouvé: ${processName || 'Inconnu'} (PID: ${pid})`);

      // Vérifier si c'est notre propre processus Node.js
      if (processName && (processName.toLowerCase().includes('node') || processName.toLowerCase().includes('sorikama'))) {
        logger.info(`🔄 Arrêt du processus Node.js précédent (PID: ${pid})...`);
        
        const killed = await this.killProcess(pid);
        if (killed) {
          // Attendre un peu que le port se libère
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const stillInUse = await this.isPortInUse(port);
          if (!stillInUse) {
            logger.info(`✅ Port ${port} libéré avec succès`);
            return true;
          } else {
            logger.error(`❌ Le port ${port} est toujours occupé après l'arrêt du processus`);
            return false;
          }
        } else {
          logger.error(`❌ Impossible d'arrêter le processus ${pid}`);
          return false;
        }
      } else {
        logger.warn(`⚠️ Le port ${port} est utilisé par un autre processus (${processName})`);
        logger.warn(`💡 Vous pouvez l'arrêter manuellement avec: taskkill /PID ${pid} /F`);
        return false;
      }
    } catch (error) {
      logger.error(`Erreur lors de la libération du port ${port}:`, error);
      return false;
    }
  }

  /**
   * Trouver un port libre à partir d'un port donné
   */
  static async findFreePort(startPort: number): Promise<number> {
    let port = startPort;
    while (port < startPort + 100) {
      const inUse = await this.isPortInUse(port);
      if (!inUse) {
        return port;
      }
      port++;
    }
    throw new Error(`Aucun port libre trouvé entre ${startPort} et ${startPort + 100}`);
  }

  /**
   * Préparer le port pour l'application
   */
  static async preparePort(desiredPort: number): Promise<number> {
    try {
      // Forcer la libération du port 7000
      await this.freePort(desiredPort);
      return desiredPort;
    } catch (error) {
      logger.error('Erreur lors de la préparation du port:', error);
      throw error;
    }
  }
}