#!/usr/bin/env python
"""
Script de test pour vérifier la création de store avec ObjectId
"""

import asyncio
import logging
import sys
import os
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient

# Ajouter le répertoire parent au path pour pouvoir importer les modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

# Configuration du logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Importer les services et modèles nécessaires
from app.core.config import settings
from app.models.store import StoreCreate
from app.services.store_service import create_store

# Initialiser la connexion à la base de données
client = AsyncIOMotorClient(settings.MONGODB_URL)
db = client[settings.MONGODB_DB_NAME]

async def test_store_creation():
    """
    Teste la création d'un store et vérifie que l'ID est bien un ObjectId
    """
    logger.info("Test de création d'un store...")
    
    # Créer un store de test
    store_data = StoreCreate(
        name="Boutique Test ObjectId",
        domaine="test-objectid",
        description="Une boutique de test pour vérifier les ObjectId"
    )
    
    # ID d'un utilisateur existant (à remplacer par un ID valide)
    # Récupérer le premier utilisateur disponible
    user = await db.users.find_one({})
    if not user:
        logger.error("Aucun utilisateur trouvé pour le test")
        return
    
    owner_id = str(user["_id"])
    logger.info(f"Utilisation de l'utilisateur {owner_id} comme propriétaire")
    
    # Créer le store
    try:
        store = await create_store(store_data, owner_id)
        logger.info(f"Store créé avec succès: {store.id}")
        
        # Vérifier que l'ID du store est bien un ObjectId dans la base de données
        db_user = await db.users.find_one({"_id": ObjectId(owner_id)})
        if not db_user:
            logger.error(f"Utilisateur {owner_id} non trouvé après création du store")
            return
        
        # Vérifier le type des IDs de stores
        stores = db_user.get("stores", [])
        logger.info(f"Liste des stores de l'utilisateur: {stores}")
        
        for store_id in stores:
            logger.info(f"Type de l'ID de store: {type(store_id)}")
            if isinstance(store_id, ObjectId):
                logger.info(f"✅ L'ID {store_id} est bien un ObjectId")
            else:
                logger.warning(f"❌ L'ID {store_id} n'est pas un ObjectId mais un {type(store_id)}")
        
        # Vérifier si le dernier store ajouté est bien un ObjectId
        if stores and isinstance(stores[-1], ObjectId):
            logger.info("✅ Le dernier store ajouté a bien un ID de type ObjectId")
        else:
            logger.warning("❌ Le dernier store ajouté n'a pas un ID de type ObjectId")
            
    except Exception as e:
        logger.error(f"Erreur lors de la création du store: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())

async def main():
    """
    Fonction principale pour exécuter le script de test
    """
    try:
        logger.info("Démarrage du script de test...")
        await test_store_creation()
        logger.info("Test terminé")
    except Exception as e:
        logger.error(f"Erreur lors de l'exécution du test: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())

if __name__ == "__main__":
    asyncio.run(main())
