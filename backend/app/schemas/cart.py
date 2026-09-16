from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.schemas.product import ProductRead

class CartItemBase(BaseModel):
    quantity: int

class CartItemCreate(CartItemBase):
    product_id: int

class CartItemUpdate(CartItemBase):
    pass

class CartItemRead(BaseModel):
    id: int
    quantity: int
    added_at: datetime
    product: ProductRead

    class Config:
        from_attributes = True

class CartRead(BaseModel):
    id: int
    user_id: Optional[int]
    created_at: datetime
    updated_at: Optional[datetime]
    items: List[CartItemRead] = []
    total_cart_value: float = 0.0

    class Config:
        from_attributes = True
