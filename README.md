# E-Commerce Store Web Application

A full-stack e-commerce web application where customers can browse products, manage a shopping cart, place orders, and track order history. Admins can manage products, categories, inventory, and orders through a dedicated admin interface.

## 🚀 Tech Stack

### Backend
- **Framework:** Python, FastAPI
- **Database:** PostgreSQL
- **ORM:** SQLAlchemy
- **Data Validation:** Pydantic
- **Authentication:** JWT (JSON Web Tokens) with bcrypt for password hashing
- **Migrations:** Alembic

### Frontend
- **Framework:** React 19 (Bootstrapped with Vite)
- **Language:** TypeScript
- **Routing:** React Router v7
- **HTTP Client:** Axios

---

## 👥 User Roles & Capabilities

| Role | Capabilities |
| :--- | :--- |
| **Guest** | Browse products, view product details, search and filter products. |
| **Customer** | All Guest actions + Register/Login, manage shopping cart, checkout, view personal order history, and manage profile. |
| **Admin** | All Customer actions + Manage products/categories, view all system orders, update order statuses, and manage inventory/dashboard. |

---

## ✨ Core Features

### 1. Authentication & User Management
- User registration (email, password, name)
- Login/logout with JWT-based sessions
- Password hashing for security
- View and edit user profile
- Password change functionality

### 2. Product Management
- Paginated product listing
- Detailed product pages (name, description, price, images, stock, category)
- Category listing and filtering
- Keyword-based search and sorting options (price, name, etc.)

### 3. Shopping Cart
- Add, update, and remove products from the cart
- Real-time cart summary (items, quantities, subtotal)
- Persistent cart state for authenticated users

### 4. Checkout & Orders
- Seamless checkout flow: Review Cart → Shipping Details → Place Order
- Order creation and confirmation
- Customer order history and tracking
- Order status lifecycle management

### 5. Admin Panel
- **Products:** Create, edit, delete, upload images, manage stock
- **Categories:** Create, edit, delete
- **Orders:** View all orders, update statuses (Pending → Processing → Shipped → Delivered)
- **Dashboard:** Track total orders, revenue, and receive low-stock alerts

---

## 📁 Project Structure

```
e-commerce/
├── backend/                  # FastAPI Application
│   ├── alembic/              # Database migrations
│   ├── app/                  # Main application code (Models, Schemas, Routers)
│   ├── scripts/              # Utility scripts
│   ├── uploads/              # Uploaded media/images
│   ├── alembic.ini           # Alembic configuration
│   └── requirements.txt      # Python dependencies
├── frontend/                 # React (Vite) Application
│   ├── src/                  # React source code (Components, Pages, Services)
│   ├── public/               # Static assets
│   ├── package.json          # Node dependencies
│   └── vite.config.ts        # Vite configuration
├── project.txt               # Project requirement notes
└── apis.txt                  # API Definitions
```

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Python (3.9 or higher)
- PostgreSQL

### 1. Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Variables:**
   - Create a `.env` file in the `backend` directory based on your PostgreSQL setup and JWT secret key configuration.
   - Example `.env`:
     ```env
     DATABASE_URL=postgresql://user:password@localhost/ecommerce
     SECRET_KEY=your_super_secret_key
     ALGORITHM=HS256
     ACCESS_TOKEN_EXPIRE_MINUTES=30
     ```

5. **Run Database Migrations:**
   ```bash
   alembic upgrade head
   ```

6. **Create an Admin User:**
   ```bash
   python scripts/create_admin.py
   ```

7. **Start the FastAPI server:**
   ```bash
   uvicorn app.main:app --reload
   ```
   *The backend API will be available at `http://localhost:8000` and Swagger UI at `http://localhost:8000/docs`.*

### 2. Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   *The frontend application will be available at `http://localhost:5173`.*

---

## 📡 API Endpoints Overview

Here is a high-level overview of the API endpoints available in the backend. 

### Auth & Users
- `POST /api/auth/register` - Register customer
- `POST /api/auth/login` - Login and get JWT
- `POST /api/auth/logout` - Logout session
- `POST /api/auth/refresh-token` - Refresh JWT token
- `GET /api/users/me` - Get logged-in user profile
- `PATCH /api/users/me` - Update profile

### Products & Categories
- `GET /api/products` - List products (pagination, search, filter)
- `GET /api/products/{id}` - Get product details
- `POST /api/products` - (Admin) Create product
- `GET /api/categories` - List categories
- `POST /api/categories` - (Admin) Create category

### Cart & Orders
- `GET /api/cart` - Get current user's cart
- `POST /api/cart/items` - Add product to cart
- `POST /api/orders` - Create order from cart
- `GET /api/orders` - Customer's order history
- `PATCH /api/admin/orders/{id}/status` - (Admin) Update order status

*(For a full list of APIs and payload structures, refer to the FastAPI Swagger UI).*
