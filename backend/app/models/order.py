from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from bson import ObjectId
from app.models.user import PyObjectId

class OrderItem(BaseModel):
    product_id: PyObjectId
    product_title: str
    product_price: float
    quantity: int = 1
    
    model_config = {
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class OrderBase(BaseModel):
    items: List[OrderItem]
    total: float
    status: str = "pending"  # pending, paid, completed, cancelled
    payment_intent_id: Optional[str] = None
    payment_status: Optional[str] = None
    metadata: Dict[str, Any] = {}

class OrderCreate(OrderBase):
    store_id: PyObjectId
    
    model_config = {
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class OrderInDB(OrderBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    store_id: PyObjectId
    customer_id: PyObjectId
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    paid_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    cancelled_at: Optional[datetime] = None
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class OrderUpdate(BaseModel):
    status: Optional[str] = None
    payment_intent_id: Optional[str] = None
    payment_status: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    
    model_config = {
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class OrderItemResponse(BaseModel):
    product_id: str
    product_title: str
    product_price: float
    quantity: int

class OrderResponse(BaseModel):
    id: str
    items: List[OrderItemResponse]
    total: float
    status: str
    payment_intent_id: Optional[str] = None
    payment_status: Optional[str] = None
    store_id: str
    customer_id: str
    created_at: datetime
    updated_at: datetime
    paid_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    cancelled_at: Optional[datetime] = None
    
    model_config = {
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class OrderDetailResponse(OrderResponse):
    metadata: Dict[str, Any] = {}
    
    model_config = {
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class PaymentSessionCreate(BaseModel):
    order_id: str
    success_url: str
    cancel_url: str

class PaymentSessionResponse(BaseModel):
    session_id: str
    url: str
