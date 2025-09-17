from datetime import datetime
from typing import List, Optional
from bson import ObjectId
from fastapi import HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from app.models.product_details import ProductDetailsCreate, ProductDetailsInDB, ProductDetailsUpdate

class ProductDetailsService:
    def __init__(self, db: AsyncIOMotorClient):
        self.db = db
        self.collection = db.product_details

    async def create_product_details(self, details: ProductDetailsCreate) -> ProductDetailsInDB:
        # Vérifier si des détails existent déjà pour ce produit
        existing = await self.collection.find_one({"product_id": details.product_id})
        if existing:
            raise HTTPException(status_code=400, detail="Product details already exist for this product")
        
        details_dict = details.model_dump(by_alias=True)
        details_dict["created_at"] = datetime.utcnow()
        details_dict["updated_at"] = datetime.utcnow()
        
        result = await self.collection.insert_one(details_dict)
        
        created_details = await self.collection.find_one({"_id": result.inserted_id})
        return ProductDetailsInDB(**created_details)

    async def get_product_details(self, product_id: str) -> Optional[ProductDetailsInDB]:
        try:
            # Essayer d'abord avec ObjectId
            details = await self.collection.find_one({"product_id": ObjectId(product_id)})
            if details:
                return ProductDetailsInDB(**details)
            
            # Si aucun résultat, essayer avec la chaîne brute
            details = await self.collection.find_one({"product_id": product_id})
            if details:
                return ProductDetailsInDB(**details)
                
            return None
        except Exception as e:
            print(f"Error in get_product_details: {str(e)}")
            return None

    async def update_product_details(self, product_id: str, details_update: ProductDetailsUpdate) -> Optional[ProductDetailsInDB]:
        try:
            # Essayer d'abord avec ObjectId
            details = await self.collection.find_one({"product_id": ObjectId(product_id)})
            product_id_format = ObjectId(product_id)
            
            # Si aucun résultat, essayer avec la chaîne brute
            if not details:
                details = await self.collection.find_one({"product_id": product_id})
                product_id_format = product_id
            
            if not details:
                # Si les détails n'existent pas, créer une nouvelle entrée
                new_details = ProductDetailsCreate(product_id=ObjectId(product_id), **details_update.model_dump(exclude_unset=True))
                return await self.create_product_details(new_details)
            
            # Mettre à jour les détails existants
            update_data = details_update.model_dump(exclude_unset=True)
            if update_data:
                update_data["updated_at"] = datetime.utcnow()
                await self.collection.update_one(
                    {"product_id": product_id_format},
                    {"$set": update_data}
                )
            
            updated_details = await self.collection.find_one({"product_id": product_id_format})
            return ProductDetailsInDB(**updated_details)
        except Exception as e:
            print(f"Error in update_product_details: {str(e)}")
            # Si une erreur se produit, essayer de créer une nouvelle entrée
            try:
                new_details = ProductDetailsCreate(product_id=product_id, **details_update.model_dump(exclude_unset=True))
                return await self.create_product_details(new_details)
            except Exception as inner_e:
                print(f"Error creating new details: {str(inner_e)}")
                return None

    async def delete_product_details(self, product_id: str) -> bool:
        try:
            # Essayer d'abord avec ObjectId
            result = await self.collection.delete_one({"product_id": ObjectId(product_id)})
            if result.deleted_count > 0:
                return True
            
            # Si aucun résultat, essayer avec la chaîne brute
            result = await self.collection.delete_one({"product_id": product_id})
            return result.deleted_count > 0
        except Exception as e:
            print(f"Error in delete_product_details: {str(e)}")
            return False
