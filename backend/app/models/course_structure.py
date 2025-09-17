from typing import List, Optional, Literal
from pydantic import BaseModel, Field
from datetime import datetime
from bson import ObjectId
from app.models.user import PyObjectId

class Lesson(BaseModel):
    id: str
    title: str
    type: Literal["video", "text", "quiz", "assignment", "link"]
    content: str
    duration: Optional[int] = None  # en minutes
    is_preview: bool = False
    order: int = 0

class Chapter(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    lessons: List[Lesson] = []
    order: int = 0

class Module(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    chapters: List[Chapter] = []
    order: int = 0

class CourseStructure(BaseModel):
    modules: List[Module] = []
    show_progress: bool = True
    require_sequential: bool = False
    allow_comments: bool = True
    downloadable_resources: bool = False

class CourseSettings(BaseModel):
    product_id: PyObjectId
    structure: CourseStructure
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = {
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class CourseSettingsInDB(CourseSettings):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class CourseSettingsUpdate(BaseModel):
    structure: Optional[CourseStructure] = None
    
    model_config = {
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class CourseSettingsResponse(BaseModel):
    id: str
    product_id: str
    structure: CourseStructure
    created_at: datetime
    updated_at: datetime
    
    model_config = {
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }
