# 🛍️ ShopCircuit - E-Commerce Platform

A modern, full-featured e-commerce web application built with React.js, Firebase, and Express.js. ShopCircuit provides a seamless online shopping experience with real-time inventory management, secure payment processing, and an intuitive admin panel.

## 🌐 Live Demo

**🔗 [Visit ShopCircuit Live](https://shopcircuit.vercel.app/)**

## 📸 Screenshots

![ShopCircuit Homepage](https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=ShopCircuit+Homepage)
*Modern homepage with featured products and carousel*

## 📋 Project Overview

ShopCircuit is a comprehensive e-commerce solution designed to provide both customers and administrators with a powerful, user-friendly platform. The application features real-time product management, secure authentication, payment gateway integration (UddoktaPay for bKash/Nagad), and complete order tracking functionality.

### Key Highlights:
- 🛒 Full-featured shopping cart with persistent storage
- 💳 Multiple payment methods (bKash, Nagad, Cash on Delivery)
- 👤 User authentication with role-based access control
- 📦 Real-time order tracking and management
- 🎨 Responsive design with Tailwind CSS
- 🔥 Firebase backend for real-time data synchronization
- 🔐 Secure payment processing with webhook integration

## 🚀 Main Features

### For Customers:
- **Product Browsing & Search**
  - Advanced search with filters (category, price range, rating)
  - Product categories with dynamic filtering
  - Detailed product pages with image galleries
  - Product ratings and reviews

- **Shopping Cart**
  - Add/remove items with quantity management
  - Real-time price calculations
  - Persistent cart across sessions (localStorage)
  - Cart summary with itemized totals

- **Wishlist**
  - Save favorite products for later
  - User-specific wishlist management
  - Quick add-to-cart from wishlist

- **Checkout & Payment**
  - Multi-step checkout process
  - Customer information validation
  - Multiple payment options (bKash, Nagad, COD)
  - Secure payment gateway integration
  - Order confirmation and tracking

- **User Profile**
  - Profile management and settings
  - Order history with status tracking
  - Saved addresses and contact information
  - Password reset functionality

### For Administrators:
- **Admin Dashboard**
  - Comprehensive product management (CRUD operations)
  - Category management with icon uploads
  - Carousel slide management for homepage
  - Order management with status updates
  - Real-time analytics and monitoring

- **Product Management**
  - Add/edit/delete products
  - Image upload to Firebase Storage
  - Stock management and pricing
  - Bulk product operations

- **Order Management**
  - View all orders with filtering
  - Update order status
  - Payment verification
  - Order details and customer information

## 🛠️ Technology Stack

### Frontend:
- **React.js 18** - UI framework with hooks and context API
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **React Icons** - Icon library (Feather Icons, React Icons)
- **React Hot Toast** - Toast notifications

### Backend:
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **Firebase Admin SDK** - Server-side Firebase operations

### Database & Storage:
- **Firebase Firestore** - NoSQL cloud database
- **Firebase Storage** - File storage for images
- **Firebase Authentication** - User authentication
- **LocalStorage** - Client-side cart/wishlist persistence

### Payment Integration:
- **UddoktaPay API** - Payment gateway (bKash, Nagad)
- **Webhook System** - Payment status notifications

### DevOps & Deployment:
- **Vercel** - Frontend hosting and deployment
- **Git** - Version control
- **npm** - Package management


## 📦 Dependencies

### Frontend Dependencies:
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.28.0",
  "react-hot-toast": "^2.4.1",
  "react-icons": "^5.3.0",
  "firebase": "^11.0.2"
}
```

### Backend Dependencies:
```json
{
  "express": "^4.21.1",
  "cors": "^2.8.5",
  "dotenv": "^16.4.5",
  "axios": "^1.7.7",
  "firebase-admin": "^13.0.1",
  "helmet": "^8.0.0",
  "morgan": "^1.10.0"
}
```

### Dev Dependencies:
```json
{
  "tailwindcss": "^3.4.14",
  "postcss": "^8.4.47",
  "autoprefixer": "^10.4.20",
  "@babel/plugin-proposal-private-property-in-object": "^7.21.11"
}
```

## 🚀 Getting Started - Local Setup

### Prerequisites
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Firebase Account** - [Create account](https://firebase.google.com/)
- **Git** - [Download here](https://git-scm.com/)

### Step 1: Clone the Repository
```bash
git clone https://github.com/Nafiz001/ISD-lab-project.git
cd ISD-lab-project
```

### Step 2: Install Frontend Dependencies
```bash
npm install
```

### Step 3: Install Backend Dependencies
```bash
cd backend
npm install
cd ..
```

### Step 4: Firebase Configuration

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project" and follow the setup wizard
   - Enable Google Analytics (optional)

2. **Enable Firebase Services**
   - **Authentication**: Enable Email/Password and Google Sign-In
   - **Firestore Database**: Create database in production mode
   - **Storage**: Enable Firebase Storage for image uploads

3. **Get Firebase Config**
   - Go to Project Settings > General
   - Scroll down to "Your apps" section
   - Click on Web app (</>) icon
   - Copy the Firebase configuration object

4. **Update Firebase Configuration**
   
   Edit `src/config/firebase.js`:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

5. **Set Admin Emails**
   
   Update admin credentials in `src/config/firebase.js`:
   ```javascript
   export const ADMIN_EMAILS = [
     'admin@shopcircuit.com',
     'youremail@example.com'  // Add your admin email here
   ];
   ```

### Step 5: Set Up Firestore Security Rules

Copy the rules from `firestore.rules` and apply them in Firebase Console:
- Go to Firestore Database > Rules
- Paste the security rules
- Click "Publish"

### Step 6: Configure Backend Environment Variables

Create a `.env` file in the `backend` directory:
```env
PORT=5000
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="your_private_key"
FIREBASE_CLIENT_EMAIL=your_client_email

