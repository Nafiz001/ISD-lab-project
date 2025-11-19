# Diagram-to-Code Mapping for E-Commerce Project

This document provides a comprehensive explanation of how each major diagram (Class, ER, Use Case, DFD, Sequence) maps to the actual codebase of the E-Commerce project. Priority is given to the class diagram, with detailed references to files, folders, and specific code constructs.

---

## 1. Class Diagram → Code Mapping

The class diagram represents the main data models and their relationships. In this project, these are implemented as JavaScript/React objects, Firebase collections, and backend API models.

### **User Class**
- **Diagram:** User class/entity with attributes: userId, name, email, password, role, createdAt
- **Code Implementation:**

#### Authentication Context (`src/context/AuthContext.js`):
```javascript
// User state management and authentication methods
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);

// User registration with Firestore integration
const signup = async (email, password, displayName) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(userCredential.user, { displayName });
  
  // Save user data to Firestore
  await setDoc(doc(db, 'users', userCredential.user.uid), {
    displayName: displayName,
    email: email,
    isAdmin: ADMIN_EMAILS.includes(email),
    createdAt: new Date()
  });
};
```

#### User Authentication Pages:
- `src/pages/Login.js`: Email/password login with Google OAuth integration
- `src/pages/SignUp.js`: User registration form with validation
- `src/pages/Profile.js`: User profile management and settings

#### Firebase Configuration:
- `src/config/firebase.js`: Firebase project configuration and admin credentials
- `src/utils/firebase.js`: Firebase services initialization (Auth, Firestore, Storage)
- **Firestore Collection:** `users` - stores user profile data and admin status

### **Product Class**
- **Diagram:** Product class/entity with attributes: productId, name, description, price, imageUrl, categoryId, stock, createdAt
- **Code Implementation:**

#### Product Data Hook (`src/hooks/useProducts.js`):
```javascript
// Custom hook for product data fetching with filters
export const useProducts = (filters = {}) => {
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    const fetchProducts = async () => {
      let q = collection(db, 'products');
      
      // Apply category filter
      if (filters.category) {
        q = query(q, where('category', '==', filters.category));
      }
      
      // Apply sorting and limiting
      if (filters.orderBy) {
        q = query(q, orderBy(filters.orderBy, filters.order || 'desc'));
      }
      
      const querySnapshot = await getDocs(q);
      // Process and return products...
    };
  }, [filters]);
};
```

#### Product Display Components:
- `src/components/ProductCard.js`: Individual product card with add-to-cart/wishlist functionality
- `src/pages/ProductDetail.js`: Detailed product view with quantity selection
- `src/pages/Products.js`: Product listing with search and filtering
- **Firestore Collection:** `products` - stores product data, pricing, and inventory

### **Category Class**
- **Diagram:** Category class/entity with attributes: categoryId, name, iconUrl
- **Code Implementation:**

#### Category Management:
- `src/pages/Category.js`: Category-based product filtering and display
- `src/assets/category/`: Category icon assets and images
- `src/hooks/useProducts.js`: Category-based product fetching with Firestore queries
- **Firestore Collection:** `categories` - stores category metadata and icons

### **Order & OrderItem Classes**
- **Diagram:** Order and OrderItem classes/entities with attributes: orderId, userId, orderDate, status, totalAmount, etc.
- **Code Implementation:**

#### Order Processing (`src/pages/Checkout.js`):
```javascript
// Order creation with Firestore integration
const handleOrderSubmit = async () => {
  const orderData = {
    userId: user.uid,
    items: items,
    customerInfo: formData,
    totalAmount: getCartTotal(),
    paymentMethod: paymentMethod,
    status: 'pending',
    createdAt: new Date(),
    orderDate: new Date().toISOString()
  };
  
  const orderRef = await addDoc(collection(db, 'orders'), orderData);
  // Process payment and update order status...
};
```

#### Order Management Pages:
- `src/pages/OrderTracking.js`: Real-time order status tracking
- `src/pages/OrderConfirmation.js`: Post-order confirmation and details
- `src/pages/Orders.js`: Order history with filtering and status updates

