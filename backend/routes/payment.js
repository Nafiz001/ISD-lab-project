const express = require('express');
const axios = require('axios');
const router = express.Router();

// UddoktaPay configuration - using the same credentials as frontend
const UDDOKTAPAY_CONFIG = {
  baseURL: 'https://shopcircuitbd.paymently.io/api',
  apiKey: 'O7rRhKCAnT85ZD1qbg4mL1MOWjL2jvwUSXmtuGlq',
  endpoints: {
    checkout_v1: '/checkout',           // Standard checkout integration
    checkout_v2: '/checkout-v2',        // Enhanced checkout with more features
    verify_payment: '/verify-payment'   // Payment verification (compatible with all versions)
  }
};

// Store orders and webhook notifications (in production, use a database)
const pendingOrders = new Map();
const webhookLogs = [];

// Initiate payment
router.post('/initiate', async (req, res) => {
  try {
    const { orderId, amount, currency = 'BDT', customerInfo, paymentMethod } = req.body;

    if (!orderId || !amount || !customerInfo) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // For cash on delivery, no payment processing needed
    if (paymentMethod === 'cash') {
      return res.json({
        success: true,
        message: 'Cash on delivery order confirmed',
        orderId
      });
    }

    // Prepare payment data for Udokta Pay
    const paymentData = {
      full_name: `${customerInfo.firstName} ${customerInfo.lastName}`,
      email: customerInfo.email,
      amount: amount,
      payment_type: paymentMethod, // 'bkash' or 'nagad'
      redirect_url: `${process.env.FRONTEND_URL}/payment/success`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
      webhook_url: `${process.env.BACKEND_URL}/api/payment/webhook`,
      invoice_id: orderId,
      metadata: {
        orderId,
        customerInfo
      }
    };

    // Store order details temporarily
    pendingOrders.set(orderId, {
      ...paymentData,
      status: 'pending',
      createdAt: new Date()
    });

    // Make request to Udokta Pay
    const response = await axios.post(`${UDOKTA_BASE_URL}/api/checkout-v2`, paymentData, {
      headers: {
        'RT-UDOKTAPAY-API-KEY': UDOKTA_API_KEY,
        'RT-UDOKTAPAY-API-TOKEN': UDOKTA_API_TOKEN,
        'Content-Type': 'application/json'
      }
    });

    if (response.data && response.data.payment_url) {
      res.json({
        success: true,
        paymentUrl: response.data.payment_url,
        sessionKey: response.data.session_key,
        orderId
      });
    } else {
      throw new Error('Invalid response from payment gateway');
    }

  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate payment',
      error: error.message
    });
  }
});

// UddoktaPay webhook validation and processing
router.post('/webhook', (req, res) => {
  try {
    // Get the API key from the request headers
    const headerApiKey = req.headers['rt-uddoktapay-api-key'];

    // Verify the API key for security
    if (headerApiKey !== UDDOKTAPAY_CONFIG.apiKey) {
      console.log('Unauthorized webhook attempt with API key:', headerApiKey);
      return res.status(401).send('Unauthorized Action');
    }

    // Get webhook data from request body
    const webhookData = req.body;

    // Log the webhook data for debugging
    console.log('UddoktaPay Webhook Data Received:');
    console.log(JSON.stringify(webhookData, null, 2));

    // Store webhook notification for audit trail
    const webhookLog = {
      timestamp: new Date().toISOString(),
      data: webhookData,
      headers: req.headers,
      ip: req.ip || req.connection.remoteAddress
    };
    webhookLogs.push(webhookLog);

    // Extract payment information
    const {
      full_name,
      email,
      amount,
      fee,
      charged_amount,
      invoice_id,
      metadata,
      payment_method,
      sender_number,
      transaction_id,
      date,
      status
    } = webhookData;

    // Validate required fields
    if (!invoice_id || !status) {
      console.error('Invalid webhook data: missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook data: missing required fields'
      });
    }

    // Find the pending order using invoice_id or metadata
    let orderId = invoice_id;
    if (metadata && metadata.order_id) {
      orderId = metadata.order_id;
    }

    // Process the payment based on status
    if (status === 'COMPLETED') {
      console.log(`✅ Payment COMPLETED for invoice: ${invoice_id}`);
      
      // Store completed payment information
      const completedPayment = {
        invoice_id,
        transaction_id,
        amount,
        fee,
        charged_amount,
        payment_method,
        sender_number,
        customer_name: full_name,
        customer_email: email,
        status: 'COMPLETED',
        completed_at: date,
        metadata,
        webhook_received_at: new Date().toISOString()
      };

      // In production, you would:
      // 1. Update order status in database
      // 2. Update inventory
      // 3. Send confirmation email
      // 4. Trigger fulfillment process
      // 5. Update customer account

      pendingOrders.set(invoice_id, completedPayment);
      
      console.log(`Order ${orderId} marked as paid`);

    } else if (status === 'PENDING') {
      console.log(`⏳ Payment PENDING for invoice: ${invoice_id}`);
      
      // Update order with pending status
      const pendingPayment = {
        invoice_id,
        amount,
        payment_method,
        customer_name: full_name,
        customer_email: email,
        status: 'PENDING',
        metadata,
        webhook_received_at: new Date().toISOString()
      };

      pendingOrders.set(invoice_id, pendingPayment);

    } else if (status === 'ERROR' || status === 'FAILED') {
      console.log(`❌ Payment FAILED for invoice: ${invoice_id}`);
      
      // Handle failed payment
      const failedPayment = {
        invoice_id,
        amount,
        payment_method,
        customer_name: full_name,
        customer_email: email,
        status: 'FAILED',
        metadata,
        webhook_received_at: new Date().toISOString()
      };

      pendingOrders.set(invoice_id, failedPayment);
      
      // In production, you might:
      // 1. Send failure notification
      // 2. Release reserved inventory
      // 3. Log for manual review

    } else {
      console.log(`⚠️ Unknown payment status: ${status} for invoice: ${invoice_id}`);
    }

    // Respond to UddoktaPay that webhook was received successfully
    res.status(200).send('Webhook received successfully');

  } catch (error) {
    console.error('Webhook processing error:', error);
    
    // Log error for debugging
    webhookLogs.push({
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      headers: req.headers,
      body: req.body
    });

    res.status(500).json({
      success: false,
      message: 'Webhook processing failed'
    });
  }
});

// Verify payment status using UddoktaPay API
router.post('/verify', async (req, res) => {
  try {
    const { invoice_id } = req.body;

    if (!invoice_id) {
      return res.status(400).json({
        success: false,
        message: 'Invoice ID is required'
      });
    }

    // Call UddoktaPay verify API
    const response = await axios.post(`${UDDOKTAPAY_CONFIG.baseURL}${UDDOKTAPAY_CONFIG.endpoints.verify_payment}`, {
      invoice_id: invoice_id
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'RT-UDDOKTAPAY-API-KEY': UDDOKTAPAY_CONFIG.apiKey
      }
    });

    const verificationData = response.data;

    // Check if verification was successful
    if (verificationData.status === 'ERROR') {
      return res.status(400).json({
        success: false,
        message: verificationData.message || 'Payment verification failed'
      });
    }

    // Return verification result
    res.json({
      success: true,
      data: {
        full_name: verificationData.full_name,
        email: verificationData.email,
        amount: verificationData.amount,
        fee: verificationData.fee,
        charged_amount: verificationData.charged_amount,
        invoice_id: verificationData.invoice_id,
        metadata: verificationData.metadata,
        payment_method: verificationData.payment_method,
        sender_number: verificationData.sender_number,
        transaction_id: verificationData.transaction_id,
        date: verificationData.date,
        status: verificationData.status,
        isPaid: verificationData.status === 'COMPLETED'
      }
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.response?.data || error.message
    });
  }
});

// Get webhook logs (for admin/debugging purposes)
router.get('/webhooks/logs', (req, res) => {
  try {
    const { limit = 50 } = req.query;
    
    // Return recent webhook logs
    const recentLogs = webhookLogs
      .slice(-parseInt(limit))
      .reverse(); // Most recent first

    res.json({
      success: true,
      logs: recentLogs,
      total: webhookLogs.length
    });

  } catch (error) {
    console.error('Error fetching webhook logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch webhook logs'
    });
  }
});

// Get payment status by invoice ID
router.get('/status/:invoice_id', (req, res) => {
  try {
    const { invoice_id } = req.params;

    const payment = pendingOrders.get(invoice_id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      payment: {
        invoice_id: payment.invoice_id,
        status: payment.status,
        amount: payment.amount,
        payment_method: payment.payment_method,
        customer_name: payment.customer_name,
        customer_email: payment.customer_email,
        transaction_id: payment.transaction_id,
        completed_at: payment.completed_at,
        webhook_received_at: payment.webhook_received_at
      }
    });

  } catch (error) {
    console.error('Error fetching payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment status'
    });
  }
});

// Get API version information
router.get('/api-info', (req, res) => {
  res.json({
    success: true,
    api_info: {
      base_url: UDDOKTAPAY_CONFIG.baseURL,
      available_versions: {
        v1: {
          endpoint: UDDOKTAPAY_CONFIG.endpoints.checkout_v1,
          full_url: `${UDDOKTAPAY_CONFIG.baseURL}${UDDOKTAPAY_CONFIG.endpoints.checkout_v1}`,
          name: 'Standard checkout integration',
          features: [
            'bKash payment processing',
            'Standard redirect flow',
            'Basic metadata support',
            'Webhook notifications'
          ]
        },
        v2: {
          endpoint: UDDOKTAPAY_CONFIG.endpoints.checkout_v2,
          full_url: `${UDDOKTAPAY_CONFIG.baseURL}${UDDOKTAPAY_CONFIG.endpoints.checkout_v2}`,
          name: 'Enhanced checkout with more features',
          features: [
            'All v1 features',
            'bKash payment method restriction',
            'Custom expiration times',
            'Enhanced metadata support',
            'Advanced styling options'
          ]
        }
      },
      verify_payment: {
        endpoint: UDDOKTAPAY_CONFIG.endpoints.verify_payment,
        full_url: `${UDDOKTAPAY_CONFIG.baseURL}${UDDOKTAPAY_CONFIG.endpoints.verify_payment}`,
        name: 'Payment verification',
        compatibility: 'Compatible with all API versions'
      },
      recommended_version: 'v2'
    }
  });
});

// Health check for webhook endpoint
router.get('/webhook/health', (req, res) => {
  res.json({
    success: true,
    message: 'Webhook endpoint is healthy',
    timestamp: new Date().toISOString(),
    config: {
      baseURL: UDDOKTAPAY_CONFIG.baseURL,
      hasApiKey: !!UDDOKTAPAY_CONFIG.apiKey,
      endpoints: UDDOKTAPAY_CONFIG.endpoints
    }
  });
});

// Get payment methods
router.get('/methods', (req, res) => {
  res.json({
    success: true,
    methods: [
      {
        id: 'bkash',
        name: 'bKash',
        icon: '/bkash-logo.png',
        description: 'Pay with bKash mobile banking',
        color: '#E2136E'
      },
      {
        id: 'cash',
        name: 'Cash on Delivery',
        icon: '/cash-icon.png',
        description: 'Pay when you receive your order'
      }
    ]
  });
});

module.exports = router;
