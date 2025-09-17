from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from bson import ObjectId
from app.models.user import PyObjectId

class StoreTheme(BaseModel):
    primary_color: str = "#3B82F6"
    secondary_color: str = "#1E40AF"
    accent_color: str = "#DBEAFE"
    font_family: str = "Inter, sans-serif"
    logo_position: str = "left"
    hero_layout: str = "centered"
    product_layout: str = "grid"

class StoreBase(BaseModel):
    name: str
    domaine: str
    description: str
    logo_url: Optional[str] = None
    cover_image_url: Optional[str] = None
    theme: StoreTheme = Field(default_factory=StoreTheme)
    social_links: Dict[str, str] = {}
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    is_active: bool = True
    custom_domain: Optional[str] = None
    metadata: Dict[str, Any] = {}

class StoreCreate(StoreBase):
    pass

class StoreInDB(StoreBase):
    # Utiliser ObjectId directement pour garantir un ID valide
    id: PyObjectId = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    owner_id: PyObjectId
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class StoreUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    domaine: Optional[str] = None
    logo_url: Optional[str] = None
    cover_image_url: Optional[str] = None
    theme: Optional[StoreTheme] = None
    social_links: Optional[Dict[str, str]] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    is_active: Optional[bool] = None
    custom_domain: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    
    model_config = {
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class StoreThemeUpdate(BaseModel):
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    accent_color: Optional[str] = None
    font_family: Optional[str] = None
    logo_position: Optional[str] = None
    hero_layout: Optional[str] = None
    product_layout: Optional[str] = None

class StoreResponse(BaseModel):
    id: str
    name: str
    domaine: str
    description: str
    logo_url: Optional[str] = None
    cover_image_url: Optional[str] = None
    theme: StoreTheme
    social_links: Dict[str, str] = {}
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    is_active: bool
    custom_domain: Optional[str] = None
    owner_id: str
    created_at: datetime
    updated_at: datetime
    
    model_config = {
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }
