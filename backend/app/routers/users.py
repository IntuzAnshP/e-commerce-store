from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.user import UserRead, UserUpdate, PasswordChange
from app.schemas.response import StandardResponse
from app.models.user import User
from app.dependencies.auth import get_current_active_user
from app.services import user_service

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.get("/me", response_model=StandardResponse[UserRead])
def get_me(current_user: User = Depends(get_current_active_user)):
    return StandardResponse(message="User profile retrieved", data=current_user)

@router.patch("/me", response_model=StandardResponse[UserRead])
def update_me(user_update: UserUpdate, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    updated_user = user_service.update_user(db, current_user, user_update)
    return StandardResponse(message="User profile updated", data=updated_user)

@router.patch("/me/password", response_model=StandardResponse[UserRead])
def change_password(password_change: PasswordChange, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    updated_user = user_service.change_password(db, current_user, password_change)
    return StandardResponse(message="Password changed successfully", data=updated_user)
