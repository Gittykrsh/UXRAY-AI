# UX-Ray AI – AI Powered Website UX Analyzer

A comprehensive SaaS application that analyzes website user experience using Google Cloud APIs, with gamification, token rewards, and e-commerce integration.

## Features

✅ **UX Analysis Engine** - Real-time website analysis with custom scoring
✅ **User Authentication** - Secure signup/login with JWT tokens
✅ **Gamification System** - Users earn tokens and level up with each analysis
✅ **Analysis History** - Track previous analyses and scores
✅ **Leaderboard** - Competitive token rankings
✅ **E-Commerce Integration** - Purchase products using tokens as discounts
✅ **Payment Integration** - Stripe payment processing
✅ **Responsive Dashboard** - Modern UI with real-time updates

## Tech Stack

**Frontend:**
- HTML5, CSS3, JavaScript
- Chart.js for analytics visualization

**Backend:**
- Node.js & Express.js
- MongoDB for data persistence
- JWT for authentication
- Stripe for payments

**APIs:**
- Google PageSpeed Insights
- OpenAI (for enhanced suggestions)

## Local Setup

### 1. Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- npm or yarn

### 2. Installation

```bash
# Install dependencies
npm install

# Create .env file with your keys
cp .env.example .env

# Edit .env and add:
MONGODB_URI=mongodb://localhost:27017/uxrayai
JWT_SECRET=your-secret-key
GOOGLE_API_KEY=your-google-api-key
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLIC_KEY=pk_test_xxx
```

### 3. Run Locally

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start

# Server runs on http://localhost:5000
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/profile` - Get user profile

### Analysis
- `POST /api/analysis/analyze` - Analyze website
- `GET /api/analysis/history` - Get analysis history
- `GET /api/analysis/detail/:analysisId` - Get specific analysis

### Tokens & Rewards
- `GET /api/tokens/balance` - Get user tokens
- `POST /api/tokens/redeem` - Redeem tokens
- `GET /api/tokens/leaderboard` - Get top users
- `POST /api/tokens/bonus` - Add bonus tokens

### E-Commerce
- `GET /api/orders/products` - Get product list
- `POST /api/orders/create` - Create order
- `POST /api/orders/payment` - Process payment
- `GET /api/orders/my-orders` - Get user orders
- `DELETE /api/orders/cancel/:orderId` - Cancel order

## Database Schema

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  tokens: Number,
  level: Number,
  totalAnalyses: Number,
  analysisHistory: [ObjectId],
  createdAt: Date
}
```

### Analysis
```javascript
{
  userId: ObjectId,
  url: String,
  scores: {
    ux, conversion, trust, mobile,
    performance, accessibility, bestPractices, seo
  },
  issues: [String],
  suggestions: [String],
  pointsEarned: Number,
  createdAt: Date
}
```

### Order
```javascript
{
  userId: ObjectId,
  items: [{name, price, quantity}],
  totalPrice: Number,
  tokensUsed: Number,
  discountAmount: Number,
  finalPrice: Number,
  paymentStatus: String,
  status: String,
  createdAt: Date
}
```

## Deployment Guide

### Option 1: Deploy Backend on Render

1. Create Render account (render.com)
2. New → Web Service → Connect GitHub repo
3. Configure environment variables
4. Deploy

### Option 2: Deploy Backend on Heroku

```bash
heroku login
heroku create uxrayai-backend
heroku config:set MONGODB_URI=mongodb+srv://...
git push heroku main
```

### Option 3: Deploy Frontend on Vercel

1. Create Vercel account (vercel.com)
2. Import project from GitHub
3. Configure API endpoint to point to backend
4. Deploy

### MongoDB Atlas Setup

1. Create account at mongodb.com/cloud/atlas
2. Create cluster
3. Add user with credentials
4. Get connection string
5. Add to `.env` and deployment config

## Environment Variables

```env
# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/uxrayai

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Google APIs
GOOGLE_API_KEY=your-google-pagespeed-api-key

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLIC_KEY=pk_test_xxxxx

# Server
PORT=5000
NODE_ENV=production
```

## Testing

### Test API Locally

```bash
# Test signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"pass123"}'

# Test analysis
curl -X POST http://localhost:5000/api/analysis/analyze \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'
```

## Gamification Rules

- **Base Tokens**: 10 tokens per analysis
- **Bonus**: Additional tokens based on UX score (score/10)
- **Levels**: Level = (tokens / 100) + 1
- **Token Value**: Each token = $0.10 discount
- **Leaderboard**: Top 10 users by token count

## Features Implementation Status

✅ Backend Setup
✅ Authentication System
✅ UX Analysis Engine
✅ Token System
✅ E-Commerce
✅ Payment Processing
✅ Database Models
✅ API Routes
✅ Frontend Integration
✅ Deployment Config

## Future Enhancements

- [ ] Advanced AI suggestions using OpenAI
- [ ] Real-time notifications
- [ ] User analytics dashboard
- [ ] Custom branding for white-label
- [ ] Bulk URL analysis
- [ ] API rate limiting
- [ ] Email verification
- [ ] Two-factor authentication
- [ ] Export reports as PDF
- [ ] Team collaboration features

## Support & Documentation

- API Documentation: `/api/docs`
- User Guide: See `USER_GUIDE.md`
- Developer Guide: See `DEVELOPER_GUIDE.md`

## License

Proprietary - All rights reserved

## Contact

For inquiries: support@uxray-ai.com

---

**Status**: Fully Functional & Ready for Production Deployment
