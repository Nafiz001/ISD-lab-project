// UddoktaPay Payment Service
const UDDOKTAPAY_CONFIG = {
  baseURL: 'https://shopcircuitbd.paymently.io/api',
  apiKey: 'O7rRhKCAnT85ZD1qbg4mL1MOWjL2jvwUSXmtuGlq',
  endpoints: {
    checkout_v1: '/checkout',           // Standard checkout integration
    checkout_v2: '/checkout-v2',        // Enhanced checkout with more features
    verify_payment: '/verify-payment'   // Payment verification (compatible with all versions)
  },
  defaultVersion: 'v2' // Use v2 by default for enhanced features
};

/**
 * Create a payment charge using UddoktaPay API
 * @param {Object} paymentData - Payment information
 * @param {string} paymentData.full_name - Customer's full name
 * @param {string} paymentData.email - Customer's email
 * @param {string} paymentData.amount - Payment amount
 * @param {Object} paymentData.metadata - Additional project-specific data
 * @param {string} paymentData.redirect_url - Base URL for success/failure redirects
 * @param {string} paymentData.cancel_url - URL for canceled transactions
 * @param {string} paymentData.webhook_url - Optional IPN callback URL
 * @param {string} paymentData.return_type - Optional: "POST" (default) or "GET"
 * @param {string} version - API version to use ('v1' or 'v2'), defaults to v2
 * @returns {Promise<Object>} Payment response with payment_url
 */
export const createPaymentCharge = async (paymentData, version = 'v2') => {
  try {
    // Select the appropriate endpoint based on version
    const endpoint = version === 'v1' 
      ? UDDOKTAPAY_CONFIG.endpoints.checkout_v1 
      : UDDOKTAPAY_CONFIG.endpoints.checkout_v2;

    console.log(`Creating payment charge using API ${version.toUpperCase()} - ${endpoint}`);

    const requestPayload = {
      full_name: paymentData.full_name,
      email: paymentData.email,
      amount: paymentData.amount.toString(),
      metadata: paymentData.metadata || {},
      redirect_url: paymentData.redirect_url,
      cancel_url: paymentData.cancel_url,
      webhook_url: paymentData.webhook_url,
      return_type: paymentData.return_type || 'POST'
    };

    // Add v2-specific features if using v2
    if (version === 'v2') {
      // V2 supports additional features like custom styling, payment method restrictions, etc.
      if (paymentData.payment_methods) {
        requestPayload.payment_methods = paymentData.payment_methods;
      }
      if (paymentData.custom_data) {
        requestPayload.custom_data = paymentData.custom_data;
      }
      if (paymentData.expires_at) {
        requestPayload.expires_at = paymentData.expires_at;
      }
    }

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'RT-UDDOKTAPAY-API-KEY': UDDOKTAPAY_CONFIG.apiKey
      },
      body: JSON.stringify(requestPayload)
    };

    const response = await fetch(
      `${UDDOKTAPAY_CONFIG.baseURL}${endpoint}`,
      requestOptions
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.status) {
      throw new Error(data.message || 'Payment creation failed');
    }

    console.log(`Payment charge created successfully using API ${version.toUpperCase()}`);

    return {
      success: true,
      payment_url: data.payment_url,
      checkout_url: data.checkout_url || data.payment_url, // v2 might use checkout_url
      invoice_id: data.invoice_id,
      session_key: data.session_key,
      message: data.message,
      api_version: version
    };

  } catch (error) {
    console.error('UddoktaPay API Error:', error);
    return {
      success: false,
      error: error.message || 'Payment service unavailable',
      api_version: version
    };
  }
};

/**
 * Generate payment URLs for the application
 * @param {string} baseUrl - Application base URL (e.g., window.location.origin)
 * @returns {Object} URLs for success, failure, and cancel redirects
 */
export const generatePaymentUrls = (baseUrl = window.location.origin) => {
  const backendUrl = 'http://localhost:5000'; // In production, use environment variable
  
  return {
    success_url: `${baseUrl}/payment/success`,
    failure_url: `${baseUrl}/payment/fail`,
    cancel_url: `${baseUrl}/payment/cancel`,
    webhook_url: `${backendUrl}/api/payment/webhook` // Backend webhook endpoint
  };
};

/**
 * Prepare enhanced payment data for checkout (supports both v1 and v2)
 * @param {Object} orderData - Order information
 * @param {Object} customerData - Customer information
 * @param {number} totalAmount - Total payment amount
 * @param {Object} options - Additional options for v2
 * @returns {Object} Formatted payment data for UddoktaPay
 */
export const preparePaymentData = (orderData, customerData, totalAmount, options = {}) => {
  const urls = generatePaymentUrls();
  
  const basePaymentData = {
    full_name: customerData.name || customerData.full_name,
    email: customerData.email,
    amount: totalAmount.toFixed(2),
    metadata: {
      user_id: customerData.id || 'guest',
      order_id: orderData.id || Date.now().toString(),
      items_count: orderData.items?.length || 0,
      order_details: orderData
    },
    redirect_url: urls.success_url,
    cancel_url: urls.cancel_url,
    webhook_url: urls.webhook_url,
    return_type: 'POST'
  };

  // Add v2-specific enhancements if options are provided
  if (options.version === 'v2' || !options.version) {
    // Payment method restrictions
    if (options.allowedPaymentMethods) {
      basePaymentData.payment_methods = options.allowedPaymentMethods;
    }

    // Custom expiration time (for time-sensitive orders)
    if (options.expiresInMinutes) {
      const expirationDate = new Date();
      expirationDate.setMinutes(expirationDate.getMinutes() + options.expiresInMinutes);
      basePaymentData.expires_at = expirationDate.toISOString();
    }

    // Custom data for advanced tracking
    if (options.customData) {
      basePaymentData.custom_data = options.customData;
    }

    // Order reference for easier tracking
    if (orderData.orderReference) {
      basePaymentData.reference = orderData.orderReference;
    }
  }

  return basePaymentData;
};

/**
 * Get information about available API versions and their features
 * @returns {Object} API version information
 */
export const getApiVersionInfo = () => {
  return {
    v1: {
      endpoint: UDDOKTAPAY_CONFIG.endpoints.checkout_v1,
      name: 'Standard Checkout Integration',
      features: [
        'Basic payment processing',
        'Standard redirect flow',
        'Basic metadata support',
        'Webhook notifications'
      ],
      limitations: [
        'Limited customization options',
        'No payment method restrictions',
        'No expiration time control'
      ]
    },
    v2: {
      endpoint: UDDOKTAPAY_CONFIG.endpoints.checkout_v2,
      name: 'Enhanced Checkout with More Features',
      features: [
        'All v1 features',
        'Payment method restrictions',
        'Custom expiration times',
        'Enhanced metadata support',
        'Custom data fields',
        'Order reference tracking',
        'Advanced styling options'
      ],
      limitations: [
        'Slightly more complex integration'
      ]
    },
    recommended: 'v2',
    verify_endpoint: UDDOKTAPAY_CONFIG.endpoints.verify_payment
  };
};

/**
 * Create payment with automatic API version selection
 * @param {Object} orderData - Order information
 * @param {Object} customerData - Customer information  
 * @param {number} totalAmount - Total amount
 * @param {Object} preferences - Payment preferences
 * @returns {Promise<Object>} Payment creation result
 */
export const createSmartPayment = async (orderData, customerData, totalAmount, preferences = {}) => {
  try {
    // Determine the best API version based on requirements
    let apiVersion = preferences.apiVersion || UDDOKTAPAY_CONFIG.defaultVersion;
    
    // Auto-select v2 if enhanced features are requested
    if (preferences.allowedPaymentMethods || 
        preferences.expiresInMinutes || 
        preferences.customData) {
      apiVersion = 'v2';
      console.log('Auto-selected API v2 for enhanced features');
    }

    // Prepare payment data with version-specific options
    const paymentData = preparePaymentData(orderData, customerData, totalAmount, {
      version: apiVersion,
      ...preferences
    });

    // Create the payment charge
    const result = await createPaymentCharge(paymentData, apiVersion);

    return {
      ...result,
      api_version_used: apiVersion,
      features_used: getApiVersionInfo()[apiVersion]?.features || []
    };

  } catch (error) {
    console.error('Smart payment creation failed:', error);
    return {
      success: false,
      error: error.message || 'Payment creation failed',
      api_version_used: preferences.apiVersion || 'unknown'
    };
  }
};

/**
 * Verify payment status using invoice_id
 * @param {string} invoiceId - The invoice ID received from payment gateway
 * @returns {Promise<Object>} Payment verification result
 */
