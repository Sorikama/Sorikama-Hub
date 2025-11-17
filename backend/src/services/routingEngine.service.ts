// src/services/routingEngine.service.ts
import { Request } from 'express';
import { logger } from '../utils/logger';

export interface ServiceRoute {
  name: string;
  path: string;
  target: string;
  methods: string[];
  permissions: string[];
  rateLimit?: {
    windowMs: number;
    max: number;
  };
  healthCheck?: string;
  loadBalancing?: {
    strategy: 'round-robin' | 'least-connections' | 'weighted';
    targets: Array<{ url: string; weight?: number }>;
  };
  circuitBreaker?: {
    failureThreshold: number;
    resetTimeout: number;
  };
  timeout?: number;
  retries?: number;
}

export class RoutingEngine {
  private routes: Map<string, ServiceRoute> = new Map();
  private healthStatus: Map<string, boolean> = new Map();
  private roundRobinCounters: Map<string, number> = new Map();
  private connectionCounts: Map<string, number> = new Map();

  constructor() {
    this.initializeRoutes().catch(console.error);
    this.startHealthChecks();
  }

  private async initializeRoutes(): Promise<void> {
    // Charger les routes dynamiquement depuis la base de données
    try {
      const { ServiceModel } = require('../database/models/service.model');
      const services = await ServiceModel.find({ enabled: true });
      
      const routes: ServiceRoute[] = services.map((service: any) => ({
        name: service.slug,
        path: `/${service.proxyPath}`,
        target: service.backendUrl,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        permissions: [`read:${service.slug}`],
        rateLimit: { windowMs: 15 * 60 * 1000, max: 100 },
        healthCheck: '/health',
        timeout: 30000,
        retries: 3,
        circuitBreaker: { failureThreshold: 5, resetTimeout: 60000 }
      }));

      routes.forEach(route => {
        this.routes.set(route.path, route);
        this.healthStatus.set(route.name, true);
        this.roundRobinCounters.set(route.name, 0);
        this.connectionCounts.set(route.name, 0);
      });

      logger.info(`[ROUTING] ${routes.length} routes initialisées`);
    } catch (error) {
      console.error('Erreur chargement routes:', error);
    }
  }

  public findRoute(req: Request): ServiceRoute | null {
    const path = req.path;
    
    // Recherche exacte d'abord
    for (const [routePath, route] of this.routes) {
      if (path.startsWith(routePath)) {
        // Vérifier si la méthode est autorisée
        if (!route.methods.includes(req.method)) {
          logger.warn(`[ROUTING] Méthode ${req.method} non autorisée pour ${routePath}`);
          return null;
        }
        
        // Vérifier si le service est en bonne santé
        if (!this.healthStatus.get(route.name)) {
          logger.warn(`[ROUTING] Service ${route.name} indisponible`);
          return null;
        }
        
        return route;
      }
    }
    
    return null;
  }

  public getTargetUrl(route: ServiceRoute): string {
    if (route.loadBalancing) {
      return this.selectTarget(route);
    }
    
    return route.target;
  }

  private selectTarget(route: ServiceRoute): string {
    if (!route.loadBalancing) return route.target;
    
    const { strategy, targets } = route.loadBalancing;
    
    switch (strategy) {
      case 'round-robin':
        return this.roundRobinSelection(route.name, targets);
      
      case 'least-connections':
        return this.leastConnectionsSelection(targets);
      
      case 'weighted':
        return this.weightedSelection(targets);
      
      default:
        return targets[0]?.url || route.target;
    }
  }

  private roundRobinSelection(serviceName: string, targets: Array<{ url: string }>): string {
    const counter = this.roundRobinCounters.get(serviceName) || 0;
    const selectedTarget = targets[counter % targets.length];
    this.roundRobinCounters.set(serviceName, counter + 1);
    return selectedTarget.url;
  }

  private leastConnectionsSelection(targets: Array<{ url: string }>): string {
    // Implémentation simplifiée - en production, utiliser des métriques réelles
    return targets[0].url;
  }

  private weightedSelection(targets: Array<{ url: string; weight?: number }>): string {
    const totalWeight = targets.reduce((sum, target) => sum + (target.weight || 1), 0);
    let random = Math.random() * totalWeight;
    
    for (const target of targets) {
      random -= (target.weight || 1);
      if (random <= 0) {
        return target.url;
      }
    }
    
    return targets[0].url;
  }

  private async startHealthChecks(): Promise<void> {
    // Health checks désactivés - Utiliser le système de services externes à la place
    // setInterval(async () => {
    //   for (const [path, route] of this.routes) {
    //     if (route.healthCheck) {
    //       try {
    //         const http = await import('http');
    //         const url = new URL(`${route.target}${route.healthCheck}`);
            
    //         const options = {
    //           hostname: url.hostname,
    //           port: url.port || 80,
    //           path: url.pathname,
    //           method: 'GET',
    //           timeout: 5000
    //         };
            
    //         const isHealthy = await new Promise<boolean>((resolve) => {
    //           const req = http.request(options, (res) => {
    //             resolve(res.statusCode === 200);
    //           });
              
    //           req.on('error', () => resolve(false));
    //           req.on('timeout', () => resolve(false));
    //           req.setTimeout(5000);
    //           req.end();
    //         });
            
    //         const wasHealthy = this.healthStatus.get(route.name);
    //         this.healthStatus.set(route.name, isHealthy);
            
    //         if (wasHealthy !== isHealthy) {
    //           logger.info(`[ROUTING] Service ${route.name} status changed: ${isHealthy ? 'healthy' : 'unhealthy'}`);
    //         }
    //       } catch (error) {
    //         this.healthStatus.set(route.name, false);
    //       }
    //     }
    //   }
    // }, 30000);
  }

  public getRoutes(): ServiceRoute[] {
    return Array.from(this.routes.values());
  }

  public getHealthStatus(): Map<string, boolean> {
    return new Map(this.healthStatus);
  }

  public addRoute(route: ServiceRoute): void {
    this.routes.set(route.path, route);
    this.healthStatus.set(route.name, true);
    this.roundRobinCounters.set(route.name, 0);
    logger.info(`[ROUTING] Route ajoutée: ${route.path} -> ${route.target}`);
  }

  public removeRoute(path: string): void {
    const route = this.routes.get(path);
    if (route) {
      this.routes.delete(path);
      this.healthStatus.delete(route.name);
      this.roundRobinCounters.delete(route.name);
      logger.info(`[ROUTING] Route supprimée: ${path}`);
    }
  }
}

// Instance singleton - Désactivé (utiliser le système de services externes à la place)
// export const routingEngine = new RoutingEngine();

// Mock pour compatibilité avec l'ancien code
export const routingEngine = {
  getRoutes: () => [],
  getHealthStatus: () => new Map(),
  matchRoute: () => null
};