from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from bson import ObjectId
from app.models.product_appearance import ProductAppearanceCreate, ProductAppearanceInDB, ProductAppearanceUpdate, ProductAppearanceResponse
from app.services.product_appearance_service import ProductAppearanceService
from app.api.routes.auth import get_current_user
from app.db.mongodb import get_database
from app.models.user import UserInDB

router = APIRouter()

@router.post("/", response_model=ProductAppearanceResponse)
async def create_product_appearance(
    appearance: ProductAppearanceCreate,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    appearance_service = ProductAppearanceService(db)
    try:
        created_appearance = await appearance_service.create_product_appearance(appearance)
        return ProductAppearanceResponse(
            id=str(created_appearance.id),
            product_id=str(created_appearance.product_id),
            **created_appearance.model_dump(exclude={"id", "product_id"})
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )

@router.get("/{product_id}", response_model=Optional[ProductAppearanceResponse])
async def get_product_appearance(
    product_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    appearance_service = ProductAppearanceService(db)
    try:
        appearance = await appearance_service.get_product_appearance(product_id)
        if not appearance:
            return None
        return ProductAppearanceResponse(
            id=str(appearance.id),
            product_id=str(appearance.product_id),
            **appearance.model_dump(exclude={"id", "product_id"})
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )

@router.put("/{product_id}", response_model=ProductAppearanceResponse)
async def update_product_appearance(
    product_id: str,
    appearance_update: ProductAppearanceUpdate,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    appearance_service = ProductAppearanceService(db)
    try:
        updated_appearance = await appearance_service.update_product_appearance(product_id, appearance_update)
        return ProductAppearanceResponse(
            id=str(updated_appearance.id),
            product_id=str(updated_appearance.product_id),
            **updated_appearance.model_dump(exclude={"id", "product_id"})
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )

@router.delete("/{product_id}", response_model=bool)
async def delete_product_appearance(
    product_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    appearance_service = ProductAppearanceService(db)
    try:
        return await appearance_service.delete_product_appearance(product_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )
