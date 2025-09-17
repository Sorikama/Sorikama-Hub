from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from bson import ObjectId
from app.models.user import PyObjectId

class ProductBase(BaseModel):
    title: str
    description: str
    price: float
    promotional_price: Optional[float] = None
    category: str
    type: str  # digital, service, etc.
    images: List[str] = []
    file_url: Optional[str] = None
    file_type: Optional[str] = None
    file_size: Optional[int] = None
    private_id: Optional[str] = None  # ID généré à la création, toujours disponible
    public_id: Optional[str] = None   # ID généré lors de la publication
    is_featured: bool = False
    is_published: bool = True
    metadata: Dict[str, Any] = {}

class ProductCreate(ProductBase):
    storeId: PyObjectId

class ProductInDB(ProductBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    storeId: PyObjectId
    created_by: PyObjectId
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class ProductUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    promotional_price: Optional[float] = None
    category: Optional[str] = None
    type: Optional[str] = None
    images: Optional[List[str]] = None
    file_url: Optional[str] = None
    file_type: Optional[str] = None
    file_size: Optional[int] = None
    private_id: Optional[str] = None
    public_id: Optional[str] = None
    is_featured: Optional[bool] = None
    is_published: Optional[bool] = None
    metadata: Optional[Dict[str, Any]] = None
    
    model_config = {
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class ProductResponse(BaseModel):
    id: str
    title: str
    description: str
    price: float
    promotional_price: Optional[float] = None
    category: str
    type: str
    images: List[str] = []
    private_id: Optional[str] = None
    public_id: Optional[str] = None
    is_featured: bool
    is_published: bool
    storeId: str
    created_at: datetime
    updated_at: datetime
    has_file: bool
    
    model_config = {
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class ProductDetailResponse(ProductResponse):
    file_url: Optional[str] = None
    file_type: Optional[str] = None
    file_size: Optional[int] = None
    metadata: Dict[str, Any] = {}
    has_file: bool = False  # Ajouter explicitement le champ has_file
    
    model_config = {
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }
