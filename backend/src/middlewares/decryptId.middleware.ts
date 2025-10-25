/**
 * Middleware pour déchiffrer automatiquement les IDs utilisateurs
 * dans les requêtes provenant des services externes
 */

import { Request, Response, NextFunction } from 'express';
import { decryptUserId, isEncryptedId } from '../utils/encryption';
import { logger } from '../utils/logger';

/**
 * Middleware pour déchiffrer l'ID utilisateur dans le token JWT
 * 
 * Utilisation :
 * - Appliquer ce middleware après l'authentification
 * - Il déchiffre automatiquement req.user.id si chiffré
 */
export const decryptUserIdFromToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Vérifier si l'utilisateur est authentifié
    if (!req.user) {
      return next();
    }

    // Vérifier si l'ID est chiffré
    const userId = req.user.id || req.user._id;
    
    if (userId && typeof userId === 'string' && isEncryptedId(userId)) {
      // Déchiffrer l'ID
      const decryptedId = decryptUserId(userId);
      
      // Remplacer l'ID chiffré par l'ID déchiffré
      req.user.id = decryptedId;
      req.user._id = decryptedId;
      
      logger.debug('ID utilisateur déchiffré depuis le token', {
        encryptedId: userId.substring(0, 20) + '...',
        decryptedId
      });
    }

    next();
  } catch (error) {
    logger.error('Erreur lors du déchiffrement de l\'ID utilisateur:', error);
    // Ne pas bloquer la requête, continuer avec l'ID chiffré
    next();
  }
};

/**
 * Middleware pour déchiffrer les IDs dans les paramètres de route
 * 
 * Utilisation :
 * - Appliquer sur les routes qui utilisent :userId, :id, etc.
 * - Déchiffre automatiquement les paramètres
 * 
 * Exemple :
 * router.get('/users/:userId', decryptRouteParams(['userId']), getUser);
 */
export const decryptRouteParams = (paramNames: string[] = ['id', 'userId']) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      paramNames.forEach(paramName => {
        const paramValue = req.params[paramName];
        
        if (paramValue && isEncryptedId(paramValue)) {
          // Déchiffrer le paramètre
          const decryptedId = decryptUserId(paramValue);
          req.params[paramName] = decryptedId;
          
          logger.debug(`Paramètre ${paramName} déchiffré`, {
            encrypted: paramValue.substring(0, 20) + '...',
            decrypted: decryptedId
          });
        }
      });

      next();
    } catch (error) {
      logger.error('Erreur lors du déchiffrement des paramètres:', error);
      // Ne pas bloquer la requête
      next();
    }
  };
};

/**
 * Middleware pour déchiffrer les IDs dans le body de la requête
 * 
 * Utilisation :
 * - Appliquer sur les routes POST/PUT/PATCH
 * - Déchiffre automatiquement les champs spécifiés
 * 
 * Exemple :
 * router.post('/orders', decryptBodyFields(['userId', 'customerId']), createOrder);
 */
export const decryptBodyFields = (fieldNames: string[] = ['id', 'userId']) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.body) {
        return next();
      }

      fieldNames.forEach(fieldName => {
        const fieldValue = req.body[fieldName];
        
        if (fieldValue && typeof fieldValue === 'string' && isEncryptedId(fieldValue)) {
          // Déchiffrer le champ
          const decryptedId = decryptUserId(fieldValue);
          req.body[fieldName] = decryptedId;
          
          logger.debug(`Champ ${fieldName} déchiffré dans le body`, {
            encrypted: fieldValue.substring(0, 20) + '...',
            decrypted: decryptedId
          });
        }
      });

      next();
    } catch (error) {
      logger.error('Erreur lors du déchiffrement des champs du body:', error);
      // Ne pas bloquer la requête
      next();
    }
  };
};

/**
 * Middleware pour déchiffrer les IDs dans les query parameters
 * 
 * Utilisation :
 * - Appliquer sur les routes avec query params
 * - Déchiffre automatiquement les paramètres spécifiés
 * 
 * Exemple :
 * router.get('/orders', decryptQueryParams(['userId']), getOrders);
 */
export const decryptQueryParams = (paramNames: string[] = ['id', 'userId']) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.query) {
        return next();
      }

      paramNames.forEach(paramName => {
        const paramValue = req.query[paramName];
        
        if (paramValue && typeof paramValue === 'string' && isEncryptedId(paramValue)) {
          // Déchiffrer le paramètre
          const decryptedId = decryptUserId(paramValue);
          req.query[paramName] = decryptedId;
          
          logger.debug(`Query param ${paramName} déchiffré`, {
            encrypted: paramValue.substring(0, 20) + '...',
            decrypted: decryptedId
          });
        }
      });

      next();
    } catch (error) {
      logger.error('Erreur lors du déchiffrement des query params:', error);
      // Ne pas bloquer la requête
      next();
    }
  };
};

/**
 * Middleware global pour déchiffrer automatiquement tous les IDs
 * 
 * Utilisation :
 * - Appliquer globalement sur toutes les routes
 * - Déchiffre automatiquement :
 *   - req.user.id (depuis le token)
 *   - req.params (id, userId, etc.)
 *   - req.body (id, userId, etc.)
 *   - req.query (id, userId, etc.)
 * 
 * Exemple :
 * app.use(autoDecryptIds);
 */
export const autoDecryptIds = (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Déchiffrer l'ID dans le token
    if (req.user) {
      const userId = req.user.id || req.user._id;
      if (userId && typeof userId === 'string' && isEncryptedId(userId)) {
        const decryptedId = decryptUserId(userId);
        req.user.id = decryptedId;
        req.user._id = decryptedId;
      }
    }

    // 2. Déchiffrer les paramètres de route
    const commonParamNames = ['id', 'userId', 'customerId', 'orderId'];
    commonParamNames.forEach(paramName => {
      const paramValue = req.params[paramName];
      if (paramValue && isEncryptedId(paramValue)) {
        req.params[paramName] = decryptUserId(paramValue);
      }
    });

    // 3. Déchiffrer les champs du body
    if (req.body) {
      commonParamNames.forEach(fieldName => {
        const fieldValue = req.body[fieldName];
        if (fieldValue && typeof fieldValue === 'string' && isEncryptedId(fieldValue)) {
          req.body[fieldName] = decryptUserId(fieldValue);
        }
      });
    }

    // 4. Déchiffrer les query params
    if (req.query) {
      commonParamNames.forEach(paramName => {
        const paramValue = req.query[paramName];
        if (paramValue && typeof paramValue === 'string' && isEncryptedId(paramValue)) {
          req.query[paramName] = decryptUserId(paramValue);
        }
      });
    }

    next();
  } catch (error) {
    logger.error('Erreur lors du déchiffrement automatique des IDs:', error);
    // Ne pas bloquer la requête
    next();
  }
};
