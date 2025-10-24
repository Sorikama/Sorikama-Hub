// src/controllers/system.controller.ts
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { RoleModel } from '../database/models/role.model';
import { PermissionModel } from '../database/models/permission.model';
import { routingEngine } from '../services/routingEngine.service';
import { getProxyMetrics } from '../services/proxy.service';
import AppError from '../utils/AppError';

export const getRoles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const roles = await RoleModel.find()
      .populate('permissions', 'action subject description')
      .sort({ name: 1 });

    res.json({
      success: true,
      data: {
        roles: roles.map(role => ({
          id: role._id,
          name: role.name,
          description: role.description,
          permissions: role.permissions,
          isEditable: role.isEditable,
          createdAt: role.createdAt,
          updatedAt: role.updatedAt
        }))
      }
    });
  } catch (error) {
    next(new AppError('Erreur lors de la récupération des rôles', StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

export const getPermissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const permissions = await PermissionModel.find().sort({ subject: 1, action: 1 });

    // Grouper par subject
    const groupedPermissions = permissions.reduce((acc: any, perm) => {
      if (!acc[perm.subject]) {
        acc[perm.subject] = [];
      }
      acc[perm.subject].push({
        id: perm._id,
        action: perm.action,
        subject: perm.subject,
        description: perm.description,
        fullPermission: `${perm.action}:${perm.subject}`
      });
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        permissions: groupedPermissions,
        total: permissions.length
      }
    });
  } catch (error) {
    next(new AppError('Erreur lors de la récupération des permissions', StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

export const getServices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const routes = routingEngine.getRoutes();
    const healthStatus = routingEngine.getHealthStatus();
    const metrics = getProxyMetrics();

    const services = routes.map(route => {
      const serviceMetrics = metrics.get(route.name);
      return {
        name: route.name,
        path: route.path,
        target: route.target,
        methods: route.methods,
        permissions: route.permissions,
        healthy: healthStatus.get(route.name) || false,
        rateLimit: route.rateLimit,
        timeout: route.timeout,
        retries: route.retries,
        circuitBreaker: route.circuitBreaker,
        metrics: serviceMetrics ? {
          requests: serviceMetrics.requestCount,
          errors: serviceMetrics.errorCount,
          avgResponseTime: serviceMetrics.requestCount > 0 
            ? Math.round(serviceMetrics.totalResponseTime / serviceMetrics.requestCount)
            : 0,
          lastRequest: serviceMetrics.lastRequestTime,
          errorRate: serviceMetrics.requestCount > 0
            ? Math.round((serviceMetrics.errorCount / serviceMetrics.requestCount) * 100)
            : 0
        } : null
      };
    });

    res.json({
      success: true,
      data: {
        services,
        summary: {
          total: services.length,
          healthy: services.filter(s => s.healthy).length,
          unhealthy: services.filter(s => !s.healthy).length
        }
      }
    });
  } catch (error) {
    next(new AppError('Erreur lors de la récupération des services', StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

export const getSystemHealth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const healthStatus = routingEngine.getHealthStatus();
    const metrics = getProxyMetrics();
    
    const services = Array.from(healthStatus.entries()).map(([name, healthy]) => {
      const serviceMetrics = metrics.get(name);
      return {
        name,
        healthy,
        metrics: serviceMetrics ? {
          requests: serviceMetrics.requestCount,
          errors: serviceMetrics.errorCount,
          avgResponseTime: serviceMetrics.requestCount > 0 
            ? Math.round(serviceMetrics.totalResponseTime / serviceMetrics.requestCount)
            : 0,
          lastRequest: serviceMetrics.lastRequestTime
        } : null
      };
    });

    const totalServices = services.length;
    const healthyServices = services.filter(s => s.healthy).length;
    const systemHealth = healthyServices === totalServices ? 'healthy' : 
                        healthyServices > totalServices / 2 ? 'degraded' : 'unhealthy';

    res.json({
      success: true,
      data: {
        status: systemHealth,
        timestamp: new Date().toISOString(),
        gateway: {
          version: '1.0.0',
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          nodeVersion: process.version
        },
        services,
        summary: {
          total: totalServices,
          healthy: healthyServices,
          unhealthy: totalServices - healthyServices,
          healthPercentage: Math.round((healthyServices / totalServices) * 100)
        }
      }
    });
  } catch (error) {
    next(new AppError('Erreur lors de la récupération de l\'état du système', StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

export const getSystemMetrics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const metrics = getProxyMetrics();
    const routes = routingEngine.getRoutes();
    
    const serviceMetrics = routes.map(route => {
      const serviceMetric = metrics.get(route.name);
      return {
        service: route.name,
        requests: serviceMetric?.requestCount || 0,
        errors: serviceMetric?.errorCount || 0,
        avgResponseTime: serviceMetric && serviceMetric.requestCount > 0
          ? Math.round(serviceMetric.totalResponseTime / serviceMetric.requestCount)
          : 0,
        errorRate: serviceMetric && serviceMetric.requestCount > 0
          ? Math.round((serviceMetric.errorCount / serviceMetric.requestCount) * 100)
          : 0,
        lastRequest: serviceMetric?.lastRequestTime
      };
    });

    const totalRequests = serviceMetrics.reduce((sum, m) => sum + m.requests, 0);
    const totalErrors = serviceMetrics.reduce((sum, m) => sum + m.errors, 0);
    const avgResponseTime = serviceMetrics.length > 0
      ? Math.round(serviceMetrics.reduce((sum, m) => sum + m.avgResponseTime, 0) / serviceMetrics.length)
      : 0;

    res.json({
      success: true,
      data: {
        overview: {
          totalRequests,
          totalErrors,
          errorRate: totalRequests > 0 ? Math.round((totalErrors / totalRequests) * 100) : 0,
          avgResponseTime
        },
        services: serviceMetrics,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(new AppError('Erreur lors de la récupération des métriques', StatusCodes.INTERNAL_SERVER_ERROR));
  }
};