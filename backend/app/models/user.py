from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, EmailStr
from bson import ObjectId

# Pydantic v2 compatible ObjectId handling
from pydantic_core import core_schema

class PyObjectId(str):
    @classmethod
    def __get_pydantic_core_schema__(cls, _source_type, _handler):
        return core_schema.union_schema([
            core_schema.is_instance_schema(ObjectId),
            core_schema.chain_schema([
                core_schema.str_schema(),
                core_schema.no_info_plain_validator_function(cls.validate),
            ])
        ])

    @classmethod
    def validate(cls, v):
        if isinstance(v, ObjectId):
            return v
        if not v or not ObjectId.is_valid(v):
            # Si la valeur est vide ou invalide, générer un nouvel ObjectId
            return ObjectId()
        return ObjectId(v)
    
    def __new__(cls):
        # Garantir qu'un nouvel ObjectId est généré lorsque PyObjectId est utilisé comme default_factory
        return ObjectId()

    def __repr__(self):
        return f"PyObjectId({super().__repr__()})"

class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: str = "customer"
    is_active: bool = True
    avatar: Optional[str] = None
    storeId: Optional[str] = None  # Pour la compatibilité avec l'existant
    stores: List[str] = []  # Liste des IDs de boutiques

class UserCreate(UserBase):
    password: str

class UserInDB(UserBase):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    avatar: Optional[str] = None
    
    model_config = {
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    name: str
    role: str
    avatar: Optional[str] = None
    storeId: Optional[str] = None  # Pour la compatibilité avec l'existant
    stores: List[str] = []  # Liste des IDs de boutiques
    created_at: datetime
    
    model_config = {
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }
