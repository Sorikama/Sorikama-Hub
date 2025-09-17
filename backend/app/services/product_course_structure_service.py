from datetime import datetime
from typing import List, Optional, Dict, Any
from bson import ObjectId
from fastapi import HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from app.models.product_course_structure import CourseStructureCreate, CourseStructureInDB, CourseStructureUpdate

class ProductCourseStructureService:
    def __init__(self, db: AsyncIOMotorClient):
        self.db = db
        self.collection = db.product_course_structure

    async def create_course_structure(self, structure: CourseStructureCreate) -> CourseStructureInDB:
        # Vérifier si une structure existe déjà pour ce produit
        existing = await self.collection.find_one({"product_id": structure.product_id})
        if existing:
            raise HTTPException(status_code=400, detail="Course structure already exists for this product")
        
        structure_dict = structure.model_dump(by_alias=True)
        structure_dict["created_at"] = datetime.utcnow()
        structure_dict["updated_at"] = datetime.utcnow()
        
        result = await self.collection.insert_one(structure_dict)
        
        created_structure = await self.collection.find_one({"_id": result.inserted_id})
        return CourseStructureInDB(**created_structure)

    async def get_course_structure(self, product_id: str) -> Optional[CourseStructureInDB]:
        structure = await self.collection.find_one({"product_id": ObjectId(product_id)})
        if structure:
            return CourseStructureInDB(**structure)
        return None

    async def update_course_structure(self, product_id: str, structure_update: CourseStructureUpdate) -> Optional[CourseStructureInDB]:
        structure = await self.collection.find_one({"product_id": ObjectId(product_id)})
        
        if not structure:
            # Si la structure n'existe pas, créer une nouvelle entrée
            new_structure = CourseStructureCreate(product_id=ObjectId(product_id), **structure_update.model_dump(exclude_unset=True))
            return await self.create_course_structure(new_structure)
        
        # Mettre à jour la structure existante
        update_data = structure_update.model_dump(exclude_unset=True)
        if update_data:
            update_data["updated_at"] = datetime.utcnow()
            await self.collection.update_one(
                {"product_id": ObjectId(product_id)},
                {"$set": update_data}
            )
        
        updated_structure = await self.collection.find_one({"product_id": ObjectId(product_id)})
        return CourseStructureInDB(**updated_structure)

    async def delete_course_structure(self, product_id: str) -> bool:
        result = await self.collection.delete_one({"product_id": ObjectId(product_id)})
        return result.deleted_count > 0
