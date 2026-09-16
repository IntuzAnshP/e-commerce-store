import sys
import os
import argparse

# Add the backend directory to path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models.user import User, UserRole
from app.core.security import hash_password

def create_admin(email: str, password: str):
    db = SessionLocal()
    try:
        # Check if user already exists
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            print(f"User {email} already exists!")
            
            # If they exist but aren't an admin, upgrade them
            if existing.role != UserRole.admin:
                existing.role = UserRole.admin
                db.commit()
                print(f"Upgraded {email} to Admin role.")
            return
            
        admin_user = User(
            email=email,
            full_name="System Administrator",
            hashed_password=hash_password(password),
            role=UserRole.admin
        )
        db.add(admin_user)
        db.commit()
        print(f"Successfully created admin user!")
        print(f"Email: {email}")
        print(f"Password: {password}")
    except Exception as e:
        print(f"Error creating admin: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Create an initial admin user")
    parser.add_argument("--email", type=str, default="admin@example.com", help="Admin email address")
    parser.add_argument("--password", type=str, default="adminpassword123", help="Admin password")
    
    args = parser.parse_args()
    create_admin(args.email, args.password)
