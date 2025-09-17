from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError
from app.schemas.auth import (
    Token, TokenPayload, LoginRequest, RegisterRequest, 
    RefreshTokenRequest, PasswordResetRequest, PasswordResetConfirm, 
    PasswordUpdate, EmailCheckRequest
)
from app.models.user import UserResponse
from app.services import auth_service
from app.core.security import decode_token
from typing import Dict, Any

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserResponse:
    """
    Get the current authenticated user
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = decode_token(token)
        user_id: str = payload.get("sub")
        token_type: str = payload.get("type")
        
        if user_id is None or token_type != "access":
            raise credentials_exception
        
    except JWTError:
        raise credentials_exception
    
    user = await auth_service.get_user_by_id(user_id)
    if user is None:
        raise credentials_exception
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    
    return UserResponse(
        id=str(user.id),
        email=user.email,
        name=user.name,
        role=user.role,
        avatar=user.avatar,
        storeId=str(user.storeId) if user.storeId else None,
        stores=[str(store_id) for store_id in user.stores] if hasattr(user, 'stores') and user.stores else [],
        created_at=user.created_at
    )

@router.post("/register", response_model=Dict[str, Any])
async def register(user_data: RegisterRequest):
    """
    Register a new user
    """
    try:
        user = await auth_service.create_user(user_data)
        tokens = await auth_service.generate_tokens(str(user.id))
        
        return {
            "user": user,
            "token": tokens["token"],
            "refresh_token": tokens["refresh_token"]
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/login", response_model=Dict[str, Any])
async def login(login_data: LoginRequest):
    """
    Login a user
    """
    user = await auth_service.authenticate_user(login_data.email, login_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    tokens = await auth_service.generate_tokens(str(user.id))
    
    return {
        "user": UserResponse(
            id=str(user.id),
            email=user.email,
            name=user.name,
            role=user.role,
            avatar=user.avatar,
            storeId=str(user.storeId) if user.storeId else None,
            stores=[str(store_id) for store_id in user.stores] if hasattr(user, 'stores') and user.stores else [],
            created_at=user.created_at
        ),
        "token": tokens["token"],
        "refresh_token": tokens["refresh_token"]
    }

@router.post("/refresh-token", response_model=Token)
async def refresh_token(refresh_data: RefreshTokenRequest):
    """
    Refresh access token
    """
    user_id = await auth_service.validate_refresh_token(refresh_data.refresh_token)
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Invalidate old refresh token
    await auth_service.invalidate_refresh_token(refresh_data.refresh_token)
    
    # Generate new tokens
    tokens = await auth_service.generate_tokens(user_id)
    
    return {
        "token": tokens["token"],
        "refresh_token": tokens["refresh_token"],
        "token_type": "bearer"
    }

@router.post("/logout")
async def logout(refresh_data: RefreshTokenRequest):
    """
    Logout a user
    """
    await auth_service.invalidate_refresh_token(refresh_data.refresh_token)
    return {"message": "Successfully logged out"}

@router.get("/me", response_model=Dict[str, Any])
async def get_me(current_user: UserResponse = Depends(get_current_user)):
    """
    Get current user profile with additional information
    """
    # Vérifier si l'utilisateur a des boutiques
    from app.db.mongodb import get_database
    from bson import ObjectId
    
    db = await get_database()
    user_id = ObjectId(current_user.id)
    
    # Compter les boutiques de l'utilisateur
    stores_count = await db["stores"].count_documents({"owner_id": user_id})
    
    # Retourner l'utilisateur avec l'information sur les boutiques
    return {
        "user": current_user,
        "hasStores": stores_count > 0
    }

@router.post("/forgot-password")
async def forgot_password(reset_data: PasswordResetRequest):
    """
    Request password reset
    """
    user = await auth_service.get_user_by_email(reset_data.email)
    
    if user:
        # In a real application, send an email with reset link
        # For now, we'll just return a success message
        pass
    
    # Always return success to prevent email enumeration
    return {"message": "If your email is registered, you will receive a password reset link"}

@router.put("/reset-password/{token}")
async def reset_password(token: str, password_data: PasswordResetConfirm):
    """
    Reset password with token
    """
    # In a real application, validate the token and update the password
    # For now, we'll just return a success message
    if password_data.password != password_data.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match"
        )
    
    return {"message": "Password reset successful"}

@router.put("/update-password")
async def update_password(
    password_data: PasswordUpdate,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Update user password
    """
    user = await auth_service.get_user_by_id(current_user.id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Verify current password
    if not auth_service.verify_password(password_data.current_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password"
        )
    
    # Update password in database
    # This would be implemented in a real application
    
    return {"message": "Password updated successfully"}

import logging

logger = logging.getLogger(__name__)

@router.get("/check-email")
async def check_email(email: str):
    """
    Check if an email is available for registration
    """
    logger.info(f"Checking email availability (GET): {email}")
    available = await auth_service.check_email_availability(email)
    logger.info(f"Email {email} availability result: {available}")
    return {"available": available}

@router.post("/check-email")
async def check_email_post(email_data: EmailCheckRequest):
    """
    Check if an email is available for registration (POST method)
    """
    available = await auth_service.check_email_availability(email_data.email)
    return {"available": available}
