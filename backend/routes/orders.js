const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

const db = admin.firestore();

// Middleware to verify Firebase ID token
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'No token provided' }
    });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Invalid token' }
    });
  }
};

// Middleware to verify admin
const verifyAdmin = async (req, res, next) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    
    if (!userDoc.exists || !userDoc.data().isAdmin) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Admin access required' }
      });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
};

// GET /api/orders - Get user's orders
router.get('/', verifyToken, async (req, res) => {
  try {
    const { status, limit = 20 } = req.query;
    
    let query = db.collection('orders')
      .where('userId', '==', req.user.uid)
      .orderBy('createdAt', 'desc');
    
    if (status) {
      query = query.where('status', '==', status);
    }
    
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    
    const snapshot = await query.get();
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

// GET /api/orders/:orderId - Get single order
router.get('/:orderId', verifyToken, async (req, res) => {
  try {
    const snapshot = await db.collection('orders')
      .where('orderId', '==', req.params.orderId)
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Order not found' }
      });
    }
    
    const orderDoc = snapshot.docs[0];
    const orderData = orderDoc.data();
    
    // Check if order belongs to user (unless admin)
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    const isAdmin = userDoc.exists && userDoc.data().isAdmin;
    
    if (orderData.userId !== req.user.uid && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Access denied' }
      });
    }
    
    res.json({
      success: true,
      data: {
        id: orderDoc.id,
        ...orderData
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

// POST /api/orders - Create new order
router.post('/', verifyToken, async (req, res) => {
  try {
    const { customerInfo, items, paymentMethod, total } = req.body;
    
    // Validation
    if (!customerInfo || !items || !paymentMethod || !total) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Missing required fields' }
      });
    }
    
    if (!items.length) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Order must contain at least one item' }
      });
    }
    
    // Check stock availability
    for (const item of items) {
      const productDoc = await db.collection('products').doc(item.id).get();
      
      if (!productDoc.exists) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: `Product ${item.name} not found` }
        });
      }
      
      const product = productDoc.data();
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          error: { code: 'OUT_OF_STOCK', message: `${item.name} is out of stock` }
        });
      }
    }
    
    // Generate order ID
    const orderId = `ORD-${Date.now()}`;
    
    // Create order
    const orderData = {
      orderId,
      userId: req.user.uid,
      customerInfo,
      items,
      subtotal: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      shippingCost: 100,
      total: parseFloat(total),
      paymentMethod,
      paymentStatus: 'pending',
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await db.collection('orders').add(orderData);
    
    // Update product stock
    const batch = db.batch();
    for (const item of items) {
      const productRef = db.collection('products').doc(item.id);
      batch.update(productRef, {
        stock: admin.firestore.FieldValue.increment(-item.quantity)
      });
    }
    await batch.commit();
    
    // Generate payment URL if bKash
    let paymentUrl = null;
    if (paymentMethod === 'bkash') {
      paymentUrl = `/payment/create?amount=${total}&orderId=${orderId}`;
    }
    
    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      orderId,
      paymentUrl
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

// PUT /api/orders/:orderId/cancel - Cancel order
router.put('/:orderId/cancel', verifyToken, async (req, res) => {
  try {
    const snapshot = await db.collection('orders')
      .where('orderId', '==', req.params.orderId)
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Order not found' }
      });
    }
    
    const orderDoc = snapshot.docs[0];
    const orderData = orderDoc.data();
    
    // Check if order belongs to user
    if (orderData.userId !== req.user.uid) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Access denied' }
      });
    }
    
    // Only pending orders can be cancelled
    if (orderData.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Only pending orders can be cancelled' }
      });
    }
    
    // Update order status
    await orderDoc.ref.update({
      status: 'cancelled',
      cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Restore product stock
    const batch = db.batch();
    for (const item of orderData.items) {
      const productRef = db.collection('products').doc(item.id);
      batch.update(productRef, {
        stock: admin.firestore.FieldValue.increment(item.quantity)
      });
    }
    await batch.commit();
    
    res.json({
      success: true,
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

// GET /api/orders/:orderId/track - Track order
router.get('/:orderId/track', async (req, res) => {
  try {
    const snapshot = await db.collection('orders')
      .where('orderId', '==', req.params.orderId)
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Order not found' }
      });
    }
    
    const orderData = snapshot.docs[0].data();
    
    // Build status timeline
    const timeline = [];
    
    if (orderData.createdAt) {
      timeline.push({
        status: 'pending',
        timestamp: orderData.createdAt.toDate()
      });
    }
    
    if (orderData.status === 'processing' || orderData.status === 'shipped' || orderData.status === 'delivered') {
      timeline.push({
        status: 'processing',
        timestamp: orderData.updatedAt?.toDate() || orderData.createdAt?.toDate()
      });
    }
    
    if (orderData.status === 'shipped' || orderData.status === 'delivered') {
      timeline.push({
        status: 'shipped',
        timestamp: orderData.shippedAt?.toDate() || orderData.updatedAt?.toDate()
      });
    }
    
    if (orderData.status === 'delivered') {
      timeline.push({
        status: 'delivered',
        timestamp: orderData.deliveredAt?.toDate() || orderData.updatedAt?.toDate()
      });
    }
    
    if (orderData.status === 'cancelled') {
      timeline.push({
        status: 'cancelled',
        timestamp: orderData.cancelledAt?.toDate()
      });
    }
    
    res.json({
      success: true,
      data: {
        orderId: orderData.orderId,
        status: orderData.status,
        trackingNumber: orderData.trackingNumber || null,
        estimatedDelivery: orderData.estimatedDelivery || null,
        timeline
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

// PUT /api/orders/:orderId/status - Update order status (Admin only)
router.put('/:orderId/status', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { status, trackingNumber } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Status is required' }
      });
    }
    
    const snapshot = await db.collection('orders')
      .where('orderId', '==', req.params.orderId)
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Order not found' }
      });
    }
    
    const updateData = {
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber;
    }
    
    if (status === 'shipped') {
      updateData.shippedAt = admin.firestore.FieldValue.serverTimestamp();
    }
    
    if (status === 'delivered') {
      updateData.deliveredAt = admin.firestore.FieldValue.serverTimestamp();
    }
    
    await snapshot.docs[0].ref.update(updateData);
    
    res.json({
      success: true,
      message: 'Order status updated'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

// GET /api/admin/orders - Get all orders (Admin only)
router.get('/admin/all', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { status, date, limit = 50 } = req.query;
    
    let query = db.collection('orders').orderBy('createdAt', 'desc');
    
    if (status) {
      query = query.where('status', '==', status);
    }
    
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    
    const snapshot = await query.get();
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

module.exports = router;
