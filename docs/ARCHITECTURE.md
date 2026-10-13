# ValueLife Essentials — System Architecture & Engineering Guide

## 1. High-Level Architecture Overview

ValueLife Essentials is architected as a modern, decoupled e-commerce platform designed for speed, security, and horizontal scalability.

```
                    +------------------------------------+
                    |        Customer Storefront         |
                    |       (React 19 / Vite / PWA)      |
                    +-----------------+------------------+
                                      | HTTPS REST API
                                      v
+-----------------------+     +-------------------------------+     +----------------------+
|  Admin Control Panel  | --> |     Express API Gateway       | <-- |  Mobile / PWA Users  |
| (React / Vite Admin)  |     |   (Modular Node.js Backend)   |     +----------------------+
+-----------------------+     +---------------+---------------+
                                              |
        +----------------------+--------------+-------------+----------------------+
        |                      |                            |                      |
        v                      v                            v                      v
+---------------+      +----------------+           +---------------+      +---------------+
| Hostinger DB  |      | Static Storage |           | Payment Rail  |      | Logistics Rail|
| (MySQL Pool)  |      | (/uploads CDN) |           | (Razorpay/COD)|      | (Shiprocket)  |
+---------------+      +----------------+           +---------------+      +---------------+
```

---

## 2. Monorepo Organization

```
tree-website/
├── admin/                         # Standalone Admin Portal
│   ├── src/
│   │   ├── api/                   # Admin API client and config
│   │   ├── components/admin/      # Modular tabs, modals, and tables
│   │   ├── hooks/                 # Admin data management hooks
│   │   └── utils/                 # Admin data transformers
│   ├── package.json
│   └── vite.config.js
│
├── server/                        # Express API Backend
│   ├── config/                    # Database pool, SMTP, constants, env validation
│   ├── controllers/               # Decoupled business logic controllers
│   ├── middleware/                # Auth, CORS, rate limiting, error handling
│   ├── routes/                    # Modular Express route routers
│   ├── services/                  # Third-party adapters (SMS, Payment, Shiprocket)
│   ├── utils/                     # Secure hashing, SKU generator, audit logs
│   ├── index.cjs                  # Server bootstrap & lifecycle manager
│   └── package.json
│
├── src/                           # Customer Storefront (Vite + React)
│   ├── api/                       # API client and proxy resolvers
│   ├── assets/                    # Static branding and media assets
│   ├── components/                # Pure UI Components (Categorized by Domain)
│   │   ├── auth/                  # Customer login, OTP modal, profile view
│   │   ├── blog/                  # Wellness journal listings and articles
│   │   ├── cart/                  # Cart drawer, cross-sell, price summary
│   │   ├── checkout/              # One-page checkout modal & form
│   │   ├── common/                # ErrorBoundary, BrandLoader, ProductCard
│   │   ├── layout/                # Header, MegaMenu, Footer, MobileBottomNav
│   │   ├── payment/               # Multi-gateway selection and UPI modals
│   │   ├── product/               # CatalogView, ProductDetailPage, Gallery
│   │   ├── profile/               # Customer account tabs & address management
│   │   └── sections/              # Homepage Hero, CategorySlider, Story, etc.
│   ├── config/                    # Client-side environment resolver (env.js)
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
│   ├── App.jsx                    # Root composition shell
│   └── main.jsx                   # React entry point with global ErrorBoundary
│
├── docs/                          # Comprehensive Architecture & API Documentation
└── scratch/                       # Isolated test scripts and migration tools
```

---

## 3. State Management Architecture

State is managed through **Domain Context Providers** wrapped hierarchically around the application:

1. **`ToastProvider`**: Provides non-blocking notifications across the UI.
2. **`AuthProvider`**: Manages `currentUser`, customer sessions, address sync, and authentication modals.
3. **`ShopProvider`**: Holds global catalog data (banners, categories, products, currency switchers, store settings, and maintenance mode).
4. **`CartProvider`**: Handles cart items, price calculations, quantity mutations, and automatic synchronization with the backend (`/api/cart`).
5. **`WishlistProvider`**: Handles customer wishlist items and persistence (`/api/wishlist`).
6. **`CheckoutProvider`**: Orchestrates checkout workflows, coupon validations, payment gateway selection, and order finalization.

### Data Flow Pattern

```
UI Component (e.g. ProductCard)
       |
       v
Action Dispatch (e.g. addToCart(product))
       |
       v
CartContext / useCart
       |
       +---> LocalStorage ('organic_cart')
       |
       +---> Toast Notification ('Added to Cart')
       |
       v
Backend Cart Sync (/api/cart) [for logged-in customer]
```

---

## 4. Error Handling Strategy

1. **Root ErrorBoundary**: Located in `src/components/common/ErrorBoundary.jsx` and wrapped in `main.jsx`. Catches any uncaught React rendering crashes and displays a branded, graceful recovery screen.
2. **Section ErrorBoundary**: Located in `src/components/common/SectionErrorBoundary.jsx`. Wraps individual views and sections so an isolated failure never crashes the full page.
3. **API Client Normalization**: Located in `src/services/apiClient.js`. Catches network timeouts, HTTP error statuses, and extracts clean user-friendly messages.
4. **Backend Centralized Handler**: Located in `server/middleware/errorHandler.cjs`. Normalizes all server errors into a standard JSON contract:
   ```json
   {
     "success": false,
     "error": "Error message",
     "code": "ERROR_CODE",
     "path": "/api/endpoint",
     "timestamp": "2026-10-13T10:00:00.000Z"
   }
   ```
5. **Async Route Wrapper**: `server/middleware/asyncHandler.cjs` wraps asynchronous Express handlers, ensuring unexpected promise rejections are automatically forwarded to `errorHandler`.
