# ☕ Coffee Shop Ordering System

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)
![TiDB](https://img.shields.io/badge/TiDB-Message_Queue-ff0000?style=for-the-badge&logo=tidb&logoColor=white)

A modern, full-stack coffee ordering application built with **React (Vite)** and **Node.js (Express)**, featuring a responsive mobile-first design, real-time-ready architecture, and a robust admin dashboard.

---

## ✨ Key Features

### 📱 Customer Experience
- **Mobile-First Design**: Optimized for all devices with a custom bottom navigation bar on mobile.
- **Dynamic Menu**: Browse 60+ items across categories (Coffee, Tea, Bakery, Food, etc.).
- **Smart Cart**: Add items, adjust quantities, and calculate totals instantly.
- **Flexible Ordering**: Support for both **Guest Checkout** and **Member Login**.
- **Order Tracking**: View order status (Pending → Approved → Completed).

### 🛡️ Admin Dashboard
- **Dashboard Overview**: Real-time visualization of Total Revenue, Total Orders, and Best Sellers.
- **Order Management**: View all orders, filter by status, and update statuses (Pending/Approved/Completed/Cancelled).
- **Product Management**: View product details and stock levels (Database ready).
- **Security**: Protected routes, JWT Authentication, and Role-Based Access Control (RBAC).

### 📸 Screenshots
<div align="center">
  <img src="screenshots/1.png" width="45%" alt="Menu Page" />
  <img src="screenshots/2.png" width="45%" alt="Cart Page" />
  <br/>
  <img src="screenshots/9.png" width="45%" alt="Admin Dashboard" />
  <img src="screenshots/13.png" width="45%" alt="Mobile View" />
</div>

---

### 🔧 Technical Highlights
- **Security First**: Rate limiting on auth routes, secure header management, and rigorous input validation.
- **Scalable Database**: Powered by **TiDB (MySQL compatible)**, fully normalized schema with Foreign Key constraints.
- **Performance**: Optimized frontend builds with Vite, backend connection pooling.
- **Type Safety**: Full **TypeScript** support across Client and Server.

---

## 🏗️ Architecture

### System Overview


```mermaid

graph TD
    User["User / Customer"] -->|"HTTPS"| Client["Client (React + Vite)"]
    Admin["Store Manager"] -->|"HTTPS"| Client

    Client -->|"REST API"| Server["Server (Express + Node.js)"]

    subgraph Backend["Backend Services"]
        Server -->|"Auth & Logic"| Controller["Controllers"]
        Controller -->|"Query"| DB[("TiDB / MySQL Cloud")]
    end

```

### Database Schema


```mermaid
erDiagram
    USERS ||--o{ ORDERS : places
    ORDERS ||--|{ ORDER_ITEMS : contains
    PRODUCTS ||--o{ ORDER_ITEMS : included_in

    USERS {
        int id PK
        string username
        string password_hash
        enum role "admin, customer"
    }

    PRODUCTS {
        int id PK
        string name
        decimal base_price
        string category
        int stock
        boolean is_active
    }

    ORDERS {
        int id PK
        int user_id FK "Nullable (Guest)"
        string customer_name
        enum status "pending, approved, completed, cancelled"
        decimal total_price
    }

    ORDER_ITEMS {
        int id PK
        int order_id FK
        int product_id FK
        int quantity
        decimal price_per_unit
        decimal sub_total
        json options_json
    }


```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **TiDB Cluster** (or local MySQL 8.0+)
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/coffee-ordering-system.git
cd coffee-ordering-system
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:
```env
PORT=3000
DB_HOST=your-tidb-host.tidbcloud.com
DB_PORT=4000
DB_USER=your-db-user.root
DB_PASSWORD=your-db-password
DB_NAME=coffee_db
JWT_SECRET=your_super_secret_jwt_key
CORS_ORIGINS=http://localhost:5173
```

Seed the database (Optional - requires DB connection):
```bash
npx ts-node src/seed.ts
```

Start the server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal:
```bash
cd client
npm install
```

Create a `.env` file in the `client` directory:
```env
VITE_API_URL=http://localhost:3000
```

Start the client:
```bash
npm run dev
```

Visit `http://localhost:5173` to view the app!

---

## 📂 Project Structure

```
coffee-ordering-system/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── api/           # Axios setup
│   │   ├── components/    # Reusable UI components
│   │   ├── content/       # Static content/context
│   │   ├── pages/         # Route pages (Menu, Cart, Admin)
│   │   └── types/         # TypeScript interfaces
│   └── ...
├── server/                 # Express Backend
│   ├── src/
│   │   ├── config/        # DB connection
│   │   ├── controllers/   # Business logic
│   │   ├── middleware/    # Auth & Rate limiters
│   │   ├── routes/        # API endpoints
│   │   └── seed.ts        # Database seeding script
│   └── database/          # SQL init scripts
└── ...
```

---

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