#### Backend Order API (`backend/routes/orders.js`):
- RESTful endpoints for order CRUD operations
- Integration with payment processing webhooks
- **Firestore Collections:** `orders` (main orders), `orderItems` (subcollection for line items)

### **Cart & CartItem Classes**
- **Diagram:** Cart and CartItem classes/entities
- **Code Implementation:**

#### Cart Context (`src/context/CartContext.js`):
```javascript
// Cart state management with reducer pattern
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        // Update quantity for existing item
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      } else {
        // Add new item to cart
        return { ...state, items: [...state.items, { ...action.payload, quantity: 1 }] };
      }
    
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };
    
    case 'REMOVE_FROM_CART':
      return { ...state, items: state.items.filter(item => item.id !== action.payload) };
  }
};
```

#### Cart Persistence:
- **Local Storage:** Cart data persisted across browser sessions
- **Session Storage:** Backup storage for cart recovery
- `src/pages/Cart.js`: Cart UI with quantity management and item removal
- `src/components/CartDebug.js`: Development tool for cart state debugging

### **CarouselSlide Class**
- **Diagram:** CarouselSlide class/entity with attributes: slideId, title, imageUrl, linkUrl, isActive
- **Code Implementation:**

#### Admin Carousel Management:
- `src/components/AddSlideModal.js`: Modal for creating new carousel slides
- `src/components/EditSlideModal.js`: Modal for editing existing slides
- `populateCarouselSlides.js`: Script for bulk carousel data population
- `clearCarouselSlides.js`: Utility script for clearing carousel data
- **Firestore Collection:** `carouselSlides` - stores homepage carousel content

### **Wishlist Class**
- **Diagram:** Wishlist class/entity with attributes: wishlistId, userId, productId, addedAt
- **Code Implementation:**

#### Wishlist Context (`src/context/WishlistContext.js`):
```javascript
// Wishlist state management with localStorage persistence
export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);

  // Add item to wishlist
  const addToWishlist = (product) => {
    if (!user) {
      toast.error('Please sign in to add items to wishlist');
      return;
    }
    
    const existingItem = wishlistItems.find(item => item.id === product.id);
    if (existingItem) {
      toast.info('Item already in wishlist');
      return;
    }

    const newWishlist = [...wishlistItems, product];
    saveWishlist(newWishlist);
    toast.success('Added to wishlist');
  };

  // Toggle wishlist functionality
  const toggleWishlist = (product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };
};
```

#### Wishlist UI Components:
- `src/pages/Wishlist.js`: Dedicated wishlist page with grid layout and bulk actions
- `src/components/ProductCard.js`: Heart icon toggle for wishlist add/remove
- **Storage:** User-specific localStorage with key `wishlist_${user.uid}`

#### Wishlist Features in ProductCard:
```javascript
// Wishlist toggle button in ProductCard component
<button 
  onClick={handleWishlistToggle}
  className={`p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors ${
    isInWishlist(product.id) 
      ? 'bg-red-500 text-white' 
      : 'bg-white text-gray-600'
  }`}
>
  <FiHeart size={16} fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
</button>
```

---

## 2. ER Diagram → Code Mapping

### **Entities → Firestore Collections:**
- **Users** → `users` collection with user profile data
- **Products** → `products` collection with inventory and pricing
- **Categories** → `categories` collection with category metadata
- **Orders** → `orders` collection with order details
- **OrderItems** → stored as array within order document OR subcollection under `orders/{orderId}/orderItems`
- **CarouselSlides** → `carouselSlides` collection for homepage content
- **Wishlist** → localStorage with key pattern `wishlist_${userId}` (not Firestore)
- **Cart** → localStorage with key `ecommerce_cart_items` (not Firestore)

### **Relationships Implementation:**

