from datetime import datetime
from typing import Optional, Dict, Any, List
from bson import ObjectId
from app.db.mongodb import db
from app.models.store import StoreInDB, StoreCreate, StoreResponse, StoreUpdate, StoreThemeUpdate
import logging
import re

logger = logging.getLogger(__name__)

async def create_store(store_data: StoreCreate, owner_id: str) -> StoreResponse:
    """
    Create a new store
    """
    try:
        logger.info(f"Création d'une nouvelle boutique: {store_data.dict()}")
        logger.info(f"Propriétaire ID: {owner_id}")
        
        # Vérifier que l'ID du propriétaire est valide
        if not ObjectId.is_valid(owner_id):
            logger.error(f"ID de propriétaire invalide: {owner_id}")
            raise ValueError("ID de propriétaire invalide")
        
        # Create store - l'ID sera généré automatiquement par le default_factory
        store_in_db = StoreInDB(
            **store_data.dict(),
            owner_id=ObjectId(owner_id),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        logger.info(f"Objet StoreInDB créé: {store_in_db.dict(exclude={'theme'})}")
        
        # Insérer dans la base de données
        store_dict = store_in_db.dict(by_alias=True)
        logger.info(f"Insertion dans la base de données avec ID: {store_dict.get('_id')}")
        
        result = await db.db.stores.insert_one(store_dict)
        logger.info(f"Boutique créée avec ID: {result.inserted_id}")
        
        # Update user role to creator if not already
        await db.db.users.update_one(
            {"_id": ObjectId(owner_id), "role": {"$ne": "creator"}},
            {"$set": {"role": "creator"}}
        )
        logger.info(f"Rôle utilisateur mis à jour pour {owner_id}")
        
        # Add store ID to user's stores array if it doesn't exist - utiliser ObjectId directement
        await db.db.users.update_one(
            {"_id": ObjectId(owner_id)},
            {"$addToSet": {"stores": result.inserted_id}}
        )
        logger.info(f"Boutique {result.inserted_id} (ObjectId) ajoutée à la liste des boutiques de l'utilisateur {owner_id}")
        
        # Construire la réponse
        store_response = StoreResponse(
            id=str(result.inserted_id),
            name=store_in_db.name,
            domaine=store_in_db.domaine,
            description=store_in_db.description,
            logo_url=store_in_db.logo_url,
            cover_image_url=store_in_db.cover_image_url,
            theme=store_in_db.theme,
            social_links=store_in_db.social_links,
            contact_email=store_in_db.contact_email,
            contact_phone=store_in_db.contact_phone,
            is_active=store_in_db.is_active,
            custom_domain=store_in_db.custom_domain,
            owner_id=str(store_in_db.owner_id),
            created_at=store_in_db.created_at,
            updated_at=store_in_db.updated_at
        )
        
        logger.info(f"Réponse StoreResponse créée: {store_response.dict(exclude={'theme'})}")
        return store_response
        
    except Exception as e:
        logger.error(f"Erreur lors de la création de la boutique: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        raise e

async def get_store_by_id(store_id: str) -> Optional[StoreResponse]:
    """
    Get a store by ID
    """
    # Vérifier si l'ID est valide
    if not store_id or not isinstance(store_id, str):
        logger.error(f"ID de boutique invalide (vide ou non-string): {store_id}")
        return None
        
    if not ObjectId.is_valid(store_id):
        logger.error(f"Format d'ID de boutique invalide: {store_id}")
        return None
    
    try:
        store_dict = await db.db.stores.find_one({"_id": ObjectId(store_id)})
        
        if not store_dict:
            logger.warning(f"Boutique non trouvée avec l'ID: {store_id}")
            return None
        
        store = StoreInDB(**store_dict)
        
        return StoreResponse(
            id=str(store.id),
            name=store.name,
            domaine=store.domaine,
            description=store.description,
            logo_url=store.logo_url,
            cover_image_url=store.cover_image_url,
            theme=store.theme,
            social_links=store.social_links,
            contact_email=store.contact_email,
            contact_phone=store.contact_phone,
            is_active=store.is_active,
            custom_domain=store.custom_domain,
            owner_id=str(store.owner_id),
            created_at=store.created_at,
            updated_at=store.updated_at
        )
    except Exception as e:
        logger.error(f"Erreur lors de la récupération de la boutique {store_id}: {e}")
        return None

async def get_store_by_domaine(domaine: str) -> Optional[StoreResponse]:
    """
    Get a store by domaine
    """
    store_dict = await db.db.stores.find_one({"domaine": domaine})
    
    if not store_dict:
        return None
    
    store = StoreInDB(**store_dict)
    
    return StoreResponse(
        id=str(store.id),
        name=store.name,
        domaine=store.domaine,
        description=store.description,
        logo_url=store.logo_url,
        cover_image_url=store.cover_image_url,
        theme=store.theme,
        social_links=store.social_links,
        contact_email=store.contact_email,
        contact_phone=store.contact_phone,
        is_active=store.is_active,
        custom_domain=store.custom_domain,
        owner_id=str(store.owner_id),
        created_at=store.created_at,
        updated_at=store.updated_at
    )

async def get_store_by_owner(owner_id: str) -> Optional[StoreResponse]:
    """
    Get a store by owner ID (for backward compatibility)
    """
    if not ObjectId.is_valid(owner_id):
        return None
    
    store_dict = await db.db.stores.find_one({"owner_id": ObjectId(owner_id)})
    
    if not store_dict:
        return None
    
    store = StoreInDB(**store_dict)
    
    return StoreResponse(
        id=str(store.id),
        name=store.name,
        domaine=store.domaine,
        description=store.description,
        logo_url=store.logo_url,
        cover_image_url=store.cover_image_url,
        theme=store.theme,
        social_links=store.social_links,
        contact_email=store.contact_email,
        contact_phone=store.contact_phone,
        is_active=store.is_active,
        custom_domain=store.custom_domain,
        owner_id=str(store.owner_id),
        created_at=store.created_at,
        updated_at=store.updated_at
    )

async def get_stores_by_owner(owner_id: str) -> List[StoreResponse]:
    """
    Get all stores owned by a user
    """
    logger.info(f"Récupération des boutiques pour le propriétaire: {owner_id}")
    
    # Vérifier si l'ID est valide
    if not owner_id or (isinstance(owner_id, str) and not owner_id.strip()):
        logger.warning(f"ID de propriétaire vide ou invalide")
        return []
    
    # Préparer la requête pour rechercher avec les deux formats d'ID
    query = {"$or": [{"owner_id": owner_id}]}
    
    # Ajouter la recherche par ObjectId si l'ID est valide
    if ObjectId.is_valid(owner_id):
        query["$or"].append({"owner_id": ObjectId(owner_id)})
        logger.info(f"Recherche des boutiques avec owner_id comme ObjectId: {ObjectId(owner_id)}")
    else:
        logger.warning(f"ID de propriétaire non valide pour conversion en ObjectId: {owner_id}")
    
    logger.info(f"Requête finale pour la recherche des boutiques: {query}")
    
    # Exécuter la requête combinée
    cursor = db.db.stores.find(query)
    
    # Compter le nombre total de boutiques trouvées
    count = await db.db.stores.count_documents(query)
    logger.info(f"Nombre total de boutiques trouvées pour {owner_id}: {count}")
    
    stores = []
    
    # Traiter les résultats de la requête combinée
    async for store_dict in cursor:
        try:
            # Vérifier que l'ID est valide avant de créer l'objet StoreInDB
            if not store_dict.get("_id") or (isinstance(store_dict.get("_id"), str) and not store_dict.get("_id").strip()):
                logger.warning(f"Store with empty ID found for owner {owner_id}, skipping")
                continue
                
            # S'assurer que _id est un ObjectId valide
            if isinstance(store_dict.get("_id"), str):
                if not ObjectId.is_valid(store_dict.get("_id")):
                    logger.warning(f"Store with invalid ID found for owner {owner_id}, skipping")
                    continue
                store_dict["_id"] = ObjectId(store_dict.get("_id"))
            store = StoreInDB(**store_dict)
            store_response = StoreResponse(
                id=str(store.id),
                name=store.name,
                domaine=store.domaine,
                description=store.description,
                logo_url=store.logo_url,
                cover_image_url=store.cover_image_url,
                theme=store.theme,
                social_links=store.social_links,
                contact_email=store.contact_email,
                contact_phone=store.contact_phone,
                is_active=store.is_active,
                custom_domain=store.custom_domain,
                owner_id=str(store.owner_id),
                created_at=store.created_at,
                updated_at=store.updated_at
            )
            stores.append(store_response)
        except Exception as e:
            logger.error(f"Error processing store for owner {owner_id}: {e}")
    
    logger.info(f"Returning {len(stores)} stores for owner {owner_id}")
    return stores

async def update_store(store_id: str, store_data: StoreUpdate) -> Optional[StoreResponse]:
    """
    Update a store
    """
    try:
        logger.info(f"Tentative de mise à jour de la boutique avec ID: {store_id}")
        logger.info(f"Données de mise à jour: {store_data}")
        
        # Vérifier si l'ID est valide
        if not ObjectId.is_valid(store_id):
            logger.error(f"Format d'ID de boutique invalide: {store_id}")
            raise ValueError(f"Format d'ID de boutique invalide: {store_id}")
        
        # Vérifier si la boutique existe
        store_dict = await db.db.stores.find_one({"_id": ObjectId(store_id)})
        if not store_dict:
            logger.error(f"Boutique non trouvée avec l'ID: {store_id}")
            raise ValueError(f"Boutique non trouvée avec l'ID: {store_id}")
        
        logger.info(f"Boutique trouvée: {store_dict.get('name')}")
        
        # Convertir les données de mise à jour
        try:
            update_data = store_data.dict(exclude_unset=True, exclude_none=True)
            logger.info(f"Données de mise à jour pour la boutique {store_id}: {update_data}")
        except Exception as e:
            logger.error(f"Erreur lors de la conversion des données: {e}")
            raise ValueError(f"Format de données invalide: {e}")
        
        if update_data:
            update_data["updated_at"] = datetime.utcnow()
            
            # Vérifier si le domaine est mis à jour et s'il est disponible
            if "domaine" in update_data and update_data["domaine"] != store_dict.get("domaine"):
                if await check_domaine_exists(update_data["domaine"]):
                    logger.error(f"Domaine '{update_data['domaine']}' déjà utilisé")
                    raise ValueError(f"Domaine '{update_data['domaine']}' est déjà utilisé")
            
            # Vérifier si le thème est mis à jour
            if "theme" in update_data and update_data["theme"] is not None:
                logger.info(f"Mise à jour du thème: {update_data['theme']}")
            
            try:
                # Mettre à jour la boutique dans la base de données
                result = await db.db.stores.update_one(
                    {"_id": ObjectId(store_id)},
                    {"$set": update_data}
                )
                
                if result.modified_count == 0:
                    logger.warning(f"Aucune modification effectuée pour la boutique {store_id}")
                else:
                    logger.info(f"Boutique {store_id} mise à jour avec succès")
                    
            except Exception as e:
                logger.error(f"Erreur de base de données lors de la mise à jour: {e}")
                import traceback
                logger.error(traceback.format_exc())
                raise ValueError(f"Erreur lors de la mise à jour dans la base de données: {e}")
        else:
            logger.info(f"Aucune donnée à mettre à jour pour la boutique {store_id}")
        
        # Récupérer la boutique mise à jour
        updated_store = await get_store_by_id(store_id)
        if not updated_store:
            logger.error(f"Impossible de récupérer la boutique mise à jour avec l'ID: {store_id}")
        else:
            logger.info(f"Boutique mise à jour récupérée avec succès: {updated_store.name}")
            
        return updated_store
    except ValueError as e:
        logger.error(f"Erreur de validation dans update_store: {e}")
        raise
    except Exception as e:
        logger.error(f"Erreur inattendue dans update_store: {e}")
        import traceback
        logger.error(traceback.format_exc())
        raise

async def delete_store(store_id: str) -> bool:
    """
    Delete a store
    """
    if not ObjectId.is_valid(store_id):
        return False
    
    # Get store owner
    store = await get_store_by_id(store_id)
    if not store:
        return False
    
    # Update user to remove store ID
    await db.db.users.update_one(
        {"_id": ObjectId(store.owner_id)},
        {"$unset": {"storeId": ""}, "$set": {"role": "customer"}}
    )
    
    # Delete store
    result = await db.db.stores.delete_one({"_id": ObjectId(store_id)})
    return result.deleted_count > 0

async def update_store_theme(store_id: str, theme_data: StoreThemeUpdate) -> Optional[StoreResponse]:
    """
    Update store theme
    """
    if not ObjectId.is_valid(store_id):
        return None
    
    # Get current store
    store = await get_store_by_id(store_id)
    if not store:
        return None
    
    # Update theme
    update_data = theme_data.dict(exclude_unset=True)
    if update_data:
        await db.db.stores.update_one(
            {"_id": ObjectId(store_id)},
            {
                "$set": {
                    "theme." + k: v for k, v in update_data.items()
                },
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
    
    # Get updated store
    return await get_store_by_id(store_id)

async def check_domaine_exists(domaine: str) -> bool:
    """
    Check if a domaine already exists
    """
    count = await db.db.stores.count_documents({"domaine": domaine})
    return count > 0

async def generate_unique_domaine(name: str) -> str:
    """
    Generate a unique domaine from a store name
    """
    # Convert to lowercase and replace spaces with hyphens
    base_domaine = re.sub(r'[^\w\s-]', '', name.lower())
    base_domaine = re.sub(r'[\s_-]+', '-', base_domaine)
    base_domaine = re.sub(r'^-+|-+$', '', base_domaine)
    
    # Check if domaine exists
    if not await check_domaine_exists(base_domaine):
        return base_domaine
    
    # If domaine exists, add a number
    counter = 1
    while True:
        new_domaine = f"{base_domaine}-{counter}"
        if not await check_domaine_exists(new_domaine):
            return new_domaine
        counter += 1

async def update_store_logo(store_id: str, logo_url: str) -> Optional[StoreResponse]:
    """
    Update store logo
    """
    if not ObjectId.is_valid(store_id):
        return None
    
    # Update store
    await db.db.stores.update_one(
        {"_id": ObjectId(store_id)},
        {
            "$set": {
                "logo_url": logo_url,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    # Get updated store
    return await get_store_by_id(store_id)

async def update_store_cover(store_id: str, cover_image_url: str) -> Optional[StoreResponse]:
    """
    Update store cover image
    """
    if not ObjectId.is_valid(store_id):
        return None
    
    # Update store
    await db.db.stores.update_one(
        {"_id": ObjectId(store_id)},
        {
            "$set": {
                "cover_image_url": cover_image_url,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    # Get updated store
    return await get_store_by_id(store_id)

async def check_domaine_exists(domaine: str) -> bool:
    """
    Check if a domaine already exists
    """
    try:
        logger.info(f"Vérification de la disponibilité du domaine: {domaine}")
        
        # Normalize domaine to lowercase and remove spaces
        domaine = domaine.lower().strip()
        logger.info(f"Domaine normalisé: {domaine}")
        
        # Check if domaine exists
        store = await db.db.stores.find_one({"domaine": domaine})
        
        if store:
            logger.info(f"Domaine {domaine} déjà utilisé par la boutique ID: {store.get('_id')}")
            return True
        else:
            logger.info(f"Domaine {domaine} disponible")
            return False
    except Exception as e:
        logger.error(f"Erreur lors de la vérification du domaine {domaine}: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

async def check_domain_exists(domain: str) -> bool:
    """
    Check if a domain already exists (deprecated, use check_domaine_exists instead)
    """
    return await check_domaine_exists(domain)

async def get_store_by_domain(domain: str) -> Optional[StoreResponse]:
    """
    Get a store by domain (alias for get_store_by_domaine)
    """
    return await get_store_by_domaine(domain)
