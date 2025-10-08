# bKash Payment Gateway Integration

## 🚀 Overview

This project now includes complete bKash payment gateway integration for processing online payments. The integration supports both sandbox (testing) and live environments.

## 📦 Components Added

### Frontend Components

1. **PaymentVerification.js** - Component for verifying payment status
2. **WebhookMonitor.js** - Real-time webhook event monitoring
3. **ApiInfoPanel.js** - Display API information and status
4. **BkashLogo.js** - bKash payment logo component
5. **paymentService.js** - Payment service utilities

### Backend Components

1. **server.js** - Express server for payment processing
2. **routes/payment.js** - bKash payment API routes
3. **.env.example** - Environment variables template

## 🔧 Setup Instructions

### 1. Backend Setup

#### Install Dependencies

```bash
cd backend
npm install
```

#### Configure Environment Variables

Copy `.env.example` to `.env` and fill in your bKash credentials:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# bKash Configuration
BKASH_BASE_URL=https://tokenized.sandbox.bka.sh/v1.2.0-beta
BKASH_APP_KEY=your_bkash_app_key
BKASH_APP_SECRET=your_bkash_app_secret
BKASH_USERNAME=your_bkash_username
BKASH_PASSWORD=your_bkash_password

# Firebase Configuration (for order management)
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email

# Callback URLs
FRONTEND_URL=http://localhost:3000
SUCCESS_CALLBACK_URL=http://localhost:3000/payment/success
FAILURE_CALLBACK_URL=http://localhost:3000/payment/fail
CANCEL_CALLBACK_URL=http://localhost:3000/payment/cancel
```

#### Start the Backend Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

### 2. Frontend Configuration

Update the API endpoint in your frontend code if needed:

```javascript
// src/utils/paymentService.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
```

## 🔐 bKash Credentials Setup

### Sandbox (Testing) Environment

1. Visit [bKash Developer Portal](https://developer.bka.sh/)
2. Register for a merchant account
3. Get sandbox credentials:
   - App Key
   - App Secret
   - Username
   - Password

### Production Environment

1. Contact bKash merchant support
2. Complete KYC verification
3. Get production credentials
4. Update `.env` with production URLs and credentials

## 💳 Payment Flow

### 1. Create Payment

```javascript
// User clicks "Pay with bKash"
POST /api/payment/create
Body: {
  amount: 1000,
  orderId: "ORD-123456",
  customerInfo: {
    name: "John Doe",
    email: "john@example.com",
    phone: "01712345678"
  }
}

Response: {
  paymentID: "TR0011abc123",
  bkashURL: "https://...",
  statusCode: "0000"
}
```

### 2. Execute Payment

```javascript
// After user completes payment on bKash
POST /api/payment/execute
Body: {
  paymentID: "TR0011abc123"
}

Response: {
  paymentID: "TR0011abc123",
  transactionStatus: "Completed",
  trxID: "8HJ16D8DL7"
}
```

### 3. Query Payment

```javascript
// Check payment status
GET /api/payment/query/:paymentID

Response: {
  paymentID: "TR0011abc123",
  trxID: "8HJ16D8DL7",
  transactionStatus: "Completed",
  amount: "1000",
  currency: "BDT"
}
```

### 4. Refund Payment (Optional)

```javascript
// Refund a transaction
POST /api/payment/refund
Body: {
  paymentID: "TR0011abc123",
  trxID: "8HJ16D8DL7",
  amount: "1000",
  reason: "Customer request"
}
```

## 🔄 Webhook Integration

The backend includes webhook endpoints for real-time payment notifications:

```javascript
// Webhook endpoint
POST /api/payment/webhook

// Automatically processes:
// - Payment success notifications
// - Payment failure notifications
// - Refund notifications
```

## 📱 Frontend Integration

### Checkout Page Integration

```javascript
import { createPayment } from '../utils/paymentService';

const handleBkashPayment = async () => {
  try {
    const paymentData = {
      amount: totalAmount,
      orderId: orderId,
      customerInfo: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone
      }
    };

    const response = await createPayment(paymentData);
    
    if (response.bkashURL) {
      // Redirect to bKash payment page
      window.location.href = response.bkashURL;
    }
  } catch (error) {
    console.error('Payment error:', error);
    toast.error('Payment failed. Please try again.');
  }
};
```

### Payment Callback Pages

#### Success Page (PaymentSuccess.js)
- Handles successful payment redirect
- Executes payment on bKash
- Updates order status
- Shows confirmation message

#### Failure Page (PaymentFail.js)
- Handles failed payment redirect
- Shows error message
- Provides retry option

#### Cancel Page (PaymentCancel.js)
- Handles cancelled payment
- Returns user to cart
- Preserves cart items

## 🛡️ Security Features

### Backend Security

1. **Token Management**
   - Automatic token generation
   - Token refresh on expiry
   - Secure token storage

2. **Request Validation**
   - Input sanitization
   - Amount validation
   - Order verification

3. **Webhook Security**
   - Signature verification
   - IP whitelisting
   - Replay attack prevention

### Frontend Security

1. **Data Protection**
   - No sensitive data in local storage
   - HTTPS only in production
   - CORS configuration

2. **User Authentication**
   - Login required for payment
   - Order ownership verification

## 📊 Database Schema

### Orders Collection

```javascript
{
  orderId: "ORD-1234567890",
  paymentInfo: {
    paymentID: "TR0011abc123",
    trxID: "8HJ16D8DL7",
    transactionStatus: "Completed",
    paymentMethod: "bkash",
    amount: 1000,
    currency: "BDT",
    paymentTime: Timestamp,
    customerMsisdn: "01712345678",
    merchantInvoiceNumber: "INV-123"
  },
  paymentStatus: "completed" | "pending" | "failed",
  // ... other order fields
}
```

## 🧪 Testing

### Test Credentials (Sandbox)

```
OTP: 1234
PIN: 12345
```

### Test Scenarios

1. **Successful Payment**
   - Create payment
   - Complete on bKash sandbox
   - Verify order status

2. **Failed Payment**
   - Create payment
   - Click cancel on bKash
   - Verify order remains pending

3. **Timeout Payment**
   - Create payment
   - Don't complete within 10 minutes
   - Verify payment expires

### Test Script

```bash
# Test create payment
curl -X POST http://localhost:5000/api/payment/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "orderId": "TEST-001",
    "customerInfo": {
      "name": "Test User",
      "email": "test@example.com",
      "phone": "01712345678"
    }
  }'
```

## 🐛 Troubleshooting

### Common Issues

#### 1. "Invalid credentials" error
**Solution**: Check if bKash credentials in `.env` are correct

#### 2. "Token expired" error
**Solution**: Token is automatically refreshed. If persists, restart backend server

#### 3. "Payment creation failed"
**Solution**: 
- Verify amount is valid (minimum 10 BDT)
- Check internet connectivity
- Verify bKash sandbox status

#### 4. "Callback URL not working"
**Solution**: 
- Ensure frontend and backend URLs are correct
- Check CORS configuration
- Verify callback routes exist

### Debug Mode

Enable debug logging in backend:

```javascript
// server.js
const DEBUG = true;

if (DEBUG) {
  console.log('Payment request:', paymentData);
  console.log('bKash response:', response.data);
}
```

## 📈 Monitoring

### Payment Metrics

Track these metrics in your admin dashboard:
- Total transactions
- Success rate
- Average transaction amount
- Failed payment reasons
- Refund rate

### Webhook Monitor Component

Use the `WebhookMonitor` component to see real-time webhook events:

```javascript
import WebhookMonitor from './components/WebhookMonitor';

// In AdminPanel
<WebhookMonitor />
```

## 🔒 Production Checklist

- [ ] Update to production bKash credentials
- [ ] Change BKASH_BASE_URL to production URL
- [ ] Enable HTTPS for all endpoints
- [ ] Set up SSL certificate
- [ ] Configure firewall rules
- [ ] Set up monitoring and alerts
- [ ] Enable webhook signature verification
- [ ] Test all payment flows
- [ ] Set up backup payment method
- [ ] Configure error logging
- [ ] Set up payment reconciliation
- [ ] Test refund process
- [ ] Verify callback URLs are accessible
- [ ] Set appropriate rate limits
- [ ] Enable audit logging

## 📚 API Documentation

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payment/create` | Create new payment |
| POST | `/api/payment/execute` | Execute payment after user approval |
| GET | `/api/payment/query/:paymentID` | Query payment status |
| POST | `/api/payment/refund` | Refund a transaction |
| POST | `/api/payment/webhook` | Receive webhook notifications |
| GET | `/api/payment/token` | Get authentication token (internal) |

### Response Codes

| Code | Description |
|------|-------------|
| 0000 | Success |
| 2001 | Invalid credentials |
| 2002 | Invalid amount |
| 2003 | Payment already processed |
| 2004 | Transaction not found |
| 2005 | Insufficient balance |
| 9999 | System error |

## 🔗 Resources

- [bKash Developer Documentation](https://developer.bka.sh/)
- [bKash API Reference](https://developer.bka.sh/reference)
- [Express.js Documentation](https://expressjs.com/)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)

## 📞 Support

For bKash integration support:
- Email: merchantservice@bka.sh
- Phone: 16247
- Portal: https://developer.bka.sh/

For application support:
- Create an issue on GitHub
- Email: support@yourdomain.com

## 📄 License

This payment integration is part of the ISD-lab-project.

---

**Version**: 1.0.0  
**Last Updated**: October 8, 2025  
**API Version**: bKash v1.2.0-beta
