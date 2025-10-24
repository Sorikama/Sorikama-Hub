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
    this.initializeRoutes();
    this.startHealthChecks();
  }

  private initializeRoutes(): void {
    const routes: ServiceRoute[] = [
      {
        name: 'soristore',
        path: '/soristore',
        target: process.env.SORISTORE_SERVICE_URL || 'http://localhost:3001',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        permissions: ['read:soristore'],
        rateLimit: { windowMs: 15 * 60 * 1000, max: 100 },
        healthCheck: '/health',
        timeout: 30000,
        retries: 3,
        circuitBreaker: { failureThreshold: 5, resetTimeout: 60000 }
      },
      {
        name: 'soripay',
        path: '/soripay',
        target: process.env.SORIPAY_SERVICE_URL || 'http://localhost:3002',
        methods: ['GET', 'POST', 'PUT'],
        permissions: ['read:soripay'],
        rateLimit: { windowMs: 15 * 60 * 1000, max: 200 },
        healthCheck: '/health',
        timeout: 45000,
        retries: 2,
        circuitBreaker: { failureThreshold: 3, resetTimeout: 30000 }
      },
      {
        name: 'soriwallet',
        path: '/soriwallet',
        target: process.env.SORIWALLET_SERVICE_URL || 'http://localhost:3003',
        methods: ['GET', 'POST', 'PUT'],
        permissions: ['read:soriwallet'],
        rateLimit: { windowMs: 15 * 60 * 1000, max: 150 },
        healthCheck: '/health',
        timeout: 30000,
        retries: 3
      },
      {
        name: 'sorilearn',
        path: '/sorilearn',
        target: process.env.SORILEARN_SERVICE_URL || 'http://localhost:3004',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        permissions: ['read:sorilearn'],
        rateLimit: { windowMs: 15 * 60 * 1000, max: 300 },
        healthCheck: '/health',
        timeout: 60000,
        retries: 2
      },
      {
        name: 'sorihealth',
        path: '/sorihealth',
        target: process.env.SORIHEALTH_SERVICE_URL || 'http://localhost:3005',
        methods: ['GET', 'POST', 'PUT'],
        permissions: ['read:sorihealth'],
        rateLimit: { windowMs: 15 * 60 * 1000, max: 100 },
        healthCheck: '/health',
        timeout: 30000,
        retries: 3
      },
      {
        name: 'soriaccess',
        path: '/soriaccess',
        target: process.env.SORIACCESS_SERVICE_URL || 'http://localhost:3006',
        methods: ['GET', 'POST', 'PUT'],
        permissions: ['read:soriaccess'],
        rateLimit: { windowMs: 15 * 60 * 1000, max: 50 },
        healthCheck: '/health',
        timeout: 30000,
        retries: 3
      }
    ];

    routes.forEach(route => {
      this.routes.set(route.path, route);
      this.healthStatus.set(route.name, true);
      this.roundRobinCounters.set(route.name, 0);
      this.connectionCounts.set(route.name, 0);
    });

    logger.info(`[ROUTING] ${routes.length} routes initialisées`);
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
    setInterval(async () => {
      for (const [path, route] of this.routes) {
        if (route.healthCheck) {
          try {
            // Utiliser une approche compatible Node.js
            const http = await import('http');
            const url = new URL(`${route.target}${route.healthCheck}`);
            
            const options = {
              hostname: url.hostname,
              port: url.port || 80,
              path: url.pathname,
              method: 'GET',
              timeout: 5000
            };
            
            const isHealthy = await new Promise<boolean>((resolve) => {
              const req = http.request(options, (res) => {
                resolve(res.statusCode === 200);
              });
              
              req.on('error', () => resolve(false));
              req.on('timeout', () => resolve(false));
              req.setTimeout(5000);
              req.end();
            });
            
            const wasHealthy = this.healthStatus.get(route.name);
            this.healthStatus.set(route.name, isHealthy);
            
            if (wasHealthy !== isHealthy) {
              logger.info(`[ROUTING] Service ${route.name} status changed: ${isHealthy ? 'healthy' : 'unhealthy'}`);
            }
          } catch (error) {
            this.healthStatus.set(route.name, false);
            // Pas de log pour éviter le spam quand les services ne sont pas démarrés
          }
        }
      }
    }, 30000);
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

// Instance singleton
export const routingEngine = new RoutingEngine();