# RESTful API Endpoints

## 🌐 Overview

Complete RESTful API documentation for the e-commerce platform with authentication, products, orders, cart, and payment endpoints.

## 🔗 Base URL

```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## 🔐 Authentication

All authenticated endpoints require a valid Firebase ID token in the Authorization header:

```
Authorization: Bearer <firebase-id-token>
```

---

## 📑 API Endpoints

### 🔑 Authentication Endpoints

#### 1. Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "phone": "+8801234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "uid": "user-uid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### 2. Login User
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "firebase-id-token",
  "user": {
    "uid": "user-uid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### 3. Logout User
```http
POST /api/auth/logout
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### 4. Reset Password
```http
POST /api/auth/reset-password
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

---

### 📦 Product Endpoints

#### 1. Get All Products
```http
GET /api/products
```

**Query Parameters:**
- `category` (optional): Filter by category
- `sort` (optional): Sort by (price, name, rating, newest)
- `limit` (optional): Number of products per page (default: 20)
- `page` (optional): Page number (default: 1)

**Example:**
```http
GET /api/products?category=electronics&sort=price&limit=10&page=1
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "product-1",
      "name": "Product Name",
      "price": 1000,
      "category": "electronics",
      "image": "image-url",
      "rating": 4.5,
      "stock": 50,
      "description": "Product description"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalProducts": 50
  }
}
```

#### 2. Get Single Product
```http
GET /api/products/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "product-1",
    "name": "Product Name",
    "price": 1000,
    "category": "electronics",
    "images": ["image1.jpg", "image2.jpg"],
    "rating": 4.5,
    "reviews": 120,
    "stock": 50,
    "description": "Detailed product description",
    "specifications": {
      "color": "Black",
      "size": "Medium"
    }
  }
}
```

#### 3. Search Products
```http
GET /api/products/search
```

**Query Parameters:**
- `q`: Search query (required)
- `category` (optional): Filter by category
- `minPrice` (optional): Minimum price
- `maxPrice` (optional): Maximum price

**Example:**
```http
GET /api/products/search?q=laptop&category=electronics&minPrice=500&maxPrice=2000
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "product-1",
      "name": "Laptop",
      "price": 1500,
      "category": "electronics"
    }
  ],
  "count": 1
}
```

#### 4. Create Product (Admin Only)
```http
POST /api/products
```

**Headers:**
```
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "New Product",
  "price": 1000,
  "category": "electronics",
  "image": "image-url",
  "stock": 50,
  "description": "Product description"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": "new-product-id",
    "name": "New Product"
  }
}
```

#### 5. Update Product (Admin Only)
```http
PUT /api/products/:id
```

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "price": 1200,
  "stock": 40
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product updated successfully"
}
```

#### 6. Delete Product (Admin Only)
```http
DELETE /api/products/:id
```

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

### 🛒 Cart Endpoints

#### 1. Get Cart
```http
GET /api/cart
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "product-1",
        "name": "Product Name",
        "price": 1000,
        "quantity": 2,
        "image": "image-url"
      }
    ],
    "subtotal": 2000,
    "itemCount": 2
  }
}
```

#### 2. Add to Cart
```http
POST /api/cart/add
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "productId": "product-1",
  "quantity": 2,
  "color": "Red" (optional)
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product added to cart",
  "cart": {
    "itemCount": 2,
    "subtotal": 2000
  }
}
```

#### 3. Update Cart Item
```http
PUT /api/cart/update
```

**Request Body:**
```json
{
  "productId": "product-1",
  "quantity": 3
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cart updated"
}
```

#### 4. Remove from Cart
```http
DELETE /api/cart/remove/:productId
```

**Response:**
```json
{
  "success": true,
  "message": "Item removed from cart"
}
```

#### 5. Clear Cart
```http
DELETE /api/cart/clear
```

**Response:**
```json
{
  "success": true,
  "message": "Cart cleared"
}
```

---

### 📋 Order Endpoints

#### 1. Get All Orders (User)
```http
GET /api/orders
```

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (optional): Filter by status
- `limit` (optional): Number of orders per page

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "orderId": "ORD-1234567890",
      "status": "pending",
      "total": 2100,
      "items": [...],
      "createdAt": "2025-10-08T10:00:00Z"
    }
  ]
}
```

#### 2. Get Single Order
```http
GET /api/orders/:orderId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "ORD-1234567890",
    "userId": "user-uid",
    "customerInfo": {...},
    "items": [...],
    "total": 2100,
    "status": "pending",
    "paymentMethod": "bkash",
    "createdAt": "2025-10-08T10:00:00Z"
  }
}
```

#### 3. Create Order
```http
POST /api/orders
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "customerInfo": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+8801234567890",
    "address": "123 Street, City",
    "city": "Dhaka",
    "postalCode": "1200"
  },
  "items": [
    {
      "id": "product-1",
      "name": "Product Name",
      "price": 1000,
      "quantity": 2
    }
  ],
  "paymentMethod": "bkash",
  "total": 2100
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order placed successfully",
  "orderId": "ORD-1234567890",
  "paymentUrl": "https://payment-gateway.com/pay/..."
}
```

#### 4. Cancel Order
```http
PUT /api/orders/:orderId/cancel
```

**Response:**
```json
{
  "success": true,
  "message": "Order cancelled successfully"
}
```

#### 5. Track Order
```http
GET /api/orders/:orderId/track
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "ORD-1234567890",
    "status": "shipped",
    "trackingNumber": "TRACK-123456",
    "estimatedDelivery": "2025-10-15",
    "timeline": [
      {
        "status": "pending",
        "timestamp": "2025-10-08T10:00:00Z"
      },
      {
        "status": "processing",
        "timestamp": "2025-10-09T14:00:00Z"
      },
      {
        "status": "shipped",
        "timestamp": "2025-10-10T09:00:00Z"
      }
    ]
  }
}
```

#### 6. Update Order Status (Admin Only)
```http
PUT /api/orders/:orderId/status
```

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "status": "processing",
  "trackingNumber": "TRACK-123456" (optional)
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order status updated"
}
```

---

### 💳 Payment Endpoints

#### 1. Create Payment (bKash)
```http
POST /api/payment/create
```

**Request Body:**
```json
{
  "amount": 2100,
  "orderId": "ORD-1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "paymentID": "TR0011abc123",
  "bkashURL": "https://checkout.sandbox.bka sh.com/payment/TR0011abc123"
}
```

#### 2. Execute Payment
```http
POST /api/payment/execute
```

**Request Body:**
```json
{
  "paymentID": "TR0011abc123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment completed",
  "transactionStatus": "Completed",
  "trxID": "8HJ16D8DL7"
}
```

#### 3. Query Payment
```http
GET /api/payment/query/:paymentID
```

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentID": "TR0011abc123",
    "transactionStatus": "Completed",
    "trxID": "8HJ16D8DL7",
    "amount": "2100"
  }
}
```

#### 4. Refund Payment
```http
POST /api/payment/refund
```

**Request Body:**
```json
{
  "paymentID": "TR0011abc123",
  "trxID": "8HJ16D8DL7",
  "amount": 2100,
  "reason": "Product defect"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Refund initiated",
  "refundTrxID": "REF123456"
}
```

#### 5. Payment Webhook
```http
POST /api/payment/webhook
```

**Request Body:**
```json
{
  "paymentID": "TR0011abc123",
  "transactionStatus": "Completed",
  "trxID": "8HJ16D8DL7"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Webhook processed"
}
```

---

### ❤️ Wishlist Endpoints

#### 1. Get Wishlist
```http
GET /api/wishlist
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "product-1",
      "name": "Product Name",
      "price": 1000,
      "image": "image-url"
    }
  ]
}
```

#### 2. Add to Wishlist
```http
POST /api/wishlist/add
```

**Request Body:**
```json
{
  "productId": "product-1"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Added to wishlist"
}
```

#### 3. Remove from Wishlist
```http
DELETE /api/wishlist/remove/:productId
```

**Response:**
```json
{
  "success": true,
  "message": "Removed from wishlist"
}
```

---

### 👤 User Endpoints

#### 1. Get User Profile
```http
GET /api/users/profile
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "uid": "user-uid",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+8801234567890",
    "address": "123 Street, City"
  }
}
```

#### 2. Update User Profile
```http
PUT /api/users/profile
```

**Request Body:**
```json
{
  "name": "Jane Doe",
  "phone": "+8809876543210",
  "address": "456 Avenue, City"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully"
}
```

#### 3. Change Password
```http
PUT /api/users/change-password
```

**Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### 📊 Admin Endpoints

#### 1. Get Dashboard Stats
```http
GET /api/admin/stats
```

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalOrders": 150,
    "totalRevenue": 500000,
    "totalProducts": 200,
    "totalUsers": 500,
    "pendingOrders": 20
  }
}
```

#### 2. Get All Users (Admin)
```http
GET /api/admin/users
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "uid": "user-1",
      "email": "user@example.com",
      "name": "John Doe",
      "isAdmin": false,
      "createdAt": "2025-01-01"
    }
  ]
}
```

#### 3. Get All Orders (Admin)
```http
GET /api/admin/orders
```

**Query Parameters:**
- `status`: Filter by status
- `date`: Filter by date
- `limit`: Results per page

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "orderId": "ORD-123",
      "userId": "user-1",
      "total": 2100,
      "status": "pending",
      "createdAt": "2025-10-08"
    }
  ]
}
```

---

## 🔥 Error Responses

### Standard Error Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid auth token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `SERVER_ERROR` | 500 | Internal server error |
| `PAYMENT_FAILED` | 402 | Payment processing failed |
| `OUT_OF_STOCK` | 400 | Product out of stock |

---

## 📡 Rate Limiting

- **Limit**: 100 requests per 15 minutes per IP
- **Response Header**: `X-RateLimit-Remaining`
- **Exceeded Response**:
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 900
  }
}
```

---

## 🧪 Testing with cURL

### Example: Get Products
```bash
curl -X GET "http://localhost:5000/api/products?category=electronics" \
  -H "Content-Type: application/json"
```

### Example: Create Order
```bash
curl -X POST "http://localhost:5000/api/orders" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerInfo": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+8801234567890",
      "address": "123 Street"
    },
    "items": [
      {
        "id": "product-1",
        "name": "Product",
        "price": 1000,
        "quantity": 2
      }
    ],
    "paymentMethod": "bkash",
    "total": 2100
  }'
```

---

## 📚 Postman Collection

Import this collection for easy API testing:

```json
{
  "info": {
    "name": "E-Commerce API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Authentication",
      "item": [...]
    },
    {
      "name": "Products",
      "item": [...]
    },
    {
      "name": "Orders",
      "item": [...]
    }
  ]
}
```

---

## 🔒 Security Best Practices

1. **Always use HTTPS** in production
2. **Validate all inputs** server-side
3. **Implement rate limiting**
4. **Use Firebase Security Rules**
5. **Never expose API keys** in client code
6. **Sanitize user inputs** to prevent XSS
7. **Use CORS** properly
8. **Log all API errors** for monitoring

---

## 📖 Additional Resources

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [bKash Payment Gateway](https://developer.bka sh.com/)
- [Express.js Guide](https://expressjs.com/)
- [REST API Best Practices](https://restfulapi.net/)

---

**Version**: 1.0.0  
**Last Updated**: October 8, 2025  
**Maintained By**: Development Team
