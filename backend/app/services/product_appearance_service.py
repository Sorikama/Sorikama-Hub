from datetime import datetime
from typing import List, Optional
from bson import ObjectId
from fastapi import HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from app.models.product_appearance import ProductAppearanceCreate, ProductAppearanceInDB, ProductAppearanceUpdate

class ProductAppearanceService:
    def __init__(self, db: AsyncIOMotorClient):
        self.db = db
        self.collection = db.product_appearance

    async def create_product_appearance(self, appearance: ProductAppearanceCreate) -> ProductAppearanceInDB:
        # Vérifier si une apparence existe déjà pour ce produit
        existing = await self.collection.find_one({"product_id": appearance.product_id})
        if existing:
            raise HTTPException(status_code=400, detail="Product appearance already exists for this product")
        
        appearance_dict = appearance.model_dump(by_alias=True)
        appearance_dict["created_at"] = datetime.utcnow()
        appearance_dict["updated_at"] = datetime.utcnow()
        
        result = await self.collection.insert_one(appearance_dict)
        
        created_appearance = await self.collection.find_one({"_id": result.inserted_id})
        return ProductAppearanceInDB(**created_appearance)

    async def get_product_appearance(self, product_id: str) -> Optional[ProductAppearanceInDB]:
        appearance = await self.collection.find_one({"product_id": ObjectId(product_id)})
        if appearance:
            return ProductAppearanceInDB(**appearance)
        return None

    async def update_product_appearance(self, product_id: str, appearance_update: ProductAppearanceUpdate) -> Optional[ProductAppearanceInDB]:
        appearance = await self.collection.find_one({"product_id": ObjectId(product_id)})
        
        if not appearance:
            # Si l'apparence n'existe pas, créer une nouvelle entrée
            new_appearance = ProductAppearanceCreate(product_id=ObjectId(product_id), **appearance_update.model_dump(exclude_unset=True))
            return await self.create_product_appearance(new_appearance)
        
        # Mettre à jour l'apparence existante
        update_data = appearance_update.model_dump(exclude_unset=True)
        if update_data:
            update_data["updated_at"] = datetime.utcnow()
            await self.collection.update_one(
                {"product_id": ObjectId(product_id)},
                {"$set": update_data}
            )
        
        updated_appearance = await self.collection.find_one({"product_id": ObjectId(product_id)})
        return ProductAppearanceInDB(**updated_appearance)

    async def delete_product_appearance(self, product_id: str) -> bool:
        result = await self.collection.delete_one({"product_id": ObjectId(product_id)})
        return result.deleted_count > 0
