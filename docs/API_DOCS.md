# UX-Ray AI - Complete API Documentation

## Base URL
- **Development**: `http://localhost:5000/api`
- **Production**: `https://your-render-domain.onrender.com/api`

## Authentication
All protected endpoints require:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

---

## AUTH ENDPOINTS

### 1. Signup
Create a new user account

**Endpoint:** `POST /auth/signup`

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "tokens": 0,
    "level": 1
  }
}
```

---

### 2. Login
Authenticate user

**Endpoint:** `POST /auth/login`

**Request:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "tokens": 50,
    "level": 2,
    "totalAnalyses": 5
  }
}
```

---

### 3. Get Profile
Retrieve current user information

**Endpoint:** `GET /auth/profile`

**Headers:** Requires Authorization

**Response:**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "tokens": 50,
    "level": 2,
    "totalAnalyses": 5,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### 4. Logout
Logout user (invalidate token)

**Endpoint:** `POST /auth/logout`

**Headers:** Requires Authorization

**Response:**
```json
{
  "message": "Logout successful"
}
```

---

## ANALYSIS ENDPOINTS

### 1. Analyze Website
Perform UX analysis on a website

**Endpoint:** `POST /analysis/analyze`

**Headers:** Requires Authorization

**Request:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "message": "Analysis completed successfully",
  "analysis": {
    "id": "507f1f77bcf86cd799439012",
    "scores": {
      "ux": 82,
      "conversion": 78,
      "trust": 85,
      "mobile": 90,
      "performance": 75,
      "accessibility": 88,
      "bestPractices": 86,
      "seo": 91
    },
    "issues": [
      "Low first contentful paint",
      "Missing alt text on images",
      "Unused CSS rules",
      "Unoptimized images"
    ],
    "suggestions": [
      "Enable text compression",
      "Add descriptive alt tags",
      "Remove unused CSS",
      "Optimize image sizes"
    ],
    "tokensEarned": 8
  },
  "userStats": {
    "tokens": 58,
    "level": 2,
    "totalAnalyses": 6
  }
}
```

**Error Response:**
```json
{
  "error": "Failed to analyze website",
  "details": "Error message from Google API"
}
```

---

### 2. Get Analysis History
Retrieve all analyses for user

**Endpoint:** `GET /analysis/history`

**Headers:** Requires Authorization

**Query Parameters:**
- `limit` (optional): Number of results (default: 50)
- `page` (optional): Page number for pagination

**Response:**
```json
{
  "analyses": [
    {
      "id": "507f1f77bcf86cd799439012",
      "url": "https://example.com",
      "scores": {
        "ux": 82,
        "conversion": 78,
        "trust": 85,
        "mobile": 90,
        "performance": 75,
        "accessibility": 88,
        "bestPractices": 86,
        "seo": 91
      },
      "tokensEarned": 8,
      "createdAt": "2024-01-20T14:30:00Z"
    }
  ]
}
```

---

### 3. Get Analysis Details
Get specific analysis details

**Endpoint:** `GET /analysis/detail/:analysisId`

**Headers:** Requires Authorization

**URL Parameters:**
- `analysisId`: MongoDB ObjectId of analysis

**Response:**
```json
{
  "analysis": {
    "id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "url": "https://example.com",
    "scores": {...},
    "issues": [...],
    "suggestions": [...],
    "pointsEarned": 8,
    "createdAt": "2024-01-20T14:30:00Z"
  }
}
```

---

## TOKEN ENDPOINTS

### 1. Get Token Balance
Retrieve user's token balance

**Endpoint:** `GET /tokens/balance`

**Headers:** Requires Authorization

**Response:**
```json
{
  "tokens": 58,
  "level": 2,
  "tokenValue": 5.80,
  "nextLevelTokens": 42,
  "totalAnalyses": 6
}
```

---

### 2. Redeem Tokens
Convert tokens to discount credits

**Endpoint:** `POST /tokens/redeem`

**Headers:** Requires Authorization

**Request:**
```json
{
  "tokensToRedeem": 50
}
```

**Response:**
```json
{
  "message": "Tokens redeemed successfully",
  "discountValue": 5.00,
  "remainingTokens": 8,
  "newLevel": 1
}
```

---

### 3. Get Leaderboard
View top users by tokens

**Endpoint:** `GET /tokens/leaderboard`

**Query Parameters:**
- `limit` (optional): Number of users (default: 10)

**Response:**
```json
{
  "leaderboard": [
    {
      "name": "Alice Johnson",
      "tokens": 500,
      "level": 5,
      "totalAnalyses": 50
    },
    {
      "name": "Bob Smith",
      "tokens": 350,
      "level": 3,
      "totalAnalyses": 35
    }
  ]
}
```

---

### 4. Add Bonus Tokens (Admin)
Add bonus tokens to user

**Endpoint:** `POST /tokens/bonus`

**Headers:** Requires Authorization

**Request:**
```json
{
  "tokensToAdd": 100
}
```

**Response:**
```json
{
  "message": "Bonus tokens added",
  "tokens": 158,
  "level": 2
}
```

---

## ORDER/E-COMMERCE ENDPOINTS

### 1. Get Products
Retrieve available products

**Endpoint:** `GET /orders/products`

**Query Parameters:**
- `category` (optional): Filter by category
- `limit` (optional): Number of products (default: 20)

**Response:**
```json
{
  "products": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Premium Analysis Report",
      "description": "Detailed UX report with recommendations",
      "price": 29.99,
      "category": "reports",
      "stock": 100,
      "rating": 4.5,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### 2. Create Order
Create new order

**Endpoint:** `POST /orders/create`

**Headers:** Requires Authorization

**Request:**
```json
{
  "items": [
    {
      "productId": "507f1f77bcf86cd799439013",
      "quantity": 2
    }
  ],
  "tokensToUse": 50
}
```

**Response:**
```json
{
  "message": "Order created successfully",
  "order": {
    "id": "507f1f77bcf86cd799439014",
    "totalPrice": 59.98,
    "discountAmount": 5.00,
    "finalPrice": 54.98,
    "paymentStatus": "pending"
  }
}
```

---

### 3. Process Payment
Complete payment for order

**Endpoint:** `POST /orders/payment`

**Headers:** Requires Authorization

**Request:**
```json
{
  "orderId": "507f1f77bcf86cd799439014",
  "paymentMethod": "stripe",
  "paymentMethodId": "pm_test_123456"
}
```

**Response:**
```json
{
  "message": "Payment processed successfully",
  "order": {
    "id": "507f1f77bcf86cd799439014",
    "status": "shipped",
    "paymentStatus": "completed",
    "finalPrice": 54.98
  }
}
```

---

### 4. Get My Orders
Retrieve user's orders

**Endpoint:** `GET /orders/my-orders`

**Headers:** Requires Authorization

**Response:**
```json
{
  "orders": [
    {
      "id": "507f1f77bcf86cd799439014",
      "items": [
        {
          "name": "Premium Analysis Report",
          "price": 29.99,
          "quantity": 2
        }
      ],
      "totalPrice": 59.98,
      "finalPrice": 54.98,
      "discountAmount": 5.00,
      "status": "shipped",
      "paymentStatus": "completed",
      "createdAt": "2024-01-20T15:00:00Z"
    }
  ]
}
```

---

### 5. Cancel Order
Cancel pending order

**Endpoint:** `DELETE /orders/cancel/:orderId`

**Headers:** Requires Authorization

**URL Parameters:**
- `orderId`: MongoDB ObjectId of order

**Response:**
```json
{
  "message": "Order cancelled successfully"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "All fields are required"
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid token"
}
```

### 403 Forbidden
```json
{
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "Error details"
}
```

---

## Scoring System

**UX Score** = (Performance × 0.4) + (Accessibility × 0.2) + (Best Practices × 0.2) + (SEO × 0.2)

**Conversion Score** = (Performance × 0.6) + (Best Practices × 0.4)

**Trust Score** = (Best Practices × 0.6) + (Accessibility × 0.4)

**Mobile Score** = (SEO × 0.6) + (Accessibility × 0.4)

---

## Gamification Mechanics

- **Tokens per Analysis**: 10 + (UX Score ÷ 10)
- **Level**: (Total Tokens ÷ 100) + 1
- **Token Value**: $0.10 per token
- **Leaderboard**: Top 10 users by total tokens

---

## Rate Limiting

Current limits (per minute):
- Auth endpoints: 5 requests
- Analysis: 2 requests
- General: 60 requests

---

## Webhooks

Stripe events:
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

---

For more info: support@uxray-ai.com
