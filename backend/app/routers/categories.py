from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryRead
from app.schemas.response import StandardResponse
from app.services import category_service
from app.dependencies.auth import require_admin
from typing import List

router = APIRouter(prefix="/api/categories", tags=["Categories"])

@router.get("", response_model=StandardResponse[List[CategoryRead]])
def list_categories(db: Session = Depends(get_db)):
    categories = category_service.get_categories(db)
    return StandardResponse(data=categories)

@router.get("/{category_id}", response_model=StandardResponse[CategoryRead])
def get_category(category_id: int, db: Session = Depends(get_db)):
    category = category_service.get_category_by_id(db, category_id)
    return StandardResponse(data=category)

@router.post("", response_model=StandardResponse[CategoryRead], status_code=status.HTTP_201_CREATED)
def create_category(category_in: CategoryCreate, db: Session = Depends(get_db), current_user=Depends(require_admin)):
    category = category_service.create_category(db, category_in)
    return StandardResponse(message="Category created successfully", data=category)

@router.patch("/{category_id}", response_model=StandardResponse[CategoryRead])
def update_category(category_id: int, category_in: CategoryUpdate, db: Session = Depends(get_db), current_user=Depends(require_admin)):
    category = category_service.update_category(db, category_id, category_in)
    return StandardResponse(message="Category updated successfully", data=category)

@router.delete("/{category_id}", response_model=StandardResponse[None])
def delete_category(category_id: int, db: Session = Depends(get_db), current_user=Depends(require_admin)):
    category_service.delete_category(db, category_id)
    return StandardResponse(message="Category deleted successfully")
