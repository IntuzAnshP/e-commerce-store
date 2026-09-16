from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.order import OrderCreate, OrderRead, OrderStatusUpdate
from app.schemas.response import StandardResponse, PaginatedData
from app.services import order_service
from app.dependencies.auth import get_current_active_user, require_admin
from app.models.user import User
from typing import List, Optional

router = APIRouter(tags=["orders"])

# Customer Order Endpoints
@router.post("/api/orders", response_model=StandardResponse[OrderRead], status_code=status.HTTP_201_CREATED)
def create_order(order_in: OrderCreate, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    order = order_service.create_order_from_cart(db, current_user.id, order_in)
    return StandardResponse(message="Order created successfully", data=order)

@router.get("/api/orders", response_model=StandardResponse[List[OrderRead]])
def get_user_orders(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    orders = order_service.get_user_orders(db, current_user.id)
    return StandardResponse(data=orders)

@router.get("/api/orders/{order_id}", response_model=StandardResponse[OrderRead])
def get_order_by_id(order_id: int, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    order = order_service.get_order_by_id(db, current_user.id, order_id)
    return StandardResponse(data=order)

# Admin Order Endpoints
@router.get("/api/admin/orders", response_model=StandardResponse[PaginatedData[OrderRead]])
def get_all_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    status_filter: Optional[str] = None,
    current_user: User = Depends(require_admin), 
    db: Session = Depends(get_db)
):
    items, total = order_service.get_all_orders(db, skip, limit, status_filter)
    return StandardResponse(data=PaginatedData(
        items=items,
        total=total,
        page=(skip // limit) + 1,
        size=limit
    ))

@router.patch("/api/admin/orders/{order_id}/status", response_model=StandardResponse[OrderRead])
def update_order_status(
    order_id: int, 
    status_update: OrderStatusUpdate, 
    current_user: User = Depends(require_admin), 
    db: Session = Depends(get_db)
):
    order = order_service.update_order_status(db, order_id, status_update)
    return StandardResponse(message="Order status updated", data=order)
