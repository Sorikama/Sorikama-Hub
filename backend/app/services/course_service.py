import logging
from typing import Dict, Any, Optional
from bson import ObjectId
from datetime import datetime
from app.db.mongodb import get_database
from app.models.course_structure import CourseStructure, CourseSettings, CourseSettingsInDB, CourseSettingsResponse

# Configuration du logger
logger = logging.getLogger(__name__)

async def initialize_course_structure(product_id: str) -> CourseSettingsResponse:
    """
    Initialize an empty course structure for a product
    """
    try:
        db = await get_database()
        
        # Vérifier si une structure existe déjà
        existing = await db["course_settings"].find_one({"product_id": ObjectId(product_id)})
        if existing:
            return format_course_settings_response(existing)
        
        # Créer une structure vide
        empty_structure = CourseStructure()
        
        # Créer le document CourseSettingsInDB
        course_settings = CourseSettingsInDB(
            product_id=ObjectId(product_id),
            structure=empty_structure,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        # Convertir en dictionnaire pour l'insertion dans MongoDB
        course_dict = course_settings.model_dump(by_alias=True)
        
        # Insérer dans la base de données
        result = await db["course_settings"].insert_one(course_dict)
        
        # Récupérer les paramètres insérés
        created_settings = await db["course_settings"].find_one({"_id": result.inserted_id})
        
        # Convertir en CourseSettingsResponse
        return format_course_settings_response(created_settings)
    except Exception as e:
        logger.error(f"Error initializing course structure: {e}")
        raise

async def get_course_structure(product_id: str) -> Optional[CourseSettingsResponse]:
    """
    Get course structure for a product
    """
    try:
        db = await get_database()
        
        # Récupérer la structure du cours
        course_settings = await db["course_settings"].find_one({"product_id": ObjectId(product_id)})
        
        if not course_settings:
            return None
        
        # Convertir en CourseSettingsResponse
        return format_course_settings_response(course_settings)
    except Exception as e:
        logger.error(f"Error getting course structure: {e}")
        raise

async def update_course_structure(product_id: str, course_data: Dict[str, Any]) -> CourseSettingsResponse:
    """
    Update course structure for a product
    """
    try:
        db = await get_database()
        
        # Vérifier si une structure existe
        existing = await db["course_settings"].find_one({"product_id": ObjectId(product_id)})
        
        if not existing:
            # Initialiser une structure si elle n'existe pas
            return await initialize_course_structure(product_id)
        
        # Préparer les données de mise à jour
        update_data = {
            "$set": {
                "structure": course_data.get("structure", existing["structure"]),
                "updated_at": datetime.utcnow()
            }
        }
        
        # Mettre à jour la structure du cours
        await db["course_settings"].update_one(
            {"product_id": ObjectId(product_id)},
            update_data
        )
        
        # Récupérer les paramètres mis à jour
        updated_settings = await db["course_settings"].find_one({"product_id": ObjectId(product_id)})
        
        # Convertir en CourseSettingsResponse
        return format_course_settings_response(updated_settings)
    except Exception as e:
        logger.error(f"Error updating course structure: {e}")
        raise

def format_course_settings_response(settings: Dict[str, Any]) -> CourseSettingsResponse:
    """
    Format course settings document as a CourseSettingsResponse
    """
    # Convertir les ObjectId en chaînes
    settings["id"] = str(settings["_id"])
    settings["product_id"] = str(settings["product_id"])
    
    # Créer et retourner la réponse
    return CourseSettingsResponse(**settings)
