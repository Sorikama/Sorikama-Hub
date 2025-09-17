from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from typing import Dict, Any
from app.models.user import UserResponse
from app.services import upload_service
from app.api.routes.auth import get_current_user

router = APIRouter()

@router.post("/product-file")
async def upload_product_file(
    file: UploadFile = File(...),
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Upload a product file
    """
    # Check if user is a creator or admin
    if current_user.role not in ["creator", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only creators can upload product files"
        )
    
    try:
        result = await upload_service.upload_product_file(file)
        return {
            "file_url": result["url_path"],
            "file_type": result["content_type"],
            "file_size": result["file_size"],
            "original_filename": result["original_filename"]
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/product-image")
async def upload_product_image(
    file: UploadFile = File(...),
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Upload a product image
    """
    # Check if user is a creator or admin
    if current_user.role not in ["creator", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only creators can upload product images"
        )
    
    try:
        result = await upload_service.upload_product_image(file)
        return {
            "image_url": result["url_path"],
            "content_type": result["content_type"],
            "file_size": result["file_size"],
            "original_filename": result["original_filename"]
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/store-logo")
async def upload_store_logo(
    file: UploadFile = File(...),
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Upload a store logo
    """
    # Check if user is a creator or admin
    if current_user.role not in ["creator", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only creators can upload store logos"
        )
    
    # Check if user has a store
    if not current_user.storeId:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User does not have a store"
        )
    
    try:
        result = await upload_service.upload_store_logo(file)
        return {
            "logo_url": result["url_path"],
            "content_type": result["content_type"],
            "file_size": result["file_size"],
            "original_filename": result["original_filename"]
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/store-cover")
async def upload_store_cover(
    file: UploadFile = File(...),
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Upload a store cover image
    """
    # Check if user is a creator or admin
    if current_user.role not in ["creator", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only creators can upload store cover images"
        )
    
    # Check if user has a store
    if not current_user.storeId:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User does not have a store"
        )
    
    try:
        result = await upload_service.upload_store_cover(file)
        return {
            "cover_image_url": result["url_path"],
            "content_type": result["content_type"],
            "file_size": result["file_size"],
            "original_filename": result["original_filename"]
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
