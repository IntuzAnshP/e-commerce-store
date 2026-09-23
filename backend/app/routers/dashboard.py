from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.user import User
from app.models.order import Order
from app.models.product import Product
from app.dependencies.auth import require_admin
from app.schemas.response import StandardResponse

router = APIRouter(tags=["Admin Dashboard"])

@router.get("/api/admin/dashboard", response_model=StandardResponse)
def get_dashboard_stats(current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    # Total orders
    total_orders = db.query(Order).count()
    
    # Total revenue (excluding cancelled orders)
    total_revenue = db.query(func.sum(Order.total_amount)).filter(Order.status != 'cancelled').scalar() or 0.0
    
    # Orders by status
    status_counts = db.query(Order.status, func.count(Order.id)).group_by(Order.status).all()
    orders_by_status = {status.value: count for status, count in status_counts}
    
    # Low stock products (e.g. stock < 10)
    low_stock_threshold = 10
    low_stock_products = db.query(Product).filter(Product.stock < low_stock_threshold, Product.is_active == True).all()
    
    low_stock_list = [
        {
            "id": p.id,
            "name": p.name,
            "stock": p.stock,
            "price": p.price
        } for p in low_stock_products
    ]
    
    return StandardResponse(data={
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "orders_by_status": orders_by_status,
        "low_stock_products": low_stock_list
    })
