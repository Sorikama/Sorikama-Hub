from datetime import datetime
from typing import List, Optional
from bson import ObjectId
from fastapi import HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from app.models.product_custom_fields import CustomFieldCreate, CustomFieldInDB, CustomFieldUpdate

class ProductCustomFieldsService:
    def __init__(self, db: AsyncIOMotorClient):
        self.db = db
        self.collection = db.product_custom_fields

    async def create_custom_field(self, field: CustomFieldCreate) -> CustomFieldInDB:
        field_dict = field.model_dump(by_alias=True)
        field_dict["created_at"] = datetime.utcnow()
        field_dict["updated_at"] = datetime.utcnow()
        
        result = await self.collection.insert_one(field_dict)
        
        created_field = await self.collection.find_one({"_id": result.inserted_id})
        return CustomFieldInDB(**created_field)

    async def get_product_custom_fields(self, product_id: str) -> List[CustomFieldInDB]:
        cursor = self.collection.find({"product_id": ObjectId(product_id)})
        fields = await cursor.to_list(length=100)
        return [CustomFieldInDB(**field) for field in fields]

    async def get_custom_field(self, field_id: str) -> Optional[CustomFieldInDB]:
        field = await self.collection.find_one({"_id": ObjectId(field_id)})
        if field:
            return CustomFieldInDB(**field)
        return None

    async def update_custom_field(self, field_id: str, field_update: CustomFieldUpdate) -> Optional[CustomFieldInDB]:
        field = await self.collection.find_one({"_id": ObjectId(field_id)})
        
        if not field:
            raise HTTPException(status_code=404, detail="Custom field not found")
        
        update_data = field_update.model_dump(exclude_unset=True)
        if update_data:
            update_data["updated_at"] = datetime.utcnow()
            await self.collection.update_one(
                {"_id": ObjectId(field_id)},
                {"$set": update_data}
            )
        
        updated_field = await self.collection.find_one({"_id": ObjectId(field_id)})
        return CustomFieldInDB(**updated_field)

    async def delete_custom_field(self, field_id: str) -> bool:
        result = await self.collection.delete_one({"_id": ObjectId(field_id)})
        return result.deleted_count > 0
        
    async def delete_product_custom_fields(self, product_id: str) -> int:
        result = await self.collection.delete_many({"product_id": ObjectId(product_id)})
        return result.deleted_count
        
    async def update_product_custom_fields(self, product_id: str, fields: List[dict]) -> List[CustomFieldInDB]:
        """
        Met à jour tous les champs personnalisés d'un produit.
        Supprime les champs existants et les remplace par les nouveaux.
        """
        # Supprimer tous les champs existants
        await self.collection.delete_many({"product_id": ObjectId(product_id)})
        
        # Créer les nouveaux champs
        new_fields = []
        for field_data in fields:
            field = CustomFieldCreate(product_id=ObjectId(product_id), **field_data)
            new_field = await self.create_custom_field(field)
            new_fields.append(new_field)
            
        return new_fields
