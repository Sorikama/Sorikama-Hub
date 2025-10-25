/**
 * Script pour afficher les rôles système
 */

import mongoose from 'mongoose';
import { RoleModel } from '../database/models/role.model';
import { PermissionModel } from '../database/models/permission.model'; // Import pour enregistrer le modèle
import { logger } from '../utils/logger';
import dotenv from 'dotenv';

dotenv.config();

// S'assurer que le modèle Permission est enregistré
PermissionModel;

async function showRoles() {
  try {
    // Connexion à la base de données
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || '';
    if (!mongoUri) {
      throw new Error('MONGODB_URI ou MONGO_URI non défini dans .env');
    }
    await mongoose.connect(mongoUri);
    logger.info('✅ Connecté à MongoDB');

    // Récupérer tous les rôles
    const roles = await RoleModel.find().populate('permissions');

    console.log('\n📋 RÔLES SYSTÈME\n');
    console.log('='.repeat(80));

    for (const role of roles) {
      console.log(`\n👤 ${role.name.toUpperCase()}`);
      console.log(`   Description: ${role.description}`);
      console.log(`   Système: ${role.isSystem ? '✅' : '❌'}`);
      console.log(`   Modifiable: ${role.isEditable ? '✅' : '❌'}`);
      console.log(`   Permissions (${role.permissions.length}):`);
      
      const permissions = role.permissions as any[];
      permissions.forEach((perm: any) => {
        console.log(`      - ${perm.action}:${perm.subject}`);
      });
    }

    console.log('\n' + '='.repeat(80));
    console.log(`\n✅ Total: ${roles.length} rôles système\n`);

    await mongoose.disconnect();
  } catch (error) {
    logger.error('❌ Erreur:', error);
    process.exit(1);
  }
}

showRoles();
