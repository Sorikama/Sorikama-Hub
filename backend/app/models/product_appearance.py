from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from bson import ObjectId
from app.models.user import PyObjectId

class ProductAppearanceBase(BaseModel):
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    button_style: Optional[str] = None
    layout_style: Optional[str] = None
    font_family: Optional[str] = None
    custom_css: Optional[str] = None

class ProductAppearanceCreate(ProductAppearanceBase):
    product_id: PyObjectId

class ProductAppearanceInDB(ProductAppearanceBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    product_id: PyObjectId
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class ProductAppearanceUpdate(BaseModel):
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    button_style: Optional[str] = None
    layout_style: Optional[str] = None
    font_family: Optional[str] = None
    custom_css: Optional[str] = None
    
    model_config = {
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class ProductAppearanceResponse(BaseModel):
    id: str
    product_id: str
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    button_style: Optional[str] = None
    layout_style: Optional[str] = None
    font_family: Optional[str] = None
    custom_css: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    model_config = {
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }
