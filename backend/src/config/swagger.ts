// src/config/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';
import { PORT } from './environments';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sorikama API Gateway',
      version: '1.0.0',
      description: `
# Sorikama API Gateway

L'API Gateway centralisée pour l'écosystème Sorikama. Cette API sert de point d'entrée unique pour tous les services Sorikama et gère l'authentification, l'autorisation, le routage intelligent et la sécurité.

## 🔐 Authentification

Cette API supporte deux méthodes d'authentification :

### 1. JWT Token (pour les applications web)
- Obtenez un token via \`/auth/login\`
- Utilisez le token dans l'en-tête : \`Authorization: Bearer <token>\`

### 2. API Key (pour les intégrations)
- Créez une API key via \`/api/keys\`
- Utilisez la clé dans l'en-tête : \`X-API-Key: <api_key>\`
- Ou dans l'URL : \`?api_key=<api_key>\`

## 🏗️ Architecture

L'API Gateway route les requêtes vers les microservices suivants :
- **SoriStore** - Marketplace e-commerce
- **SoriPay** - Système de paiement
- **SoriWallet** - Portefeuille numérique
- **SoriLearn** - Plateforme d'apprentissage
- **SoriHealth** - Suivi santé
- **SoriAccess** - Accessibilité

## 🛡️ Sécurité

- Rate limiting dynamique par rôle utilisateur
- Validation des requêtes et sanitisation
- Permissions granulaires par action/ressource
- Logging complet des activités
- Circuit breaker pour la résilience

## 📊 Monitoring

- Health checks automatiques des services
- Métriques de performance en temps réel
- Alertes en cas de dysfonctionnement
      `,
      contact: {
        name: 'Équipe Sorikama',
        email: 'dev@sorikama.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Serveur de développement'
      },
      {
        url: 'https://api.sorikama.com',
        description: 'Serveur de production'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtenu via /auth/login'
        },
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API Key pour l\'authentification des intégrations'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Message d\'erreur'
            },
            code: {
              type: 'string',
              example: 'ERROR_CODE'
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Opération réussie'
            },
            data: {
              type: 'object'
            }
          }
        },
        Role: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'role-uuid'
            },
            name: {
              type: 'string',
              example: 'admin'
            },
            description: {
              type: 'string',
              example: 'Administrateur avec droits étendus'
            },
            permissions: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Permission'
              }
            },
            isEditable: {
              type: 'boolean',
              example: true
            }
          }
        },
        Permission: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'perm-uuid'
            },
            action: {
              type: 'string',
              example: 'read'
            },
            subject: {
              type: 'string',
              example: 'user'
            },
            description: {
              type: 'string',
              example: 'Lire les informations utilisateur'
            },
            fullPermission: {
              type: 'string',
              example: 'read:user'
            }
          }
        },
        Service: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              example: 'soristore'
            },
            path: {
              type: 'string',
              example: '/soristore'
            },
            target: {
              type: 'string',
              example: 'http://localhost:3001'
            },
            methods: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['GET', 'POST', 'PUT', 'DELETE']
            },
            permissions: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['read:soristore']
            },
            healthy: {
              type: 'boolean',
              example: true
            },
            metrics: {
              type: 'object',
              properties: {
                requests: {
                  type: 'number',
                  example: 1250
                },
                errors: {
                  type: 'number',
                  example: 5
                },
                avgResponseTime: {
                  type: 'number',
                  example: 150
                },
                errorRate: {
                  type: 'number',
                  example: 0.4
                }
              }
            }
          }
        },
        ApiKey: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'key-uuid'
            },
            name: {
              type: 'string',
              example: 'Mon API Key'
            },
            prefix: {
              type: 'string',
              example: 'sk_12345'
            },
            permissions: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['read:soristore', 'write:soripay']
            },
            isActive: {
              type: 'boolean',
              example: true
            },
            usageCount: {
              type: 'number',
              example: 42
            },
            lastUsed: {
              type: 'string',
              format: 'date-time'
            },
            expiresAt: {
              type: 'string',
              format: 'date-time'
            },
            rateLimit: {
              type: 'object',
              properties: {
                requests: {
                  type: 'number',
                  example: 1000
                },
                windowMs: {
                  type: 'number',
                  example: 3600000
                }
              }
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Token d\'authentification manquant ou invalide',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        ForbiddenError: {
          description: 'Permissions insuffisantes',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        NotFoundError: {
          description: 'Ressource non trouvée',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        ValidationError: {
          description: 'Erreur de validation des données',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        RateLimitError: {
          description: 'Limite de taux dépassée',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        ServerError: {
          description: 'Erreur interne du serveur',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'Gestion de l\'authentification et des sessions'
      },
      {
        name: 'API Keys',
        description: 'Gestion des clés API pour les intégrations'
      },
      {
        name: 'System',
        description: 'Informations système, rôles, permissions et services'
      },
      {
        name: 'SoriStore',
        description: 'Marketplace e-commerce - Vente et achat de produits'
      },
      {
        name: 'SoriPay',
        description: 'Système de paiement - Transactions et factures'
      },
      {
        name: 'SoriWallet',
        description: 'Portefeuille numérique - Gestion des fonds'
      },
      {
        name: 'SoriLearn',
        description: 'Plateforme d\'apprentissage - Cours et formations'
      },
      {
        name: 'SoriHealth',
        description: 'Suivi santé - Données médicales et bien-être'
      },
      {
        name: 'SoriAccess',
        description: 'Accessibilité - Outils d\'assistance et inclusion'
      }
    ]
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts'
  ]
};

export const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;