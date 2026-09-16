from sqlalchemy.orm import Session
from app.models.order import Order, OrderItem, OrderStatus
from app.models.cart import Cart, CartItem
from app.models.product import Product
from app.schemas.order import OrderCreate, OrderStatusUpdate
from fastapi import HTTPException, status

def create_order_from_cart(db: Session, user_id: int, order_in: OrderCreate):
    cart = db.query(Cart).filter(Cart.user_id == user_id).first()
    if not cart or not cart.items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cart is empty")
        
    # Start checking stock by locking rows
    total_amount = 0.0
    for item in cart.items:
        product = db.query(Product).with_for_update().filter(Product.id == item.product_id).first()
        if not product or product.stock < item.quantity:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail=f"Quantity for product '{product.name if product else item.product_id}' is greater than available stock"
            )
        total_amount += item.quantity * product.price
        # deduct stock
        product.stock -= item.quantity
        
    # Create order
    shipping_dict = order_in.shipping_address.model_dump()
    order = Order(
        user_id=user_id,
        status=OrderStatus.pending,
        total_amount=total_amount,
        shipping_address=shipping_dict
    )
    db.add(order)
    db.flush() # get order id
    
    # Create order items
    for item in cart.items:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=item.product.price
        )
        db.add(order_item)
        
    # Clear cart
    db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
    
    db.commit()
    db.refresh(order)
    return order

def get_user_orders(db: Session, user_id: int):
    return db.query(Order).filter(Order.user_id == user_id).order_by(Order.created_at.desc()).all()

def get_order_by_id(db: Session, user_id: int, order_id: int, is_admin: bool = False):
    query = db.query(Order).filter(Order.id == order_id)
    if not is_admin:
        query = query.filter(Order.user_id == user_id)
        
    order = query.first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return order

def get_all_orders(db: Session, skip: int = 0, limit: int = 10, status_filter: str = None):
    query = db.query(Order)
    if status_filter:
        query = query.filter(Order.status == status_filter)
        
    total = query.count()
    items = query.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()
    return items, total

def update_order_status(db: Session, order_id: int, status_update: OrderStatusUpdate):
    order = get_order_by_id(db, user_id=None, order_id=order_id, is_admin=True)
    
    old_status = order.status
    new_status = status_update.status
    
    if old_status != OrderStatus.cancelled and new_status == OrderStatus.cancelled:
        # Restock
        for item in order.items:
            product = db.query(Product).with_for_update().filter(Product.id == item.product_id).first()
            if product:
                product.stock += item.quantity
                
    elif old_status == OrderStatus.cancelled and new_status != OrderStatus.cancelled:
        # Re-deduct
        for item in order.items:
            product = db.query(Product).with_for_update().filter(Product.id == item.product_id).first()
            if not product or product.stock < item.quantity:
                db.rollback()
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST, 
                    detail=f"Cannot un-cancel: quantity for product '{product.name if product else item.product_id}' is greater than available stock"
                )
            product.stock -= item.quantity
            
    order.status = new_status
    db.commit()
    db.refresh(order)
    return order
