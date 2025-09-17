from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Dict, Any, Optional, List
import logging
from app.models.product import ProductCreate, ProductUpdate, ProductResponse, ProductDetailResponse
from app.models.course_structure import CourseSettingsUpdate, CourseSettingsResponse
from app.models.user import UserResponse
from app.services import product_service, course_service
from app.api.routes.auth import get_current_user

# Configuration du logger
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/", response_model=ProductDetailResponse)
async def create_product(
    product_data: ProductCreate,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Create a new product
    """
    try:
        # Vérifier que l'utilisateur a accès à la boutique
        store_id = str(product_data.storeId)
        logger.info(f"Vérification des permissions pour l'utilisateur {current_user.id} sur la boutique {store_id}")
        logger.info(f"Boutiques de l'utilisateur: {current_user.stores}")
        
        # Vérifier si l'utilisateur est admin ou propriétaire de la boutique
        if current_user.role != "admin" and store_id not in current_user.stores:
            logger.warning(f"Accès refusé: l'utilisateur {current_user.id} n'a pas accès à la boutique {store_id}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vous n'avez pas les permissions pour créer des produits dans cette boutique"
            )
        
        # Créer le produit
        product = await product_service.create_product(product_data, current_user.id)
        
        # Si c'est un cours, initialiser la structure du cours
        if product_data.type == "course" and product:
            await course_service.initialize_course_structure(product.id)
        
        return product
    except ValueError as e:
        logger.error(f"Erreur de validation lors de la création du produit: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Erreur serveur lors de la création du produit: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur serveur: {str(e)}"
        )

@router.get("/", response_model=List[ProductResponse])
async def get_products(
    store_id: Optional[str] = Query(None, description="Filter by store ID"),
    type: Optional[str] = Query(None, description="Filter by product type"),
    category: Optional[str] = Query(None, description="Filter by category"),
    is_published: Optional[bool] = Query(None, description="Filter by publication status"),
    search: Optional[str] = Query(None, description="Search term for product name or description"),
    sort: Optional[str] = Query(None, description="Sort order (e.g., 'price:asc', 'name:desc')"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Maximum number of products to return"),
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Get products with optional filters and pagination
    """
    try:
        # Construire les filtres
        filters = {}
        if store_id:
            filters["storeId"] = store_id
        if type:
            filters["type"] = type
        if category:
            filters["category"] = category
        if is_published is not None:
            filters["is_published"] = is_published
        if search:
            filters["search"] = search
        
        # Calculer skip à partir de page et limit
        skip = (page - 1) * limit
        
        products = await product_service.get_products(filters, skip, limit, sort)
        return products
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des produits: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur serveur: {str(e)}"
        )

@router.get("/store/{store_id}")
async def get_products_by_store(
    store_id: str,
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Maximum number of products to return"),
    sort: Optional[str] = Query(None, description="Sort order (e.g., 'price:asc', 'name:desc')"),
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Get products by store with pagination
    """
    try:
        filters = {"storeId": store_id}
        skip = (page - 1) * limit
        products = await product_service.get_products(filters, skip, limit, sort)
        return products
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des produits pour la boutique {store_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur serveur: {str(e)}"
        )

@router.get("/{product_id}", response_model=ProductDetailResponse)
async def get_product(
    product_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Get a product by ID
    """
    try:
        product = await product_service.get_product_by_id(product_id)
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Produit non trouvé"
            )
        
        return product
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la récupération du produit {product_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur serveur: {str(e)}"
        )

@router.get("/product/{product_id}", response_model=ProductDetailResponse)
async def get_product_by_any_id(
    product_id: str
):
    """
    Get a product by any type of ID (private_id, public_id, or MongoDB ID)
    This endpoint is accessible without authentication
    """
    try:
        product = None
        
        # Déterminer le type d'identifiant
        if product_id.startswith('private-'):
            # C'est un private_id
            product = await product_service.get_product_by_private_id(product_id)
        elif product_id.startswith('public-'):
            # C'est un public_id
            product = await product_service.get_product_by_public_id(product_id)
        elif ObjectId.is_valid(product_id):
            # C'est un ID MongoDB
            product = await product_service.get_product_by_id(product_id)
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Produit non trouvé"
            )
        
        return product
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la récupération du produit {product_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur serveur: {str(e)}"
        )

