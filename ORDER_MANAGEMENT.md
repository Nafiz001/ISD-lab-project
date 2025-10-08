# Order Placement and Tracking System

## 🎯 Overview

Complete order management system with order placement, tracking, and history features.

## 📦 Features Implemented

### 1. **Order Placement**
- Create orders from checkout
- Multiple payment methods (bKash, COD)
- Order validation and processing
- Automatic order ID generation
- Cart clearing after successful order

### 2. **Order Tracking**
- Real-time order status updates
- Track order by Order ID
- Visual status timeline
- Delivery tracking
- Order history view

### 3. **Order Management**
- View all user orders
- Filter orders by status
- Cancel pending orders
- Reorder functionality
- Download order invoices

## 📋 Order Status Flow

```
Pending → Processing → Shipped → Delivered
    ↓
Cancelled
```

### Status Definitions:
- **Pending**: Order placed, awaiting confirmation
- **Processing**: Payment confirmed, preparing shipment  
- **Shipped**: Order dispatched for delivery
- **Delivered**: Order successfully delivered
- **Cancelled**: Order cancelled by user/admin

## 🗂️ File Structure

```
src/
├── pages/
│   ├── Checkout.js          # Order creation
│   ├── OrderConfirmation.js # Order success page
│   ├── Orders.js            # Order history
│   └── OrderTracking.js     # Track order status
├── context/
│   └── CartContext.js       # Cart management
└── utils/
    └── firebase.js          # Database operations
```

## 💾 Database Schema

### Orders Collection

```javascript
{
  orderId: "ORD-1234567890",        // Unique order ID
  userId: "user-uid",               // User who placed order
  
  // Customer Information
  customerInfo: {
    name: "John Doe",
    email: "john@example.com",
    phone: "+8801234567890",
    address: "123 Street, City",
    city: "Dhaka",
    postalCode: "1200"
  },
  
  // Order Items
  items: [
    {
      id: "product-id",
      name: "Product Name",
      price: 1000,
      quantity: 2,
      image: "image-url",
      color: "Red" (optional)
    }
  ],
  
  // Pricing
  subtotal: 2000,
  shippingCost: 100,
  discount: 0,
  total: 2100,
  
  // Payment
  paymentMethod: "bkash" | "cod",
  paymentStatus: "pending" | "completed" | "failed",
  paymentInfo: {
    paymentID: "TR0011abc123",
    trxID: "8HJ16D8DL7",
    transactionStatus: "Completed"
  },
  
  // Status
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled",
  
  // Tracking
  trackingNumber: "TRACK-123456",
  estimatedDelivery: Timestamp,
  
  // Timestamps
  createdAt: Timestamp,
  updatedAt: Timestamp,
  deliveredAt: Timestamp (optional),
  cancelledAt: Timestamp (optional)
}
```

## 🔧 Implementation

### 1. Creating an Order (Checkout.js)

```javascript
const handlePlaceOrder = async () => {
  try {
    // Validate cart
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // Create order object
    const orderData = {
      orderId: `ORD-${Date.now()}`,
      userId: user.uid,
      customerInfo: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode
      },
      items: cartItems,
      subtotal: calculateSubtotal(),
      shippingCost: 100,
      total: calculateTotal(),
      paymentMethod: selectedPayment,
      paymentStatus: 'pending',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save to Firestore
    await addDoc(collection(db, 'orders'), orderData);
    
    // Clear cart
    clearCart();
    
    // Redirect to confirmation
    navigate(`/order-confirmation/${orderData.orderId}`);
    
    toast.success('Order placed successfully!');
  } catch (error) {
    console.error('Error placing order:', error);
    toast.error('Failed to place order');
  }
};
```

### 2. Order Confirmation (OrderConfirmation.js)

```javascript
const OrderConfirmation = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  
  useEffect(() => {
    const fetchOrder = async () => {
      const q = query(
        collection(db, 'orders'),
        where('orderId', '==', orderId)
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        setOrder(snapshot.docs[0].data());
      }
    };
    
    fetchOrder();
  }, [orderId]);
  
  return (
    <div>
      <h1>Order Confirmed!</h1>
      <p>Order ID: {orderId}</p>
      <Link to={`/track-order/${orderId}`}>Track Order</Link>
    </div>
  );
};
```

### 3. Order Tracking (OrderTracking.js)

