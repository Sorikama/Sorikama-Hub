from datetime import datetime
from typing import List, Optional
from bson import ObjectId
from fastapi import HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from app.models.product_files import (
    ProductFileCreate, ProductFileInDB, ProductFileUpdate,
    ProductFileSettingsCreate, ProductFileSettingsInDB, ProductFileSettingsUpdate
)

class ProductFilesService:
    def __init__(self, db: AsyncIOMotorClient):
        self.db = db
        self.files_collection = db.product_files
        self.settings_collection = db.product_file_settings

    # Gestion des fichiers
    async def create_product_file(self, file: ProductFileCreate) -> ProductFileInDB:
        file_dict = file.model_dump(by_alias=True)
        file_dict["created_at"] = datetime.utcnow()
        file_dict["updated_at"] = datetime.utcnow()
        
        result = await self.files_collection.insert_one(file_dict)
        
        created_file = await self.files_collection.find_one({"_id": result.inserted_id})
        return ProductFileInDB(**created_file)

    async def get_product_files(self, product_id: str) -> List[ProductFileInDB]:
        cursor = self.files_collection.find({"product_id": ObjectId(product_id)})
        files = await cursor.to_list(length=100)
        return [ProductFileInDB(**file) for file in files]

    async def get_product_file(self, file_id: str) -> Optional[ProductFileInDB]:
        file = await self.files_collection.find_one({"_id": ObjectId(file_id)})
        if file:
            return ProductFileInDB(**file)
        return None

    async def update_product_file(self, file_id: str, file_update: ProductFileUpdate) -> Optional[ProductFileInDB]:
        file = await self.files_collection.find_one({"_id": ObjectId(file_id)})
        
        if not file:
            raise HTTPException(status_code=404, detail="File not found")
        
        update_data = file_update.model_dump(exclude_unset=True)
        if update_data:
            update_data["updated_at"] = datetime.utcnow()
            await self.files_collection.update_one(
                {"_id": ObjectId(file_id)},
                {"$set": update_data}
            )
        
        updated_file = await self.files_collection.find_one({"_id": ObjectId(file_id)})
        return ProductFileInDB(**updated_file)

    async def delete_product_file(self, file_id: str) -> bool:
        result = await self.files_collection.delete_one({"_id": ObjectId(file_id)})
        return result.deleted_count > 0

    # Gestion des paramètres de fichiers
    async def create_file_settings(self, settings: ProductFileSettingsCreate) -> ProductFileSettingsInDB:
        # Vérifier si des paramètres existent déjà pour ce produit
        existing = await self.settings_collection.find_one({"product_id": settings.product_id})
        if existing:
            raise HTTPException(status_code=400, detail="File settings already exist for this product")
        
        settings_dict = settings.model_dump(by_alias=True)
        settings_dict["created_at"] = datetime.utcnow()
        settings_dict["updated_at"] = datetime.utcnow()
        
        result = await self.settings_collection.insert_one(settings_dict)
        
        created_settings = await self.settings_collection.find_one({"_id": result.inserted_id})
        return ProductFileSettingsInDB(**created_settings)

    async def get_file_settings(self, product_id: str) -> Optional[ProductFileSettingsInDB]:
        settings = await self.settings_collection.find_one({"product_id": ObjectId(product_id)})
        if settings:
            return ProductFileSettingsInDB(**settings)
        return None

    async def update_file_settings(self, product_id: str, settings_update: ProductFileSettingsUpdate) -> Optional[ProductFileSettingsInDB]:
        settings = await self.settings_collection.find_one({"product_id": ObjectId(product_id)})
        
        if not settings:
            # Si les paramètres n'existent pas, créer une nouvelle entrée
            new_settings = ProductFileSettingsCreate(product_id=ObjectId(product_id), **settings_update.model_dump(exclude_unset=True))
            return await self.create_file_settings(new_settings)
        
        # Mettre à jour les paramètres existants
        update_data = settings_update.model_dump(exclude_unset=True)
        if update_data:
            update_data["updated_at"] = datetime.utcnow()
            await self.settings_collection.update_one(
                {"product_id": ObjectId(product_id)},
                {"$set": update_data}
            )
        
        updated_settings = await self.settings_collection.find_one({"product_id": ObjectId(product_id)})
        return ProductFileSettingsInDB(**updated_settings)

    async def delete_file_settings(self, product_id: str) -> bool:
        result = await self.settings_collection.delete_one({"product_id": ObjectId(product_id)})
        return result.deleted_count > 0
