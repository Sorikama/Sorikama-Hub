#!/usr/bin/env python
"""
Script de test pour vérifier la récupération d'une boutique par domaine
"""

import asyncio
import logging
import sys
import os
from bson import ObjectId

# Ajouter le répertoire parent au path pour pouvoir importer les modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

# Configuration du logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Importer les services nécessaires
from app.services.store_service import get_store_by_domaine, get_store_by_id

async def test_get_store_by_domaine():
    """
    Teste la récupération d'une boutique par domaine
    """
    logger.info("Test de récupération d'une boutique par domaine...")
    
    # Domaine à tester (à remplacer par un domaine existant)
    test_domaine = "test-objectid"
    
    # Récupérer la boutique par domaine
    store = await get_store_by_domaine(test_domaine)
    
    if store:
        logger.info(f"✅ Boutique trouvée avec le domaine '{test_domaine}'")
        logger.info(f"ID: {store.id}")
        logger.info(f"Nom: {store.name}")
        logger.info(f"Domaine: {store.domaine}")
        return store
    else:
        logger.warning(f"❌ Aucune boutique trouvée avec le domaine '{test_domaine}'")
        return None

async def main():
    """
    Fonction principale pour exécuter le script de test
    """
    try:
        logger.info("Démarrage du script de test...")
        store = await test_get_store_by_domaine()
        
        if store:
            # Tester également la récupération par ID
            logger.info(f"Test de récupération de la boutique par ID: {store.id}")
            store_by_id = await get_store_by_id(store.id)
            
            if store_by_id:
                logger.info(f"✅ Boutique trouvée avec l'ID '{store.id}'")
                logger.info(f"Nom: {store_by_id.name}")
                logger.info(f"Domaine: {store_by_id.domaine}")
            else:
                logger.warning(f"❌ Aucune boutique trouvée avec l'ID '{store.id}'")
        
        logger.info("Test terminé")
    except Exception as e:
        logger.error(f"Erreur lors de l'exécution du test: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())

if __name__ == "__main__":
    asyncio.run(main())