@router.put("/{product_id}", response_model=ProductDetailResponse)
async def update_product(
    product_id: str,
    product_data: ProductUpdate,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Update a product
    """
    try:
        # Vérifier que le produit existe
        existing_product = await product_service.get_product_by_id(product_id)
        if not existing_product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Produit non trouvé"
            )
        
        # Vérifier que l'utilisateur a le droit de modifier ce produit
        if current_user.role != "admin" and existing_product.storeId not in current_user.stores:
            logger.warning(f"Accès refusé: l'utilisateur {current_user.id} n'a pas accès à la boutique {existing_product.storeId}")
            logger.info(f"Boutiques de l'utilisateur: {current_user.stores}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vous n'avez pas les permissions pour modifier ce produit"
            )
        
        # Mettre à jour le produit
        product = await product_service.update_product(product_id, product_data)
        return product
    except ValueError as e:
        logger.error(f"Erreur de validation lors de la mise à jour du produit {product_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur serveur lors de la mise à jour du produit {product_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur serveur: {str(e)}"
        )

@router.delete("/{product_id}")
async def delete_product(
    product_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Delete a product
    """
    try:
        # Vérifier que le produit existe
        existing_product = await product_service.get_product_by_id(product_id)
        if not existing_product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Produit non trouvé"
            )
        
        # Vérifier que l'utilisateur a le droit de supprimer ce produit
        if current_user.role != "admin" and existing_product.storeId not in current_user.stores:
            logger.warning(f"Accès refusé: l'utilisateur {current_user.id} n'a pas accès à la boutique {existing_product.storeId}")
            logger.info(f"Boutiques de l'utilisateur: {current_user.stores}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vous n'avez pas les permissions pour supprimer ce produit"
            )
        
        # Supprimer le produit
        success = await product_service.delete_product(product_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Échec de la suppression du produit"
            )
        
        return {"message": "Produit supprimé avec succès"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la suppression du produit {product_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur serveur: {str(e)}"
        )

@router.post("/upload", response_model=Dict[str, Any])
async def upload_product_file(
    product_id: str,
    file_data: Dict[str, Any],
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Upload a product file
    """
    try:
        # Vérifier que le produit existe
        product = await product_service.get_product_by_id(product_id)
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Produit non trouvé"
            )
        
        # Vérifier que l'utilisateur a le droit de modifier ce produit
        if product.storeId != str(current_user.storeId) and current_user.role != "admin":
            logger.warning(f"Accès refusé: l'utilisateur {current_user.id} n'a pas accès à la boutique {product.storeId}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vous n'avez pas les permissions pour modifier ce produit"
            )
        
        updated_product = await product_service.update_product_file(product_id, file_data)
        return {"message": "Fichier téléversé avec succès", "product": updated_product}
    except Exception as e:
        logger.error(f"Erreur lors du téléversement du fichier pour le produit {product_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/upload-image", response_model=Dict[str, Any])
async def upload_product_image(
    product_id: str,
    image_url: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Upload a product image
    """
    try:
        # Vérifier que le produit existe
        product = await product_service.get_product_by_id(product_id)
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Produit non trouvé"
            )
        
        # Vérifier que l'utilisateur a le droit de modifier ce produit
        if product.storeId != str(current_user.storeId) and current_user.role != "admin":
            logger.warning(f"Accès refusé: l'utilisateur {current_user.id} n'a pas accès à la boutique {product.storeId}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vous n'avez pas les permissions pour modifier ce produit"
            )
        
        updated_product = await product_service.update_product_image(product_id, image_url)
        return {"message": "Image téléversée avec succès", "product": updated_product}
    except Exception as e:
        logger.error(f"Erreur lors du téléversement de l'image pour le produit {product_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/{product_id}/course-structure", response_model=CourseSettingsResponse)
async def get_course_structure(
    product_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Get course structure for a course product
    """
    try:
        # Vérifier que le produit existe et est de type cours
        product = await product_service.get_product_by_id(product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Produit non trouvé"
            )
        
        if product.type != "course":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ce produit n'est pas un cours"
            )
        
        # Récupérer la structure du cours
        course_structure = await course_service.get_course_structure(product_id)
        if not course_structure:
            # Initialiser une structure vide si elle n'existe pas
            course_structure = await course_service.initialize_course_structure(product_id)
        
        return course_structure
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la récupération de la structure du cours {product_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur serveur: {str(e)}"
        )

@router.put("/{product_id}/course-structure", response_model=CourseSettingsResponse)
async def update_course_structure(
    product_id: str,
    course_data: CourseSettingsUpdate,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Update course structure for a course product
    """
    try:
        # Vérifier que le produit existe et est de type cours
        product = await product_service.get_product_by_id(product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Produit non trouvé"
            )
        
        if product.type != "course":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ce produit n'est pas un cours"
            )
        
        # Vérifier que l'utilisateur a le droit de modifier ce produit
        if product.storeId != str(current_user.storeId) and current_user.role != "admin":
            logger.warning(f"Accès refusé: l'utilisateur {current_user.id} n'a pas accès à la boutique {product.storeId}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vous n'avez pas les permissions pour modifier ce cours"
            )
        
        # Mettre à jour la structure du cours
        course_structure = await course_service.update_course_structure(product_id, course_data)
        return course_structure
    except ValueError as e:
        logger.error(f"Erreur de validation lors de la mise à jour de la structure du cours {product_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur serveur lors de la mise à jour de la structure du cours {product_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur serveur: {str(e)}"
        )