# UddoktaPay Configuration (for payment gateway)
UDDOKTAPAY_API_KEY=your_uddoktapay_api_key
UDDOKTAPAY_BASE_URL=https://sandbox.uddoktapay.com/api
```

### Step 7: Run the Application

#### Start Frontend Development Server:
```bash
npm start
```
The app will open at `http://localhost:3000`

#### Start Backend Server (in a new terminal):
```bash
cd backend
npm start
```
The server will run at `http://localhost:5000`

### Step 8: Populate Sample Data (Optional)

Run these scripts to add initial data:

```bash
# Add sample products
node src/utils/populateDatabase.js

# Add carousel slides
node populateCarouselSlides.js
```

## 📖 Usage Guide

### Customer Workflow:
1. **Browse Products** - Navigate to Products page or browse by category
2. **View Product Details** - Click on any product for detailed information
3. **Add to Cart** - Select quantity and add items to cart
4. **Checkout** - Fill in customer information and select payment method
5. **Complete Payment** - For online payment, you'll be redirected to payment gateway
6. **Track Order** - View order status in Orders page after login

### Admin Workflow:
1. **Login as Admin** - Use admin email credentials
2. **Access Admin Panel** - Navigate to `/admin` route
3. **Manage Products** - Add, edit, or delete products with images
4. **Manage Categories** - Add category names and icons
5. **Manage Orders** - Update order status and view payment details
6. **Update Carousel** - Add/edit homepage carousel slides

## 🔗 Important Links

