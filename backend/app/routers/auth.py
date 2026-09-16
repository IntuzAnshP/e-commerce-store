from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.user import UserCreate, UserRead
from app.schemas.auth import LoginRequest, TokenResponse, RefreshTokenRequest
from app.schemas.response import StandardResponse
from app.services import auth_service
from app.dependencies.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/register", response_model=StandardResponse[UserRead], status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db: Session = Depends(get_db)):
    new_user = auth_service.register_user(db, user)
    return StandardResponse(message="User registered successfully", data=new_user)

@router.post("/login", response_model=StandardResponse[TokenResponse])
def login(login_req: LoginRequest, db: Session = Depends(get_db)):
    user = auth_service.authenticate_user(db, login_req)
    tokens = auth_service.create_tokens(db, user)
    return StandardResponse(message="Login successful", data=tokens)

@router.post("/refresh-token", response_model=StandardResponse[TokenResponse])
def refresh_token(req: RefreshTokenRequest, db: Session = Depends(get_db)):
    tokens = auth_service.refresh_access_token(db, req.refresh_token)
    return StandardResponse(message="Token refreshed successfully", data=tokens)

@router.post("/logout", response_model=StandardResponse[None])
def logout(req: RefreshTokenRequest, db: Session = Depends(get_db)):
    auth_service.logout_user(db, req.refresh_token)
    return StandardResponse(message="Successfully logged out")