```javascript
const OrderTracking = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  
  const getStatusProgress = () => {
    const statuses = ['pending', 'processing', 'shipped', 'delivered'];
    return statuses.indexOf(order.status);
  };
  
  return (
    <div>
      <h1>Track Order: {orderId}</h1>
      
      {/* Status Timeline */}
      <div className="status-timeline">
        {['Pending', 'Processing', 'Shipped', 'Delivered'].map((status, idx) => (
          <div 
            key={status}
            className={idx <= getStatusProgress() ? 'active' : ''}
          >
            {status}
          </div>
        ))}
      </div>
      
      {/* Order Details */}
      <div className="order-details">
        <p>Status: {order.status}</p>
        <p>Tracking: {order.trackingNumber}</p>
        <p>Estimated Delivery: {order.estimatedDelivery}</p>
      </div>
    </div>
  );
};
```

### 4. Order History (Orders.js)

```javascript
const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  
  useEffect(() => {
    const fetchOrders = async () => {
      const q = query(
        collection(db, 'orders'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setOrders(ordersData);
    };
    
    fetchOrders();
  }, [user]);
  
  return (
    <div>
      <h1>My Orders</h1>
      {orders.map(order => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
};
```

## 🔐 Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /orders/{orderId} {
      // Users can read their own orders
      allow read: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
      
      // Users can create orders
      allow create: if request.auth != null &&
                       request.resource.data.userId == request.auth.uid;
      
      // Users can cancel their pending orders
      allow update: if request.auth != null &&
                       resource.data.userId == request.auth.uid &&
                       resource.data.status == 'pending' &&
                       request.resource.data.status == 'cancelled';
      
      // Admins can do everything
      allow read, write: if request.auth != null &&
                            get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
  }
}
```

## 📱 User Actions

### Place Order
1. Add items to cart
2. Go to checkout
3. Fill billing information
4. Select payment method
5. Click "Place Order"
6. View order confirmation

### Track Order
1. Go to "My Orders"
2. Click on order
3. View tracking details
4. Check status timeline

### Cancel Order
1. Go to "My Orders"
2. Find pending order
3. Click "Cancel Order"
4. Confirm cancellation

### Reorder
1. Go to "My Orders"
2. Find previous order
3. Click "Reorder"
4. Items added to cart

## 🔄 Admin Actions

### Update Order Status

```javascript
const updateOrderStatus = async (orderId, newStatus) => {
  const orderRef = doc(db, 'orders', orderId);
  await updateDoc(orderRef, {
    status: newStatus,
    updatedAt: new Date()
  });
};
```

### Add Tracking Number

```javascript
const addTrackingNumber = async (orderId, trackingNumber) => {
  const orderRef = doc(db, 'orders', orderId);
  await updateDoc(orderRef, {
    trackingNumber,
    status: 'shipped',
    updatedAt: new Date()
  });
};
```

## 📧 Notifications (Optional Enhancement)

### Email Notifications
- Order confirmation
- Order status updates
- Delivery notifications

### SMS Notifications
- Order placed
- Out for delivery
- Delivered

## 🧪 Testing Checklist

- [ ] Place order with COD
- [ ] Place order with bKash
- [ ] View order confirmation
- [ ] Track order by ID
- [ ] View order history
- [ ] Cancel pending order
- [ ] Reorder from history
- [ ] Admin update status
- [ ] Admin add tracking
- [ ] Order appears in Firebase
- [ ] Cart clears after order

## 🐛 Common Issues

### Issue: Order not appearing in history
**Solution**: Check userId matches in query

### Issue: Cannot cancel order
**Solution**: Only pending orders can be cancelled

### Issue: Tracking not working
**Solution**: Ensure tracking number is added

## 📈 Future Enhancements

1. **Order Reviews**
   - Rate products after delivery
   - Leave feedback

2. **Advanced Tracking**
   - Live GPS tracking
   - Delivery partner details
   - Photo proof of delivery

3. **Order Modifications**
   - Change delivery address
   - Update phone number
   - Modify items (before processing)

4. **Bulk Actions**
   - Download multiple invoices
   - Export order history
   - Print packing slips

## 🔗 Related Files

- `Checkout.js` - Order creation
- `OrderConfirmation.js` - Success page
- `OrderTracking.js` - Track orders
- `Orders.js` - Order history
- `CartContext.js` - Cart management
- `paymentService.js` - Payment processing

## 📞 Support

For order-related issues:
- Check order status in "My Orders"
- Contact support: support@yourdomain.com
- Call: +880 1234-567890

---

**Version**: 1.0.0  
**Last Updated**: October 8, 2025
