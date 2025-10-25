/**
 * Configuration pour l'import/export de différentes entités
 */

// Configuration pour les utilisateurs
export const usersImportExportConfig = {
  entityName: 'utilisateur',
  entityNamePlural: 'utilisateurs',
  
  export: {
    formats: ['json', 'csv', 'excel'],
    defaultFormat: 'json',
    
    filters: [
      {
        key: 'role',
        label: 'Type d\'utilisateur',
        allLabel: 'Tous les utilisateurs',
        options: [
          { value: 'user', label: 'Utilisateurs', icon: '👤' },
          { value: 'admin', label: 'Administrateurs', icon: '👑' }
        ]
      },
      {
        key: 'isBlocked',
        label: 'Statut',
        allLabel: 'Tous les statuts',
        options: [
          { value: 'false', label: 'Actifs', icon: '✅' },
          { value: 'true', label: 'Bloqués', icon: '🚫' }
        ]
      }
    ],
    
    fields: [
      { key: 'email', label: 'Email', default: true },
      { key: 'firstName', label: 'Prénom', default: true },
      { key: 'lastName', label: 'Nom', default: true },
      { key: 'role', label: 'Rôle', default: true },
      { key: 'isActive', label: 'Actif', default: true },
      { key: 'isBlocked', label: 'Bloqué', default: true },
      { key: 'createdAt', label: 'Date création', default: true },
      { key: 'lastActivity', label: 'Dernière activité', default: true },
      { key: 'loginCount', label: 'Nb connexions', default: false },
      { key: 'isVerified', label: 'Vérifié', default: false }
    ]
  },
  
  import: {
    acceptedFormats: ['.json', '.csv', '.xlsx', '.xls'],
    exampleFormat: '[{email, firstName, lastName, role, ...}]',
    
    modes: [
      {
        value: 'create',
        label: 'Créer uniquement',
        description: 'Créer de nouveaux utilisateurs, ignorer les doublons'
      },
      {
        value: 'update',
        label: 'Mettre à jour uniquement',
        description: 'Mettre à jour les utilisateurs existants (par email)'
      },
      {
        value: 'merge',
        label: 'Fusionner',
        description: 'Créer les nouveaux et mettre à jour les existants'
      }
    ],
    
    templateGenerator: (format) => {
      const examples = [
        {
          email: 'john.doe@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'user'
        },
        {
          email: 'jane.smith@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
          role: 'user'
        },
        {
          email: 'admin.test@example.com',
          firstName: 'Admin',
          lastName: 'Test',
          role: 'admin'
        },
        {
          email: 'alice.martin@example.com',
          firstName: 'Alice',
          lastName: 'Martin',
          role: 'user'
        },
        {
          email: 'bob.wilson@example.com',
          firstName: 'Bob',
          lastName: 'Wilson',
          role: 'user'
        }
      ];

      if (format === 'json') {
        return examples;
      } else if (format === 'csv') {
        const headers = 'email,firstName,lastName,role';
        const rows = examples.map(u => `${u.email},${u.firstName},${u.lastName},${u.role}`);
        return [headers, ...rows].join('\n');
      }
    }
  }
};

// Configuration pour les rôles
export const rolesImportExportConfig = {
  entityName: 'rôle',
  entityNamePlural: 'rôles',
  
  export: {
    formats: ['json', 'csv'],
    defaultFormat: 'json',
    
    filters: [
      {
        key: 'isEditable',
        label: 'Type de rôle',
        allLabel: 'Tous les rôles',
        options: [
          { value: 'true', label: 'Personnalisés', icon: '✏️' },
          { value: 'false', label: 'Système', icon: '🔒' }
        ]
      }
    ],
    
    fields: [
      { key: 'name', label: 'Nom', default: true },
      { key: 'description', label: 'Description', default: true },
      { key: 'permissions', label: 'Permissions', default: true },
      { key: 'userCount', label: 'Nb utilisateurs', default: false },
      { key: 'isEditable', label: 'Modifiable', default: false },
      { key: 'createdAt', label: 'Date création', default: false }
    ]
  },
  
  import: {
    acceptedFormats: ['.json', '.csv'],
    exampleFormat: '[{name, description, permissions: [...], ...}]',
    
    modes: [
      {
        value: 'create',
        label: 'Créer uniquement',
        description: 'Créer de nouveaux rôles, ignorer les doublons'
      },
      {
        value: 'update',
        label: 'Mettre à jour uniquement',
        description: 'Mettre à jour les rôles existants (par nom)'
      },
      {
        value: 'merge',
        label: 'Fusionner',
        description: 'Créer les nouveaux et mettre à jour les existants'
      }
    ],
    
    templateGenerator: (format) => {
      const examples = [
        {
          name: 'moderator',
          description: 'Modérateur de contenu',
          permissions: ['read:users', 'update:users']
        },
        {
          name: 'editor',
          description: 'Éditeur de contenu',
          permissions: ['read:content', 'create:content', 'update:content']
        },
        {
          name: 'viewer',
          description: 'Lecteur uniquement',
          permissions: ['read:content']
        }
      ];

      if (format === 'json') {
        return examples;
      } else if (format === 'csv') {
        const headers = 'name,description,permissions';
        const rows = examples.map(r => `${r.name},${r.description},"${r.permissions.join(';')}"`);
        return [headers, ...rows].join('\n');
      }
    }
  }
};
