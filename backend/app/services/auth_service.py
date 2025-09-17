from datetime import datetime, timedelta
from typing import Optional
from bson import ObjectId
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token
from app.db.mongodb import db
from app.models.user import UserInDB, UserCreate, UserResponse
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

async def get_user_by_email(email: str) -> Optional[UserInDB]:
    """
    Get a user by email
    """
    user_dict = await db.db.users.find_one({"email": email})
    if user_dict:
        # Convert ObjectId to string before passing to UserInDB
        if "_id" in user_dict and isinstance(user_dict["_id"], ObjectId):
            user_dict["_id"] = str(user_dict["_id"])
            
        # Convertir les ObjectId en chaînes dans la liste des boutiques
        if "stores" in user_dict and isinstance(user_dict["stores"], list):
            user_dict["stores"] = [str(store_id) if isinstance(store_id, ObjectId) else store_id 
                                  for store_id in user_dict["stores"]]
            logger.info(f"Conversion des ObjectId en chaînes dans la liste des boutiques pour l'utilisateur {user_dict['_id']}")
            
        return UserInDB(**user_dict)
    return None

async def get_user_by_id(user_id: str) -> Optional[UserInDB]:
    """
    Get a user by ID
    """
    if not ObjectId.is_valid(user_id):
        return None
    
    user_dict = await db.db.users.find_one({"_id": ObjectId(user_id)})
    if user_dict:
        # Convert ObjectId to string before passing to UserInDB
        if "_id" in user_dict and isinstance(user_dict["_id"], ObjectId):
            user_dict["_id"] = str(user_dict["_id"])
            
        # Convertir les ObjectId en chaînes dans la liste des boutiques
        if "stores" in user_dict and isinstance(user_dict["stores"], list):
            user_dict["stores"] = [str(store_id) if isinstance(store_id, ObjectId) else store_id 
                                  for store_id in user_dict["stores"]]
            logger.info(f"Conversion des ObjectId en chaînes dans la liste des boutiques pour l'utilisateur {user_dict['_id']}")
            
        return UserInDB(**user_dict)
    return None

async def authenticate_user(email: str, password: str) -> Optional[UserInDB]:
    """
    Authenticate a user
    """
    user = await get_user_by_email(email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

async def create_user(user_data: UserCreate) -> UserResponse:
    """
    Create a new user
    """
    # Check if user already exists
    existing_user = await get_user_by_email(user_data.email)
    if existing_user:
        raise ValueError("Email already registered")
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    
    # Créer un nouvel ID MongoDB
    new_id = str(ObjectId())
    
    user_in_db = UserInDB(
        _id=new_id,  # Utiliser l'alias _id directement
        **user_data.dict(exclude={"password"}),
        hashed_password=hashed_password,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    # Convertir le modèle en dictionnaire pour MongoDB
    user_dict = user_in_db.dict(by_alias=True)
    
    # Convertir l'ID en ObjectId pour MongoDB
    if "_id" in user_dict and isinstance(user_dict["_id"], str):
        user_dict["_id"] = ObjectId(user_dict["_id"])
    
    # Insert user into database
    await db.db.users.insert_one(user_dict)
    
    # Get created user
    created_user = await get_user_by_id(new_id)
    
    # Convert to response model
    return UserResponse(
        id=str(created_user.id),
        email=created_user.email,
        name=created_user.name,
        role=created_user.role,
        avatar=created_user.avatar,
        storeId=str(created_user.storeId) if created_user.storeId else None,
        created_at=created_user.created_at
    )

async def generate_tokens(user_id: str):
    """
    Generate access and refresh tokens for a user
    """
    access_token = create_access_token(user_id)
    refresh_token = create_refresh_token(user_id)
    
    # Store refresh token in database
    await db.db.refresh_tokens.insert_one({
        "user_id": ObjectId(user_id),
        "token": refresh_token,
        "expires_at": datetime.utcnow() + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS),
        "created_at": datetime.utcnow()
    })
    
    return {
        "token": access_token,
        "refresh_token": refresh_token
    }

async def validate_refresh_token(refresh_token: str) -> Optional[str]:
    """
    Validate a refresh token and return the user ID if valid
    """
    # Find token in database
    token_data = await db.db.refresh_tokens.find_one({
        "token": refresh_token,
        "expires_at": {"$gt": datetime.utcnow()}
    })
    
    if not token_data:
        return None
    
    return str(token_data["user_id"])

async def invalidate_refresh_token(refresh_token: str) -> bool:
    """
    Invalidate a refresh token
    """
    result = await db.db.refresh_tokens.delete_one({"token": refresh_token})
    return result.deleted_count > 0

async def invalidate_all_user_tokens(user_id: str) -> bool:
    """
    Invalidate all refresh tokens for a user
    """
    result = await db.db.refresh_tokens.delete_many({"user_id": ObjectId(user_id)})
    return result.deleted_count > 0

async def check_email_availability(email: str) -> bool:
    """
    Check if an email is available for registration
    """
    user = await get_user_by_email(email)
    return user is None
