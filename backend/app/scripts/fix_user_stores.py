#!/usr/bin/env python
"""
Script pour corriger les ObjectId bruts dans les listes de boutiques des utilisateurs.
Ce script convertit tous les ObjectId en chaînes de caractères pour éviter les erreurs de validation.
"""

import asyncio
import logging
import sys
import os
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient
from typing import List, Dict, Any

# Ajouter le répertoire parent au path pour pouvoir importer les modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

# Configuration du logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Configuration de la base de données
from app.core.config import settings

# Créer une connexion directe à MongoDB
from motor.motor_asyncio import AsyncIOMotorClient

# Initialiser la connexion à la base de données
client = AsyncIOMotorClient(settings.MONGODB_URL)
db = client[settings.MONGODB_DB_NAME]

async def fix_user_stores():
    """
    Parcourt tous les utilisateurs et convertit les ObjectId en chaînes dans leurs listes de boutiques.
    """
    logger.info("Début de la correction des listes de boutiques des utilisateurs...")
    
    # Récupérer tous les utilisateurs
    users = await db.users.find({}).to_list(length=None)
    logger.info(f"Nombre d'utilisateurs trouvés: {len(users)}")
    
    fixed_count = 0
    for user in users:
        stores = user.get('stores', [])
        if not stores:
            continue
        
        # Vérifier si des conversions sont nécessaires
        needs_fixing = False
        fixed_stores = []
        
        for store_id in stores:
            if isinstance(store_id, ObjectId):
                needs_fixing = True
                fixed_stores.append(str(store_id))
                logger.info(f"Conversion d'ObjectId en chaîne pour l'utilisateur {user['_id']}: {store_id} -> {str(store_id)}")
            else:
                fixed_stores.append(store_id)
        
        # Mettre à jour l'utilisateur si nécessaire
        if needs_fixing:
            await db.users.update_one(
                {"_id": user["_id"]},
                {"$set": {"stores": fixed_stores}}
            )
            fixed_count += 1
            logger.info(f"Utilisateur {user['_id']} mis à jour avec des ID de boutiques convertis en chaînes")
    
    logger.info(f"Correction terminée. {fixed_count} utilisateurs ont été mis à jour.")

async def main():
    """
    Fonction principale pour exécuter le script.
    """
    try:
        logger.info("Démarrage du script de correction...")
        await fix_user_stores()
        logger.info("Script terminé avec succès.")
    except Exception as e:
        logger.error(f"Erreur lors de l'exécution du script: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())

if __name__ == "__main__":
    asyncio.run(main())