export const verifyPayment = async (invoiceId) => {
  try {
    console.log('Verifying payment for invoice:', invoiceId);

    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const response = await fetch(`${UDDOKTAPAY_CONFIG.baseURL}${UDDOKTAPAY_CONFIG.endpoints.verify_payment}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'RT-UDDOKTAPAY-API-KEY': UDDOKTAPAY_CONFIG.apiKey
      },
      body: JSON.stringify({
        invoice_id: invoiceId
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId); // Clear timeout if request completes

    const result = await response.json();
    console.log('Payment verification response:', result);

    if (!response.ok) {
      throw new Error(result.message || 'Payment verification failed');
    }

    // Check if the payment verification was successful
    if (result.status === 'ERROR') {
      return {
        success: false,
        error: result.message || 'Payment verification failed',
        data: null
      };
    }

    return {
      success: true,
      data: {
        full_name: result.full_name,
        email: result.email,
        amount: result.amount,
        fee: result.fee,
        charged_amount: result.charged_amount,
        invoice_id: result.invoice_id,
        metadata: result.metadata,
        payment_method: result.payment_method,
        sender_number: result.sender_number,
        transaction_id: result.transaction_id,
        date: result.date,
        status: result.status, // COMPLETED, PENDING, or ERROR
        isPaid: result.status === 'COMPLETED'
      }
    };
  } catch (error) {
    console.error('Payment verification error:', error);
    
    // Handle different types of errors
    if (error.name === 'AbortError') {
      return {
        success: false,
        error: 'Payment verification timed out. Please try again or contact support.',
        data: null
      };
    }
    
    if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
      return {
        success: false,
        error: 'Network error during payment verification. Please check your connection.',
        data: null
      };
    }
    
    return {
      success: false,
      error: error.message || 'Failed to verify payment',
      data: null
    };
  }
};

/**
 * Check payment status with retry logic for pending payments
 * @param {string} invoiceId - The invoice ID to check
 * @param {number} maxRetries - Maximum number of retry attempts
 * @param {number} retryDelay - Delay between retries in milliseconds
 * @returns {Promise<Object>} Final payment status
 */
export const checkPaymentStatusWithRetry = async (invoiceId, maxRetries = 3, retryDelay = 5000) => {
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      const result = await verifyPayment(invoiceId);
      
      if (result.success && result.data) {
        // If payment is completed or failed, return immediately
        if (result.data.status === 'COMPLETED' || result.data.status === 'ERROR') {
          return result;
        }
        
        // If payment is still pending and we have more retries, wait and try again
        if (result.data.status === 'PENDING' && attempt < maxRetries - 1) {
          console.log(`Payment still pending, retrying in ${retryDelay/1000} seconds... (${attempt + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          attempt++;
          continue;
        }
        
        // Return the current status (pending) if no more retries
        return result;
      }
      
      // If verification failed, try again if we have retries left
      if (attempt < maxRetries - 1) {
        console.log(`Verification failed, retrying... (${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        attempt++;
        continue;
      }
      
      return result;
    } catch (error) {
      console.error(`Payment verification attempt ${attempt + 1} failed:`, error);
      
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        attempt++;
        continue;
      }
      
      return {
        success: false,
        error: error.message || 'Failed to verify payment after multiple attempts',
        data: null
      };
    }
  }
};

/**
 * Process checkout and redirect to payment gateway
 * @param {Object} checkoutData - Checkout information
 * @param {Object} checkoutData.orderId - Order ID
 * @param {number} checkoutData.amount - Payment amount
 * @param {Object} checkoutData.customerInfo - Customer information
 * @param {Array} checkoutData.items - Order items
 * @param {Object} preferences - Payment preferences (API version, restrictions, etc.)
 * @returns {Promise<Object>} Payment result with redirect URL
 */
export const processCheckout = async (checkoutData, preferences = {}) => {
  try {
    const orderData = {
      id: checkoutData.orderId || `ORDER_${Date.now()}`,
      items: checkoutData.items || [],
      total: checkoutData.amount,
      created_at: new Date().toISOString(),
      orderReference: checkoutData.orderReference
    };

    // Use smart payment creation with enhanced features
    const result = await createSmartPayment(
      orderData, 
      checkoutData.customerInfo, 
      checkoutData.amount, 
      preferences
    );

    if (result.success) {
      return {
        success: true,
        checkout_url: result.checkout_url || result.payment_url,
        payment_url: result.payment_url,
        invoice_id: result.invoice_id,
        session_key: result.session_key,
        api_version: result.api_version_used,
        message: result.message
      };
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Checkout process failed:', error);
    return {
      success: false,
      error: error.message || 'Checkout failed',
      message: 'Failed to initiate payment'
    };
  }
};

const paymentService = {
  createPaymentCharge,
  createSmartPayment,
  generatePaymentUrls,
  preparePaymentData,
  processCheckout,
  verifyPayment,
  checkPaymentStatusWithRetry,
  getApiVersionInfo,
  UDDOKTAPAY_CONFIG
};

export default paymentService;
