import os
import shutil
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
from fastapi import UploadFile
from app.core.config import settings
import logging
import mimetypes

logger = logging.getLogger(__name__)

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

# Create subdirectories for different file types
PRODUCT_FILES_DIR = os.path.join(settings.UPLOAD_DIR, "products")
PRODUCT_IMAGES_DIR = os.path.join(settings.UPLOAD_DIR, "product_images")
STORE_LOGOS_DIR = os.path.join(settings.UPLOAD_DIR, "store_logos")
STORE_COVERS_DIR = os.path.join(settings.UPLOAD_DIR, "store_covers")

# Create all subdirectories
for directory in [PRODUCT_FILES_DIR, PRODUCT_IMAGES_DIR, STORE_LOGOS_DIR, STORE_COVERS_DIR]:
    os.makedirs(directory, exist_ok=True)

async def save_upload_file(upload_file: UploadFile, directory: str) -> Dict[str, Any]:
    """
    Save an uploaded file to the specified directory
    """
    # Generate a unique filename
    file_extension = os.path.splitext(upload_file.filename)[1] if upload_file.filename else ""
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(directory, unique_filename)
    
    # Save the file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
    
    # Get file size
    file_size = os.path.getsize(file_path)
    
    # Get file type
    content_type = upload_file.content_type
    if not content_type:
        content_type = mimetypes.guess_type(file_path)[0] or "application/octet-stream"
    
    # Generate URL path
    url_path = f"/uploads/{os.path.basename(directory)}/{unique_filename}"
    
    return {
        "filename": unique_filename,
        "original_filename": upload_file.filename,
        "content_type": content_type,
        "file_size": file_size,
        "file_path": file_path,
        "url_path": url_path
    }

async def upload_product_file(upload_file: UploadFile) -> Dict[str, Any]:
    """
    Upload a product file
    """
    return await save_upload_file(upload_file, PRODUCT_FILES_DIR)

async def upload_product_image(upload_file: UploadFile) -> Dict[str, Any]:
    """
    Upload a product image
    """
    # Validate image type
    content_type = upload_file.content_type
    if not content_type or not content_type.startswith("image/"):
        raise ValueError("File must be an image")
    
    return await save_upload_file(upload_file, PRODUCT_IMAGES_DIR)

async def upload_store_logo(upload_file: UploadFile) -> Dict[str, Any]:
    """
    Upload a store logo
    """
    # Validate image type
    content_type = upload_file.content_type
    if not content_type or not content_type.startswith("image/"):
        raise ValueError("File must be an image")
    
    return await save_upload_file(upload_file, STORE_LOGOS_DIR)

async def upload_store_cover(upload_file: UploadFile) -> Dict[str, Any]:
    """
    Upload a store cover image
    """
    # Validate image type
    content_type = upload_file.content_type
    if not content_type or not content_type.startswith("image/"):
        raise ValueError("File must be an image")
    
    return await save_upload_file(upload_file, STORE_COVERS_DIR)

async def delete_file(file_path: str) -> bool:
    """
    Delete a file
    """
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
        return False
    except Exception as e:
        logger.error(f"Error deleting file: {str(e)}")
        return False
