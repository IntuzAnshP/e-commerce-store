from sqlalchemy.orm import Session
from app.models.user import User, RefreshToken
from app.schemas.user import UserCreate
from app.schemas.auth import TokenResponse, LoginRequest
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from app.services.user_service import get_user_by_email, get_user_by_id
from fastapi import HTTPException, status
from datetime import datetime, timedelta
from app.core.config import settings

def register_user(db: Session, user_create: UserCreate) -> User:
    if get_user_by_email(db, user_create.email):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    
    new_user = User(
        email=user_create.email,
        full_name=user_create.full_name,
        hashed_password=hash_password(user_create.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

def authenticate_user(db: Session, login_req: LoginRequest) -> User:
    user = get_user_by_email(db, login_req.email)
    if not user or not verify_password(login_req.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    return user

def create_tokens(db: Session, user: User) -> TokenResponse:
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token_str = create_refresh_token(data={"sub": str(user.id)})
    
    # store refresh token in db
    expire_date = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    db_refresh = RefreshToken(
        user_id=user.id,
        token=refresh_token_str,
        expires_at=expire_date
    )
    db.add(db_refresh)
    db.commit()
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token_str,
        token_type="bearer"
    )

def refresh_access_token(db: Session, refresh_token: str) -> TokenResponse:
    payload = decode_token(refresh_token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    
    user_id = int(payload.get("sub"))
    db_token = db.query(RefreshToken).filter(
        RefreshToken.token == refresh_token,
        RefreshToken.revoked == False,
        RefreshToken.user_id == user_id
    ).first()
    
    if not db_token or db_token.expires_at < datetime.utcnow():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")
    
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        
    return create_tokens(db, user)

def logout_user(db: Session, refresh_token: str):
    db_token = db.query(RefreshToken).filter(RefreshToken.token == refresh_token).first()
    if db_token:
        db_token.revoked = True
        db.commit()
