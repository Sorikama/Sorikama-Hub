// src/utils/browserLauncher.ts
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { logger } from './logger';

const LAUNCH_COUNT_FILE = path.join(process.cwd(), '.launch-count');
const MAX_AUTO_LAUNCHES = 3;

export class BrowserLauncher {
  
  /**
   * Lance automatiquement le navigateur si conditions remplies
   */
  static async autoLaunch(port: number) {
    try {
      // Vérifier le compteur de lancements
      const launchCount = this.getLaunchCount();
      
      if (launchCount >= MAX_AUTO_LAUNCHES) {
        logger.info(`🚫 Lancement automatique désactivé (${launchCount}/${MAX_AUTO_LAUNCHES} tentatives atteintes)`);
        logger.info(`💡 Accédez manuellement à: http://localhost:${port}`);
        return;
      }

      // Incrémenter le compteur
      this.incrementLaunchCount();
      
      const url = `http://localhost:${port}`;
      logger.info(`🌐 Lancement automatique du navigateur (${launchCount + 1}/${MAX_AUTO_LAUNCHES})`);
      
      // Lancer le navigateur selon l'OS
      await this.openBrowser(url);
      
    } catch (error) {
      logger.error('❌ Erreur lors du lancement du navigateur:', error);
    }
  }

  /**
   * Ouvre le navigateur selon l'OS
   */
  private static async openBrowser(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      let command: string;
      
      switch (process.platform) {
        case 'darwin': // macOS
          command = `open "${url}"`;
          break;
        case 'win32': // Windows
          command = `start "" "${url}"`;
          break;
        default: // Linux
          command = `xdg-open "${url}"`;
          break;
      }
      
      exec(command, (error) => {
        if (error) {
          logger.warn('⚠️ Impossible d\'ouvrir le navigateur automatiquement');
          reject(error);
        } else {
          logger.info('✅ Navigateur ouvert avec succès');
          resolve();
        }
      });
    });
  }

  /**
   * Récupère le nombre de lancements
   */
  private static getLaunchCount(): number {
    try {
      if (fs.existsSync(LAUNCH_COUNT_FILE)) {
        const count = parseInt(fs.readFileSync(LAUNCH_COUNT_FILE, 'utf8'));
        return isNaN(count) ? 0 : count;
      }
      return 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Incrémente le compteur de lancements
   */
  private static incrementLaunchCount(): void {
    try {
      const currentCount = this.getLaunchCount();
      fs.writeFileSync(LAUNCH_COUNT_FILE, (currentCount + 1).toString());
    } catch (error) {
      logger.error('❌ Erreur mise à jour compteur lancement:', error);
    }
  }

  /**
   * Remet à zéro le compteur (pour les admins)
   */
  static resetLaunchCount(): void {
    try {
      if (fs.existsSync(LAUNCH_COUNT_FILE)) {
        fs.unlinkSync(LAUNCH_COUNT_FILE);
      }
      logger.info('🔄 Compteur de lancement remis à zéro');
    } catch (error) {
      logger.error('❌ Erreur reset compteur:', error);
    }
  }

  /**
   * Obtient le statut du lancement automatique
   */
  static getStatus(): { count: number, maxCount: number, autoLaunchEnabled: boolean } {
    const count = this.getLaunchCount();
    return {
      count,
      maxCount: MAX_AUTO_LAUNCHES,
      autoLaunchEnabled: count < MAX_AUTO_LAUNCHES
    };
  }
}