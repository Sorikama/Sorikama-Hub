// src/utils/banner.ts
import chalk from 'chalk';
import figlet from 'figlet';
import { logger } from './logger';

export class Banner {
  private static startTime = Date.now();
  private static stepCount = 0;
  private static totalSteps = 6; // Ajouté préparation port + monitoring

  /**
   * Obtient les couleurs selon l'environnement
   */
  private static getEnvColors() {
    const env = process.env.NODE_ENV || 'development';
    switch (env) {
      case 'production':
        return {
          primary: (text: string) => chalk.red.bold(text),
          secondary: (text: string) => chalk.yellow.bold(text),
          accent: (text: string) => chalk.white.bold(text),
          env: (text: string) => chalk.red.bgWhite.bold(text)
        };
      case 'test':
        return {
          primary: (text: string) => chalk.yellow.bold(text),
          secondary: (text: string) => chalk.yellow.bold(text),
          accent: (text: string) => chalk.white.bold(text),
          env: (text: string) => chalk.yellow.bgBlack.bold(text)
        };
      default: // development
        return {
          primary: (text: string) => chalk.cyan.bold(text),
          secondary: (text: string) => chalk.blue.bold(text),
          accent: (text: string) => chalk.white.bold(text),
          env: (text: string) => chalk.green.bgBlack.bold(text)
        };
    }
  }

  /**
   * Animation de chargement
   */
  private static async showLoadingAnimation(duration: number = 2000): Promise<void> {
    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let i = 0;
    const interval = 100;
    const iterations = duration / interval;
    
    return new Promise((resolve) => {
      const timer = setInterval(() => {
        process.stdout.write(`\r${frames[i % frames.length]} Chargement du système Sorikama...`);
        i++;
        if (i >= iterations) {
          clearInterval(timer);
          process.stdout.write('\r' + ' '.repeat(50) + '\r');
          resolve();
        }
      }, interval);
    });
  }

  /**
   * Génère une barre de progression
   */
  private static getProgressBar(current: number, total: number): string {
    // Sécuriser les valeurs pour éviter les erreurs
    const safeCurrent = Math.max(0, Math.min(current, total));
    const safeTotal = Math.max(1, total);
    
    const percentage = Math.round((safeCurrent / safeTotal) * 100);
    const filled = Math.max(0, Math.round((safeCurrent / safeTotal) * 20));
    const empty = Math.max(0, 20 - filled);
    
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    return `${bar} ${percentage}%`;
  }

