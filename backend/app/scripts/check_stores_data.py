#!/usr/bin/env python
"""
Script pour vérifier la structure des données des boutiques dans MongoDB.
Ce script affiche les boutiques et leurs propriétaires pour aider au débogage.
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

async def check_stores_data():
    """
    Vérifie la structure des données des boutiques et leurs relations avec les utilisateurs.
    """
    logger.info("Vérification des données des boutiques...")
    
    # Récupérer tous les utilisateurs
    users = await db.users.find({}).to_list(length=None)
    logger.info(f"Nombre d'utilisateurs trouvés: {len(users)}")
    
    for user in users:
        user_id = str(user['_id'])
        stores_list = user.get('stores', [])
        store_id = user.get('storeId')
        
        logger.info(f"Utilisateur {user_id} - Email: {user.get('email')}")
        logger.info(f"  - storeId (legacy): {store_id}")
        logger.info(f"  - stores (liste): {stores_list}")
        
        # Vérifier si les boutiques existent dans la collection stores
        for store_id_str in stores_list:
            try:
                if ObjectId.is_valid(store_id_str):
                    store = await db.stores.find_one({"_id": ObjectId(store_id_str)})
                    if store:
                        logger.info(f"    - Boutique {store_id_str} trouvée: {store.get('name')}")
                        # Vérifier si l'owner_id correspond à l'utilisateur
                        owner_id = store.get('owner_id')
                        if owner_id:
                            if str(owner_id) == user_id:
                                logger.info(f"      - Propriétaire correct: {str(owner_id)} == {user_id}")
                            else:
                                logger.warning(f"      - Propriétaire incorrect: {str(owner_id)} != {user_id}")
                    else:
                        logger.warning(f"    - Boutique {store_id_str} non trouvée dans la collection stores")
                else:
                    logger.warning(f"    - ID de boutique invalide: {store_id_str}")
            except Exception as e:
                logger.error(f"    - Erreur lors de la vérification de la boutique {store_id_str}: {str(e)}")
    
    # Vérifier toutes les boutiques dans la collection stores
    logger.info("\nVérification de toutes les boutiques...")
    stores = await db.stores.find({}).to_list(length=None)
    logger.info(f"Nombre de boutiques trouvées: {len(stores)}")
    
    for store in stores:
        store_id = str(store['_id'])
        owner_id = store.get('owner_id')
        
        logger.info(f"Boutique {store_id} - Nom: {store.get('name')}")
        logger.info(f"  - Propriétaire: {str(owner_id)}")
        
        # Vérifier si le propriétaire existe
        if owner_id:
            user = await db.users.find_one({"_id": owner_id})
            if user:
                logger.info(f"    - Propriétaire trouvé: {user.get('email')}")
                # Vérifier si la boutique est dans la liste des boutiques de l'utilisateur
                user_stores = user.get('stores', [])
                if store_id in user_stores:
                    logger.info(f"      - Boutique présente dans la liste des boutiques de l'utilisateur")
                else:
                    logger.warning(f"      - Boutique absente de la liste des boutiques de l'utilisateur")
            else:
                logger.warning(f"    - Propriétaire non trouvé dans la collection users")

async def main():
    """
    Fonction principale pour exécuter le script.
    """
    try:
        logger.info("Démarrage du script de vérification...")
        await check_stores_data()
        logger.info("Script terminé avec succès.")
    except Exception as e:
        logger.error(f"Erreur lors de l'exécution du script: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())

if __name__ == "__main__":
    asyncio.run(main())
