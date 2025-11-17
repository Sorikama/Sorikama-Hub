// src/utils/redisManager.ts
import { spawn, exec } from 'child_process';
import { logger } from './logger';
import { redisLogger } from './redisLogger';
import net from 'net';

export class RedisManager {
  private static redisProcess: any = null;
  private static isRedisRunning = false;

  /**
   * Vérifie si Redis est accessible
   */
  static async checkRedisConnection(): Promise<boolean> {
    return new Promise((resolve) => {
      const client = new net.Socket();
      const timeout = setTimeout(() => {
        client.destroy();
        resolve(false);
      }, 2000);

      client.connect(6379, '127.0.0.1', () => {
        clearTimeout(timeout);
        client.destroy();
        resolve(true);
      });

      client.on('error', () => {
        clearTimeout(timeout);
        resolve(false);
      });
    });
  }

  /**
   * Démarre Redis automatiquement
   */
  static async startRedis(): Promise<boolean> {
    try {
      const isRunning = await this.checkRedisConnection();
      
      if (isRunning) {
        this.isRedisRunning = true;
        return true;
      }

      // Démarrage silencieux de Redis

      return new Promise((resolve) => {
        // Démarrer Redis en arrière-plan
        this.redisProcess = spawn('redis-server', [], {
          detached: true,
          stdio: ['ignore', 'pipe', 'pipe']
        });

        let startupComplete = false;

        this.redisProcess.stdout.on('data', (data: Buffer) => {
          const output = data.toString();
          
          if (output.includes('Ready to accept connections') && !startupComplete) {
            startupComplete = true;
            redisLogger.info('REDIS_READY', { 
              port: 6379, 
              pid: this.redisProcess.pid,
              timestamp: new Date().toISOString()
            });
            this.isRedisRunning = true;
            resolve(true);
          }
        });

        this.redisProcess.stderr.on('data', (data: Buffer) => {
          const error = data.toString();
          redisLogger.error('REDIS_STARTUP_ERROR', { error });
        });

        this.redisProcess.on('error', (error: Error) => {
          redisLogger.error('REDIS_SPAWN_ERROR', { error: error.message });
          resolve(false);
        });

        // Timeout de 10 secondes
        setTimeout(() => {
          if (!startupComplete) {
            redisLogger.error('REDIS_STARTUP_TIMEOUT', { timeout: 10000 });
            resolve(false);
          }
        }, 10000);
      });

    } catch (error) {
      redisLogger.error('REDIS_START_EXCEPTION', { error: error.message });
      return false;
    }
  }

  /**
   * Arrête Redis proprement
   */
  static async stopRedis(): Promise<void> {
    if (this.redisProcess && this.isRedisRunning) {
      redisLogger.info('REDIS_STOPPING', { pid: this.redisProcess.pid });
      this.redisProcess.kill('SIGTERM');
      this.isRedisRunning = false;
      redisLogger.info('REDIS_STOPPED');
    }
  }

  /**
   * Retourne le statut de Redis
   */
  static getStatus(): { running: boolean, pid?: number } {
    return {
      running: this.isRedisRunning,
      pid: this.redisProcess?.pid
    };
  }
}

// Gestion propre de l'arrêt
process.on('SIGINT', async () => {
  await RedisManager.stopRedis();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await RedisManager.stopRedis();
  process.exit(0);
});