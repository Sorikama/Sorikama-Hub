from datetime import datetime
from typing import List, Optional
from bson import ObjectId
from fastapi import HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from app.models.product_faq import (
    FAQItemCreate, FAQItemInDB, FAQItemUpdate,
    FAQSettingsCreate, FAQSettingsInDB, FAQSettingsUpdate
)

class ProductFAQService:
    def __init__(self, db: AsyncIOMotorClient):
        self.db = db
        self.items_collection = db.product_faq_items
        self.settings_collection = db.product_faq_settings

    # Gestion des éléments FAQ
    async def create_faq_item(self, item: FAQItemCreate) -> FAQItemInDB:
        item_dict = item.model_dump(by_alias=True)
        item_dict["created_at"] = datetime.utcnow()
        item_dict["updated_at"] = datetime.utcnow()
        
        result = await self.items_collection.insert_one(item_dict)
        
        created_item = await self.items_collection.find_one({"_id": result.inserted_id})
        return FAQItemInDB(**created_item)

    async def get_product_faq_items(self, product_id: str) -> List[FAQItemInDB]:
        cursor = self.items_collection.find({"product_id": ObjectId(product_id)})
        items = await cursor.to_list(length=100)
        return [FAQItemInDB(**item) for item in items]

    async def get_faq_item(self, item_id: str) -> Optional[FAQItemInDB]:
        item = await self.items_collection.find_one({"_id": ObjectId(item_id)})
        if item:
            return FAQItemInDB(**item)
        return None

    async def update_faq_item(self, item_id: str, item_update: FAQItemUpdate) -> Optional[FAQItemInDB]:
        item = await self.items_collection.find_one({"_id": ObjectId(item_id)})
        
        if not item:
            raise HTTPException(status_code=404, detail="FAQ item not found")
        
        update_data = item_update.model_dump(exclude_unset=True)
        if update_data:
            update_data["updated_at"] = datetime.utcnow()
            await self.items_collection.update_one(
                {"_id": ObjectId(item_id)},
                {"$set": update_data}
            )
        
        updated_item = await self.items_collection.find_one({"_id": ObjectId(item_id)})
        return FAQItemInDB(**updated_item)

    async def delete_faq_item(self, item_id: str) -> bool:
        result = await self.items_collection.delete_one({"_id": ObjectId(item_id)})
        return result.deleted_count > 0
        
    async def delete_product_faq_items(self, product_id: str) -> int:
        result = await self.items_collection.delete_many({"product_id": ObjectId(product_id)})
        return result.deleted_count
        
    async def update_product_faq_items(self, product_id: str, items: List[dict]) -> List[FAQItemInDB]:
        """
        Met à jour tous les éléments FAQ d'un produit.
        Supprime les éléments existants et les remplace par les nouveaux.
        """
        # Supprimer tous les éléments existants
        await self.items_collection.delete_many({"product_id": ObjectId(product_id)})
        
        # Créer les nouveaux éléments
        new_items = []
        for item_data in items:
            item = FAQItemCreate(product_id=ObjectId(product_id), **item_data)
            new_item = await self.create_faq_item(item)
            new_items.append(new_item)
            
        return new_items

    # Gestion des paramètres FAQ
    async def create_faq_settings(self, settings: FAQSettingsCreate) -> FAQSettingsInDB:
        # Vérifier si des paramètres existent déjà pour ce produit
        existing = await self.settings_collection.find_one({"product_id": settings.product_id})
        if existing:
            raise HTTPException(status_code=400, detail="FAQ settings already exist for this product")
        
        settings_dict = settings.model_dump(by_alias=True)
        settings_dict["created_at"] = datetime.utcnow()
        settings_dict["updated_at"] = datetime.utcnow()
        
        result = await self.settings_collection.insert_one(settings_dict)
        
        created_settings = await self.settings_collection.find_one({"_id": result.inserted_id})
        return FAQSettingsInDB(**created_settings)

    async def get_faq_settings(self, product_id: str) -> Optional[FAQSettingsInDB]:
        settings = await self.settings_collection.find_one({"product_id": ObjectId(product_id)})
        if settings:
            return FAQSettingsInDB(**settings)
        return None

    async def update_faq_settings(self, product_id: str, settings_update: FAQSettingsUpdate) -> Optional[FAQSettingsInDB]:
        settings = await self.settings_collection.find_one({"product_id": ObjectId(product_id)})
        
        if not settings:
            # Si les paramètres n'existent pas, créer une nouvelle entrée
            new_settings = FAQSettingsCreate(product_id=ObjectId(product_id), **settings_update.model_dump(exclude_unset=True))
            return await self.create_faq_settings(new_settings)
        
        # Mettre à jour les paramètres existants
        update_data = settings_update.model_dump(exclude_unset=True)
        if update_data:
            update_data["updated_at"] = datetime.utcnow()
            await self.settings_collection.update_one(
                {"product_id": ObjectId(product_id)},
                {"$set": update_data}
            )
        
        updated_settings = await self.settings_collection.find_one({"product_id": ObjectId(product_id)})
        return FAQSettingsInDB(**updated_settings)

    async def delete_faq_settings(self, product_id: str) -> bool:
        result = await self.settings_collection.delete_one({"product_id": ObjectId(product_id)})
        return result.deleted_count > 0