- **Live Application**: [https://shopcircuit.vercel.app/](https://shopcircuit.vercel.app/)
- **GitHub Repository**: [https://github.com/Nafiz001/ISD-lab-project](https://github.com/Nafiz001/ISD-lab-project)
- **Project Documentation**: [DiagramToCodeMapping.md](./DiagramToCodeMapping.md)
- **API Documentation**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Payment Integration Guide**: [PAYMENT_INTEGRATION.md](./PAYMENT_INTEGRATION.md)
- **Monitoring Guide**: [PRODUCTION_MONITORING.md](./PRODUCTION_MONITORING.md)

## 📁 Project Structure

```
ISD-lab-project/
├── public/
│   ├── index.html
│   └── bkash-logo-generator.html
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Header.js
│   │   ├── Footer.js
│   │   ├── ProductCard.js
│   │   ├── AddProductModal.js
│   │   └── ...
│   ├── pages/              # Route components
│   │   ├── Home.js
│   │   ├── Products.js
│   │   ├── Cart.js
│   │   ├── Checkout.js
│   │   ├── AdminPanel.js
│   │   └── ...
│   ├── context/            # React Context providers
│   │   ├── AuthContext.js
│   │   ├── CartContext.js
│   │   └── WishlistContext.js
│   ├── hooks/              # Custom React hooks
│   │   ├── useProducts.js
│   │   └── useAdvancedSearch.js
│   ├── config/             # Configuration files
│   │   └── firebase.js
│   ├── utils/              # Utility functions
│   │   ├── firebase.js
│   │   └── paymentService.js
│   ├── assets/             # Static assets
│   ├── App.js              # Main App component
│   └── index.js            # Entry point
├── backend/
│   ├── routes/
│   │   ├── payment.js
│   │   ├── products.js
│   │   └── orders.js
│   ├── middleware/
│   │   └── healthMonitoring.js
│   └── server.js           # Express server
├── firestore.rules         # Firestore security rules
├── tailwind.config.js      # Tailwind configuration
├── package.json
└── README.md
```


## 🔒 Security Features

- **Firebase Authentication** with email/password and Google OAuth
- **Role-based Access Control** for admin functionality
- **Firestore Security Rules** for data protection
- **Input Validation** on both client and server side
- **XSS Protection** through React's built-in sanitization
- **Secure Payment Processing** with webhook verification
- **Protected Routes** for authenticated users
- **Session Management** with automatic token refresh

## 🧪 Testing

### Manual Testing Checklist

**Authentication:**
- [x] User registration with email/password
- [x] User login with email/password and Google OAuth
- [x] Password reset functionality
- [x] Profile management and updates
- [x] Admin authentication and access control

**Shopping Features:**
- [x] Product browsing and filtering
- [x] Advanced search functionality
- [x] Add/remove items from cart
- [x] Wishlist management
- [x] Checkout process with multiple payment methods

**Admin Features:**
- [x] Product CRUD operations
- [x] Category management
- [x] Order management and status updates
- [x] Carousel slide management
- [x] Image uploads to Firebase Storage

**Payment Integration:**
- [x] bKash payment processing
- [x] Nagad payment processing
- [x] Cash on delivery
- [x] Webhook notifications
- [x] Order confirmation

## 🚀 Deployment

### Frontend Deployment (Vercel)

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Deploy
   vercel --prod
   ```

3. **Configure Environment Variables in Vercel Dashboard**
   - Add all Firebase configuration variables
   - Set production API URLs

### Backend Deployment Options

**Option 1: Vercel Serverless Functions**
- Place backend routes in `/api` directory
- Configure `vercel.json` for serverless functions

**Option 2: Railway/Render**
- Connect GitHub repository
- Set environment variables
- Deploy Node.js application

**Option 3: Firebase Cloud Functions**
- Convert Express routes to Cloud Functions
- Deploy with Firebase CLI

## 🐛 Troubleshooting

### Common Issues:

**Firebase Connection Error:**
```bash
# Verify Firebase configuration in src/config/firebase.js
# Check if all Firebase services are enabled in Console
```

**Cart Not Persisting:**
```bash
# Check browser localStorage
# Clear cache and reload application
```

**Payment Gateway Issues:**
```bash
# Verify UddoktaPay API credentials in backend/.env
# Check webhook URL configuration
# Review payment logs in backend console
```

**Admin Access Denied:**
```bash
# Confirm email is added to ADMIN_EMAILS array in firebase.js
# Re-login after adding email to admin list
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/ISD-lab-project.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```

3. **Commit your changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```

4. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```

5. **Open a Pull Request**

### Coding Standards:
- Follow React best practices and hooks guidelines
- Use Tailwind CSS for styling
- Write clean, readable code with comments
- Test thoroughly before submitting PR

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team & Authors

- **Nafiz** - Project Lead & Full Stack Developer
  - GitHub: [@Nafiz001](https://github.com/Nafiz001)
  - Email: nafiz@shopcircuit.com

## 🙏 Acknowledgments

- Firebase team for comprehensive backend services
- React.js community for excellent documentation
- Tailwind CSS for utility-first CSS framework
- UddoktaPay for payment gateway integration
- Vercel for seamless deployment platform

## 📞 Support & Contact

- **Email**: nafiz@shopcircuit.com
- **GitHub Issues**: [Report a bug](https://github.com/Nafiz001/ISD-lab-project/issues)
- **Documentation**: [Project Docs](./DiagramToCodeMapping.md)

## 🔄 Version History

### Version 2.0.0 (Current - November 2025)
- ✅ Complete e-commerce platform with payment integration
- ✅ Admin panel with full product management
- ✅ Shopping cart and wishlist functionality
- ✅ Order tracking and management
- ✅ UddoktaPay payment gateway integration
- ✅ Real-time inventory management
- ✅ Advanced search and filtering
- ✅ Responsive design for all devices

### Version 1.0.0 (Initial Release)
- ✅ Basic authentication system
- ✅ User profile management
- ✅ Firebase integration

## 🗺️ Future Roadmap

- [ ] Email notifications for order updates
- [ ] Product reviews and ratings system
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Inventory alerts for low stock
- [ ] Customer support chat integration
- [ ] Loyalty points and rewards program
- [ ] Social media sharing functionality
- [ ] Product recommendations based on browsing history

## 📊 Project Statistics

- **Total Components**: 30+
- **Total Pages**: 15+
- **Firebase Collections**: 6 (users, products, orders, categories, carouselSlides, reviews)
- **API Endpoints**: 12+
- **Lines of Code**: 10,000+

---

**Made with ❤️ by the ShopCircuit Team**

**⭐ If you find this project useful, please consider giving it a star on GitHub!**
