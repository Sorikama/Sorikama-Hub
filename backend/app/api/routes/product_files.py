from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from bson import ObjectId
from app.models.product_files import (
    ProductFileCreate, ProductFileInDB, ProductFileUpdate, ProductFileResponse,
    ProductFileSettingsCreate, ProductFileSettingsInDB, ProductFileSettingsUpdate, ProductFileSettingsResponse
)
from app.services.product_files_service import ProductFilesService
from app.api.routes.auth import get_current_user
from app.db.mongodb import get_database
from app.models.user import UserInDB

router = APIRouter()

# Routes pour les fichiers
@router.post("/files", response_model=ProductFileResponse)
async def create_product_file(
    file: ProductFileCreate,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    files_service = ProductFilesService(db)
    try:
        created_file = await files_service.create_product_file(file)
        return ProductFileResponse(
            id=str(created_file.id),
            product_id=str(created_file.product_id),
            **created_file.model_dump(exclude={"id", "product_id"})
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )

@router.get("/files/{product_id}", response_model=List[ProductFileResponse])
async def get_product_files(
    product_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    files_service = ProductFilesService(db)
    try:
        files = await files_service.get_product_files(product_id)
        return [
            ProductFileResponse(
                id=str(file.id),
                product_id=str(file.product_id),
                **file.model_dump(exclude={"id", "product_id"})
            ) for file in files
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )

@router.get("/file/{file_id}", response_model=ProductFileResponse)
async def get_product_file(
    file_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    files_service = ProductFilesService(db)
    try:
        file = await files_service.get_product_file(file_id)
        if not file:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File not found"
            )
        return ProductFileResponse(
            id=str(file.id),
            product_id=str(file.product_id),
            **file.model_dump(exclude={"id", "product_id"})
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )

@router.put("/file/{file_id}", response_model=ProductFileResponse)
async def update_product_file(
    file_id: str,
    file_update: ProductFileUpdate,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    files_service = ProductFilesService(db)
    try:
        updated_file = await files_service.update_product_file(file_id, file_update)
        return ProductFileResponse(
            id=str(updated_file.id),
            product_id=str(updated_file.product_id),
            **updated_file.model_dump(exclude={"id", "product_id"})
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )

@router.delete("/file/{file_id}", response_model=bool)
async def delete_product_file(
    file_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    files_service = ProductFilesService(db)
    try:
        return await files_service.delete_product_file(file_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )

# Routes pour les paramètres des fichiers
@router.post("/settings", response_model=ProductFileSettingsResponse)
async def create_file_settings(
    settings: ProductFileSettingsCreate,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    files_service = ProductFilesService(db)
    try:
        created_settings = await files_service.create_file_settings(settings)
        return ProductFileSettingsResponse(
            id=str(created_settings.id),
            product_id=str(created_settings.product_id),
            **created_settings.model_dump(exclude={"id", "product_id"})
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )

@router.get("/settings/{product_id}", response_model=Optional[ProductFileSettingsResponse])
async def get_file_settings(
    product_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    files_service = ProductFilesService(db)
    try:
        settings = await files_service.get_file_settings(product_id)
        if not settings:
            return None
        return ProductFileSettingsResponse(
            id=str(settings.id),
            product_id=str(settings.product_id),
            **settings.model_dump(exclude={"id", "product_id"})
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )

@router.put("/settings/{product_id}", response_model=ProductFileSettingsResponse)
async def update_file_settings(
    product_id: str,
    settings_update: ProductFileSettingsUpdate,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    files_service = ProductFilesService(db)
    try:
        updated_settings = await files_service.update_file_settings(product_id, settings_update)
        return ProductFileSettingsResponse(
            id=str(updated_settings.id),
            product_id=str(updated_settings.product_id),
            **updated_settings.model_dump(exclude={"id", "product_id"})
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )

@router.delete("/settings/{product_id}", response_model=bool)
async def delete_file_settings(
    product_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    files_service = ProductFilesService(db)
    try:
        return await files_service.delete_file_settings(product_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )
