# Quick Start Guide - Payment Integration

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 2: Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your credentials
# For testing, use bKash sandbox credentials
```

### Step 3: Start Backend Server

```bash
# In backend folder
npm run dev
```

Server will run on http://localhost:5000

### Step 4: Start Frontend

```bash
# In root folder
npm start
```

Frontend will run on http://localhost:3000

### Step 5: Test Payment

1. Add products to cart
2. Go to checkout
3. Select "Pay with bKash"
4. Fill in billing information
5. Click "Place Order"
6. Complete payment on bKash sandbox

**Test Credentials:**
- OTP: 1234
- PIN: 12345

## ✅ Verification

Visit these URLs to verify:
- Backend Health: http://localhost:5000/api/health
- Payment API: http://localhost:5000/api/payment/status

## 📝 Next Steps

1. Get production bKash credentials from [bKash Developer Portal](https://developer.bka.sh/)
2. Update `.env` with production credentials
3. Deploy backend to production server
4. Update frontend with production API URL
5. Test complete payment flow

## 🆘 Need Help?

See full documentation: [PAYMENT_INTEGRATION.md](./PAYMENT_INTEGRATION.md)

## 🎯 Features Available

✅ bKash Payment Gateway  
✅ Cash on Delivery  
✅ Order Management  
✅ Payment Tracking  
✅ Refund Support  
✅ Webhook Integration  
✅ Real-time Status Updates  
