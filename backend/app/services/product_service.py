import logging
from typing import Dict, Any, List, Optional
from bson import ObjectId
from datetime import datetime
from app.db.mongodb import get_database
from app.models.product import ProductInDB, ProductCreate, ProductUpdate, ProductResponse, ProductDetailResponse
from app.utils.id_generator import generate_product_uuid, generate_private_id, generate_public_id

# Configuration du logger
logger = logging.getLogger(__name__)

async def create_product(product_data: ProductCreate, user_id: str) -> ProductDetailResponse:
    """
    Create a new product
    """
    try:
        db = await get_database()
        
        # Convertir storeId en ObjectId si c'est une chaîne
        if isinstance(product_data.storeId, str) and ObjectId.is_valid(product_data.storeId):
            product_data.storeId = ObjectId(product_data.storeId)
        
        # Générer un private_id unique
        private_id = generate_private_id()
        
        # Créer le document ProductInDB avec les données de base
        product_in_db = ProductInDB(
            **product_data.dict(exclude={'private_id', 'public_id'}),  # Exclure private_id et public_id pour éviter les conflits
            private_id=private_id,  # Ajouter private_id explicitement
            public_id=None,  # Initialiser public_id à None
            created_by=ObjectId(user_id),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        # Convertir en dictionnaire pour l'insertion dans MongoDB
        product_dict = product_in_db.dict(by_alias=True)
        
        # Insérer dans la base de données
        result = await db["products"].insert_one(product_dict)
        
        # Récupérer le produit inséré
        created_product = await db["products"].find_one({"_id": result.inserted_id})
        
        if not created_product:
            logger.error("Produit créé non trouvé après insertion")
            raise ValueError("Échec de la récupération du produit créé")
        
        # Convertir en ProductDetailResponse
        return format_product_detail_response(created_product)
    except Exception as e:
        logger.error(f"Erreur lors de la création du produit: {str(e)}")
        raise

async def get_products(
    filters: Dict[str, Any] = None,
    skip: int = 0,
    limit: int = 100,
    sort: Optional[str] = None
) -> Dict[str, Any]:
    """
    Get products with optional filters and pagination
    """
    try:
        db = await get_database()
        
        # Préparer les filtres
        query = {}
        if filters:
            for key, value in filters.items():
                if key == "storeId" and isinstance(value, str) and ObjectId.is_valid(value):
                    query[key] = ObjectId(value)
                elif key == "search":
                    query["$or"] = [
                        {"title": {"$regex": value, "$options": "i"}},
                        {"description": {"$regex": value, "$options": "i"}}
                    ]
                else:
                    query[key] = value
        
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
        total = await db["products"].count_documents(query)
        
        # Exécuter la requête
        cursor = db["products"].find(query).sort(sort_dict).skip(skip).limit(limit)
        products = []
        
        async for product_dict in cursor:
            products.append(format_product_response(product_dict))
        
        # Construire la réponse paginée
        return {
            "items": products,
            "total": total,
            "page": (skip // limit) + 1,
            "limit": limit,
            "pages": (total + limit - 1) // limit
        }
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des produits: {str(e)}")
        raise

async def get_product_by_id(product_id: str) -> Optional[ProductDetailResponse]:
    """
    Get a product by ID
    """
    try:
        if not ObjectId.is_valid(product_id):
            logger.warning(f"ID de produit invalide: {product_id}")
            return None
        
        db = await get_database()
        
        # Convertir en ObjectId
        product_obj_id = ObjectId(product_id)
        
        # Récupérer le produit
        product = await db["products"].find_one({"_id": product_obj_id})
        
        if not product:
            logger.info(f"Produit non trouvé pour l'ID: {product_id}")
            return None
        
        # Convertir en ProductDetailResponse
        return format_product_detail_response(product)
    except Exception as e:
        logger.error(f"Erreur lors de la récupération du produit {product_id}: {str(e)}")
        raise

async def get_product_by_private_id(private_id: str) -> Optional[ProductDetailResponse]:
    """
    Get a product by its private_id
    """
    try:
        db = await get_database()
        
        # Récupérer le produit par son private_id
        product = await db["products"].find_one({"private_id": private_id})
        
        if not product:
            logger.info(f"Produit non trouvé pour le private_id: {private_id}")
            return None
        
        # Convertir en ProductDetailResponse
        return format_product_detail_response(product)
    except Exception as e:
        logger.error(f"Erreur lors de la récupération du produit par private_id {private_id}: {str(e)}")
        raise

async def get_product_by_public_id(public_id: str) -> Optional[ProductDetailResponse]:
    """
    Get a product by its public_id
    """
    try:
        db = await get_database()
        
        # Récupérer le produit par son public_id
        product = await db["products"].find_one({"public_id": public_id})
        
        if not product:
            logger.info(f"Produit non trouvé pour le public_id: {public_id}")
            return None
        
        # Convertir en ProductDetailResponse
        return format_product_detail_response(product)
    except Exception as e:
        logger.error(f"Erreur lors de la récupération du produit par public_id {public_id}: {str(e)}")
        raise


async def update_product(product_id: str, product_data: ProductUpdate) -> Optional[ProductDetailResponse]:
    """
    Update a product
    """
    try:
        if not ObjectId.is_valid(product_id):
            logger.warning(f"ID de produit invalide: {product_id}")
            return None
        
        db = await get_database()
        
        # Convertir en ObjectId
        product_obj_id = ObjectId(product_id)
        
        # Vérifier que le produit existe
        existing_product = await db["products"].find_one({"_id": product_obj_id})
        if not existing_product:
            logger.info(f"Produit non trouvé pour l'ID: {product_id}")
            return None
        
        # Préparer les données de mise à jour
        update_data = product_data.dict(exclude_unset=True)
        if update_data:
            update_data["updated_at"] = datetime.utcnow()
            
            # Générer un public_id si le produit est publié et n'en a pas déjà un
            if update_data.get("is_published") and not existing_product.get("public_id"):
                # Générer un ID public unique
                public_id = generate_public_id()
                update_data["public_id"] = public_id
            # Supprimer le public_id si le produit est dépublié
            elif "is_published" in update_data and not update_data["is_published"]:
                update_data["public_id"] = None
            
            # Mettre à jour le produit
            await db["products"].update_one(
                {"_id": product_obj_id},
                {"$set": update_data}
            )
        
        # Récupérer le produit mis à jour
        updated_product = await db["products"].find_one({"_id": product_obj_id})
        
        if not updated_product:
            logger.info(f"Produit non trouvé après mise à jour pour l'ID: {product_id}")
            return None
        
        # Convertir en ProductDetailResponse
        return format_product_detail_response(updated_product)
    except Exception as e:
        logger.error(f"Erreur lors de la mise à jour du produit {product_id}: {str(e)}")
        raise

async def delete_product(product_id: str) -> bool:
    """
    Delete a product
    """
    try:
        if not ObjectId.is_valid(product_id):
            logger.warning(f"ID de produit invalide: {product_id}")
            return False
        
        db = await get_database()
        
        # Convertir en ObjectId
        product_obj_id = ObjectId(product_id)
        
        # Supprimer le produit
        result = await db["products"].delete_one({"_id": product_obj_id})
        
        # Vérifier si le produit a été supprimé
        if result.deleted_count > 0:
            logger.info(f"Produit supprimé avec succès: {product_id}")
            return True
        else:
            logger.info(f"Aucun produit trouvé pour suppression: {product_id}")
            return False
    except Exception as e:
        logger.error(f"Erreur lors de la suppression du produit {product_id}: {str(e)}")
        raise

async def get_products_by_store(
    store_id: str,
    page: int = 1,
    limit: int = 10,
    sort: Optional[str] = None
) -> Dict[str, Any]:
    """
    Get products by store
    """
    try:
        if not ObjectId.is_valid(store_id):
            logger.warning(f"ID de boutique invalide: {store_id}")
            return {
                "items": [],
                "total": 0,
                "page": page,
                "limit": limit,
                "pages": 0
            }
        
        filters = {"storeId": store_id}
        skip = (page - 1) * limit
        return await get_products(filters, skip, limit, sort)
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des produits pour la boutique {store_id}: {str(e)}")
        raise

async def update_product_file(product_id: str, file_data: Dict[str, Any]) -> Optional[ProductDetailResponse]:
    """
    Update product file information
    """
    try:
        if not ObjectId.is_valid(product_id):
            logger.warning(f"ID de produit invalide: {product_id}")
            return None
        
        db = await get_database()
        
        # Préparer les données de mise à jour
        update_data = {
            "file_url": file_data.get("file_url"),
            "file_type": file_data.get("file_type"),
            "file_size": file_data.get("file_size"),
            "updated_at": datetime.utcnow()
        }
        
        # Mettre à jour le produit
        await db["products"].update_one(
            {"_id": ObjectId(product_id)},
            {"$set": update_data}
        )
        
        # Récupérer le produit mis à jour
        updated_product = await db["products"].find_one({"_id": ObjectId(product_id)})
        
        if not updated_product:
            logger.info(f"Produit non trouvé après mise à jour du fichier: {product_id}")
            return None
        
        # Convertir en ProductDetailResponse
        return format_product_detail_response(updated_product)
    except Exception as e:
        logger.error(f"Erreur lors de la mise à jour du fichier du produit {product_id}: {str(e)}")
        raise

async def update_product_image(product_id: str, image_url: str) -> Optional[ProductDetailResponse]:
    """
    Add an image to a product
    """
    try:
        if not ObjectId.is_valid(product_id):
            logger.warning(f"ID de produit invalide: {product_id}")
            return None
        
        db = await get_database()
        
        # Mettre à jour le produit
        await db["products"].update_one(
            {"_id": ObjectId(product_id)},
            {
                "$push": {"images": image_url},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        
        # Récupérer le produit mis à jour
        updated_product = await db["products"].find_one({"_id": ObjectId(product_id)})
        
        if not updated_product:
            logger.info(f"Produit non trouvé après mise à jour de l'image: {product_id}")
            return None
        
        # Convertir en ProductDetailResponse
        return format_product_detail_response(updated_product)
    except Exception as e:
        logger.error(f"Erreur lors de la mise à jour de l'image du produit {product_id}: {str(e)}")
        raise

def format_product_response(product: Dict[str, Any]) -> ProductResponse:
    """
    Format a product document as a ProductResponse
    """
    # Convertir les ObjectId en chaînes
    product["id"] = str(product["_id"])
    product["storeId"] = str(product["storeId"])
    product["created_by"] = str(product["created_by"])
    
    # Ajouter le champ has_file
    product["has_file"] = bool(product.get("file_url"))
    
    # Créer et retourner la réponse
    return ProductResponse(**product)

def format_product_detail_response(product: Dict[str, Any]) -> ProductDetailResponse:
    """
    Format a product document as a ProductDetailResponse
    """
    # Convertir les ObjectId en chaînes
    product["id"] = str(product["_id"])
    product["storeId"] = str(product["storeId"])
    product["created_by"] = str(product["created_by"])
    
    # Ajouter le champ has_file
    product["has_file"] = bool(product.get("file_url"))
    
    # Créer et retourner la réponse
    return ProductDetailResponse(**product)