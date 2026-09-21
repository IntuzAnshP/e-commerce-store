from sqlalchemy.orm import Session
from app.models.product import Product, ProductImage
from app.schemas.product import ProductCreate, ProductUpdate
from fastapi import HTTPException, status, UploadFile
import re
from datetime import datetime
import shutil
import os
from uuid import uuid4

UPLOAD_DIR = "uploads/products"
os.makedirs(UPLOAD_DIR, exist_ok=True)

MAX_IMAGE_SIZE = 5 * 1024 * 1024 
ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]

def generate_slug(name: str) -> str:
    return re.sub(r'[\W_]+', '-', name.lower()).strip('-')

def get_products(db: Session, skip: int = 0, limit: int = 10, search: str = None, category_id: int = None, sort_by: str = None):
    query = db.query(Product).filter(Product.is_active == True)
    
    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))
    if category_id:
        query = query.filter(Product.category_id == category_id)
        
    if sort_by == "price_asc":
        query = query.order_by(Product.price.asc())
    elif sort_by == "price_desc":
        query = query.order_by(Product.price.desc())
    elif sort_by == "name_asc":
        query = query.order_by(Product.name.asc())
    elif sort_by == "name_desc":
        query = query.order_by(Product.name.desc())
    else:
        query = query.order_by(Product.created_at.desc(), Product.id.desc())
        
    total = query.count()
    items = query.offset(skip).limit(limit).all()
    
    return items, total

def get_product_by_id(db: Session, product_id: int, include_inactive: bool = False):
    query = db.query(Product).filter(Product.id == product_id)
    if not include_inactive:
        query = query.filter(Product.is_active == True)
        
    product = query.first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product

def create_product(db: Session, product_in: ProductCreate):
    slug = generate_slug(product_in.name)
    if db.query(Product).filter(Product.slug == slug).first():
        slug = f"{slug}-{int(datetime.utcnow().timestamp())}"
        
    product = Product(
        name=product_in.name,
        slug=slug,
        description=product_in.description,
        price=product_in.price,
        stock=product_in.stock,
        category_id=product_in.category_id,
        is_active=product_in.is_active
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

def update_product(db: Session, product_id: int, product_in: ProductUpdate):
    product = get_product_by_id(db, product_id, include_inactive=True)
    
    update_data = product_in.model_dump(exclude_unset=True)
    
    if "name" in update_data:
        product.name = update_data["name"]
        new_slug = generate_slug(update_data["name"])
        if new_slug != product.slug and not db.query(Product).filter(Product.slug == new_slug).first():
            product.slug = new_slug
            
    for field, value in update_data.items():
        if field != "name":
            setattr(product, field, value)
            
    db.commit()
    db.refresh(product)
    return product

def delete_product(db: Session, product_id: int):
    product = get_product_by_id(db, product_id, include_inactive=True)
    product.is_active = False
    db.commit()

def upload_product_image(db: Session, product_id: int, file: UploadFile):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Unsupported file type. Allowed types are: {', '.join(ALLOWED_IMAGE_TYPES)}"
        )
        
    file.file.seek(0, 2)
    file_size = file.file.tell()
    
    if file_size > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"File too large. Maximum size is {MAX_IMAGE_SIZE / (1024 * 1024):.0f} MB"
        )
        
    file.file.seek(0)
    
    product = get_product_by_id(db, product_id, include_inactive=True)
    
    ext = file.filename.split(".")[-1]
    filename = f"{uuid4()}.{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    url = f"/static/products/{filename}"
    
    is_primary = db.query(ProductImage).filter(ProductImage.product_id == product_id).count() == 0
    
    image = ProductImage(
        product_id=product_id,
        url=url,
        is_primary=is_primary
    )
    
    db.add(image)
    db.commit()
    db.refresh(image)
    
    return image
