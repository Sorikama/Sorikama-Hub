from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from bson import ObjectId
from app.models.product_custom_fields import CustomFieldCreate, CustomFieldInDB, CustomFieldUpdate, CustomFieldResponse
from app.services.product_custom_fields_service import ProductCustomFieldsService
from app.api.routes.auth import get_current_user
from app.db.mongodb import get_database
from app.models.user import UserInDB

router = APIRouter()

@router.post("/", response_model=CustomFieldResponse)
async def create_custom_field(
    field: CustomFieldCreate,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    custom_fields_service = ProductCustomFieldsService(db)
    try:
        created_field = await custom_fields_service.create_custom_field(field)
        return CustomFieldResponse(
            id=str(created_field.id),
            product_id=str(created_field.product_id),
            **created_field.model_dump(exclude={"id", "product_id"})
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )

@router.get("/{product_id}", response_model=List[CustomFieldResponse])
async def get_product_custom_fields(
    product_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    custom_fields_service = ProductCustomFieldsService(db)
    try:
        fields = await custom_fields_service.get_product_custom_fields(product_id)
        return [
            CustomFieldResponse(
                id=str(field.id),
                product_id=str(field.product_id),
                **field.model_dump(exclude={"id", "product_id"})
            ) for field in fields
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )

@router.get("/field/{field_id}", response_model=CustomFieldResponse)
async def get_custom_field(
    field_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    custom_fields_service = ProductCustomFieldsService(db)
    try:
        field = await custom_fields_service.get_custom_field(field_id)
        if not field:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Custom field not found"
            )
        return CustomFieldResponse(
            id=str(field.id),
            product_id=str(field.product_id),
            **field.model_dump(exclude={"id", "product_id"})
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )

@router.put("/field/{field_id}", response_model=CustomFieldResponse)
async def update_custom_field(
    field_id: str,
    field_update: CustomFieldUpdate,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    custom_fields_service = ProductCustomFieldsService(db)
    try:
        updated_field = await custom_fields_service.update_custom_field(field_id, field_update)
        return CustomFieldResponse(
            id=str(updated_field.id),
            product_id=str(updated_field.product_id),
            **updated_field.model_dump(exclude={"id", "product_id"})
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )

@router.delete("/field/{field_id}", response_model=bool)
async def delete_custom_field(
    field_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    custom_fields_service = ProductCustomFieldsService(db)
    try:
        return await custom_fields_service.delete_custom_field(field_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )

@router.put("/batch/{product_id}", response_model=List[CustomFieldResponse])
async def update_product_custom_fields(
    product_id: str,
    fields: List[dict],
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    custom_fields_service = ProductCustomFieldsService(db)
    try:
        updated_fields = await custom_fields_service.update_product_custom_fields(product_id, fields)
        return [
            CustomFieldResponse(
                id=str(field.id),
                product_id=str(field.product_id),
                **field.model_dump(exclude={"id", "product_id"})
            ) for field in updated_fields
        ]
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )

@router.delete("/all/{product_id}", response_model=int)
async def delete_product_custom_fields(
    product_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    custom_fields_service = ProductCustomFieldsService(db)
    try:
        return await custom_fields_service.delete_product_custom_fields(product_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )
