# ValueLife Essentials — REST API Reference

Base Production URL: `https://backend.valuelifeessentials.com`  
Local Development URL: `http://localhost:5000`

---

## 1. System & Health

### `GET /api/health`
Checks server uptime, health status, and store metadata.
- **Response `200 OK`**:
  ```json
  {
    "status": "online",
    "store": "ValueLife Essentials API",
    "timestamp": "2026-10-13T10:00:00.000Z",
    "uptime": 12450.2
  }
  ```

---

## 2. Catalog & Products

### `GET /api/products`
Retrieves products with optional category, collection, or search filtering.
- **Query Parameters**:
  - `category` (optional): Category slug (e.g. `cold-pressed-oils`)
  - `collection` (optional): Collection slug (e.g. `bestsellers`)
  - `search` (optional): Keyword search across title, tags, description, SKU
- **Response `200 OK`**:
  ```json
  [
    {
      "id": 1,
      "title": "Cold Pressed Mustard Oil",
      "slug": "cold-pressed-mustard-oil",
      "price_inr": 299,
      "discount_inr": 249,
      "stock": 50,
      "variants": [...]
    }
  ]
  ```

### `GET /api/products/slug/:slug`
Fetches a single product by its unique SEO slug.

### `GET /api/categories`
Fetches all active product categories.

### `GET /api/collections`
Fetches all product collections.

### `GET /api/banners`
Fetches promotional and hero banners.

### `GET /api/filter-groups`
Fetches dynamic filter groups for faceted catalog search.

---

## 3. Customer Authentication

### `POST /api/auth/send-otp`
Sends a 6-digit verification code to the customer's email or mobile number.
- **Payload**:
  ```json
  {
    "target": "+919876543210",
    "type": "login"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Verification code dispatched via SMS."
  }
  ```

### `POST /api/auth/verify-otp`
Verifies OTP code and returns authenticated session or auto-creates customer account.
- **Payload**:
  ```json
  {
    "target": "+919876543210",
    "otp": "123456"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "user": {
      "id": 142,
      "phone": "+919876543210",
      "name": "Customer Name",
      "email": "customer@gmail.com",
      "token": "jwt_token_here"
    }
  }
  ```

---

## 4. Cart & Wishlist

### `GET /api/cart?user_id=:id`
Fetches the persistent server cart for a logged-in user.

### `POST /api/cart`
Upserts a single item or syncs an entire items array.
- **Payload**:
  ```json
  {
    "user_id": 142,
    "items": [
      { "product_id": 1, "variant_id": 2, "quantity": 1 }
    ]
  }
  ```

### `DELETE /api/cart`
Removes a specific item or empties the cart.

### `GET /api/wishlist?user_id=:id`
Fetches customer wishlist items.

### `POST /api/wishlist`
Adds an item to the user's wishlist.

---

## 5. Orders & Payments

### `POST /api/orders`
Creates a new order in the system.
- **Payload**:
  ```json
  {
    "user_id": 142,
    "customer_name": "Hariom Bhati",
    "customer_email": "hariom@example.com",
    "customer_phone": "+919876543210",
    "shipping_address": "Flat 101, ValueLife Tower, Hyderabad, Telangana",
    "total_amount": 999,
    "paid_amount": 999,
    "payment_mode": "FULL",
    "payment_gateway": "razorpay",
    "items": [
      { "product_id": 1, "variant_id": 2, "quantity": 1, "price": 999 }
    ]
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "orderNumber": "VL-2026-10492",
    "order_id": 10492,
    "total_amount": 999
  }
  ```

### `POST /api/payment/razorpay/create-order`
Creates a Razorpay order on Razorpay servers.

### `POST /api/payment/razorpay/verify`
Verifies cryptographic HMAC SHA256 signature for Razorpay payments.

---

## 6. Error Response Standard

All errors adhere to this standard structure:
```json
{
  "success": false,
  "error": "Human readable error description",
  "code": "ERROR_CODE_IDENTIFIER",
  "path": "/api/requested/path",
  "timestamp": "2026-10-13T10:00:00.000Z"
}
```
