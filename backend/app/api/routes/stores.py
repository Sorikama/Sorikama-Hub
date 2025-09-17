from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Dict, Any, Optional, List
import logging
from app.models.store import StoreCreate, StoreUpdate, StoreResponse, StoreThemeUpdate
from app.models.user import UserResponse
from app.services import store_service
from app.api.routes.auth import get_current_user
from pydantic import BaseModel

# Modèle Pydantic pour la vérification de disponibilité du domaine
class DomaineCheck(BaseModel):
    domaine: str

# Configuration du logger
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/", response_model=StoreResponse)
async def create_store(
    store_data: Dict[str, Any],
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Create a new store
    """
    # Nous permettons maintenant à un utilisateur d'avoir plusieurs boutiques
    # La vérification limitant à une seule boutique a été supprimée
    
    try:
        # Le frontend utilise maintenant domaine partout, plus besoin de conversion
        
        # Vérifier que les champs obligatoires sont présents
        required_fields = ["name", "domaine", "description"]
        for field in required_fields:
            if field not in store_data or not store_data[field]:
                raise ValueError(f"Le champ {field} est obligatoire")
        
        # Vérifier que le domaine est valide
        if "domaine" in store_data:
            # Vérifier si le domaine existe déjà
            domain_exists = await store_service.check_domain_exists(store_data["domaine"])
            if domain_exists:
                raise ValueError(f"Le domaine {store_data['domaine']} est déjà utilisé")
        
        # Create StoreCreate model
        try:
            store_create = StoreCreate(**store_data)
        except Exception as e:
            raise ValueError(f"Erreur de validation des données: {str(e)}")
        
        # Create store
        store = await store_service.create_store(store_create, current_user.id)
        if not store:
            raise Exception("Erreur lors de la création de la boutique")
            
        return store
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur serveur: {str(e)}"
        )

@router.get("/me", response_model=StoreResponse)
async def get_my_store(
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Get the current user's primary store (for backward compatibility)
    """
    if not current_user.storeId:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User does not have a store"
        )
    
    store = await store_service.get_store_by_id(current_user.storeId)
    
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found"
        )
    
    return store

@router.get("/", response_model=List[StoreResponse])
async def get_my_stores(
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Get all stores owned by the current user
    """
    try:
        stores = await store_service.get_stores_by_owner(current_user.id)
        return stores
    except Exception as e:
        logger.error(f"Error getting stores for user {current_user.id}: {e}")
        # Retourner une liste vide en cas d'erreur plutôt que de faire échouer la requête
        return []

@router.get("/{store_id}", response_model=StoreResponse)
async def get_store(store_id: str):
    """
    Get a store by ID
    """
    store = await store_service.get_store_by_id(store_id)
    
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found"
        )
    
    return store

@router.get("/domaine/{domaine}", response_model=StoreResponse)
async def get_store_by_domaine(domaine: str):
    """
    Get a store by domaine
    """
    store = await store_service.get_store_by_domaine(domaine)
    
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found"
        )
    
    return store

@router.put("/{store_id}", response_model=StoreResponse)
async def update_store(
    store_id: str,
    store_data: Dict[str, Any],
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Update a store
    """
    # Vérifier si l'ID est au format valide pour MongoDB
    if not store_id or not isinstance(store_id, str):
        logger.error(f"ID de boutique invalide (vide ou non-string): {store_id}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Format d'ID de boutique invalide: l'ID ne peut pas être vide"
        )
        
    if not store_service.ObjectId.is_valid(store_id):
        logger.error(f"Format d'ID de boutique invalide: {store_id}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Format d'ID de boutique invalide: {store_id}"
        )
    
    # Check if user has permission to update this store
    has_permission = False
    
    # Si l'utilisateur est admin, il a toujours la permission
    if current_user.role == "admin":
        has_permission = True
    # Si le store_id correspond au storeId principal de l'utilisateur
    elif current_user.storeId and store_id == current_user.storeId:
        has_permission = True
    # Si le store_id est dans la liste des boutiques de l'utilisateur
    elif current_user.stores and store_id in current_user.stores:
        has_permission = True
        
    if not has_permission:
        logger.warning(f"User {current_user.id} tried to update store {store_id} without permission")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas la permission de mettre à jour cette boutique"
        )
    
    # Vérifier si la boutique existe avant de tenter la mise à jour
    existing_store = await store_service.get_store_by_id(store_id)
    if not existing_store:
        logger.error(f"Boutique non trouvée avec l'ID: {store_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Boutique non trouvée avec l'ID: {store_id}"
        )
    
    try:
        # Le frontend utilise maintenant domaine partout, plus besoin de conversion
        
        # Convertir en StoreUpdate
        try:
            store_update = StoreUpdate(**store_data)
        except Exception as e:
            logger.error(f"Erreur de validation des données: {e}")
            raise ValueError(f"Format de données invalide: {e}")
        
        store = await store_service.update_store(store_id, store_update)
        
        if not store:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Boutique non trouvée avec l'ID: {store_id}"
            )
        
        return store
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Erreur inattendue lors de la mise à jour de la boutique {store_id}: {e}")
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur serveur lors de la mise à jour: {str(e)}"
        )

