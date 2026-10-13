# ValueLife Essentials — Modern Organic E-Commerce Platform

A high-performance, modular, full-stack e-commerce architecture powering [ValueLife Essentials](https://valuelifeessentials.com). Engineered with a decoupled React 19 storefront, a dedicated standalone Admin Control Center, and an enterprise-grade Express.js REST API with MySQL persistence.

---

## 🏗️ Project Architecture

```
tree-website/
├── admin/                         # 🛡️ Standalone Admin Control Center (React / Vite)
│   ├── src/
│   │   ├── api/                   # Admin API client & endpoint resolvers
│   │   ├── components/admin/      # Modular tabs (Banners, Catalog, Orders, Settings)
│   │   ├── hooks/                 # Data synchronization hooks
│   │   └── utils/                 # Metrics & data formatting utilities
│   ├── package.json
│   └── vite.config.js
│
├── server/                        # ⚡ Scalable Express API Gateway
│   ├── config/                    # Database connection pool, SMTP, env validation
│   ├── controllers/               # Business logic controllers (Cart, Orders, Auth)
│   ├── middleware/                # Rate limiter, JWT auth, asyncHandler, errorHandler
│   ├── routes/                    # Modular kebab-case REST routers
│   ├── services/                  # SMS gateway, Shiprocket, Payment adapters
│   ├── utils/                     # Password hashing, SKU generator, audit logs
│   ├── index.cjs                  # Server bootstrap & lifecycle manager
│   └── package.json
│
├── src/                           # 🌿 Customer Storefront (React 19 / Vite / Tailwind)
│   ├── api/                       # API client and proxy resolvers
│   ├── assets/                    # Optimized logos and branding vectors
│   ├── components/                # Domain-Modular UI Components
│   │   ├── auth/                  # Customer login, OTP verification, profile
│   │   ├── blog/                  # Wellness journal listings and articles
│   │   ├── cart/                  # Cart drawer, cross-sell, price summary
│   │   ├── checkout/              # One-page checkout modal & form
│   │   ├── common/                # ErrorBoundary, BrandLoader, ProductCard
│   │   ├── layout/                # Header, MegaMenu, Footer, MobileBottomNav
│   │   ├── payment/               # Multi-gateway selection and UPI modals
│   │   ├── product/               # CatalogView, ProductDetailPage, Gallery
│   │   ├── profile/               # Customer account tabs & address management
│   │   └── sections/              # Homepage Hero, CategorySlider, Story, etc.
│   ├── config/                    # Centralized env resolver (env.js)
│   ├── context/                   # Centralized React State Management
│   │   ├── AuthContext.jsx        # Customer authentication & saved addresses
│   │   ├── CartContext.jsx        # Cart items, quantities, backend sync
│   │   ├── WishlistContext.jsx    # Wishlist toggle and local storage
│   │   ├── ShopContext.jsx        # Store settings, currency, active catalog
│   │   ├── CheckoutContext.jsx    # Order placement, payments, coupons
│   │   └── ToastContext.jsx       # Global notification toasts
│   ├── hooks/                     # Custom hooks exposing business logic
│   ├── services/                  # Network services (catalogService, orderService)
│   ├── utils/                     # Price calculation, weight parser, filter matchers
│   ├── App.jsx                    # Root composition shell with provider nesting
│   └── main.jsx                   # React entry point with global ErrorBoundary
│
├── docs/                          # 📚 Engineering Documentation
│   ├── ARCHITECTURE.md            # System architecture, state flow & layer diagrams
│   ├── API_REFERENCE.md           # Complete REST API endpoint reference
│   ├── ENVIRONMENT.md             # Complete list of environment variables
│   └── CODING_STANDARDS.md        # File naming & architectural standards
│
└── scratch/                       # 🧪 Maintenance and data migration scripts
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** v18+ or v20+ LTS
- **npm** v9+

### 2. Installation
```bash
# Install root dependencies
npm install

# Install admin dependencies
npm install --prefix admin

# Install server dependencies
npm install --prefix server
```

### 3. Environment Setup
Copy the example files and configure your credentials:
```bash
cp .env.example .env
cp server/.env.example server/.env
cp admin/.env.example admin/.env
```
Refer to [`docs/ENVIRONMENT.md`](./docs/ENVIRONMENT.md) for details on each variable.

### 4. Running Locally
```bash
# Run both Storefront (port 5173) and Backend API (port 5000) concurrently:
npm run dev

# Or run API server only:
npm run server

# Or run Storefront Vite client only:
npm run client

# Run standalone Admin panel:
npm run dev --prefix admin
```

---

## 🛡️ Key Architectural Principles

1. **Clean Separation of Concerns**: UI components never contain inline API calls or complex state logic; all domain actions are handled by clean React Contexts (`useCart`, `useAuth`, `useShop`, `useCheckout`).
2. **Defensive Error Handling**: Double-layered Error Boundaries (`ErrorBoundary` at root, `SectionErrorBoundary` per view) ensure that partial failures never break the entire storefront.
3. **Resilient API Architecture**: Asynchronous Express route handlers are protected with `asyncHandler`, piping unexpected exceptions directly to a centralized, structured JSON error handler.
4. **Environment Isolation**: All configuration is isolated in dedicated config files (`src/config/env.js`, `server/config/env.cjs`) with automatic production domain fallbacks.

---

## 📖 Documentation Index

- [System Architecture & State Management](./docs/ARCHITECTURE.md)
- [REST API Reference & Contract](./docs/API_REFERENCE.md)
- [Environment Variables Configuration](./docs/ENVIRONMENT.md)
- [Coding Standards & Conventions](./docs/CODING_STANDARDS.md)

---

## 🔒 License
Proprietary — ValueLife Essentials. All rights reserved.
