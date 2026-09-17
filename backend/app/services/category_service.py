from sqlalchemy.orm import Session
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate
from fastapi import HTTPException, status
from datetime import datetime
import re

def generate_slug(name: str) -> str:
    return re.sub(r'[\W_]+', '-', name.lower()).strip('-')

def get_categories(db: Session):
    return db.query(Category).all()

def get_category_by_id(db: Session, category_id: int):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return category

def create_category(db: Session, category_in: CategoryCreate):
    existing_category = db.query(Category).filter(Category.name == category_in.name).first()
    if existing_category:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Category with this name already exists")
        
    slug = generate_slug(category_in.name)
    if db.query(Category).filter(Category.slug == slug).first():
        slug = f"{slug}-{int(datetime.utcnow().timestamp())}"
        
    category = Category(
        name=category_in.name,
        description=category_in.description,
        slug=slug
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category

def update_category(db: Session, category_id: int, category_in: CategoryUpdate):
    category = get_category_by_id(db, category_id)
    
    if category_in.name is not None and category_in.name != category.name:
        existing_category = db.query(Category).filter(Category.name == category_in.name).first()
        if existing_category:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Category with this name already exists")
        category.name = category_in.name
        new_slug = generate_slug(category_in.name)
        if new_slug != category.slug and not db.query(Category).filter(Category.slug == new_slug).first():
            category.slug = new_slug
    
    if category_in.description is not None:
        category.description = category_in.description
        
    db.commit()
    db.refresh(category)
    return category

def delete_category(db: Session, category_id: int):
    category = get_category_by_id(db, category_id)
    db.delete(category)
    db.commit()
