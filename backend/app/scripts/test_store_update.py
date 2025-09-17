import asyncio
import sys
import os
from bson import ObjectId

# Ajouter le répertoire parent au path pour pouvoir importer les modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.services import store_service
from app.models.store import StoreUpdate

async def test_update_store():
    """
    Test la mise à jour d'une boutique avec modification du domaine
    """
    print("Test de mise à jour d'une boutique avec modification du domaine")
    
    # Créer une boutique de test
    from app.models.store import StoreCreate
    
    # Générer un ID unique pour éviter les conflits
    test_id = str(ObjectId())
    test_name = f"Test Store {test_id[:6]}"
    test_domaine = f"test-store-{test_id[:6]}"
    
    store_data = StoreCreate(
        name=test_name,
        domaine=test_domaine,
        description="Une boutique de test pour vérifier la mise à jour du domaine"
    )
    
    # Créer la boutique
    print(f"Création d'une boutique de test: {test_name} avec domaine: {test_domaine}")
    store = await store_service.create_store(store_data, "test_user_id")
    
    if not store:
        print("❌ Erreur: Impossible de créer la boutique de test")
        return
    
    print(f"✅ Boutique créée avec succès: ID={store.id}, Domaine={store.domaine}")
    
    # Récupérer la boutique par son ID pour vérifier
    store_by_id = await store_service.get_store_by_id(store.id)
    if not store_by_id:
        print("❌ Erreur: Impossible de récupérer la boutique par ID")
        return
    
    print(f"✅ Boutique récupérée par ID: {store_by_id.name}, Domaine={store_by_id.domaine}")
    
    # Récupérer la boutique par son domaine pour vérifier
    store_by_domaine = await store_service.get_store_by_domaine(test_domaine)
    if not store_by_domaine:
        print("❌ Erreur: Impossible de récupérer la boutique par domaine")
        return
    
    print(f"✅ Boutique récupérée par domaine: {store_by_domaine.name}, ID={store_by_domaine.id}")
    
    # Mettre à jour le domaine de la boutique
    new_domaine = f"updated-store-{test_id[:6]}"
    print(f"Mise à jour du domaine: {test_domaine} -> {new_domaine}")
    
    update_data = StoreUpdate(
        domaine=new_domaine,
        description="Description mise à jour pour tester la modification du domaine"
    )
    
    updated_store = await store_service.update_store(store.id, update_data)
    if not updated_store:
        print("❌ Erreur: Impossible de mettre à jour la boutique")
        return
    
    print(f"✅ Boutique mise à jour avec succès: Nouveau domaine={updated_store.domaine}")
    
    # Vérifier que l'ancien domaine n'est plus accessible
    old_store = await store_service.get_store_by_domaine(test_domaine)
    if old_store:
        print(f"❌ Erreur: L'ancien domaine {test_domaine} est toujours accessible")
    else:
        print(f"✅ L'ancien domaine {test_domaine} n'est plus accessible")
    
    # Vérifier que le nouveau domaine est accessible
    new_store = await store_service.get_store_by_domaine(new_domaine)
    if not new_store:
        print(f"❌ Erreur: Le nouveau domaine {new_domaine} n'est pas accessible")
        return
    
    print(f"✅ Boutique accessible avec le nouveau domaine: {new_store.name}, ID={new_store.id}")
    
    # Supprimer la boutique de test pour nettoyer
    print("Suppression de la boutique de test...")
    success = await store_service.delete_store(store.id)
    if success:
        print("✅ Boutique de test supprimée avec succès")
    else:
        print("❌ Erreur: Impossible de supprimer la boutique de test")

if __name__ == "__main__":
    asyncio.run(test_update_store())