  /**
   * Affiche le banner animé de Sorikama API Gateway
   */
  static async displayBanner(): Promise<void> {
    console.clear();
    const colors = this.getEnvColors();
    const env = process.env.NODE_ENV || 'development';
    
    // Animation de chargement initial
    await this.showLoadingAnimation(1500);
    console.clear();
    
    // Banner principal SORIKAMA
    const sorikamaBanner = figlet.textSync('SORIKAMA', {
      font: 'Big',
      horizontalLayout: 'default',
      verticalLayout: 'default'
    });
    
    // Banner API GATEWAY
    const gatewayBanner = figlet.textSync('API GATEWAY', {
      font: 'Small',
      horizontalLayout: 'default',
      verticalLayout: 'default'
    });

    // Affichage avec couleurs selon environnement
    console.log(colors.primary(sorikamaBanner));
    console.log(colors.secondary(gatewayBanner));
    console.log(colors.accent('═'.repeat(80)));
    
    // Informations système avec couleurs environnement
    console.log(colors.env(`   ${env.toUpperCase()} ENVIRONMENT   `));
    console.log('');
    console.log(chalk.green('🚀 ') + colors.accent('Sorikama Hub - Plateforme Centrale'));
    console.log(chalk.blue('📡 ') + chalk.white('Version: ') + chalk.yellow('1.0.0'));
    console.log(chalk.hex('#FF6B9D')('🌐 ') + chalk.white('Environnement: ') + colors.env(` ${env} `));
    console.log(chalk.red('⚡ ') + chalk.white('Node.js: ') + chalk.yellow(process.version));
    console.log(chalk.cyan('💾 ') + chalk.white('Mémoire: ') + chalk.yellow(Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB'));
    console.log(chalk.magenta('⏱️ ') + chalk.white('Démarrage: ') + chalk.yellow(new Date().toLocaleTimeString('fr-FR')));
    
    console.log(colors.accent('═'.repeat(80)));
    
    // Services Sorikama
    console.log(chalk.hex('#FF6B9D').bold('🏪 SERVICES SORIKAMA CONNECTÉS:'));
    const services = [
      { name: 'SoriStore', icon: '🛍️', status: 'ready' },
      { name: 'SoriPay', icon: '💳', status: 'ready' },
      { name: 'SoriWallet', icon: '💰', status: 'ready' },
      { name: 'SoriLearn', icon: '📚', status: 'ready' },
      { name: 'SoriHealth', icon: '🏥', status: 'ready' },
      { name: 'SoriAccess', icon: '♿', status: 'ready' }
    ];

    services.forEach(service => {
      const statusColor = service.status === 'ready' ? chalk.green : chalk.red;
      const statusText = service.status === 'ready' ? '✅ PRÊT' : '❌ ARRÊTÉ';
      console.log(`   ${service.icon} ${chalk.white.bold(service.name.padEnd(12))} ${statusColor(statusText)}`);
    });
    
    console.log(colors.accent('═'.repeat(80)));
    
    // Informations de démarrage avec compteur
    console.log(colors.secondary('🔧 INITIALISATION EN COURS...'));
    console.log(chalk.gray(`📊 Progression: 0/${this.totalSteps} étapes`));
    console.log('');
  }

  /**
   * Affiche le statut de démarrage avec animation et compteur
   */
  static displayStartupStep(step: string, status: 'loading' | 'success' | 'error', details?: string): void {
    const timestamp = new Date().toLocaleTimeString('fr-FR');
    const colors = this.getEnvColors();
    
    let icon: string;
    let color: any;
    
    switch (status) {
      case 'loading':
        icon = '⏳';
        color = chalk.yellow;
        break;
      case 'success':
        icon = '✅';
        color = chalk.green;
        this.stepCount++;
        break;
      case 'error':
        icon = '❌';
        color = chalk.red;
        break;
    }
    
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
    const progress = `${this.stepCount}/${this.totalSteps}`;
    
    const message = `[${chalk.gray(timestamp)}] ${icon} ${color.bold(step)}`;
    const progressBar = this.getProgressBar(this.stepCount, this.totalSteps);
    
    console.log(message + (details ? chalk.gray(` - ${details}`) : ''));
    console.log(chalk.gray(`   ⏱️ ${elapsed}s | 📊 ${progress} | ${progressBar}`));
    
    if (status === 'loading') {
      // Animation de points pour les étapes en cours
      const dots = '.'.repeat((Date.now() % 1000) < 333 ? 1 : (Date.now() % 1000) < 666 ? 2 : 3);
      process.stdout.write(`\r   ${chalk.yellow('⚡ Traitement en cours' + dots + ' '.repeat(3 - dots.length))}`);
      setTimeout(() => process.stdout.write('\r' + ' '.repeat(30) + '\r'), 100);
    }
    
    console.log('');
  }

  /**
   * Affiche le banner de démarrage complet avec animation finale
   */
  static async displayStartupComplete(port: number): Promise<void> {
    const colors = this.getEnvColors();
    const totalTime = ((Date.now() - this.startTime) / 1000).toFixed(2);
    const env = process.env.NODE_ENV || 'development';
    
    // Animation finale
    console.log('');
    console.log(colors.accent('═'.repeat(80)));
    
    // Message de succès animé
    const successMsg = '🎉 SORIKAMA API GATEWAY DÉMARRÉ AVEC SUCCÈS!';
    console.log(colors.primary(successMsg));
    console.log('');
    
    // Statistiques de démarrage
    console.log(chalk.green('⚡ ') + chalk.white.bold('Temps de démarrage: ') + chalk.yellow.bold(`${totalTime}s`));
    console.log(chalk.blue('🔧 ') + chalk.white.bold('Étapes complétées: ') + chalk.green.bold(`${this.stepCount}/${this.totalSteps}`));
    console.log(chalk.hex('#FF6B9D')('🌐 ') + chalk.white.bold('Environnement: ') + colors.env(` ${env.toUpperCase()} `));
    console.log('');
    
    console.log(colors.accent('═'.repeat(80)));
    console.log(colors.secondary('📋 LIENS UTILES POUR UTILISER L\'APPLICATION:'));
    console.log('');
    
    // URLs principales avec lien de connexion
    console.log(`🏠 Accueil ${chalk.cyan.bold(`http://localhost:${port}`)}`);
    console.log(`   ${chalk.gray('Page d\'accueil professionnelle avec guide')}`);
    console.log('');
    
    console.log(`🔑 Connexion API ${chalk.cyan.bold(`http://localhost:${port}/swagger/login`)}`);
    console.log(`   ${chalk.gray('Se connecter avec la clé API par défaut')}`);
    console.log('');
    
    console.log(`📖 Documentation ${chalk.cyan.bold(`http://localhost:${port}/documentation?token=demo`)}`);
    console.log(`   ${chalk.gray('Documentation interactive complète')}`);
    console.log('');
    
    console.log(`🔐 Swagger UI ${chalk.cyan.bold(`http://localhost:${port}/swagger`)}`);
    console.log(`   ${chalk.gray('Interface Swagger sécurisée')}`);
    console.log('');
    
    console.log(`📊 Métriques ${chalk.cyan.bold(`http://localhost:${port}/performance/metrics`)}`);
    console.log(`   ${chalk.gray('Métriques de performance temps réel')}`);
    console.log('');
    
    console.log(`❤️ Health Check ${chalk.cyan.bold(`http://localhost:${port}/performance/health`)}`);
    console.log('');
    console.log(`🛡️ Contrôle Admin ${chalk.cyan.bold(`http://localhost:${port}/admin/control?apiKey=sk_dev_default_key_12345678901234567890123456789012345678901234567890`)}`);
    console.log(`   ${chalk.gray('Vérification de santé du système')}`);
    console.log('');
    
    console.log(colors.accent('═'.repeat(80)));
    console.log(chalk.yellow('🔑 ') + chalk.white.bold('Clé API par défaut: ') + chalk.green.bold('sk_dev_sorikama_default_key_2024'));
    console.log(chalk.blue('💡 ') + chalk.white('En-tête: ') + chalk.cyan('X-API-Key'));
    console.log(chalk.magenta('🚀 ') + chalk.white('Accès rapide: ') + chalk.cyan.bold(`http://localhost:${port}/swagger/login`));
    console.log('');
    
    console.log(colors.accent('═'.repeat(80)));
    console.log(colors.primary('🌟 SORIKAMA HUB - VOTRE ÉCOSYSTÈME UNIFIÉ EST PRÊT!'));
    console.log(colors.accent('═'.repeat(80)));
    console.log('');
    
    // Message final selon l'environnement
    const envMessages = {
      development: '🚧 Mode développement - Toutes les fonctionnalités de debug sont activées',
      test: '🧪 Mode test - Environnement de test configuré',
      production: '🚀 Mode production - Système optimisé pour la performance'
    };
    
    console.log(colors.env(`   ${envMessages[env] || envMessages.development}   `));
    console.log('');
    console.log(chalk.cyan.bold('✨ ASTUCE: Le navigateur s\'ouvrira automatiquement (max 3 fois)!'));
    
    const launchStatus = require('./browserLauncher').BrowserLauncher.getStatus();
    console.log(chalk.gray(`🔢 Lancements auto: ${launchStatus.count}/${launchStatus.maxCount}`));
    console.log('');
  }

  /**
   * Affiche les logs colorés selon le niveau
   */
  static formatLog(level: string, message: string, meta?: any): void {
    const timestamp = new Date().toLocaleTimeString('fr-FR');
    let coloredLevel: string;
    
    switch (level.toLowerCase()) {
      case 'error':
        coloredLevel = chalk.red.bold('ERROR');
        break;
      case 'warn':
        coloredLevel = chalk.yellow.bold('WARN ');
        break;
      case 'info':
        coloredLevel = chalk.blue.bold('INFO ');
        break;
      case 'debug':
        coloredLevel = chalk.gray.bold('DEBUG');
        break;
      default:
        coloredLevel = chalk.white.bold(level.toUpperCase());
    }
    
    const formattedMessage = `[${chalk.gray(timestamp)}] ${coloredLevel} ${message}`;
    console.log(formattedMessage + (meta ? chalk.gray(` ${JSON.stringify(meta)}`) : ''));
  }
}