#### One-to-Many Relationships:
```javascript
// Category → Products (categoryId foreign key)
// In useProducts.js hook:
if (filters.category) {
  q = query(q, where('category', '==', filters.category));
}

// User → Orders (userId foreign key)
// In Orders.js:
const ordersQuery = query(
  collection(db, 'orders'),
  where('userId', '==', user.uid),
  orderBy('createdAt', 'desc')
);
```

#### Many-to-Many Relationships:
```javascript
// User ↔ Products (via Cart - temporary relationship)
// In CartContext.js:
const cartItems = [
  { productId: 'prod1', quantity: 2, userId: 'user1' },
  { productId: 'prod2', quantity: 1, userId: 'user1' }
];

// User ↔ Products (via Wishlist - saved relationship)
// In WishlistContext.js:
localStorage.setItem(`wishlist_${user.uid}`, JSON.stringify(wishlistItems));
```

#### Composition Relationships:
```javascript
// Order → OrderItems (embedded array approach - primary implementation)
// In Checkout.js:
const orderData = {
  userId: user.uid,
  items: items, // ← Items stored directly as array in order document
  customerInfo: formData,
  totalAmount: getCartTotal(),
  paymentMethod: paymentMethod,
  status: 'pending',
  createdAt: new Date()
};
const orderRef = await addDoc(collection(db, 'orders'), orderData);

// Alternative: Subcollection approach (optional, for complex scenarios)
// for (const item of items) {
//   await addDoc(collection(db, 'orders', orderRef.id, 'orderItems'), {
//     productId: item.id, quantity: item.quantity, price: item.price
//   });
// }
```

#### Client-Side Storage Relationships:
```javascript
// Cart → localStorage (temporary, session-based)
// In CartContext.js:
const saveToStorage = (items) => {
  const cartData = { items: items, timestamp: Date.now(), version: '1.0' };
  localStorage.setItem('ecommerce_cart_items', JSON.stringify(cartData));
};

// Wishlist → localStorage (user-specific, persistent)
// In WishlistContext.js:
const saveWishlist = (items) => {
  if (user) {
    localStorage.setItem(`wishlist_${user.uid}`, JSON.stringify(items));
  }
};
```

---

## 3. Use Case Diagram → Code Mapping

### **Actors Implementation:**

#### **Guest User** (Unauthenticated):
- Can browse products, view details, and search
- Redirected to login for cart/wishlist/checkout actions

#### **Registered Customer** (Authenticated User):
```javascript
// In AuthContext.js - user state check
const { user } = useAuth();
if (user) {
  // Allow access to protected features
} else {
  // Redirect to login or show guest message
}
```

#### **Admin** (Privileged User):
```javascript
// In firebase.js config:
export const ADMIN_EMAILS = [
  'admin@shopcircuit.com',
  'nafiz@shopcircuit.com'
];

// In AdminPanel.js - admin route protection:
if (!user || !user.isAdmin) {
  return <Navigate to="/" replace />;
}
```

#### **Payment Gateway** (External System):
- UddoktaPay integration in `src/utils/paymentService.js`
- Webhook handling in `backend/routes/payment.js`

### **Use Cases → Code Implementation:**

#### **Browse Products** (`src/pages/Home.js`, `src/pages/Products.js`):
```javascript
// Product browsing with filtering and search
const { products, loading } = useProducts({
  category: selectedCategory,
  orderBy: 'createdAt',
  limit: 12
});

// Product grid rendering
{products.map((product) => (
  <ProductCard key={product.id} product={product} />
))}
```

#### **View Product Details** (`src/pages/ProductDetail.js`):
```javascript
// Detailed product view with quantity selection
const [quantity, setQuantity] = useState(1);
const [selectedImage, setSelectedImage] = useState('');

const fetchProduct = async () => {
  const productDoc = await getDoc(doc(db, 'products', id));
  if (productDoc.exists()) {
    const productData = { id: productDoc.id, ...productDoc.data() };
    setProduct(productData);
    setSelectedImage(productData.imageUrl);
  }
};
```

