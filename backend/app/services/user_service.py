from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserUpdate, PasswordChange
from app.core.security import hash_password, verify_password
from fastapi import HTTPException, status

def get_user_by_id(db: Session, user_id: int) -> User | None:
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()

def update_user(db: Session, user: User, user_update: UserUpdate) -> User:
    if user_update.email is not None:
        if db.query(User).filter(User.email == user_update.email, User.id != user.id).first():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
        user.email = user_update.email
    if user_update.full_name is not None:
        user.full_name = user_update.full_name
    
    db.commit()
    db.refresh(user)
    return user

def change_password(db: Session, user: User, password_change: PasswordChange) -> User:
    if not verify_password(password_change.current_password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect current password")
    
    user.hashed_password = hash_password(password_change.new_password)
    db.commit()
    db.refresh(user)
    return user