@router.delete("/{store_id}")
async def delete_store(
    store_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Delete a store
    """
    # Check if user has permission to delete this store
    if store_id != current_user.storeId and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this store"
        )
    
    success = await store_service.delete_store(store_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found"
        )
    
    return {"message": "Store deleted successfully"}

@router.put("/{store_id}/theme", response_model=StoreResponse)
async def update_store_theme(
    store_id: str,
    theme_data: StoreThemeUpdate,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Update store theme
    """
    # Check if user has permission to update this store
    has_permission = False
    
    # Si l'utilisateur est admin, il a toujours la permission
    if current_user.role == "admin":
        has_permission = True
    # Si le store_id correspond au storeId principal de l'utilisateur
    elif current_user.storeId and store_id == current_user.storeId:
        has_permission = True
    # Si le store_id est dans la liste des boutiques de l'utilisateur
    elif current_user.stores and store_id in current_user.stores:
        has_permission = True
        
    if not has_permission:
        logger.warning(f"User {current_user.id} tried to update store theme for {store_id} without permission")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to update this store"
        )
    
    store = await store_service.update_store_theme(store_id, theme_data)
    
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found"
        )
    
    return store

# Cette route a été supprimée car elle est en conflit avec la route POST /check-domaine ci-dessous

@router.get("/domaine-check", response_model=Dict[str, bool])
async def check_domaine_availability(domaine: str = Query(..., description="Domaine to check availability")):
    """
    Check if a domaine is available
    """
    exists = await store_service.check_domaine_exists(domaine)
    return {"available": not exists}

@router.get("/domain-check", response_model=Dict[str, bool], deprecated=True)
async def check_domain_availability(domain: str = Query(..., description="Domain to check availability")):
    """
    Check if a domain is available (deprecated, use /domaine-check instead)
    """
    exists = await store_service.check_domaine_exists(domain)
    return {"available": not exists}

@router.post("/check-domaine", response_model=Dict[str, bool])
async def check_domaine_post(domaine_data: DomaineCheck):
    """
    Check if a domaine is available (POST method)
    """
    domaine = domaine_data.domaine
    if not domaine:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Domaine is required"
        )
    exists = await store_service.check_domaine_exists(domaine)
    return {"available": not exists}

@router.post("/check-domain", response_model=Dict[str, bool], deprecated=True)
async def check_domain_post(domain_data: Dict[str, str]):
    """
    Check if a domain is available (POST method, deprecated, use /check-domaine instead)
    """
    domain = domain_data.get("domain", "")
    if not domain:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Domain is required"
        )
    exists = await store_service.check_domaine_exists(domain)
    return {"available": not exists}

@router.post("/generate-domaine")
async def generate_domaine(name: str):
    """
    Generate a unique domaine from a store name
    """
    domaine = await store_service.generate_unique_domaine(name)
    return {"domaine": domaine}

@router.post("/{store_id}/logo", response_model=StoreResponse)
async def update_store_logo(
    store_id: str,
    logo_url: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Update store logo
    """
    # Check if user has permission to update this store
    has_permission = False
    
    # Si l'utilisateur est admin, il a toujours la permission
    if current_user.role == "admin":
        has_permission = True
    # Si le store_id correspond au storeId principal de l'utilisateur
    elif current_user.storeId and store_id == current_user.storeId:
        has_permission = True
    # Si le store_id est dans la liste des boutiques de l'utilisateur
    elif current_user.stores and store_id in current_user.stores:
        has_permission = True
        
    if not has_permission:
        logger.warning(f"User {current_user.id} tried to update store logo for {store_id} without permission")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to update this store"
        )
    
    store = await store_service.update_store_logo(store_id, logo_url)
    
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found"
        )
    
    return store

@router.post("/{store_id}/cover", response_model=StoreResponse)
async def update_store_cover(
    store_id: str,
    cover_image_url: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Update store cover image
    """
    # Check if user has permission to update this store
    has_permission = False
    
    # Si l'utilisateur est admin, il a toujours la permission
    if current_user.role == "admin":
        has_permission = True
    # Si le store_id correspond au storeId principal de l'utilisateur
    elif current_user.storeId and store_id == current_user.storeId:
        has_permission = True
    # Si le store_id est dans la liste des boutiques de l'utilisateur
    elif current_user.stores and store_id in current_user.stores:
        has_permission = True
        
    if not has_permission:
        logger.warning(f"User {current_user.id} tried to update store cover for {store_id} without permission")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to update this store"
        )
    
    store = await store_service.update_store_cover(store_id, cover_image_url)
    
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found"
        )
    
    return store