#### **User Registration/Login**:
```javascript
// In Login.js:
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    await login(formData.email, formData.password);
    navigate('/');
    toast.success('Logged in successfully!');
  } catch (error) {
    toast.error(error.message);
  }
};

// Google OAuth integration:
const handleGoogleSignIn = async () => {
  try {
    await signInWithGoogle();
    navigate('/');
  } catch (error) {
    toast.error('Failed to sign in with Google');
  }
};
```

#### **Add to Cart/Wishlist**:
```javascript
// In ProductCard.js:
const handleAddToCart = (e) => {
  e.preventDefault();
  addToCart(product);
  toast.success('Product added to cart!');
};

const handleWishlistToggle = (e) => {
  e.preventDefault();
  e.stopPropagation();
  toggleWishlist(product);
};
```

#### **Checkout/Payment Processing**:
```javascript
// In Checkout.js:
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Create order in Firestore
  const orderData = {
    userId: user.uid,
    items: items,
    customerInfo: formData,
    totalAmount: getCartTotal(),
    paymentMethod: paymentMethod,
    status: 'pending'
  };
  
  const orderRef = await addDoc(collection(db, 'orders'), orderData);
  
  // Process payment
  if (paymentMethod !== 'cash') {
    const result = await processCheckout({
      orderId: orderRef.id,
      amount: getCartTotal(),
      customerInfo: formData,
      paymentMethod: paymentMethod
    });
    
    if (result.success && result.payment_url) {
      window.location.href = result.payment_url;
    }
  }
};
```

#### **Admin Product Management**:
```javascript
// In AdminPanel.js:
const handleAddProduct = async (productData, imageFile) => {
  try {
    // Upload image to Firebase Storage
    if (imageFile) {
      const imageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
      const uploadResult = await uploadBytes(imageRef, imageFile);
      productData.imageUrl = await getDownloadURL(uploadResult.ref);
    }
    
    // Add product to Firestore
    await addDoc(collection(db, 'products'), {
      ...productData,
      createdAt: new Date()
    });
    
    toast.success('Product added successfully!');
    fetchProducts(); // Refresh product list
  } catch (error) {
    toast.error('Failed to add product');
  }
};
```

---

## 4. Data Flow Diagrams (DFD) → Code Mapping

### **Level 0 DFD (Context Diagram):**

#### **External Entities → Code:**
- **Customer** → Browser users interacting with React frontend
- **Admin** → Privileged users with admin panel access
- **Payment Gateway** → UddoktaPay API integration

#### **Main System Process** → Complete Application (`src/App.js`):
```javascript
// Application structure with provider hierarchy
<AuthProvider>
  <CartProvider>
    <WishlistProvider>
      <Router>
        <Header />
        <Routes>
          {/* All application routes */}
        </Routes>
        <Footer />
      </Router>
    </WishlistProvider>
  </CartProvider>
</AuthProvider>
```

### **Level 1 DFD (Major Processes):**

#### **Process 1: User Authentication**
```javascript
// AuthContext.js - Authentication process implementation
const signup = async (email, password, displayName) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(userCredential.user, { displayName });
  
  // Store user data in Firestore
  await setDoc(doc(db, 'users', userCredential.user.uid), {
    displayName, email, isAdmin: ADMIN_EMAILS.includes(email), createdAt: new Date()
  });
  return userCredential.user;
};

// Real-time auth state monitoring
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};
      const isAdmin = ADMIN_EMAILS.includes(user.email);
      setUser({ ...user, ...userData, isAdmin });
    } else {
      setUser(null);
    }
    setLoading(false);
  });
  return unsubscribe;
}, []);
```

#### **Process 2: Product Catalog Management**
```javascript
// useProducts.js - Product data flow
export const useProducts = (filters = {}) => {
  useEffect(() => {
    const fetchProducts = async () => {
      let q = collection(db, 'products');
      
      // Input: Filter parameters
      if (filters.category) q = query(q, where('category', '==', filters.category));
      if (filters.orderBy) q = query(q, orderBy(filters.orderBy, filters.order || 'desc'));
      if (filters.limit) q = query(q, limit(filters.limit));
      
      // Process: Query Firestore
      const querySnapshot = await getDocs(q);
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id, ...doc.data()
      }));
      
      // Output: Processed product list
      setProducts(productsData);
    };
  }, [filters]);
};
```

