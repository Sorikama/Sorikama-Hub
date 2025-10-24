/**
 * Service pour logger les actions dans l'audit trail
 */

import { Request } from 'express';
import { AuditLogModel, IAuditLog } from '../database/models/auditLog.model';
import { logger } from '../utils/logger';

export interface AuditLogData {
  userId?: string;
  action: string;
  category: 'auth' | 'user' | 'admin' | 'service' | 'proxy' | 'system' | 'security';
  resource?: string;
  resourceId?: string;
  details?: any;
  status?: 'success' | 'failure' | 'warning';
  errorMessage?: string;
  metadata?: any;
}

/**
 * Logger une action dans l'audit trail
 */
export const logAudit = async (data: AuditLogData, req?: Request): Promise<void> => {
  try {
    const auditLog: Partial<IAuditLog> = {
      ...data,
      status: data.status || 'success',
      ipAddress: req?.ip,
      userAgent: req?.get('user-agent'),
    };

    await AuditLogModel.create(auditLog);

    // Logger aussi dans les logs système
    const logLevel = data.status === 'failure' ? 'warn' : 'info';
    logger[logLevel](`[AUDIT] ${data.category}:${data.action}`, {
      userId: data.userId,
      resource: data.resource,
      resourceId: data.resourceId,
      status: data.status,
    });
  } catch (error) {
    // Ne pas bloquer l'application si l'audit échoue
    logger.error('[AUDIT] Erreur lors du logging:', error);
  }
};

/**
 * Logger une connexion
 */
export const logLogin = async (userId: string, success: boolean, req?: Request, errorMessage?: string): Promise<void> => {
  await logAudit({
    userId,
    action: 'login',
    category: 'auth',
    status: success ? 'success' : 'failure',
    errorMessage,
    details: {
      method: 'password',
    },
  }, req);
};

/**
 * Logger une déconnexion
 */
export const logLogout = async (userId: string, req?: Request): Promise<void> => {
  await logAudit({
    userId,
    action: 'logout',
    category: 'auth',
    status: 'success',
  }, req);
};

/**
 * Logger une modification de profil
 */
export const logProfileUpdate = async (userId: string, changes: string[], req?: Request): Promise<void> => {
  await logAudit({
    userId,
    action: 'update_profile',
    category: 'user',
    resource: 'user',
    resourceId: userId,
    details: {
      changes,
    },
  }, req);
};

/**
 * Logger une autorisation de service SSO
 */
export const logServiceAuthorization = async (
  userId: string,
  serviceId: string,
  serviceName: string,
  granted: boolean,
  req?: Request
): Promise<void> => {
  await logAudit({
    userId,
    action: 'authorize_service',
    category: 'service',
    resource: 'sso_session',
    resourceId: serviceId,
    status: granted ? 'success' : 'failure',
    details: {
      serviceName,
      granted,
    },
  }, req);
};

/**
 * Logger une action admin
 */
export const logAdminAction = async (
  adminId: string,
  action: string,
  resource: string,
  resourceId: string,
  details?: any,
  req?: Request
): Promise<void> => {
  await logAudit({
    userId: adminId,
    action,
    category: 'admin',
    resource,
    resourceId,
    details,
  }, req);
};

/**
 * Logger une requête proxy
 */
export const logProxyRequest = async (
  userId: string,
  service: string,
  endpoint: string,
  method: string,
  statusCode: number,
  responseTime: number,
  req?: Request
): Promise<void> => {
  await logAudit({
    userId,
    action: 'proxy_request',
    category: 'proxy',
    resource: service,
    status: statusCode >= 200 && statusCode < 400 ? 'success' : 'failure',
    details: {
      endpoint,
      method,
      statusCode,
      responseTime,
    },
  }, req);
};

/**
 * Logger une tentative de sécurité suspecte
 */
export const logSecurityEvent = async (
  userId: string | undefined,
  action: string,
  details: any,
  req?: Request
): Promise<void> => {
  await logAudit({
    userId,
    action,
    category: 'security',
    status: 'warning',
    details,
  }, req);
};

/**
 * Logger un événement système
 */
export const logSystemEvent = async (
  action: string,
  details: any,
  status: 'success' | 'failure' | 'warning' = 'success'
): Promise<void> => {
  await logAudit({
    action,
    category: 'system',
    status,
    details,
  });
};
