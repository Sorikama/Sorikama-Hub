from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from bson import ObjectId
from app.models.user import PyObjectId

class CustomFieldBase(BaseModel):
    label: str
    type: str  # text, textarea, select, checkbox, radio, date, number, email
    placeholder: Optional[str] = None
    required: bool = False
    options: Optional[List[str]] = None  # Pour les types select, checkbox, radio

class CustomFieldCreate(CustomFieldBase):
    product_id: PyObjectId

class CustomFieldInDB(CustomFieldBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    product_id: PyObjectId
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class CustomFieldUpdate(BaseModel):
    label: Optional[str] = None
    type: Optional[str] = None
    placeholder: Optional[str] = None
    required: Optional[bool] = None
    options: Optional[List[str]] = None
    
    model_config = {
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class CustomFieldResponse(BaseModel):
    id: str
    product_id: str
    label: str
    type: str
    placeholder: Optional[str] = None
    required: bool
    options: Optional[List[str]] = None
    created_at: datetime
    updated_at: datetime
    
    model_config = {
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }
