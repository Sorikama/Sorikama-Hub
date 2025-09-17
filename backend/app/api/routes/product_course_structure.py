from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional, Dict, Any
from bson import ObjectId
from app.models.product_course_structure import CourseStructureCreate, CourseStructureInDB, CourseStructureUpdate, CourseStructureResponse
from app.services.product_course_structure_service import ProductCourseStructureService
from app.api.routes.auth import get_current_user
from app.db.mongodb import get_database
from app.models.user import UserInDB

router = APIRouter()

@router.post("/", response_model=CourseStructureResponse)
async def create_course_structure(
    structure: CourseStructureCreate,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    course_structure_service = ProductCourseStructureService(db)
    try:
        created_structure = await course_structure_service.create_course_structure(structure)
        return CourseStructureResponse(
            id=str(created_structure.id),
            product_id=str(created_structure.product_id),
            **created_structure.model_dump(exclude={"id", "product_id"})
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )

@router.get("/{product_id}", response_model=Optional[CourseStructureResponse])
async def get_course_structure(
    product_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    course_structure_service = ProductCourseStructureService(db)
    try:
        structure = await course_structure_service.get_course_structure(product_id)
        if not structure:
            return None
        return CourseStructureResponse(
            id=str(structure.id),
            product_id=str(structure.product_id),
            **structure.model_dump(exclude={"id", "product_id"})
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )

@router.put("/{product_id}", response_model=CourseStructureResponse)
async def update_course_structure(
    product_id: str,
    structure_update: CourseStructureUpdate,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    course_structure_service = ProductCourseStructureService(db)
    try:
        updated_structure = await course_structure_service.update_course_structure(product_id, structure_update)
        return CourseStructureResponse(
            id=str(updated_structure.id),
            product_id=str(updated_structure.product_id),
            **updated_structure.model_dump(exclude={"id", "product_id"})
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )

@router.delete("/{product_id}", response_model=bool)
async def delete_course_structure(
    product_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    course_structure_service = ProductCourseStructureService(db)
    try:
        return await course_structure_service.delete_course_structure(product_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )
