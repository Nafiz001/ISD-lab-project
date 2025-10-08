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

// GET /api/products - Get all products with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const { category, sort, limit = 20, page = 1 } = req.query;
    
    let query = db.collection('products');
    
    // Filter by category
    if (category) {
      query = query.where('category', '==', category);
    }
    
    // Get all matching products
    const snapshot = await query.get();
    let products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Sort products
    if (sort === 'price') {
      products.sort((a, b) => a.price - b.price);
    } else if (sort === 'name') {
      products.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'rating') {
      products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sort === 'newest') {
      products.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB - dateA;
      });
    }
    
    // Pagination
    const totalProducts = products.length;
    const totalPages = Math.ceil(totalProducts / parseInt(limit));
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedProducts = products.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedProducts,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProducts
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

// GET /api/products/search - Search products
router.get('/search', async (req, res) => {
  try {
    const { q, category, minPrice, maxPrice } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Search query is required' }
      });
    }
    
    let query = db.collection('products');
    
    // Filter by category
    if (category) {
      query = query.where('category', '==', category);
    }
    
    const snapshot = await query.get();
    let products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Search by name (case-insensitive)
    const searchTerm = q.toLowerCase();
    products = products.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.description?.toLowerCase().includes(searchTerm)
    );
    
    // Filter by price range
    if (minPrice) {
      products = products.filter(p => p.price >= parseFloat(minPrice));
    }
    if (maxPrice) {
      products = products.filter(p => p.price <= parseFloat(maxPrice));
    }
    
    res.json({
      success: true,
      data: products,
      count: products.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

// GET /api/products/:id - Get single product
router.get('/:id', async (req, res) => {
  try {
    const productDoc = await db.collection('products').doc(req.params.id).get();
    
    if (!productDoc.exists) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Product not found' }
      });
    }
    
    res.json({
      success: true,
      data: {
        id: productDoc.id,
        ...productDoc.data()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

// POST /api/products - Create product (Admin only)
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, price, category, image, stock, description } = req.body;
    
    // Validation
    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Name, price, and category are required' }
      });
    }
    
    const productData = {
      name,
      price: parseFloat(price),
      category,
      image: image || '',
      stock: parseInt(stock) || 0,
      description: description || '',
      rating: 0,
      reviews: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await db.collection('products').add(productData);
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: {
        id: docRef.id,
        ...productData
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

// PUT /api/products/:id - Update product (Admin only)
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const productRef = db.collection('products').doc(req.params.id);
    const productDoc = await productRef.get();
    
    if (!productDoc.exists) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Product not found' }
      });
    }
    
    const updateData = {
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // Convert price and stock to numbers if provided
    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.stock) updateData.stock = parseInt(updateData.stock);
    
    await productRef.update(updateData);
    
    res.json({
      success: true,
      message: 'Product updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

// DELETE /api/products/:id - Delete product (Admin only)
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const productRef = db.collection('products').doc(req.params.id);
    const productDoc = await productRef.get();
    
    if (!productDoc.exists) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Product not found' }
      });
    }
    
    await productRef.delete();
    
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

module.exports = router;
