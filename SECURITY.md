# Security Implementation Guide

## 🔐 Overview

This document outlines all security measures implemented in the authentication system and provides guidelines for maintaining and enhancing security.

## 🛡️ Authentication Security

### 1. Password Security

#### Current Implementation
- **Minimum Length**: 6 characters (Firebase default)
- **Storage**: Passwords are hashed by Firebase Authentication
- **Transmission**: All data transmitted over HTTPS
- **Reset**: Secure password reset via email verification

#### Recommendations for Enhancement
```javascript
// Add password strength validation
const validatePasswordStrength = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (password.length < minLength) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  if (!hasUpperCase || !hasLowerCase) {
    return { valid: false, message: 'Password must contain both upper and lowercase letters' };
  }
  if (!hasNumbers) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  if (!hasSpecialChar) {
    return { valid: false, message: 'Password must contain at least one special character' };
  }

  return { valid: true, message: 'Strong password' };
};
```

### 2. Email Validation

#### Current Implementation
```javascript
// Basic email format validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
```

#### Enhanced Validation
```javascript
// More comprehensive email validation
const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};
```

### 3. Session Management

#### Firebase Session Handling
- **Token Refresh**: Automatic token refresh by Firebase
- **Session Persistence**: Configurable (local, session, none)
- **Timeout**: Tokens expire after 1 hour by default

#### Custom Session Configuration
```javascript
// Configure session persistence
import { setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';

// For "Remember Me" functionality
await setPersistence(auth, browserLocalPersistence);

// For session-only login
await setPersistence(auth, browserSessionPersistence);
```

## 🔒 Firestore Security Rules

### Current Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
  }
}
```

### Enhanced Rules with Field Validation
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Helper functions
      function isSignedIn() {
        return request.auth != null;
      }
      
      function isOwner(userId) {
        return request.auth.uid == userId;
      }
      
      function isAdmin() {
        return isSignedIn() && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
      }
      
      function validUserData() {
        return request.resource.data.keys().hasAll(['name', 'email']) &&
               request.resource.data.name is string &&
               request.resource.data.name.size() > 0 &&
               request.resource.data.email is string &&
               request.resource.data.email.matches('^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$');
      }
      
      // Read rules
      allow read: if isSignedIn() && (isOwner(userId) || isAdmin());
      
      // Create rules
      allow create: if isSignedIn() && isOwner(userId) && validUserData();
      
      // Update rules
      allow update: if isSignedIn() && isOwner(userId) && 
                       request.resource.data.email == resource.data.email && // Prevent email changes
                       validUserData();
      
      // Delete rules (only admins can delete)
      allow delete: if isAdmin();
    }
  }
}
```

## 🚨 Input Validation

### Client-Side Validation

#### Profile Update Validation
```javascript
const validateProfileData = (data) => {
  const errors = {};

  // Name validation
  if (!data.displayName || data.displayName.trim().length === 0) {
    errors.displayName = 'Name is required';
  } else if (data.displayName.length > 100) {
    errors.displayName = 'Name must be less than 100 characters';
  }

  // Phone validation
  if (data.phone) {
    const phoneRegex = /^[\d\s\-+()]+$/;
    if (!phoneRegex.test(data.phone)) {
      errors.phone = 'Invalid phone number format';
    }
  }

  // Address validation
  if (data.address && data.address.length > 500) {
    errors.address = 'Address must be less than 500 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
```

### Server-Side Validation (Firebase Functions)

```javascript
// Example Cloud Function for additional validation
exports.validateUserUpdate = functions.firestore
  .document('users/{userId}')
  .onUpdate((change, context) => {
    const newData = change.after.data();
    const previousData = change.before.data();

    // Ensure email hasn't changed
    if (newData.email !== previousData.email) {
      throw new Error('Email cannot be changed');
    }

    // Validate name length
    if (newData.name.length > 100) {
      throw new Error('Name too long');
    }

    // Additional validation logic
    return null;
  });
```

## 🔐 XSS Protection

### React's Built-in Protection
React automatically escapes values embedded in JSX, preventing XSS attacks.

### Additional Measures
```javascript
// Sanitize user input if you need to render HTML
import DOMPurify from 'dompurify';

const sanitizeHtml = (dirty) => {
  return {
    __html: DOMPurify.sanitize(dirty)
  };
};

// Usage
<div dangerouslySetInnerHTML={sanitizeHtml(userInput)} />
```

## 🛡️ CSRF Protection

Firebase handles CSRF protection automatically through:
- Token-based authentication
- SameSite cookies
- Origin validation

## 🔒 Rate Limiting

### Firebase Rate Limiting
Firebase automatically implements rate limiting for:
- Authentication requests
- Password reset emails
- Sign-in attempts

### Custom Rate Limiting (Optional)
```javascript
// Implement custom rate limiting for API calls
const rateLimiter = new Map();

const checkRateLimit = (userId, maxRequests = 10, timeWindow = 60000) => {
  const now = Date.now();
  const userRequests = rateLimiter.get(userId) || [];
  
  // Remove old requests outside time window
  const recentRequests = userRequests.filter(time => now - time < timeWindow);
  
  if (recentRequests.length >= maxRequests) {
    throw new Error('Too many requests. Please try again later.');
  }
  
  recentRequests.push(now);
  rateLimiter.set(userId, recentRequests);
  
  return true;
};
```

## 🔐 Admin Security

### Current Implementation
```javascript
// Admin credentials stored in config (NOT RECOMMENDED for production)
export const ADMIN_CREDENTIALS = [
  { email: 'admin@shopcircuit.com', password: 'admin123' },
];
```

### Recommended Production Approach
```javascript
// Use Firebase Custom Claims for admin roles
// Set via Firebase Admin SDK (server-side only)
const admin = require('firebase-admin');

async function setAdminClaim(uid) {
  await admin.auth().setCustomUserClaims(uid, { admin: true });
}

// Check admin status (client-side)
const checkAdmin = async () => {
  const token = await auth.currentUser.getIdTokenResult();
  return token.claims.admin === true;
};
```

## 📊 Security Monitoring

### Firebase Console Monitoring
1. **Authentication Events**
   - Monitor failed login attempts
   - Track unusual sign-in locations
   - Review user creation patterns

2. **Firestore Usage**
   - Monitor read/write patterns
   - Check for unusual activity
   - Review security rule violations

### Implement Logging
```javascript
// Log authentication events
const logAuthEvent = (event, userId, success) => {
  const logData = {
    event,
    userId,
    success,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    ip: window.location.hostname
  };
  
  // Send to logging service or Firestore
  console.log('[Auth Event]', logData);
};

// Usage
try {
  await login(email, password);
  logAuthEvent('login', user.uid, true);
} catch (error) {
  logAuthEvent('login', email, false);
}
```

## 🔒 Data Encryption

### In Transit
- All Firebase communications use HTTPS/TLS
- WebSocket connections are encrypted
- API calls are secured

### At Rest
- Firebase automatically encrypts data at rest
- Passwords are hashed using bcrypt
- Sensitive data can be additionally encrypted

### Additional Encryption (Optional)
```javascript
// Encrypt sensitive data before storing
import CryptoJS from 'crypto-js';

const encryptData = (data, secretKey) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
};

const decryptData = (encryptedData, secretKey) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};
```

## 🚀 Production Checklist

- [ ] Remove all console.log statements with sensitive data
- [ ] Use environment variables for all configuration
- [ ] Enable Firebase App Check
- [ ] Implement proper error logging
- [ ] Set up security alerts
- [ ] Configure proper CORS settings
- [ ] Enable Firebase Security Rules
- [ ] Use custom claims for admin roles (remove hardcoded credentials)
- [ ] Implement rate limiting for sensitive operations
- [ ] Add email verification for new accounts
- [ ] Set up monitoring and analytics
- [ ] Regular security audits
- [ ] Keep all dependencies updated
- [ ] Implement Content Security Policy (CSP)
- [ ] Add security headers
- [ ] Enable HTTPS only

## 🔧 Security Headers (for hosting configuration)

```javascript
// Example headers for Firebase Hosting (firebase.json)
{
  "hosting": {
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "X-Content-Type-Options",
            "value": "nosniff"
          },
          {
            "key": "X-Frame-Options",
            "value": "DENY"
          },
          {
            "key": "X-XSS-Protection",
            "value": "1; mode=block"
          },
          {
            "key": "Strict-Transport-Security",
            "value": "max-age=31536000; includeSubDomains"
          },
          {
            "key": "Content-Security-Policy",
            "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://apis.google.com; style-src 'self' 'unsafe-inline';"
          }
        ]
      }
    ]
  }
}
```

## 📚 Resources

- [Firebase Security Best Practices](https://firebase.google.com/docs/rules/basics)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Web Security Guidelines](https://developer.mozilla.org/en-US/docs/Web/Security)
- [React Security Best Practices](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)

## 🆘 Security Incident Response

If you discover a security vulnerability:
1. **DO NOT** open a public issue
2. Email security concerns to: nafiz@shopcircuit.com
3. Include detailed information about the vulnerability
4. Allow time for the issue to be addressed before public disclosure

---

**Last Updated**: October 2, 2025
**Version**: 1.0.0
