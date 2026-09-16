from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.cart import CartRead, CartItemCreate, CartItemUpdate
from app.schemas.response import StandardResponse
from app.services import cart_service
from app.dependencies.auth import get_current_active_user
from app.models.user import User

router = APIRouter(prefix="/api/cart", tags=["cart"])

@router.get("", response_model=StandardResponse[CartRead])
def get_cart(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    cart = cart_service.get_cart(db, current_user.id)
    return StandardResponse(data=cart)

@router.post("/items", response_model=StandardResponse[CartRead], status_code=status.HTTP_201_CREATED)
def add_item_to_cart(item_in: CartItemCreate, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    cart = cart_service.add_item_to_cart(db, current_user.id, item_in)
    return StandardResponse(message="Item added to cart", data=cart)

@router.patch("/items/{item_id}", response_model=StandardResponse[CartRead])
def update_cart_item(item_id: int, item_in: CartItemUpdate, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    cart = cart_service.update_cart_item(db, current_user.id, item_id, item_in)
    return StandardResponse(message="Cart item updated", data=cart)

@router.delete("/items/{item_id}", response_model=StandardResponse[None])
def remove_cart_item(item_id: int, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    cart_service.remove_cart_item(db, current_user.id, item_id)
    return StandardResponse(message="Item removed from cart")

@router.delete("", response_model=StandardResponse[None])
def clear_cart(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    cart_service.clear_cart(db, current_user.id)
    return StandardResponse(message="Cart cleared")