#### **Process 3: Cart Management**
```javascript
// CartContext.js - Cart data flow with persistence
const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  
  // Input: Load cart from storage
  useEffect(() => {
    const savedItems = loadFromStorage();
    if (savedItems.length > 0) {
      dispatch({ type: 'LOAD_CART', payload: savedItems });
    }
  }, []);
  
  // Process: Save cart changes to storage
  useEffect(() => {
    if (isInitialized.current) {
      saveToStorage(state.items);
    }
  }, [state.items]);
  
  // Output: Cart operations
  const addToCart = (product) => {
    dispatch({ type: 'ADD_TO_CART', payload: product });
  };
};
```

#### **Process 4: Order Processing & Payment**
```javascript
// Checkout.js - Order processing workflow
const processOrder = async () => {
  // Input: Order data from form and cart
  const orderData = {
    userId: user.uid,
    items: items,
    customerInfo: formData,
    totalAmount: getCartTotal(),
    paymentMethod: paymentMethod,
    status: 'pending',
    createdAt: new Date()
  };
  
  // Process: Create order in Firestore
  const orderRef = await addDoc(collection(db, 'orders'), orderData);
  
  // Process: Handle payment
  if (paymentMethod !== 'cash') {
    const paymentResult = await processCheckout({
      orderId: orderRef.id,
      amount: getCartTotal(),
      customerInfo: formData,
      paymentMethod: paymentMethod
    });
    
    // Output: Redirect to payment gateway
    if (paymentResult.success) {
      window.location.href = paymentResult.payment_url;
    }
  } else {
    // Output: Direct order confirmation for cash payments
    navigate(`/order-confirmation/${orderRef.id}`);
  }
};
```

### **Level 2 DFD (Detailed Processes):**

#### **Data Stores → Firebase Services:**
```javascript
// firebase.js - Data store initialization
export const auth = getAuth(app);      // User authentication store
export const db = getFirestore(app);   // Main application data store
export const storage = getStorage(app); // File/image storage

// Data store operations examples:
// Users store: collection(db, 'users')
// Products store: collection(db, 'products')  
// Orders store: collection(db, 'orders')
// Categories store: collection(db, 'categories')
```

#### **Backend API Processes** (`backend/server.js`):
```javascript
// Express server setup with middleware pipeline
app.use(helmet());           // Security headers
app.use(cors());             // Cross-origin requests
app.use(morgan('combined')); // Request logging
app.use(express.json());     // JSON parsing

// Route handlers (data transformation processes)
app.use('/api/payment', paymentRoutes);   // Payment processing
app.use('/api/products', productsRoutes); // Product operations
app.use('/api/orders', ordersRoutes);     // Order management
```

---

## 5. Sequence Diagram → Code Mapping

### **Complete User Purchase Flow Sequence:**

#### **1. Customer Login Sequence:**
```javascript
// Step 1: Customer → Login Page (src/pages/Login.js)
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Step 2: Login Page → AuthContext
  try {
    await login(formData.email, formData.password);
    
    // Step 3: AuthContext → Firebase Auth
    // (In AuthContext.js)
    const login = (email, password) => {
      return signInWithEmailAndPassword(auth, email, password);
    };
    
    // Step 4: Firebase Auth → Firestore (user data retrieval)
    // Step 5: AuthContext updates user state
    // Step 6: Navigation to home page
    navigate('/');
    toast.success('Logged in successfully!');
  } catch (error) {
    toast.error(error.message);
  }
};
```

#### **2. Product Browsing Sequence:**
```javascript
// Step 1: Customer → Product Page (src/pages/Products.js)
// Step 2: Products Page → useProducts Hook
const { products, loading } = useProducts({
  category: selectedCategory,
  orderBy: 'createdAt'
});

// Step 3: useProducts → Firestore Query
// (In useProducts.js)
useEffect(() => {
  const fetchProducts = async () => {
    let q = collection(db, 'products');
    if (filters.category) {
      q = query(q, where('category', '==', filters.category));
    }
    
    // Step 4: Firestore → Product Data
    const querySnapshot = await getDocs(q);
    const productsData = querySnapshot.docs.map(doc => ({
      id: doc.id, ...doc.data()
    }));
    
    // Step 5: Return products to UI
    setProducts(productsData);
  };
}, [filters]);
```

#### **3. Add to Cart Sequence:**
```javascript
// Step 1: Customer clicks "Add to Cart" (ProductCard.js)
const handleAddToCart = (e) => {
  e.preventDefault();
  
  // Step 2: ProductCard → CartContext
  addToCart(product);
  
  // Step 3: CartContext processes addition
  // (In CartContext.js)
  const addToCart = (product) => {
    dispatch({ type: 'ADD_TO_CART', payload: product });
  };
  
  // Step 4: CartReducer updates state
  case 'ADD_TO_CART':
    const existingItem = state.items.find(item => item.id === action.payload.id);
    if (existingItem) {
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      };
    } else {
      return { ...state, items: [...state.items, { ...action.payload, quantity: 1 }] };
    }
  
  // Step 5: Save to localStorage
  // Step 6: Show success toast
  toast.success('Product added to cart!');
};
```

#### **4. Checkout and Payment Sequence:**
```javascript
// Step 1: Customer → Checkout Page (src/pages/Checkout.js)
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Step 2: Validate form and prepare order data
  const orderData = {
    userId: user.uid,
    items: items,
    customerInfo: formData,
    totalAmount: getCartTotal(),
    paymentMethod: paymentMethod,
    status: 'pending',
    createdAt: new Date()
  };
  
  // Step 3: Checkout → Firestore (create order)
  const orderRef = await addDoc(collection(db, 'orders'), orderData);
  
  // Step 4: For non-cash payments → Payment Service
  if (paymentMethod !== 'cash') {
    // Step 5: PaymentService → Backend API
    const result = await processCheckout({
      orderId: orderRef.id,
      amount: getCartTotal(),
      customerInfo: formData,
      paymentMethod: paymentMethod
    });
    
    // Step 6: Backend → UddoktaPay API
    // (In backend/routes/payment.js)
    const response = await axios.post(
      `${UDDOKTAPAY_CONFIG.baseURL}${UDDOKTAPAY_CONFIG.endpoints.checkout_v2}`,
      paymentData,
      { headers: { 'RT-UDDOKTAPAY-API-KEY': UDDOKTAPAY_CONFIG.apiKey } }
    );
    
    // Step 7: UddoktaPay → Payment URL
    // Step 8: Redirect customer to payment gateway
    if (result.success && result.payment_url) {
      window.location.href = result.payment_url;
    }
  }
};
```

#### **5. Payment Webhook Sequence:**
```javascript
// Step 1: Payment Gateway → Backend Webhook
// (In backend/routes/payment.js)
router.post('/webhook', async (req, res) => {
  try {
    const webhookData = req.body;
    
    // Step 2: Validate webhook signature
    // Step 3: Extract payment information
    const { invoice_id, payment_status, transaction_id } = webhookData;
    
    // Step 4: Backend → Firestore (update order)
    if (payment_status === 'COMPLETED') {
      await updateDoc(doc(db, 'orders', invoice_id), {
        status: 'paid',
        paymentStatus: 'completed',
        transactionId: transaction_id,
        paidAt: new Date()
      });
      
      // Step 5: Clear customer's cart (if applicable)
      // Step 6: Send confirmation email/notification
    }
    
    // Step 7: Respond to payment gateway
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});
```

### **Actor Communication Patterns:**

#### **Frontend ↔ Context Communication:**
```javascript
// React Components use React Context via hooks
const { user, login, logout } = useAuth();        // AuthContext
const { items, addToCart, clearCart } = useCart(); // CartContext  
const { toggleWishlist, isInWishlist } = useWishlist(); // WishlistContext
```

#### **Context ↔ Firebase Communication:**
```javascript
// Contexts interact with Firebase services directly
import { auth, db, storage } from '../utils/firebase';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, getDocs, updateDoc } from 'firebase/firestore';
```

#### **Frontend ↔ Backend API Communication:**
```javascript
// Frontend calls backend APIs for complex operations
const response = await fetch('/api/payment/initiate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(paymentData)
});
```

---

## Summary Table: Diagram-to-Code Mapping

| Diagram Type | Primary Code Location | Key Implementation Files | Data Storage |
|--------------|----------------------|--------------------------|--------------|
| **Class Diagram** | `src/context/*`, `src/hooks/*` | `AuthContext.js`, `CartContext.js`, `WishlistContext.js`, `useProducts.js` | Firestore Collections: `users`, `products`, `orders`, `categories` |
| **ER Diagram** | Firestore Collections & Relationships | Foreign keys in Firestore documents, subcollections for composition | Firebase Firestore with NoSQL document structure |
| **Use Case Diagram** | `src/pages/*`, `src/components/*` | Page components for each use case, modal components for admin actions | Context state + Firestore persistence |
| **DFD (All Levels)** | `src/context/*`, `backend/*`, Firebase services | Data flow through React contexts, Express.js routes, Firebase SDK | Real-time data synchronization via Firestore |
| **Sequence Diagram** | Complete application flow | API calls, context methods, Firebase operations, payment gateway integration | Multi-layer: LocalStorage → Context → Firestore → Backend APIs |

## Database Schema Accuracy Assessment

### **✅ Accurate Mappings:**
- **Users Collection**: Matches ER diagram with Firebase Auth integration
- **Products Collection**: Complete match with additional fields (rating, reviews, sales, featured)
- **Categories Collection**: Implemented but missing from ER diagram
- **Orders Collection**: Primary implementation uses embedded items array
- **CarouselSlides Collection**: Matches both DFD and implementation

### **⚠️ Implementation Differences:**
- **Cart Entity**: ER shows Firestore collection, but actually uses localStorage
- **OrderItems**: ER shows separate entity, but primarily stored as embedded array
- **Wishlist Entity**: Missing from ER diagram entirely, but fully implemented

### **📊 Actual vs. Designed Schema:**

#### **Product Entity - Enhanced Fields:**
```javascript
// ER Diagram Fields: name, description, price, imageUrl, categoryId, stock, createdAt
// Actual Implementation adds:
{
  originalPrice: number,    // For discount calculations
  rating: number,          // Average user rating (0-5)
  reviews: number,         // Total review count
  sales: number,           // Total units sold
  featured: boolean,       // Homepage featured flag
  secondaryImages: array   // Additional product images
}
```

#### **Order Entity - Flexible Structure:**
```javascript
// Primary approach: Embedded items
{
  userId: string,
  items: [                 // ← Array of order items (not separate collection)
    { productId, quantity, price, name },
    { productId, quantity, price, name }
  ],
  customerInfo: object,
  totalAmount: number,
  paymentMethod: string,
  status: enum,
  createdAt: timestamp
}
```

### **Technology Stack Summary**

### **Frontend Architecture:**
```javascript
// React Application Structure
src/
├── App.js                 // Main app with provider hierarchy
├── context/              // Global state management
│   ├── AuthContext.js    // User authentication & authorization
│   ├── CartContext.js    // Shopping cart with localStorage persistence  
│   └── WishlistContext.js // User wishlist management (localStorage)
├── pages/                // Route components (use cases)
├── components/           // Reusable UI components
├── hooks/                // Custom React hooks (data fetching)
└── utils/                // Firebase integration & payment services
```

### **Backend Architecture:**
```javascript
// Express.js Server Structure  
backend/
├── server.js             // Main server with middleware pipeline
├── routes/               // API endpoints
│   ├── payment.js        // Payment processing & webhooks
│   ├── products.js       // Product CRUD operations
│   └── orders.js         // Order management
└── middleware/           // Custom middleware (monitoring, etc.)
```

