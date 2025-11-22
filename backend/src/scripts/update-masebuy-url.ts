/**
 * Script pour mettre à jour l'URL du service Masebuy
 */

import mongoose from 'mongoose';
import { MONGO_URI } from '../config';
import { ServiceModel } from '../database/models/service.model';
import { logger } from '../utils/logger';

async function updateMasebuyUrl() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Chercher le service Masebuy
    const service = await ServiceModel.findOne({ slug: 'masebuy' });

    if (!service) {
      console.log('❌ Service Masebuy non trouvé');
      process.exit(1);
    }

    console.log('📋 Configuration actuelle:');
    console.log(`   Nom: ${service.name}`);
    console.log(`   Slug: ${service.slug}`);
    console.log(`   Backend URL: ${service.backendUrl}`);
    console.log(`   Frontend URL: ${service.frontendUrl}\n`);

    // Mettre à jour l'URL
    const newBackendUrl = 'http://localhost:4001';
    
    service.backendUrl = newBackendUrl;
    await service.save();

    console.log('✅ URL mise à jour avec succès!');
    console.log(`   Nouvelle Backend URL: ${service.backendUrl}\n`);

    await mongoose.disconnect();
    console.log('✅ Déconnecté de MongoDB');
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

updateMasebuyUrl();
