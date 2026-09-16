from fastapi import APIRouter, Depends, status, Query, UploadFile, File
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.product import ProductCreate, ProductUpdate, ProductRead, ProductImageRead
from app.schemas.response import StandardResponse, PaginatedData
from app.services import product_service
from app.dependencies.auth import require_admin
from typing import Optional

router = APIRouter(prefix="/api/products", tags=["Products"])

@router.get("", response_model=StandardResponse[PaginatedData[ProductRead]])
def list_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    sort_by: Optional[str] = None,
    db: Session = Depends(get_db)
):
    items, total = product_service.get_products(db, skip, limit, search, category_id, sort_by)
    return StandardResponse(data=PaginatedData(
        items=items,
        total=total,
        page=(skip // limit) + 1,
        size=limit
    ))

@router.get("/{product_id}", response_model=StandardResponse[ProductRead])
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = product_service.get_product_by_id(db, product_id)
    return StandardResponse(data=product)

@router.post("", response_model=StandardResponse[ProductRead], status_code=status.HTTP_201_CREATED)
def create_product(product_in: ProductCreate, db: Session = Depends(get_db), current_user=Depends(require_admin)):
    product = product_service.create_product(db, product_in)
    return StandardResponse(message="Product created successfully", data=product)

@router.patch("/{product_id}", response_model=StandardResponse[ProductRead])
def update_product(product_id: int, product_in: ProductUpdate, db: Session = Depends(get_db), current_user=Depends(require_admin)):
    product = product_service.update_product(db, product_id, product_in)
    return StandardResponse(message="Product updated successfully", data=product)

@router.delete("/{product_id}", response_model=StandardResponse[None])
def delete_product(product_id: int, db: Session = Depends(get_db), current_user=Depends(require_admin)):
    product_service.delete_product(db, product_id)
    return StandardResponse(message="Product deleted/deactivated successfully")

@router.post("/{product_id}/image", response_model=StandardResponse[ProductImageRead], status_code=status.HTTP_201_CREATED)
def upload_image(product_id: int, file: UploadFile = File(...), db: Session = Depends(get_db), current_user=Depends(require_admin)):
    image = product_service.upload_product_image(db, product_id, file)
    return StandardResponse(message="Image uploaded successfully", data=image)
