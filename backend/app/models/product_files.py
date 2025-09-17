from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from bson import ObjectId
from app.models.user import PyObjectId

class ProductFileBase(BaseModel):
    file_url: str
    file_name: str
    file_type: str
    file_size: int
    is_preview: bool = False

class ProductFileCreate(ProductFileBase):
    product_id: PyObjectId

class ProductFileInDB(ProductFileBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    product_id: PyObjectId
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class ProductFileUpdate(BaseModel):
    file_url: Optional[str] = None
    file_name: Optional[str] = None
    file_type: Optional[str] = None
    file_size: Optional[int] = None
    is_preview: Optional[bool] = None
    
    model_config = {
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class ProductFileResponse(BaseModel):
    id: str
    product_id: str
    file_url: str
    file_name: str
    file_type: str
    file_size: int
    is_preview: bool
    created_at: datetime
    updated_at: datetime
    
    model_config = {
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

# Paramètres des fichiers
class ProductFileSettingsBase(BaseModel):
    download_limit: Optional[str] = "unlimited"
    link_expiry: Optional[str] = "30"
    require_login: bool = False
    watermark: bool = False
    download_instructions: Optional[str] = None

class ProductFileSettingsCreate(ProductFileSettingsBase):
    product_id: PyObjectId

class ProductFileSettingsInDB(ProductFileSettingsBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    product_id: PyObjectId
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class ProductFileSettingsUpdate(BaseModel):
    download_limit: Optional[str] = None
    link_expiry: Optional[str] = None
    require_login: Optional[bool] = None
    watermark: Optional[bool] = None
    download_instructions: Optional[str] = None
    
    model_config = {
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class ProductFileSettingsResponse(BaseModel):
    id: str
    product_id: str
    download_limit: str
    link_expiry: str
    require_login: bool
    watermark: bool
    download_instructions: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    model_config = {
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }
