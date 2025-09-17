from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from bson import ObjectId
from app.models.product_faq import (
    FAQItemCreate, FAQItemInDB, FAQItemUpdate, FAQItemResponse,
    FAQSettingsCreate, FAQSettingsInDB, FAQSettingsUpdate, FAQSettingsResponse
)
from app.services.product_faq_service import ProductFAQService
from app.api.routes.auth import get_current_user
from app.db.mongodb import get_database
from app.models.user import UserInDB

router = APIRouter()

# Routes pour les éléments FAQ
@router.post("/items", response_model=FAQItemResponse)
async def create_faq_item(
    item: FAQItemCreate,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    faq_service = ProductFAQService(db)
    try:
        created_item = await faq_service.create_faq_item(item)
        return FAQItemResponse(
            id=str(created_item.id),
            product_id=str(created_item.product_id),
            **created_item.model_dump(exclude={"id", "product_id"})
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )

@router.get("/items/{product_id}", response_model=List[FAQItemResponse])
async def get_product_faq_items(
    product_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    faq_service = ProductFAQService(db)
    try:
        items = await faq_service.get_product_faq_items(product_id)
        return [
            FAQItemResponse(
                id=str(item.id),
                product_id=str(item.product_id),
                **item.model_dump(exclude={"id", "product_id"})
            ) for item in items
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )

@router.get("/item/{item_id}", response_model=FAQItemResponse)
async def get_faq_item(
    item_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    faq_service = ProductFAQService(db)
    try:
        item = await faq_service.get_faq_item(item_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="FAQ item not found"
            )
        return FAQItemResponse(
            id=str(item.id),
            product_id=str(item.product_id),
            **item.model_dump(exclude={"id", "product_id"})
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )

@router.put("/item/{item_id}", response_model=FAQItemResponse)
async def update_faq_item(
    item_id: str,
    item_update: FAQItemUpdate,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    faq_service = ProductFAQService(db)
    try:
        updated_item = await faq_service.update_faq_item(item_id, item_update)
        return FAQItemResponse(
            id=str(updated_item.id),
            product_id=str(updated_item.product_id),
            **updated_item.model_dump(exclude={"id", "product_id"})
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )

@router.delete("/item/{item_id}", response_model=bool)
async def delete_faq_item(
    item_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    faq_service = ProductFAQService(db)
    try:
        return await faq_service.delete_faq_item(item_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )

@router.put("/batch/{product_id}", response_model=List[FAQItemResponse])
async def update_product_faq_items(
    product_id: str,
    items: List[dict],
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    faq_service = ProductFAQService(db)
    try:
        updated_items = await faq_service.update_product_faq_items(product_id, items)
        return [
            FAQItemResponse(
                id=str(item.id),
                product_id=str(item.product_id),
                **item.model_dump(exclude={"id", "product_id"})
            ) for item in updated_items
        ]
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )

@router.delete("/all/{product_id}", response_model=int)
async def delete_product_faq_items(
    product_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    faq_service = ProductFAQService(db)
    try:
        return await faq_service.delete_product_faq_items(product_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )

# Routes pour les paramètres FAQ
@router.post("/settings", response_model=FAQSettingsResponse)
async def create_faq_settings(
    settings: FAQSettingsCreate,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    faq_service = ProductFAQService(db)
    try:
        created_settings = await faq_service.create_faq_settings(settings)
        return FAQSettingsResponse(
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

@router.get("/settings/{product_id}", response_model=Optional[FAQSettingsResponse])
async def get_faq_settings(
    product_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    faq_service = ProductFAQService(db)
    try:
        settings = await faq_service.get_faq_settings(product_id)
        if not settings:
            return None
        return FAQSettingsResponse(
            id=str(settings.id),
            product_id=str(settings.product_id),
            **settings.model_dump(exclude={"id", "product_id"})
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )

@router.put("/settings/{product_id}", response_model=FAQSettingsResponse)
async def update_faq_settings(
    product_id: str,
    settings_update: FAQSettingsUpdate,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    faq_service = ProductFAQService(db)
    try:
        updated_settings = await faq_service.update_faq_settings(product_id, settings_update)
        return FAQSettingsResponse(
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
async def delete_faq_settings(
    product_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    faq_service = ProductFAQService(db)
    try:
        return await faq_service.delete_faq_settings(product_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )
