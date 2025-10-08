# Secure Authentication System

A comprehensive, production-ready authentication system built with React, Firebase, and modern security best practices.

## 🔐 Security Features

### ✅ Implemented Security Measures

1. **Secure User Registration**
   - Email/password authentication with Firebase
   - Password strength validation (minimum 6 characters)
   - Email format validation
   - Duplicate account prevention
   - Google OAuth integration

2. **Secure Login System**
   - Email/password authentication
   - Password visibility toggle
   - Session management with Firebase
   - Admin authentication with role-based access
   - Google Sign-In support
   - Error handling with user-friendly messages

3. **Password Reset Functionality**
   - Secure password reset via email
   - Email verification before reset
   - Rate limiting protection
   - Reset link expiration
   - User-friendly success/error feedback

4. **Profile Management**
   - Secure profile updates
   - Input validation and sanitization
   - Real-time data sync with Firestore
   - Display name, phone, and address management
   - Account creation and last sign-in timestamps
   - Password reset link from profile

5. **Additional Security Features**
   - Firebase security rules
   - Protected routes
   - Session persistence
   - Automatic token refresh
   - XSS protection through React
   - CSRF protection via Firebase
   - Secure HTTP-only cookies (Firebase handles this)

## 📁 Project Structure

```
src/
├── config/
│   └── firebase.js              # Firebase configuration and admin credentials
├── context/
│   └── AuthContext.js           # Authentication context and hooks
├── pages/
│   ├── Login.js                 # Login page with email/password and Google auth
│   ├── SignUp.js                # User registration page
│   ├── ForgotPassword.js        # Password reset page
│   └── Profile.js               # User profile management
└── utils/
    └── firebase.js              # Firebase initialization
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Nafiz001/ISD-lab-project.git
   cd ISD-lab-project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   
   Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   
   Update `src/config/firebase.js` with your Firebase credentials:
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

4. **Set up Firebase Authentication**
   - Enable Email/Password authentication in Firebase Console
   - Enable Google Sign-In provider
   - Configure authorized domains

5. **Set up Firestore Database**
   - Create a Firestore database
   - Apply security rules from `firestore.rules`

6. **Configure Admin Accounts (Optional)**
   
   Update admin credentials in `src/config/firebase.js`:
   ```javascript
   export const ADMIN_EMAILS = [
     'admin@yourdomain.com',
   ];
   
   export const ADMIN_CREDENTIALS = [
     { email: 'admin@yourdomain.com', password: 'secure_admin_password' },
   ];
   ```

7. **Run the application**
   ```bash
   npm start
   ```

## 🔧 Configuration

### Environment Variables (Recommended)

For production, use environment variables instead of hardcoding credentials:

1. Create a `.env` file in the root directory:
   ```
   REACT_APP_FIREBASE_API_KEY=your_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   ```

2. Update `src/config/firebase.js`:
   ```javascript
   const firebaseConfig = {
     apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
     authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
     projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
     storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
     messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
     appId: process.env.REACT_APP_FIREBASE_APP_ID
   };
   ```

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      // Allow users to read their own data
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Allow users to create their own document during signup
      allow create: if request.auth != null && request.auth.uid == userId;
      
      // Allow users to update their own data
      allow update: if request.auth != null && request.auth.uid == userId;
      
      // Admins can read all users
      allow read: if request.auth != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
  }
}
```

## 📱 Features

### User Registration
- Email and password registration
- Google OAuth registration
- Automatic profile creation in Firestore
- Display name setup during registration
- Email verification (optional)

### User Login
- Email/password login
- Google Sign-In
- Remember me functionality
- Password visibility toggle
- Admin role detection

### Password Reset
- Email-based password reset
- Secure reset link generation
- Email verification
- Success confirmation page

### Profile Management
- View account information
- Edit profile details (name, phone, address)
- View account creation date
- View last sign-in date
- Password reset access
- Form validation

## 🛡️ Security Best Practices

1. **Never commit sensitive credentials**
   - Use `.env` files for configuration
   - Add `.env` to `.gitignore`
   - Use different configs for dev/prod

2. **Implement strong password policies**
   - Minimum 6 characters (consider increasing to 8+)
   - Consider password complexity requirements
   - Implement password strength meter

3. **Enable Firebase Security Features**
   - Set up Firestore security rules
   - Enable App Check for abuse prevention
   - Monitor authentication events

4. **Use HTTPS in production**
   - Ensure all communication is encrypted
   - Configure proper CORS settings
   - Use secure cookies

5. **Regular Security Updates**
   - Keep dependencies updated
   - Monitor security advisories
   - Regular security audits

## 🧪 Testing

### Manual Testing Checklist

- [ ] User can register with email/password
- [ ] User can register with Google
- [ ] User can login with email/password
- [ ] User can login with Google
- [ ] Password reset email is sent
- [ ] Password reset link works
- [ ] User can update profile information
- [ ] Form validation works correctly
- [ ] Error messages are user-friendly
- [ ] Admin authentication works
- [ ] Session persists on page refresh

## 🚢 Deployment

### Prerequisites for Deployment
- Firebase Hosting or any static hosting service
- Environment variables configured
- Production Firebase project

### Deployment Steps

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Firebase Hosting**
   ```bash
   firebase login
   firebase init hosting
   firebase deploy
   ```

3. **Or deploy to other platforms**
   - Vercel: `vercel --prod`
   - Netlify: `netlify deploy --prod`
   - GitHub Pages: Configure in repository settings

## 📚 Dependencies

- **react**: UI framework
- **react-router-dom**: Routing
- **firebase**: Backend and authentication
- **react-hot-toast**: Toast notifications
- **react-icons**: Icon library
- **tailwindcss**: Styling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Nafiz** - [GitHub](https://github.com/Nafiz001)

## 🙏 Acknowledgments

- Firebase team for excellent documentation
- React community for best practices
- Contributors and testers

## 📞 Support

For support, email nafiz@shopcircuit.com or open an issue in the GitHub repository.

## 🔄 Changelog

### Version 1.0.0 (Current)
- ✅ Initial release with complete authentication system
- ✅ Email/password authentication
- ✅ Google OAuth integration
- ✅ Password reset functionality
- ✅ Profile management
- ✅ Admin role support
- ✅ Comprehensive security measures

## 🗺️ Roadmap

- [ ] Email verification on signup
- [ ] Two-factor authentication (2FA)
- [ ] Social login (Facebook, Twitter)
- [ ] Account deletion functionality
- [ ] Password strength meter
- [ ] Session timeout management
- [ ] Login history tracking
- [ ] Automated testing suite
