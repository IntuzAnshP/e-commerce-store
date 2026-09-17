from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.schemas.category import CategoryRead

class ProductImageRead(BaseModel):
    id: int
    url: str
    is_primary: bool
    order: int

    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float = Field(..., gt=0, description="Price must be greater than zero")
    stock: int = Field(default=0, ge=0, description="Stock cannot be negative")
    category_id: Optional[int] = None
    is_active: bool = True

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    category_id: Optional[int] = None
    is_active: Optional[bool] = None

class ProductRead(ProductBase):
    id: int
    slug: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    category: Optional[CategoryRead] = None
    images: List[ProductImageRead] = []

    class Config:
        from_attributes = True
