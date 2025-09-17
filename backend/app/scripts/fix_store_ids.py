#!/usr/bin/env python
# -*- coding: utf-8 -*-

import asyncio
import logging
from typing import List, Dict, Any
from bson import ObjectId

from app.core.config import settings
from motor.motor_asyncio import AsyncIOMotorClient

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Créer une connexion directe à MongoDB
client = AsyncIOMotorClient(settings.MONGODB_URL)
db = client[settings.MONGODB_DB_NAME]

async def fix_store_ids():
    """
    Parcourt toutes les boutiques et s'assure que tous les IDs sont au format ObjectId.
    """
    logger.info("Début de la conversion des IDs de boutiques en ObjectId...")
    
    # Récupérer toutes les boutiques
    stores = await db.stores.find({}).to_list(length=None)
    logger.info(f"Nombre de boutiques trouvées: {len(stores)}")
    
    fixed_count = 0
    for store in stores:
        needs_fixing = False
        updates = {}
        
        # Vérifier l'ID de la boutique
        if "_id" in store and isinstance(store["_id"], str):
            if ObjectId.is_valid(store["_id"]):
                logger.info(f"Conversion de l'ID de la boutique {store['_id']} en ObjectId")
                new_id = ObjectId(store["_id"])
                # Pour l'ID principal, nous devons faire une opération spéciale
                needs_fixing = True
                # Nous ne pouvons pas mettre à jour l'_id directement, nous devons supprimer et réinsérer
            else:
                logger.warning(f"ID de boutique invalide trouvé: {store['_id']}, impossible de convertir")
                continue
        
        # Vérifier l'ID du propriétaire
        if "owner_id" in store:
            if isinstance(store["owner_id"], str):
                if ObjectId.is_valid(store["owner_id"]):
                    logger.info(f"Conversion de l'ID du propriétaire {store['owner_id']} en ObjectId")
                    updates["owner_id"] = ObjectId(store["owner_id"])
                    needs_fixing = True
                else:
                    logger.warning(f"ID de propriétaire invalide trouvé: {store['owner_id']}, impossible de convertir")
            
        # Mettre à jour la boutique si nécessaire
        if needs_fixing:
            if "_id" in store and isinstance(store["_id"], str) and ObjectId.is_valid(store["_id"]):
                # Si l'ID principal doit être converti, nous devons supprimer et réinsérer
                old_id = store["_id"]
                new_store = store.copy()
                new_store["_id"] = ObjectId(old_id)
                
                # Appliquer les autres mises à jour
                for key, value in updates.items():
                    new_store[key] = value
                
                # Supprimer l'ancienne boutique
                await db.stores.delete_one({"_id": old_id})
                
                # Insérer la nouvelle boutique avec l'ID converti
                await db.stores.insert_one(new_store)
                logger.info(f"Boutique {old_id} supprimée et réinsérée avec ID ObjectId")
            else:
                # Sinon, nous pouvons simplement mettre à jour les champs
                await db.stores.update_one({"_id": store["_id"]}, {"$set": updates})
                logger.info(f"Boutique {store['_id']} mise à jour")
            
            fixed_count += 1
    
    logger.info(f"Conversion terminée. {fixed_count} boutiques ont été mises à jour.")

async def main():
    """
    Fonction principale pour exécuter le script.
    """
    logger.info("Démarrage du script de correction...")
    await fix_store_ids()
    logger.info("Script terminé avec succès.")

if __name__ == "__main__":
    asyncio.run(main())
