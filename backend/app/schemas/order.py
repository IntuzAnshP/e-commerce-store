from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.models.order import OrderStatus
from app.schemas.product import ProductRead

class ShippingAddress(BaseModel):
    full_name: str = ""
    address_line_1: str
    city: str
    state: str
    postal_code: str
    country: str

class OrderCreate(BaseModel):
    shipping_address: ShippingAddress

class OrderStatusUpdate(BaseModel):
    status: OrderStatus

class OrderItemRead(BaseModel):
    id: int
    quantity: int
    unit_price: float
    product: ProductRead

    class Config:
        from_attributes = True

class OrderRead(BaseModel):
    id: int
    status: OrderStatus
    total_amount: float
    shipping_address: ShippingAddress
    created_at: datetime
    updated_at: Optional[datetime]
    items: List[OrderItemRead] = []

    class Config:
        from_attributes = True
