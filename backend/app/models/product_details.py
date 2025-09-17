from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from bson import ObjectId
from app.models.user import PyObjectId

class ProductDetailsBase(BaseModel):
    # Paramètres de visibilité
    visibility: Optional[str] = "public"  # public, private
    hide_purchases_count: Optional[bool] = False
    
    # URL personnalisée
    custom_url: Optional[str] = None
    
    # Prix et validité
    limited_quantity: Optional[bool] = False
    price_validity_start: Optional[datetime] = None
    price_validity_end: Optional[datetime] = None
    
    # Localisation
    physical_address: Optional[str] = None
    
    # Protection des fichiers
    password_protection: Optional[bool] = False
    add_watermarks: Optional[bool] = False
    
    # Guide après-achat
    post_purchase_instructions: Optional[str] = None
    
    # Métadonnées
    sku: Optional[str] = None
    tags: Optional[str] = None

class ProductDetailsCreate(ProductDetailsBase):
    product_id: PyObjectId

class ProductDetailsInDB(ProductDetailsBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    product_id: PyObjectId
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class ProductDetailsUpdate(BaseModel):
    # Paramètres de visibilité
    visibility: Optional[str] = None
    hide_purchases_count: Optional[bool] = None
    
    # URL personnalisée
    custom_url: Optional[str] = None
    
    # Prix et validité
    limited_quantity: Optional[bool] = None
    price_validity_start: Optional[datetime] = None
    price_validity_end: Optional[datetime] = None
    
    # Localisation
    physical_address: Optional[str] = None
    
    # Protection des fichiers
    password_protection: Optional[bool] = None
    add_watermarks: Optional[bool] = None
    
    # Guide après-achat
    post_purchase_instructions: Optional[str] = None
    
    # Métadonnées
    sku: Optional[str] = None
    tags: Optional[str] = None
    
    model_config = {
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class ProductDetailsResponse(BaseModel):
    id: str
    product_id: str
    
    # Paramètres de visibilité
    visibility: str
    hide_purchases_count: Optional[bool] = False
    
    # URL personnalisée
    custom_url: Optional[str] = None
    
    # Prix et validité
    limited_quantity: bool
    price_validity_start: Optional[datetime] = None
    price_validity_end: Optional[datetime] = None
    
    # Localisation
    physical_address: Optional[str] = None
    
    # Protection des fichiers
    password_protection: Optional[bool] = False
    add_watermarks: Optional[bool] = False
    
    # Guide après-achat
    post_purchase_instructions: Optional[str] = None
    
    # Métadonnées
    sku: Optional[str] = None
    tags: Optional[str] = None
    
    created_at: datetime
    updated_at: datetime
    
    model_config = {
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }
