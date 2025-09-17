from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from bson import ObjectId
from app.models.user import PyObjectId

class FAQItemBase(BaseModel):
    question: str
    answer: str

class FAQItemCreate(FAQItemBase):
    product_id: PyObjectId

class FAQItemInDB(FAQItemBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    product_id: PyObjectId
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class FAQItemUpdate(BaseModel):
    question: Optional[str] = None
    answer: Optional[str] = None
    
    model_config = {
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class FAQItemResponse(BaseModel):
    id: str
    product_id: str
    question: str
    answer: str
    created_at: datetime
    updated_at: datetime
    
    model_config = {
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

# Paramètres de la FAQ
class FAQSettingsBase(BaseModel):
    show_on_product_page: bool = True
    expand_first_faq: bool = False
    faq_position: str = "bottom"  # top, middle, bottom

class FAQSettingsCreate(FAQSettingsBase):
    product_id: PyObjectId

class FAQSettingsInDB(FAQSettingsBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    product_id: PyObjectId
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class FAQSettingsUpdate(BaseModel):
    show_on_product_page: Optional[bool] = None
    expand_first_faq: Optional[bool] = None
    faq_position: Optional[str] = None
    
    model_config = {
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class FAQSettingsResponse(BaseModel):
    id: str
    product_id: str
    show_on_product_page: bool
    expand_first_faq: bool
    faq_position: str
    created_at: datetime
    updated_at: datetime
    
    model_config = {
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }
