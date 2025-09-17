from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from bson import ObjectId
from app.models.product_details import ProductDetailsCreate, ProductDetailsInDB, ProductDetailsUpdate, ProductDetailsResponse
from app.services.product_details_service import ProductDetailsService
from app.api.routes.auth import get_current_user
from app.db.mongodb import get_database
from app.models.user import UserInDB

router = APIRouter()

@router.post("/", response_model=ProductDetailsResponse)
async def create_product_details(
    details: ProductDetailsCreate,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    details_service = ProductDetailsService(db)
    try:
        created_details = await details_service.create_product_details(details)
        return ProductDetailsResponse(
            id=str(created_details.id),
            product_id=str(created_details.product_id),
            **created_details.model_dump(exclude={"id", "product_id"})
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )

@router.get("/{product_id}", response_model=Optional[ProductDetailsResponse])
async def get_product_details(
    product_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    details_service = ProductDetailsService(db)
    try:
        details = await details_service.get_product_details(product_id)
        if not details:
            return None
        return ProductDetailsResponse(
            id=str(details.id),
            product_id=str(details.product_id),
            **details.model_dump(exclude={"id", "product_id"})
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )

@router.put("/{product_id}", response_model=ProductDetailsResponse)
async def update_product_details(
    product_id: str,
    details_update: ProductDetailsUpdate,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    details_service = ProductDetailsService(db)
    try:
        updated_details = await details_service.update_product_details(product_id, details_update)
        return ProductDetailsResponse(
            id=str(updated_details.id),
            product_id=str(updated_details.product_id),
            **updated_details.model_dump(exclude={"id", "product_id"})
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )

@router.delete("/{product_id}", response_model=bool)
async def delete_product_details(
    product_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    details_service = ProductDetailsService(db)
    try:
        return await details_service.delete_product_details(product_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )
