from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional, Dict, Any, List
from app.db.mongodb import get_database
from app.models.store import StoreResponse
from app.services.store_service import get_store_by_domain
from app.services.product_service import get_products_by_store, get_product_by_id
from app.models.product import ProductResponse, ProductDetailResponse
from bson import ObjectId
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api",
    tags=["store-preview"],
    responses={404: {"description": "Not found"}},
)

@router.get("/stores/domain/{domain}", response_model=StoreResponse)
async def get_store_preview_by_domain(domain: str):
    """
    Récupère une boutique par son domaine pour la prévisualisation publique
    """
    store = await get_store_by_domain(domain)
    if not store:
        raise HTTPException(status_code=404, detail="Boutique non trouvée")
    
    # Vérifier que la boutique est active
    if not store.is_active:
        raise HTTPException(status_code=404, detail="Cette boutique n'est pas active")
    
    return store

@router.get("/products/preview/{preview_url}", response_model=ProductDetailResponse)
async def get_product_by_preview_url(preview_url: str):
    """
    Récupère un produit par son URL de prévisualisation
    """
    db = await get_database()
    product_data = await db["products"].find_one({"preview_url": preview_url, "is_published": True})
    
    if not product_data:
        raise HTTPException(status_code=404, detail="Produit non trouvé")
    
    # Convertir les ObjectId en chaînes
    product_data["id"] = str(product_data["_id"])
    product_data["storeId"] = str(product_data["storeId"])
    product_data["created_by"] = str(product_data["created_by"])
    
    # Ajouter le champ has_file requis par le modèle ProductDetailResponse
    product_data["has_file"] = bool(product_data.get("file_url"))
    
    # Retourner le produit formaté
    return ProductDetailResponse(**product_data)

@router.get("/products/custom-url/{custom_url}", response_model=ProductDetailResponse)
async def get_product_by_custom_url(custom_url: str):
    """
    Récupère un produit par son URL personnalisée
    """
    db = await get_database()
    
    # Chercher dans la collection product_details
    product_details = await db["product_details"].find_one({"custom_url": custom_url})
    
    if not product_details:
        raise HTTPException(status_code=404, detail="Produit non trouvé")
    
    # Récupérer le produit associé
    product_id = product_details.get("product_id")
    if not product_id or not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=404, detail="Produit non trouvé")
    
    # Récupérer le produit complet depuis la base de données
    db = await get_database()
    product_data = await db["products"].find_one({"_id": ObjectId(product_id)})
    
    if not product_data:
        raise HTTPException(status_code=404, detail="Produit non trouvé")
        
    # Vérifier que le produit est publié
    if not product_data.get("is_published", False):
        raise HTTPException(status_code=404, detail="Produit non publié")
    
    # Convertir les ObjectId en chaînes
    product_data["id"] = str(product_data["_id"])
    product_data["storeId"] = str(product_data["storeId"])
    product_data["created_by"] = str(product_data["created_by"])
    
    # Ajouter le champ has_file requis
    product_data["has_file"] = bool(product_data.get("file_url"))
    
    # Retourner le produit formaté
    return ProductDetailResponse(**product_data)

@router.get("/public/products/store/{store_id}", response_model=Dict[str, Any])
async def get_public_products_by_store(
    store_id: str,
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Maximum number of products to return"),
    sort: Optional[str] = Query(None, description="Sort order (e.g., 'price_asc', 'price_desc', 'newest', 'oldest')")
):
    """
    Récupère les produits publiés d'une boutique sans nécessiter d'authentification
    """
    try:
        logger.info(f"Récupération des produits publics pour la boutique {store_id}")
        
        # Vérifier que l'ID de la boutique est valide
        if not ObjectId.is_valid(store_id):
            raise HTTPException(status_code=400, detail="ID de boutique invalide")
        
        # Vérifier que la boutique existe et est active
        db = await get_database()
        store = await db["stores"].find_one({"_id": ObjectId(store_id)})
        
        if not store:
            raise HTTPException(status_code=404, detail="Boutique non trouvée")
        
        if not store.get("is_active", False):
            raise HTTPException(status_code=404, detail="Cette boutique n'est pas active")
        
        # Construire les filtres pour ne récupérer que les produits publiés
        filters = {"storeId": ObjectId(store_id), "is_published": True}
        
        # Calculer skip à partir de page et limit
        skip = (page - 1) * limit
        
        # Définir le tri
        sort_dict = {}
        if sort:
            if sort == "price_asc":
                sort_dict["price"] = 1
            elif sort == "price_desc":
                sort_dict["price"] = -1
            elif sort == "newest":
                sort_dict["created_at"] = -1
            elif sort == "oldest":
                sort_dict["created_at"] = 1
            else:
                sort_dict["created_at"] = -1
        else:
            sort_dict["created_at"] = -1
        
        # Compter le nombre total de documents
        total = await db["products"].count_documents(filters)
        
        # Exécuter la requête
        cursor = db["products"].find(filters).sort(sort_dict).skip(skip).limit(limit)
        products = []
        
        async for product_dict in cursor:
            # Convertir les ObjectId en chaînes
            product_dict["id"] = str(product_dict["_id"])
            product_dict["storeId"] = str(product_dict["storeId"])
            product_dict["created_by"] = str(product_dict["created_by"])
            
            # Ajouter le champ has_file
            product_dict["has_file"] = bool(product_dict.get("file_url"))
            
            products.append(ProductResponse(**product_dict))
        
        # Construire la réponse paginée
        return {
            "items": products,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des produits publics pour la boutique {store_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erreur serveur: {str(e)}"
        )
