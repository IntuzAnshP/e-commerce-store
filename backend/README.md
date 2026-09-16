# E-Commerce Backend

This is the backend for the E-Commerce platform built with FastAPI, SQLAlchemy, and PostgreSQL.

## Initializing the Database

When setting up this project for the first time, you must create an initial Admin user to access protected endpoints (like creating categories and products, or managing orders).

To create the first Admin user, run the provided utility script from the root of the `backend` directory:

```bash
# Run with default credentials (admin@example.com / adminpassword123)
python scripts/create_admin.py

# Or specify custom credentials
python scripts/create_admin.py --email "your_admin@company.com" --password "super_secret"
```

Once the admin is created, you can log into the Swagger UI (`http://localhost:8000/docs`) to authorize and interact with the Admin endpoints.