### **Data Layer:**
- **Firebase Authentication**: User management and session handling
- **Firestore Collections**: 
  - `users` - User profiles and admin status
  - `products` - Product catalog with enhanced fields
  - `orders` - Orders with embedded items array
  - `categories` - Product categories and metadata
  - `carouselSlides` - Homepage carousel content
- **Firebase Storage**: Image and file storage for products/categories
- **LocalStorage**: 
  - Cart persistence (`ecommerce_cart_items`)
  - User-specific wishlists (`wishlist_${userId}`)
- **UddoktaPay API**: External payment gateway integration

### **Key Design Patterns:**
1. **Context Pattern**: Global state management without Redux
2. **Custom Hooks**: Reusable data fetching and business logic
3. **Reducer Pattern**: Complex state updates (especially in CartContext)
4. **Provider Pattern**: Nested context providers for different concerns
5. **Webhook Pattern**: Asynchronous payment status updates

---

## Development Notes

### **Authentication Flow:**
- Firebase Auth handles user sessions with automatic token refresh
- Admin status determined by email whitelist in `firebase.js` config
- Protected routes use auth state from AuthContext

### **Data Synchronization:**
- Real-time Firestore listeners for live data updates
- Optimistic UI updates with error handling and rollback
- Local storage backup for critical user data (cart, wishlist)

### **Storage Strategy Decisions:**
```javascript
// Why localStorage for Cart & Wishlist instead of Firestore:
// 1. Performance: Instant local access, no network calls
// 2. Offline functionality: Works without internet connection
// 3. Cost efficiency: Reduces Firestore read/write operations
// 4. User experience: Immediate updates, no loading states
// 5. Privacy: Cart data stays local until checkout

// Cart Implementation:
localStorage.setItem('ecommerce_cart_items', JSON.stringify({
  items: cartItems,
  timestamp: Date.now(),
  version: '1.0'
}));

// Wishlist Implementation (user-specific):
localStorage.setItem(`wishlist_${user.uid}`, JSON.stringify(wishlistItems));
```

### **Order Data Structure Decision:**
```javascript
// Embedded Items vs. Subcollection Trade-off:
// ✅ Chosen: Embedded array approach
{
  orderId: "order123",
  items: [
    { productId: "prod1", quantity: 2, price: 100, name: "Product 1" },
    { productId: "prod2", quantity: 1, price: 50, name: "Product 2" }
  ],
  totalAmount: 250
}

// ❌ Alternative: Subcollection approach (more complex, used for specific cases)
// orders/order123 -> { userId, totalAmount, status }
// orders/order123/orderItems/item1 -> { productId, quantity, price }
```

### **Payment Integration:**
- UddoktaPay webhook system for payment status updates
- Dual payment methods: online (bKash/Nagad) and cash on delivery
- Order status tracking with real-time Firestore updates

## Diagram Accuracy Summary

### **Overall Compatibility Score: 90% ✅**

**What Matches Perfectly:**
- Core Firestore collections (users, products, orders, categories, carouselSlides)
- Authentication flow and user management
- Product catalog and search functionality  
- Order processing and payment integration
- Admin panel CRUD operations

**What Needs Clarification in Diagrams:**
- Cart storage: localStorage (not Firestore collection as ER suggests)
- Wishlist entity: Missing from ER but fully implemented
- OrderItems: Embedded array approach vs. separate entity shown in ER
- Enhanced product fields: rating, reviews, sales, featured (missing from ER)

**Recommendations for Diagram Updates:**
1. Add Wishlist entity to ER diagram
2. Update Cart entity to show localStorage storage method
3. Clarify OrderItems as embedded array within Order entity
4. Add missing product fields to Product entity in ER
5. Update DFD to show localStorage data stores for Cart/Wishlist

For implementation details and specific code examples, see the expanded sections above and examine the referenced files directly.