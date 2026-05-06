# Quick Start Guide - UX-Ray AI

## 1. LOCAL DEVELOPMENT

### Install Dependencies
```bash
cd e:\Webtech
npm install
```

### Configure Environment
Create `.env` file with:
```
MONGODB_URI=mongodb://localhost:27017/uxrayai
JWT_SECRET=your-secret-key-change-in-prod
GOOGLE_API_KEY=AIxxxxxx_xxxxxxZ_dNXA
OPENAI_API_KEY=sk-proj-xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLIC_KEY=pk_test_xxx
PORT=5000
NODE_ENV=development
```

### Start MongoDB (if local)
```bash
mongod
```

### Run Development Server
```bash
npm run dev
```

### Access Application
- Frontend: http://localhost:5000
- Auth: http://localhost:5000/auth
- Dashboard: http://localhost:5000/dashboard

---

## 2. PRODUCTION DEPLOYMENT

### OPTION A: Deploy on Render (Recommended)

#### Backend Deployment
1. Push code to GitHub
2. Go to render.com → New Web Service
3. Select your repository
4. Configure:
   - Name: `uxrayai-backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `node server.js`
5. Add Environment Variables:
   - `MONGODB_URI`: MongoDB Atlas connection string
   - `JWT_SECRET`: Strong random string
   - `GOOGLE_API_KEY`: Your API key
   - `STRIPE_SECRET_KEY`: Stripe test/live key
6. Deploy

#### MongoDB Atlas Setup
1. Create account at mongodb.com/cloud/atlas
2. Create free cluster (M0)
3. Create database user
4. Get connection string
5. Whitelist IP: 0.0.0.0/0 (or your Render IP)

#### Update Frontend for Production
In `dashboard.js` and `auth.js`, update:
```javascript
const API_BASE = "https://uxrayai-backend.onrender.com/api";
```

---

### OPTION B: Deploy on Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create uxrayai-backend

# Set environment variables
heroku config:set MONGODB_URI=mongodb+srv://...
heroku config:set JWT_SECRET=your-secret
heroku config:set GOOGLE_API_KEY=your-key
heroku config:set STRIPE_SECRET_KEY=sk_test_xxx

# Deploy
git push heroku main
```

---

### OPTION C: Deploy Frontend on Vercel

1. Go to vercel.com
2. Import GitHub repository
3. Configure environment:
   - `REACT_APP_API_BASE=https://uxrayai-backend.onrender.com/api`
4. Deploy

---

## 3. STRIPE SETUP

### Test Mode
- Already configured with test keys
- Use card: `4242 4242 4242 4242`
- Any future date and CVC

### Production Mode
1. Go to stripe.com → Account Settings
2. Reveal live keys
3. Add to environment variables:
   ```
   STRIPE_SECRET_KEY=sk_live_xxxxx
   STRIPE_PUBLIC_KEY=pk_live_xxxxx
   ```

---

## 4. GOOGLE CLOUD API

### Setup PageSpeed API
1. Go to console.cloud.google.com
2. Create new project
3. Enable PageSpeed Insights API
4. Create API key
5. Add to `.env`

### Setup OpenAI API (Optional)
1. Go to openai.com → API Keys
2. Create new key
3. Add to `.env`

---

## 5. TESTING

### Test Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test Analysis
```bash
curl -X POST http://localhost:5000/api/analysis/analyze \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

### Test Products
```bash
curl http://localhost:5000/api/orders/products
```

---

## 6. MONITORING & LOGS

### Render Logs
```bash
# View real-time logs
# In Render dashboard → Logs tab
```

### MongoDB Monitoring
- Go to MongoDB Atlas → Monitoring
- Check performance and storage

### Error Debugging
- Check browser console (F12)
- Check server logs in terminal
- Enable verbose logging if needed

---

## 7. SCALING

### When You Need More
- Render: Upgrade to paid tier
- MongoDB: Switch to paid cluster
- Stripe: Increase rate limits

### Performance Optimization
- Enable caching headers
- Compress responses
- Optimize database queries
- Use CDN for static files

---

## 8. MAINTENANCE

### Regular Backups
- Enable MongoDB Atlas backup
- Export data monthly
- Store backups securely

### Security Updates
- Update npm packages: `npm update`
- Check for vulnerabilities: `npm audit`
- Rotate JWT secret periodically

### Monitoring
- Setup error tracking (Sentry)
- Monitor API response times
- Track user metrics

---

## Troubleshooting

### MongoDB Connection Issues
```
Error: connect ECONNREFUSED
→ Ensure MongoDB is running or check Atlas connection string
```

### CORS Errors
```
→ Add frontend URL to CORS whitelist in server.js
→ Ensure Authorization header is set correctly
```

### Token Expiration
```
→ Default: 7 days
→ Change in utils/helpers.js: generateToken()
```

### Payment Failures
```
→ Check Stripe API keys are correct
→ Verify webhook endpoints
→ Check test mode vs live mode
```

---

## Support

Need help? Check:
1. README.md
2. Server logs
3. MongoDB Atlas dashboard
4. Render monitoring
5. Stripe documentation

---

**Ready for Production** ✅
