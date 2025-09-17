from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from bson import ObjectId
from app.models.user import PyObjectId

class CourseStructureBase(BaseModel):
    modules: List[Dict[str, Any]] = []  # Structure complexe avec modules, chapitres, leçons
    show_progress: bool = True
    require_sequential: bool = False
    allow_comments: bool = True
    downloadable_resources: bool = False

class CourseStructureCreate(CourseStructureBase):
    product_id: PyObjectId

class CourseStructureInDB(CourseStructureBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    product_id: PyObjectId
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class CourseStructureUpdate(BaseModel):
    modules: Optional[List[Dict[str, Any]]] = None
    show_progress: Optional[bool] = None
    require_sequential: Optional[bool] = None
    allow_comments: Optional[bool] = None
    downloadable_resources: Optional[bool] = None
    
    model_config = {
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class CourseStructureResponse(BaseModel):
    id: str
    product_id: str
    modules: List[Dict[str, Any]]
    show_progress: bool
    require_sequential: bool
    allow_comments: bool
    downloadable_resources: bool
    created_at: datetime
    updated_at: datetime
    
    model_config = {
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }
