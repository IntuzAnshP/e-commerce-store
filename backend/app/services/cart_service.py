from sqlalchemy.orm import Session
from app.models.cart import Cart, CartItem
from app.models.product import Product
from app.schemas.cart import CartItemCreate, CartItemUpdate
from fastapi import HTTPException, status
from typing import Optional

def get_or_create_cart(db: Session, user_id: Optional[int] = None, guest_cart_id: Optional[int] = None) -> Cart:
    cart = None
    if user_id is not None:
        cart = db.query(Cart).filter(Cart.user_id == user_id).first()
        if not cart:
            cart = Cart(user_id=user_id)
            db.add(cart)
            db.commit()
            db.refresh(cart)
    else:
        if guest_cart_id is not None:
            cart = db.query(Cart).filter(Cart.id == guest_cart_id, Cart.user_id == None).first()
        
        if not cart:
            cart = Cart(user_id=None)
            db.add(cart)
            db.commit()
            db.refresh(cart)
            
    return cart

def get_cart(db: Session, user_id: Optional[int] = None, guest_cart_id: Optional[int] = None):
    cart = get_or_create_cart(db, user_id, guest_cart_id)
    # calculate total
    total = sum(item.quantity * item.product.price for item in cart.items)
    
    # We can just attach total to the cart object dynamically before returning to match CartRead
    cart.total_cart_value = total
    return cart

def add_item_to_cart(db: Session, item_in: CartItemCreate, user_id: Optional[int] = None, guest_cart_id: Optional[int] = None):
    if item_in.quantity <= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Quantity must be greater than 0")
        
    product = db.query(Product).filter(Product.id == item_in.product_id, Product.is_active == True).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
        
    if item_in.quantity > product.stock:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Quantity is greater than available stock")
        
    cart = get_or_create_cart(db, user_id, guest_cart_id)
    
    cart_item = db.query(CartItem).filter(CartItem.cart_id == cart.id, CartItem.product_id == item_in.product_id).first()
    
    if cart_item:
        new_quantity = cart_item.quantity + item_in.quantity
        if new_quantity > product.stock:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Quantity is greater than available stock")
        cart_item.quantity = new_quantity
    else:
        cart_item = CartItem(
            cart_id=cart.id,
            product_id=item_in.product_id,
            quantity=item_in.quantity
        )
        db.add(cart_item)
        
    db.commit()
    return get_cart(db, user_id, cart.id if user_id is None else None)

def update_cart_item(db: Session, item_id: int, item_in: CartItemUpdate, user_id: Optional[int] = None, guest_cart_id: Optional[int] = None):
    if item_in.quantity <= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Quantity must be greater than 0")
        
    cart = get_or_create_cart(db, user_id, guest_cart_id)
    cart_item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.cart_id == cart.id).first()
    
    if not cart_item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found")
        
    if item_in.quantity > cart_item.product.stock:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Quantity is greater than available stock")
        
    cart_item.quantity = item_in.quantity
    db.commit()
    
    return get_cart(db, user_id, guest_cart_id)

def remove_cart_item(db: Session, item_id: int, user_id: Optional[int] = None, guest_cart_id: Optional[int] = None):
    cart = get_or_create_cart(db, user_id, guest_cart_id)
    cart_item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.cart_id == cart.id).first()
    
    if not cart_item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found")
        
    db.delete(cart_item)
    db.commit()

def clear_cart(db: Session, user_id: Optional[int] = None, guest_cart_id: Optional[int] = None):
    cart = get_or_create_cart(db, user_id, guest_cart_id)
    db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
    db.commit()
